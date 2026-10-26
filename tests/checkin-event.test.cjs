const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/checkin.js'), 'utf8');
const token = 'CHK-KF001-ABC';
function client(api = {}, storage = new Map()) {
  const localStorage = { getItem: k => storage.get(k) || null, setItem: (k,v) => storage.set(k,v) };
  const window = { WeddingApi: api, clearTimeout() {}, setTimeout() {}, requestAnimationFrame() {}, crypto: { randomUUID: () => 'request-1234567890123456' } };
  const document = { addEventListener() {}, hidden: false };
  const navigator = { onLine: true };
  vm.runInNewContext(source, { window, localStorage, document, navigator, console });
  const c = window.WeddingCheckin;
  c.testEnvironment = { window, document, navigator };
  c.credentials = { name: 'Equipe', sessionToken: 'test' };
  c.offlineModeToggle = { checked: false };
  c.showResult = (...args) => c.lastResult = args;
  c.afterValidation = c.addHistory = c.renderSyncState = () => {};
  c.writeRoster([{ token, name: 'Ana', checkinStatus: 'pendente' }], new Date().toISOString());
  return c;
}
const allowed = () => ({ status: 'allowed', guest: { token, name: 'Ana', checkinStatus: 'validado', checkinAt: new Date().toISOString() } });

test('entrada criada durante envio da fila permanece salva', async () => {
  let resolve;
  const c = client({ validateCheckin: () => new Promise(r => resolve = r) });
  c.writeOfflineQueue([{ token, requestId: 'request-1234567890123456' }]);
  const sending = c.flushOfflineQueue();
  c.writeOfflineQueue([...c.readOfflineQueue(), { token: 'CHK-KF002-DEF', requestId: 'request-2234567890123456' }]);
  resolve(allowed()); await sending;
  assert.equal(c.readOfflineQueue().length, 1);
  assert.equal(c.readOfflineQueue()[0].token, 'CHK-KF002-DEF');
});

test('aprovação online impede repetição offline mesmo após snapshot antigo', async () => {
  const c = client({ validateCheckin: async () => allowed() });
  await c.validateToken(token);
  c.writeRoster([{ token, name: 'Ana', checkinStatus: 'pendente' }], new Date().toISOString());
  c.offlineModeToggle.checked = true;
  await c.validateToken(token);
  assert.equal(c.lastResult[0], 'used');
  assert.equal(c.readOfflineQueue().length, 0);
});

test('resposta perdida mantém ID após reabrir e bloqueia liberação offline incerta', async () => {
  const storage = new Map(); let firstId, secondId;
  const c = client({ validateCheckin: async data => { firstId = data.requestId; throw Object.assign(Error('timeout'), { kind: 'timeout' }); } }, storage);
  await c.validateToken(token);
  c.offlineModeToggle.checked = true;
  await c.validateToken(token);
  assert.equal(c.lastResult[0], 'invalid');
  assert.equal(c.readOfflineQueue().length, 0);
  const reopened = client({ validateCheckin: async data => { secondId = data.requestId; return allowed(); } }, storage);
  await reopened.validateToken(token);
  assert.equal(secondId, firstId);
  assert.equal(reopened.lastResult[0], 'allowed');
});

test('offline explícito libera sem chamar rede e mantém ID e horário na fila', async () => {
  const c = client({ validateCheckin: () => { throw Error('Não deve consultar rede'); } });
  c.offlineModeToggle.checked = true;
  await c.validateToken(token);
  assert.equal(c.lastResult[0], 'allowed');
  const item = c.readOfflineQueue()[0];
  assert.ok(item.requestId);
  assert.ok(Date.parse(item.checkedInAt));
});

test('lista vencida e falha de armazenamento não liberam entrada', async () => {
  const c = client();
  c.offlineModeToggle.checked = true;
  c.writeRoster([{ token, name: 'Ana' }], new Date(Date.now() - 3 * 3600000).toISOString());
  await c.validateToken(token);
  assert.equal(c.lastResult[0], 'invalid');
  assert.equal(c.readOfflineQueue().length, 0);
  c.writeRoster([{ token, name: 'Ana' }], new Date().toISOString());
  c.writeOfflineQueue = () => false;
  await c.validateToken(token);
  assert.equal(c.lastResult[0], 'invalid');
});

