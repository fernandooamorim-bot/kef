const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function backend() {
  const events = [];
  const rows = [];
  const cache = new Map();
  const properties = new Map();
  const sheet = { getLastRow: () => rows.length + 1 };
  const context = vm.createContext({
    console,
    Buffer,
    SpreadsheetApp: { flush: () => events.push("flush") },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => events.push("unlock") }) },
    CacheService: { getScriptCache: () => ({
      get: (key) => cache.get(key) || null,
      put: (key, value) => cache.set(key, value),
      remove: (key) => cache.delete(key)
    }) },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: (key) => properties.get(key) || null,
      setProperty: (key, value) => properties.set(key, value)
    }) },
    Utilities: {
      newBlob: (value) => ({ getBytes: () => Buffer.from(value) }),
      getUuid: () => String(Math.random())
    }
  });
  vm.runInContext(fs.readFileSync(path.join(root, "appscript/Code.gs"), "utf8"), context);
  context.jsonResponse = (ok, data, error) => ({ ok, data, error });
  context.getRsvpAvailability_ = () => ({ open: true });
  context.findGuestById_ = (id) => id === "KF001" ? { guest_id: id, name: "Pessoa Teste", allowed_companions: 0 } : null;
  context.findLatestRsvpByGuestId_ = (id) => rows.findLast((row) => row.guest_id === id) || null;
  context.readKeyValueSheet_ = () => ({ rsvp_show_digital_invite: true });
  context.createCheckinToken_ = () => "CHK-KF001-ABC";
  context.buildCheckinLink_ = () => "https://example.test/checkin";
  context.buildInviteLink_ = () => "https://example.test/convite";
  context.createCancellationToken_ = () => "CANCEL-KF001-ABC";
  context.buildCancellationLink_ = () => "https://example.test/cancelar";
  context.buildQrCodeUrl_ = () => "https://example.test/qr";
  context.buildWhatsappLink_ = () => "https://example.test/whatsapp";
  context.getOrCreateSheet_ = () => sheet;
  context.appendRecord_ = (_, record) => { events.push("append"); rows.push(record); };
  context.recordConfirmationEmailResult_ = () => events.push("email-status");
  context.sendRsvpConfirmationEmail_ = () => { events.push("email"); return { sentAt: new Date(), error: "" }; };
  return { context, events, rows, cache, properties };
}

test("RSVP grava antes do email e segunda tentativa não duplica", () => {
  const { context, events, rows } = backend();
  const data = { guestId: "KF001", guestName: "Pessoa Teste", attendance: "confirmed", phone: "85999999999", email: "teste@example.test" };
  const first = context.handleRsvp_(data);
  const second = context.handleRsvp_(data);
  assert.equal(first.ok, true);
  assert.equal(first.data.inviteLink, "https://example.test/convite");
  assert.equal(second.data.alreadyRegistered, true);
  assert.equal(second.data.inviteLink, undefined);
  assert.equal(rows.length, 1);
  assert.equal(events.filter((event) => event === "email").length, 1);
  assert.ok(events.indexOf("append") < events.indexOf("email"));
});

test("RSVP respeita fechamento da janela antes da gravação", () => {
  const { context, events, rows } = backend();
  let checks = 0;
  context.getRsvpAvailability_ = () => (++checks === 1
    ? { open: true }
    : { open: false, message: "Confirmações encerradas." });
  const result = context.handleRsvp_({ guestId: "KF001", guestName: "Pessoa Teste", attendance: "confirmed", phone: "85999999999", email: "teste@example.test" });
  assert.equal(result.ok, false);
  assert.equal(result.error, "Confirmações encerradas.");
  assert.equal(rows.length, 0);
  assert.equal(events.includes("email"), false);
});

test("RSVP não envia email quando a gravação falha", () => {
  const { context, events } = backend();
  context.appendRecord_ = () => { throw new Error("sheet down"); };
  assert.throws(() => context.handleRsvp_({ guestId: "KF001", guestName: "Pessoa Teste", attendance: "confirmed", phone: "85999999999", email: "teste@example.test" }), /sheet down/);
  assert.equal(events.includes("email"), false);
  assert.equal(events.includes("unlock"), true);
});

