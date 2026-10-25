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
  vm.runInNewContext(source, { window, localStorage, document: { addEventListener() {}, hidden: false }, console });
  const c = window.WeddingCheckin;
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