test('ID de fila antiga é salvo antes de enviar e reutilizado após erro', async () => {
  const ids = [];
  const c = client({ validateCheckin: async data => { ids.push(data.requestId); throw Error('rede'); } });
  c.writeOfflineQueue([{ token }]);
  await c.flushOfflineQueue(); await c.flushOfflineQueue();
  assert.ok(ids[0]); assert.equal(ids[1], ids[0]);
});

test('câmera não decodifica enquanto valida e limita imagem a 800 pixels', () => {
  const c = client(); let reads = 0, decoded;
  c.scanning = true; c.validating = true;
  c.video = { videoWidth: 1920, videoHeight: 1080 };
  c.canvas = { getContext: () => { reads++; return { drawImage() {}, getImageData: () => ({ data: [] }) }; } };
  c.scanFrame(); assert.equal(reads, 0);
  // Supply decoder in the same VM through a fresh small context.
  const window = { requestAnimationFrame() {}, jsQR: (_, w, h) => { decoded = [w,h]; return null; } };
  vm.runInNewContext(source, { window, document: { addEventListener() {}, hidden: false } });
  const scanner = window.WeddingCheckin;
  Object.assign(scanner, { scanning: true, video: c.video, canvas: c.canvas });
  scanner.scanFrame();
  assert.deepEqual(decoded, [800,450]);
  scanner.scanFrame(); assert.equal(reads, 1);
});

test('QR malformado não gera exceção nem consulta remota', async () => {
  const c = client({ validateCheckin: () => { throw Error('não consultar'); } });
  await c.validateToken('https://example.test/?t=%ZZ');
  assert.equal(c.lastResult[0], 'invalid');
});

test('reenvio de transporte usa exatamente o mesmo ID e não repete erro de negócio', async () => {
  const window = {}; vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/api.js'),'utf8'), { window });
  let calls = 0;
  window.WeddingApi.checkinRequest = async (_, data) => { calls++; assert.equal(data.requestId, 'fixed'); if (calls === 1) throw Object.assign(Error('rede'), { kind: 'network' }); return allowed(); };
  assert.equal((await window.WeddingApi.validateCheckin({ token, requestId: 'fixed' })).status, 'allowed');
  assert.equal(calls, 2);
  window.WeddingApi.checkinRequest = async () => { calls++; throw Object.assign(Error('Sessão inválida'), { kind: 'business' }); };
  await assert.rejects(window.WeddingApi.validateCheckin({ token, requestId: 'fixed' }));
  assert.equal(calls, 3);
});

test('QR em processamento não mostra nome nem acompanhante antes do resultado', async () => {
  let resolve;
  const c = client({ validateCheckin: () => new Promise(r => resolve = r) });
  const pending = c.validateToken(token);
  assert.equal(c.lastResult[0], 'reading');
  assert.match(c.lastResult[1], /aguarde a validação/);
  assert.equal(c.lastResult[2], 'Aguarde…');
  assert.equal(c.lastResult[4], undefined);
  resolve(allowed());
  await pending;
  assert.equal(c.lastResult[0], 'allowed');
  assert.equal(c.lastResult[2], 'Ana');
});

test('falha de conexão não apresenta nome como se houvesse resultado confirmado', async () => {
  const c = client({ validateCheckin: async () => { throw Object.assign(Error('rede'), { kind: 'network' }); } });
  await c.validateToken(token);
  assert.equal(c.lastResult[0], 'invalid');
  assert.equal(c.lastResult[2], 'Tente novamente');
  assert.equal(c.lastResult[4], undefined);
});