test("gestão registra presença sem contato, cria QR e não duplica resposta", () => {
  const { context, events, rows } = backend();
  context.validateOperator_ = () => ({ ok: true, username: "equipe", name: "Equipe" });
  context.findGuestById_ = () => ({ guest_id: "KF001", name: "Pessoa Teste", status: "ativo", allowed_companions: 1, phone: "", email: "" });
  const data = { guestId: "KF001", attendance: "confirmed", companionsConfirmed: 1, companionName: "Acompanhante" };
  const first = context.handleAdminRespondGuest_(data);
  const second = context.handleAdminRespondGuest_(data);
  assert.equal(first.ok, true);
  assert.equal(first.data.guest.inviteLink, "https://example.test/convite");
  assert.equal(first.data.guest.totalPeople, 2);
  assert.equal(rows[0].source, "gestao_manual:Equipe");
  assert.equal(rows[0].email, "");
  assert.equal(second.data.alreadyRegistered, true);
  assert.equal(rows.length, 1);
  assert.equal(events.includes("email"), false);
  assert.equal(events.includes("flush"), true);
});

test("gestão registra ausência sem QR e impede acompanhantes acima do convite", () => {
  const { context, rows } = backend();
  context.validateOperator_ = () => ({ ok: true, username: "equipe" });
  context.findGuestById_ = () => ({ guest_id: "KF001", name: "Pessoa Teste", status: "ativo", allowed_companions: 1 });
  const invalid = context.handleAdminRespondGuest_({ guestId: "KF001", attendance: "confirmed", companionsConfirmed: 2 });
  assert.equal(invalid.ok, false);
  assert.equal(rows.length, 0);
  const declined = context.handleAdminRespondGuest_({ guestId: "KF001", attendance: "declined", companionsConfirmed: 0 });
  assert.equal(declined.ok, true);
  assert.equal(rows[0].checkin_token, "");
  assert.equal(rows[0].attendance, "declined");
});

test("quadro administrativo separa vagas convidadas, confirmadas e liberadas", () => {
  const { context } = backend();
  context.validateOperator_ = () => ({ ok: true, username: "equipe" });
  context.readTableSheet_ = () => [
    { guest_id: "KF001", name: "Primeira", status: "ativo", allowed_companions: 1 },
    { guest_id: "KF002", name: "Segunda", status: "ativo", allowed_companions: 1 },
    { guest_id: "KF003", name: "Terceira", status: "ativo", allowed_companions: 2 }
  ];
  context.getLatestRsvpByGuestIdMap_ = () => ({
    KF001: { attendance: "confirmed", companions_confirmed: 0 },
    KF002: { attendance: "declined", companions_confirmed: 0 }
  });
  const result = context.handleAdminSummary_({});
  assert.equal(result.data.capabilities.adminRespondGuest, true);
  assert.equal(result.data.totals.invitedPeople, 7);
  assert.equal(result.data.totals.confirmedPeople, 1);
  assert.equal(result.data.totals.pendingPeople, 3);
  assert.equal(result.data.totals.releasedPeople, 3);
  assert.equal(result.data.totals.projectedPeople, 4);
  assert.equal(result.data.totals.declinedPeople, 2);
  assert.equal(result.data.totals.unusedCompanions, 1);
});

test("painel administrativo só envia resposta depois da confirmação", async () => {
  let requests = 0;
  const window = { WeddingApi: { respondAdminGuest: async () => {
    requests += 1;
    return { message: "Presença registrada pela gestão." };
  } } };
  const context = vm.createContext({ window, document: { addEventListener: () => {} }, console });
  vm.runInContext(fs.readFileSync(path.join(root, "js/admin.js"), "utf8"), context);
  const admin = window.WeddingAdmin;
  admin.credentials = { sessionToken: "test" };
  admin.guests = [{ guestId: "KF001", name: "Pessoa Teste", status: "pending", allowedCompanions: 1 }];
  admin.responseForm = { reset() {}, elements: { companionsConfirmed: { value: "1", innerHTML: "" }, companionName: { value: "Acompanhante" } } };
  admin.responseStatus = { textContent: "" };
  admin.responseMode = { textContent: "" };
  admin.responseTitle = { textContent: "" };
  admin.responseDescription = { textContent: "" };
  admin.responseCompanionFields = { hidden: true };
  admin.responseSubmit = { textContent: "", disabled: false };
  admin.responseCancel = { disabled: false };
  admin.responseDialog = { showModal() {}, close() {} };
  admin.loadSummary = async () => true;
  admin.showActionFeedback = () => {};
  admin.openResponse("KF001", "confirmed");
  assert.equal(requests, 0);
  await admin.submitResponse({ preventDefault() {} });
  assert.equal(requests, 1);
  assert.equal(admin.responseSubmit.disabled, false);
});

test("painel oculta ações manuais até o Apps Script oferecer suporte", () => {
  const window = {};
  const context = vm.createContext({ window, document: { addEventListener: () => {} }, console });
  vm.runInContext(fs.readFileSync(path.join(root, "js/admin.js"), "utf8"), context);
  const admin = window.WeddingAdmin;
  admin.guests = [{ guestId: "KF001", name: "Pessoa Teste", group: "Família", status: "pending", statusLabel: "Falta confirmar", allowedCompanions: 1 }];
  admin.search = { value: "" };
  admin.groupSelect = { value: "" };
  admin.listCount = { textContent: "" };
  admin.list = { innerHTML: "" };
  assert.equal(admin.escape(0), "0");
  admin.renderList();
  assert.equal(admin.list.innerHTML.includes("data-admin-response"), false);
  admin.manualResponseAvailable = true;
  admin.renderList();
  assert.equal(admin.list.innerHTML.includes("data-admin-response"), true);
});

test("frontend não reenvia RSVP após falha de rede", async () => {
  let requests = 0;
  const window = {
    WEDDING_CONFIG: { appScriptUrl: "https://example.test/exec" },
    setTimeout,
    clearTimeout
  };
  const context = vm.createContext({ window, URL, AbortController, console: { warn: () => {} }, fetch: async () => {
    requests += 1;
    throw new TypeError("Network error");
  } });
  vm.runInContext(fs.readFileSync(path.join(root, "js/api.js"), "utf8"), context);
  await assert.rejects(window.WeddingApi.submitRsvp({ guestId: "KF001" }), /pode ter sido registrada/);
  assert.equal(requests, 1);
});

test("busca reutiliza índice e invalida após gravação", () => {
  const { context } = backend();
  let reads = 0;
  context.getLatestRsvpByGuestIdMap_ = () => ({});
  context.readTableSheet_ = () => { reads += 1; return [{ guest_id: "KF001", name: "Pessoa Teste", status: "ativo" }]; };
  assert.equal(context.handleGuestSearch_("pe").data.guests.length, 1);
  assert.equal(context.handleGuestSearch_("pes").data.guests.length, 1);
  assert.equal(reads, 1);
  context.invalidateGuestSearchCache_();
  context.handleGuestSearch_("pes");
  assert.equal(reads, 2);
});

test("falha de leitura do cache não impede busca de convidados", () => {
  const { context } = backend();
  context.console = { ...console, error: () => {} };
  context.CacheService.getScriptCache = () => ({ get: () => { throw new Error("cache unavailable"); }, put: () => {} });
  context.getLatestRsvpByGuestIdMap_ = () => ({});
  context.readTableSheet_ = () => [{ guest_id: "KF001", name: "Pessoa Teste", status: "ativo" }];
  assert.equal(context.handleGuestSearch_("pes").data.guests.length, 1);
});

test("check-in bloqueia segundo uso e QR cancelado", () => {
  const { context } = backend();
  const record = { guest_id: "KF001", guest_name: "Pessoa Teste", attendance: "confirmed", checkin_token: "CHK-KF001-ABC", checkin_at: "", rowNumber: 2 };
  const records = [record];
  context.validateOperator_ = () => ({ ok: true, name: "Portaria" });
  context.extractCheckinToken_ = (value) => value;
  context.readRsvpRecords_ = () => records;
  context.markCheckin_ = () => { record.checkin_at = new Date(); };
  assert.equal(context.handleCheckinValidate_({ token: record.checkin_token }).data.status, "allowed");
  assert.equal(context.handleCheckinValidate_({ token: record.checkin_token }).data.status, "used");
  record.checkin_at = "";
  records.push({ guest_id: "KF001", guest_name: "Pessoa Teste", attendance: "cancelled", checkin_token: "" });
  assert.equal(context.handleCheckinValidate_({ token: record.checkin_token }).data.status, "invalid");
});