test('modo offline envia 10 pendências automaticamente sem baixar lista nem mudar modo', async () => {
  let calls = 0;
  const c = client({ validateCheckin: async data => { calls++; assert.ok(data.requestId); return {status:'allowed'}; }, syncCheckinRoster: () => { throw Error('Não deve baixar lista'); } });
  c.offlineModeToggle.checked = true;
  c.writeOfflineQueue(Array.from({length:10}, (_,i) => ({token:`CHK-TEST${i}-ABC`,requestId:`request-123456789012345${i}`})));
  await c.backgroundSyncTick();
  assert.equal(calls,10);
  assert.equal(c.readOfflineQueue().length,0);
  assert.equal(c.offlineModeToggle.checked,true);
  assert.ok(c.readStored(c.queueSyncKey));
});

test('nova entrada offline é liberada durante envio e preservada para o próximo lote', async () => {
  let resolve;
  const c = client({ validateCheckin: () => new Promise(r => resolve=r) });
  c.offlineModeToggle.checked = true;
  c.writeOfflineQueue([{token:'CHK-OUTRO-ABC',requestId:'request-1234567890123457'}]);
  const background = c.backgroundSyncTick();
  assert.equal(c.syncing,true);
  await c.validateToken(token);
  assert.equal(c.lastResult[0],'allowed');
  assert.equal(c.syncing,true);
  resolve({status:'allowed'});
  await background;
  assert.equal(c.readOfflineQueue().length,1);
  assert.equal(c.readOfflineQueue()[0].token,token);
});

test('falha mantém pendências e aumenta intervalo; sucesso restaura intervalo curto', async () => {
  let calls=0, fail=true;
  const c=client({validateCheckin:async()=>{calls++; if(fail)throw Error('rede'); return {status:'allowed'};}});
  c.writeOfflineQueue([{token,requestId:'request-1234567890123456'}]);
  for(const expected of [15000,30000,60000,60000]) {
    c.nextQueueSyncAt=0;
    await c.backgroundSyncTick();
    assert.equal(c.queueRetryMs,expected);
    assert.equal(c.readOfflineQueue().length,1);
    const before=calls;
    await c.backgroundSyncTick();
    assert.equal(calls,before);
  }
  fail=false; c.nextQueueSyncAt=0;
  await c.backgroundSyncTick();
  assert.equal(c.queueRetryMs,5000);
  assert.equal(c.readOfflineQueue().length,0);
});

test('não inicia envio paralelo, sem rede, com tela oculta ou fila só de conflitos', async () => {
  let calls=0;
  const c=client({validateCheckin:async()=>{calls++;return {status:'allowed'};}});
  c.writeOfflineQueue([{token,requestId:'request-1234567890123456'}]);
  c.syncing=true; await c.backgroundSyncTick();
  c.syncing=false; c.testEnvironment.navigator.onLine=false; await c.backgroundSyncTick();
  c.testEnvironment.navigator.onLine=true; c.testEnvironment.document.hidden=true; await c.backgroundSyncTick();
  c.testEnvironment.document.hidden=false;
  c.writeOfflineQueue([{token,conflict:true}]); await c.backgroundSyncTick();
  assert.equal(calls,0);
});

test('servidor ocupado não descarta entrada e conflito permanece visível', async () => {
  let status='busy';
  const c=client({validateCheckin:async()=>({status})});
  c.writeOfflineQueue([{token,requestId:'request-1234567890123456'}]);
  await c.backgroundSyncTick();
  assert.equal(c.readOfflineQueue().length,1);
  assert.equal(c.queueRetryMs,15000);
  status='used'; c.nextQueueSyncAt=0; await c.backgroundSyncTick();
  assert.equal(c.readOfflineQueue()[0].conflict,true);
});

test('temporizador de 5 segundos é instalado para sincronização em segundo plano', async () => {
  const c=client(); const intervals=[];
  c.testEnvironment.window.setInterval=(fn,ms)=>intervals.push({fn,ms});
  c.testEnvironment.window.addEventListener=()=>{};
  for(const name of ['loginForm','logoutButton','startButton','stopButton','manualForm','manualCancelButton','manualConfirmButton','manualConfirmDialog','syncButton']) c[name]={addEventListener(){}};
  c.offlineModeToggle.addEventListener=()=>{};
  c.bindEvents();
  let ticks=0; c.backgroundSyncTick=()=>ticks++;
  intervals.find(i=>i.ms===5000).fn();
  assert.equal(ticks,1);
});