test("check-in não usa lista offline sem escolha do operador", async () => {
  const window = { WeddingApi: { validateCheckin: async () => { const error = new Error("timeout"); error.kind = "timeout"; throw error; } } };
  const context = vm.createContext({ window, console, document: { addEventListener: () => {} } });
  vm.runInContext(fs.readFileSync(path.join(root, "js/checkin.js"), "utf8"), context);
  const checkin = window.WeddingCheckin;
  checkin.credentials = { sessionToken: "test" };
  checkin.offlineModeToggle = { checked: false };
  checkin.showResult = () => {};
  checkin.afterValidation = () => {};
  let offlineCalls = 0;
  checkin.validateOffline = () => { offlineCalls += 1; return true; };
  await checkin.validateToken("CHK-KF001-ABC");
  assert.equal(offlineCalls, 0);
  checkin.offlineModeToggle.checked = true;
  await checkin.validateToken("CHK-KF001-ABC");
  assert.equal(offlineCalls, 1);
});

test("busca manual só valida após confirmação do operador", async () => {
  let requests = 0;
  const window = { WeddingApi: { validateCheckin: async () => { requests += 1; return { status: "allowed", title: "Entrada liberada", guest: { name: "Pessoa Teste" } }; } } };
  const context = vm.createContext({ window, console, document: { addEventListener: () => {} } });
  vm.runInContext(fs.readFileSync(path.join(root, "js/checkin.js"), "utf8"), context);
  const checkin = window.WeddingCheckin;
  checkin.credentials = { sessionToken: "test" };
  checkin.manualConfirmName = { textContent: "" };
  checkin.manualConfirmDetails = { textContent: "" };
  checkin.manualConfirmButton = { textContent: "" };
  checkin.manualConfirmDialog = { showModal() {}, close() {} };
  checkin.markManualSelection = () => {};
  checkin.restoreManualSelection = () => {};
  checkin.showResult = () => {};
  checkin.scrollToResult = () => {};
  checkin.renderValidation = () => {};
  const guest = { name: "Pessoa Teste", token: "CHK-KF001-ABC", checkinStatus: "pendente" };
  checkin.selectManualGuest(guest, {});
  assert.equal(requests, 0);
  checkin.manualSelection = null;
  checkin.confirmManualSelection();
  assert.equal(requests, 0);
  checkin.selectManualGuest(guest, {});
  checkin.confirmManualSelection();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(requests, 1);
});

test("sincronização offline marca conflito em vez de descartá-lo", async () => {
  const window = { WeddingApi: { validateCheckin: async () => ({ status: "used" }) } };
  const context = vm.createContext({ window, console, document: { addEventListener: () => {} } });
  vm.runInContext(fs.readFileSync(path.join(root, "js/checkin.js"), "utf8"), context);
  const checkin = window.WeddingCheckin;
  checkin.credentials = { sessionToken: "test" };
  let saved = [];
  checkin.readOfflineQueue = () => [{ token: "CHK-KF001-ABC" }];
  checkin.writeOfflineQueue = (queue) => { saved = queue; return true; };
  const result = await checkin.flushOfflineQueue();
  assert.equal(result.conflicts, 1);
  assert.equal(result.synced, 0);
  assert.equal(saved[0].conflict, true);
});

test("fila pendente tenta sincronizar quando a conexão volta", () => {
  const window = {};
  const context = vm.createContext({ window, console, document: { addEventListener: () => {} } });
  vm.runInContext(fs.readFileSync(path.join(root, "js/checkin.js"), "utf8"), context);
  const checkin = window.WeddingCheckin;
  checkin.credentials = { sessionToken: "test" };
  let syncs = 0;
  checkin.syncRoster = () => { syncs += 1; };
  checkin.readOfflineQueue = () => [{ token: "CHK-KF001-ABC" }];
  checkin.syncPendingCheckins();
  assert.equal(syncs, 1);
  checkin.readOfflineQueue = () => [{ token: "CHK-KF001-ABC", conflict: true }];
  checkin.syncPendingCheckins();
  assert.equal(syncs, 1);
});

test("service worker reconhece caminho /kef/ e versão na URL", async () => {
  const handlers = {};
  const self = {
    location: { origin: "https://example.test" },
    registration: { scope: "https://example.test/kef/" },
    addEventListener: (name, handler) => { handlers[name] = handler; }
  };
  const caches = { open: async () => ({ put: async () => {} }), match: async () => null };
  const context = vm.createContext({ self, caches, URL, fetch: async () => ({ ok: true, clone: () => ({}) }) });
  vm.runInContext(fs.readFileSync(path.join(root, "sw-checkin.js"), "utf8"), context);
  let handled = false;
  handlers.fetch({ request: { method: "GET", url: "https://example.test/kef/js/checkin.js?v=1" }, respondWith: (promise) => { handled = true; return promise; } });
  assert.equal(handled, true);
});
