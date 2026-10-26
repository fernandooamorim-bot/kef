window.WeddingCheckin = {
  credentials: null,
  stream: null,
  scanning: false,
  validating: false,
  syncing: false,
  lastToken: "",
  lastReadAt: 0,
  readLockedUntil: 0,
  resetTimer: null,
  audioContext: null,
  history: [],
  sessionKey: "kf_checkin_operator",
  rosterKey: "kf_checkin_roster_v1",
  offlineQueueKey: "kf_checkin_queue_v1",
  operationKey: "kf_checkin_operations_v1",
  admissionKey: "kf_checkin_admissions_v1",
  syncRetryMs: 15000,
  queueRetryMs: 5000,
  nextQueueSyncAt: 0,
  queueSyncKey: "kf_checkin_last_queue_sync_v1",
  rosterTtlMs: 2 * 60 * 60 * 1000,

  init() {
    this.cacheElements();
    this.bindEvents();
    const token = new URLSearchParams(window.location.search).get("t");
    if (token) this.pendingToken = token;
    this.restoreSession();
    this.registerServiceWorker();
    if (token && !this.credentials) {
      this.showResult("idle", "QR Code recebido", "Faça login para validar", "O convite será verificado após o acesso do operador.");
    }
  },

  cacheElements() {
    this.loginPanel = document.getElementById("loginPanel");
    this.loginForm = document.getElementById("loginForm");
    this.loginStatus = document.getElementById("loginStatus");
    this.app = document.getElementById("checkinApp");
    this.operatorName = document.getElementById("operatorName");
    this.logoutButton = document.getElementById("logoutButton");
    this.resultPanel = document.getElementById("resultPanel");
    this.resultTitle = document.getElementById("resultTitle");
    this.resultIcon = document.getElementById("resultIcon");
    this.resultReason = document.getElementById("resultReason");
    this.resultName = document.getElementById("resultName");
    this.resultMessage = document.getElementById("resultMessage");
    this.resultDetails = document.getElementById("resultDetails");
    this.scannerPanel = document.getElementById("scannerPanel");
    this.scannerSignal = document.getElementById("scannerSignal");
    this.video = document.getElementById("scannerVideo");
    this.canvas = document.getElementById("scannerCanvas");
    this.startButton = document.getElementById("startScannerButton");
    this.stopButton = document.getElementById("stopScannerButton");
    this.manualForm = document.getElementById("manualForm");
    this.manualResults = document.getElementById("manualResults");
    this.manualConfirmDialog = document.getElementById("manualConfirmDialog");
    this.manualConfirmName = document.getElementById("manualConfirmName");
    this.manualConfirmDetails = document.getElementById("manualConfirmDetails");
    this.manualConfirmButton = document.getElementById("manualConfirmButton");
    this.manualCancelButton = document.getElementById("manualCancelButton");
    this.historyList = document.getElementById("checkinHistory");
    this.syncButton = document.getElementById("syncRosterButton");
    this.syncStatus = document.getElementById("syncStatus");
    this.syncDetails = document.getElementById("syncDetails");
    this.offlineModeToggle = document.getElementById("offlineModeToggle");
  },

  bindEvents() {
    this.loginForm.addEventListener("submit", (event) => this.login(event));
    this.logoutButton.addEventListener("click", () => this.logout());
    this.startButton.addEventListener("click", () => this.startScanner());
    this.stopButton.addEventListener("click", () => this.stopScanner());
    this.manualForm.addEventListener("submit", (event) => this.searchManual(event));
    this.manualCancelButton.addEventListener("click", () => this.manualConfirmDialog.close());
    this.manualConfirmButton.addEventListener("click", () => this.confirmManualSelection());
    this.manualConfirmDialog.addEventListener("close", () => { this.manualSelection = null; });
    window.addEventListener("online", () => this.syncRoster({ silent: true }));
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && navigator.onLine) this.syncPendingCheckins();
    });
    window.setInterval(() => {
      if (this.credentials && !document.hidden && navigator.onLine && !this.validating && !this.offlineModeToggle?.checked) this.syncRoster({ silent: true });
    }, 60000);
    window.setInterval(() => this.backgroundSyncTick(), 5000);
    this.syncButton?.addEventListener("click", () => this.syncRoster());
    this.offlineModeToggle?.addEventListener("change", () => {
      if (this.offlineModeToggle.checked && this.isRosterStale()) {
        this.offlineModeToggle.checked = false;
        this.renderSyncState("Atualize a lista antes de ativar o modo offline.");
      } else {
        this.renderSyncState(this.offlineModeToggle.checked ? "Modo offline ativo. Use somente este aparelho para liberar entradas." : "Validação online ativa.");
      }
    });
  },

  restoreSession() {
    const saved = this.readSession();
    if (saved?.username && saved?.sessionToken) {
      this.credentials = saved;
      this.showApp(saved.name || saved.username);
      this.renderSyncState();
      if (this.pendingToken) {
        this.validateToken(this.pendingToken).finally(() => this.syncRoster({ silent: true }));
      } else {
        this.syncRoster({ silent: true });
      }
    }
  },

  async login(event) {
    event.preventDefault();
    const credentials = {
      username: this.loginForm.elements.username.value.trim(),
      password: this.loginForm.elements.password.value.trim()
    };
    this.loginStatus.textContent = "Validando acesso...";

    try {
      const result = await window.WeddingApi.checkinLogin(credentials);
      this.credentials = {
        username: result.operator?.username || credentials.username,
        name: result.operator?.name || credentials.username,
        sessionToken: result.sessionToken
      };
      this.writeSession(this.credentials);
      this.showApp(this.credentials.name);
      this.loginStatus.textContent = "";
      this.renderSyncState();
      if (this.pendingToken) {
        this.validateToken(this.pendingToken).finally(() => this.syncRoster({ silent: true }));
      } else {
        this.syncRoster({ silent: true });
      }
    } catch (error) {
      this.loginStatus.textContent = error.message || "Não foi possível entrar.";
    }
  },

  logout() {
    this.stopScanner();
    if (this.manualConfirmDialog?.open) this.manualConfirmDialog.close();
    if (this.offlineModeToggle) this.offlineModeToggle.checked = false;
    window.clearTimeout(this.syncRetryTimer);
    this.clearSession();
    this.credentials = null;
    this.app.hidden = true;
    this.loginPanel.hidden = false;
    this.loginForm.reset();
  },

  readSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.sessionKey) || "null");
      if (!saved) return null;
      return saved;
    } catch (error) {
      this.clearSession();
      return null;
    }
  },

  writeSession(value) {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(value));
    } catch (error) {
      return false;
    }
    return true;
  },

  clearSession() {
    localStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.sessionKey);
  },

  isInvalidSessionError(error) {
    return /sessão inválida/i.test(String(error?.message || error || ""));
  },

  showApp(name) {
    this.operatorName.textContent = name || "Equipe";
    this.loginPanel.hidden = true;
    this.app.hidden = false;
  },

  async startScanner() {
    if (this.scanning || this.startingScanner) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.showResult("invalid", "Câmera indisponível", "Use a busca manual", "Este navegador não liberou acesso à câmera.");
      return;
    }

    if (!window.jsQR) {
      this.showResult("invalid", "Leitor indisponível", "Use a busca manual", "A biblioteca de QR Code não carregou.");
      return;
    }

    this.startingScanner = true;
    this.startButton.disabled = true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      this.video.srcObject = this.stream;
      await this.video.play();
      this.scanning = true;
      this.startButton.disabled = true;
      this.stopButton.disabled = false;
      this.prepareAudio();
      this.setScannerSignal("reading", "Câmera ativa. Aponte para o QR Code.");
      this.scanFrame();
    } catch (error) {
      this.showResult("invalid", "Câmera bloqueada", "Use a busca manual", "Permita o acesso à câmera ou faça a validação pelo nome.");
      this.stopScanner();
      this.setScannerSignal("error", "Câmera bloqueada.");
    } finally {
      this.startingScanner = false;
      this.startButton.disabled = this.scanning;
    }
  },

  stopScanner() {
    this.scanning = false;
    window.cancelAnimationFrame?.(this.frameId);
    window.clearTimeout(this.resetTimer);
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.video.srcObject = null;
    this.startButton.disabled = false;
    this.stopButton.disabled = true;
    this.setScannerSignal("", "Câmera parada");
  },

  scanFrame() {
    if (!this.scanning) return;
    this.frameId = window.requestAnimationFrame(() => this.scanFrame());
    const now = Date.now();
    if (this.validating || document.hidden || this.manualConfirmDialog?.open || now < this.readLockedUntil || now - (this.lastFrameAt || 0) < 120) return;
    this.lastFrameAt = now;
    const sourceWidth = this.video.videoWidth, sourceHeight = this.video.videoHeight;
    if (!sourceWidth || !sourceHeight) return;
    const scale = Math.min(1, 800 / Math.max(sourceWidth, sourceHeight));
    const width = Math.round(sourceWidth * scale), height = Math.round(sourceHeight * scale);
    const context = this.canvas.getContext("2d", { willReadFrequently: true });
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
    context.drawImage(this.video, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const code = window.jsQR(imageData.data, width, height);
    if (code?.data) this.handleQrValue(code.data);
  },

  handleQrValue(value) {
    const now = Date.now();
    value = this.extractToken(value) || value;
    if (value === this.lastToken && now - this.lastReadAt < 5500) return;
    this.lastToken = value;
    this.lastReadAt = now;
    this.readLockedUntil = now + 900;
    this.setScannerSignal("validating", "QR Code lido. Validando convite...");
    this.playFeedback("read");
    this.validateToken(value);
  },

  newRequestId() {
    return window.crypto?.randomUUID?.() || `entry-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  },

  readStored(key, fallback = {}) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch { return fallback; }
  },

  writeStored(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  },

  async withEntryLock(task) {
    if (typeof navigator !== "undefined" && navigator.locks?.request) {
      return navigator.locks.request("kf-checkin-entry", { ifAvailable: true }, lock => {
        if (!lock) throw new Error("Outra aba está registrando uma entrada. Use somente uma aba de check-in.");
        return task();
      });
    }
    return task();
  },

  async validateToken(value, options = {}) {
    if (!this.credentials) { this.pendingToken = value; return; }
    if (this.validating) return;
    const token = this.extractToken(value);
    if (!token) {
      this.showResult("invalid", "QR Code inválido", "Use o convite do casamento", "Este código não contém um convite válido.");
      this.afterValidation("invalid", "QR Code inválido");
      return;
    }
    this.pendingToken = null;
    this.validating = true;
    const session = this.credentials;
    this.showResult("reading", "QR lido — aguarde a validação", "Aguarde…", "Não libere a entrada até aparecer o resultado.");
    if (options.scrollToResult) this.scrollToResult();
    const startedAt = Date.now();
    try {
      await this.withEntryLock(async () => {
        const operations = this.readStored(this.operationKey);
        if (this.offlineModeToggle?.checked) {
          if (operations[token]) throw new Error("Há uma validação online sem resposta para este QR. Desative o modo offline e leia novamente para conferir o registro.");
          if (!this.validateOffline(token, options)) throw new Error("Convite não encontrado na lista local. Confira online.");
          return;
        }
        const operation = operations[token] || { requestId: this.newRequestId() };
        operations[token] = operation;
        if (!this.writeStored(this.operationKey, operations)) throw new Error("Não foi possível guardar a operação neste aparelho. Libere espaço ou use outro aparelho.");
        // The same ID survives timeouts, reloads and retries. Never turn an uncertain online write into an offline admission.
        const result = await window.WeddingApi.validateCheckin({ ...session, token, requestId: operation.requestId });
        const persisted = this.credentials === session ? this.renderValidation(result, options) !== false : false;
        if (result.status !== "busy" && persisted) {
          const latest = this.readStored(this.operationKey);
          delete latest[token];
          this.writeStored(this.operationKey, latest);
        }
        if (this.credentials !== session) return;
        this.lastValidationMs = Date.now() - startedAt;
        if (this.resultMessage) this.resultMessage.textContent += ` (${(this.lastValidationMs / 1000).toFixed(1)} s)`;
      });
    } catch (error) {
      if (this.credentials !== session) return;
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Seu acesso foi atualizado. Faça login novamente.";
        return;
      }
      this.showResult("invalid", "Entrada não confirmada", "Tente novamente", this.isConnectionError(error)
        ? "A resposta não chegou. Não libere a entrada; leia o mesmo QR novamente para recuperar a confirmação."
        : error.message || "Não foi possível validar agora.");
      this.afterValidation("invalid", "Entrada não confirmada");
    } finally { this.validating = false; }
  },

  async searchManual(event) {
    event.preventDefault();
    this.manualSelection = null;
    const query = this.manualForm.elements.query.value.trim();
    if (query.length < 2) {
      this.manualResults.innerHTML = '<p class="checkin-status">Digite pelo menos duas letras.</p>';
      return;
    }

    const local = this.searchOfflineGuests(query);
    if (local.length || this.offlineModeToggle?.checked) { this.renderManualResults(local); return; }
    this.manualResults.innerHTML = '<p class="checkin-status">Buscando...</p>';
    try {
      const result = await window.WeddingApi.searchCheckinGuests({
        ...this.credentials,
        query
      });
      this.renderManualResults(result.guests || []);
    } catch (error) {
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Seu acesso foi atualizado. Faça login novamente.";
        return;
      }
      const guests = this.searchOfflineGuests(query);
      if (guests.length) {
        this.renderManualResults(guests);
        this.setSyncState("Busca local", "Resultado da última lista sincronizada.");
        return;
      }
      this.manualResults.innerHTML = `<p class="checkin-status">${this.escape(error.message || "Não foi possível buscar.")}</p>`;
    }
  },

  async syncRoster(options = {}) {
    if (!this.credentials || this.syncing) return false;
    this.syncing = true;
    if (this.syncButton) this.syncButton.disabled = true;
    const session = this.credentials;
    window.clearTimeout(this.syncRetryTimer);
    this.setSyncState("Atualizando lista...", "Baixando confirmações e enviando validações pendentes.");

    try {
      const queueResult = await this.flushOfflineQueue();
      const result = await window.WeddingApi.syncCheckinRoster(session);
      if (this.credentials !== session) return false;
      if (!Array.isArray(result?.guests)) {
        throw new Error("O servidor não enviou uma lista válida.");
      }
      if (!this.writeRoster(result.guests, result.syncedAt || new Date().toISOString())) {
        throw new Error("Não foi possível salvar a lista neste aparelho.");
      }
      const suffix = queueResult.pending
        ? ` ${queueResult.pending} validação(ões) ainda aguardam internet.`
        : queueResult.synced
          ? ` ${queueResult.synced} validação(ões) offline foram sincronizadas.`
          : "";
      const conflicts = queueResult.conflicts ? ` ${queueResult.conflicts} entrada(s) exigem conferência manual.` : "";
      this.syncRetryMs = 15000;
      this.renderSyncState(`Lista pronta.${suffix}${conflicts}`);
      return true;
    } catch (error) {
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Seu acesso foi atualizado. Faça login novamente.";
        return false;
      }
      this.renderSyncState("Falha ao atualizar. Nova tentativa automática em instantes.");
      if (this.credentials === session) {
        this.syncRetryTimer = window.setTimeout(() => this.syncRoster({ silent: true }), this.syncRetryMs);
        this.syncRetryMs = Math.min(this.syncRetryMs * 2, 60000);
      }
      return false;
    } finally {
      this.syncing = false;
      if (this.syncButton) this.syncButton.disabled = false;
    }
  },

  syncPendingCheckins() {
    if (this.credentials && this.readOfflineQueue().some((item) => !item.conflict)) {
      this.syncRoster({ silent: true });
    }
  },

  backgroundSyncTick() {
    if (!this.credentials || this.syncing || this.validating || document.hidden || !navigator.onLine || Date.now() < this.nextQueueSyncAt) return;
    if (this.readOfflineQueue().some(item => !item.conflict)) return this.syncQueueInBackground();
  },

  async syncQueueInBackground() {
    if (!this.credentials || this.syncing) return;
    const session = this.credentials;
    this.syncing = true;
    if (this.syncButton) this.syncButton.disabled = true;
    this.renderSyncState("Enviando entradas pendentes em segundo plano…");
    try {
      const result = await this.flushOfflineQueue();
      if (this.credentials !== session) return;
      this.queueRetryMs = result.stalled ? Math.min(Math.max(this.queueRetryMs * 2, 15000), 60000) : 5000;
      this.renderSyncState(result.stalled
        ? "Conexão instável. Entradas preservadas; nova tentativa automática."
        : result.conflicts ? "Sincronização concluída com entradas para conferência."
        : result.pending ? "Envio concluído. Novas entradas aguardam a próxima sincronização."
        : "Todas as entradas pendentes foram sincronizadas.");
    } catch (error) {
      if (this.credentials !== session) return;
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Faça login novamente para sincronizar as entradas salvas neste aparelho.";
        return;
      }
      this.queueRetryMs = Math.min(Math.max(this.queueRetryMs * 2, 15000), 60000);
      this.renderSyncState("Não foi possível sincronizar. Entradas preservadas; nova tentativa automática.");
    } finally {
      this.nextQueueSyncAt = Date.now() + this.queueRetryMs;
      this.syncing = false;
      if (this.syncButton) this.syncButton.disabled = false;
    }
  },

  async flushOfflineQueue() {
    let queue = this.readOfflineQueue();
    if (queue.some(item => !item.requestId && !item.conflict)) {
      queue = queue.map(item => item.requestId || item.conflict ? item : { ...item, requestId: this.newRequestId() });
      if (!this.writeOfflineQueue(queue)) throw new Error("Não foi possível preparar as entradas pendentes.");
    }
    const processed = new Map();
    const session = this.credentials;
    let stalled = false;
    let synced = 0;
    for (const item of queue) {
      if (this.credentials !== session) { stalled = true; break; }
      if (item.conflict) continue;
      try {
        const result = await window.WeddingApi.validateCheckin({
          ...session, token: item.token, requestId: item.requestId,
          offline: true, checkedInAt: item.checkedInAt
        });
        if (result.status === "allowed") { processed.set(item.token, null); synced++; }
        else if (result.status === "used" || result.status === "invalid") processed.set(item.token, { ...item, conflict: true });
        else { stalled = true; break; }
      } catch (error) {
        if (this.isInvalidSessionError(error)) throw error;
        stalled = true;
        break;
      }
    }
    // Merge into the CURRENT queue; entries added while the requests ran must survive.
    const save = () => {
      const remaining = this.readOfflineQueue().flatMap(item => {
        if (!processed.has(item.token)) return [item];
        const updated = processed.get(item.token);
        return updated ? [updated] : [];
      });
      if (!this.writeOfflineQueue(remaining)) throw new Error("Não foi possível atualizar as validações pendentes neste aparelho.");
      if (synced) this.writeStored(this.queueSyncKey, new Date().toISOString());
      return { synced, stalled, pending: remaining.filter(item => !item.conflict).length, conflicts: remaining.filter(item => item.conflict).length };
    };
    if (typeof navigator !== "undefined" && navigator.locks?.request) return navigator.locks.request("kf-checkin-entry", save);
    return save();
  },

  validateOffline(token, options = {}) {
    if (this.isRosterStale()) {
      this.showResult("invalid", "Lista offline desatualizada", "Conecte-se à internet", "Atualize a lista antes de validar entradas sem conexão.");
      if (options.scrollToResult) this.scrollToResult();
      this.afterValidation("invalid", "Lista offline desatualizada");
      return true;
    }

    const guest = this.findOfflineGuest(token);
    if (!guest) return false;

    if (guest.checkinStatus === "validado" || this.isOfflineTokenUsed(guest.token)) {
      this.renderValidation({
        status: "used",
        title: "Convite já utilizado",
        message: "Este QR Code já foi validado neste aparelho ou na última sincronização.",
        guest
      }, options);
      return true;
    }

    const checkedInAt = new Date().toISOString();
    if (!this.writeOfflineQueue([...this.readOfflineQueue(), {
      token: guest.token,
      requestId: this.newRequestId(),
      checkedInAt
    }])) {
      this.showResult("invalid", "Não foi possível salvar", guest.name, "Este aparelho não conseguiu registrar a entrada offline.");
      this.afterValidation("invalid", "Não foi possível salvar");
      return true;
    }
    guest.checkinStatus = "validado";
    guest.checkinAt = checkedInAt;
    guest.checkinBy = this.credentials?.name || this.credentials?.username || "Equipe";
    this.updateOfflineGuest(guest);
    this.renderValidation({
      status: "allowed",
      title: "Entrada liberada (offline)",
      message: "Registro salvo neste aparelho e será sincronizado assim que a internet voltar.",
      guest
    }, options);
    this.renderSyncState("Modo offline: há validação pendente de sincronização.");
    return true;
  },

  readRoster() {
    try {
      const raw = localStorage.getItem(this.rosterKey);
      if (raw && raw === this.rosterRaw) return this.rosterCached;
      const roster = JSON.parse(raw || "null");
      if (!roster?.guests || !Array.isArray(roster.guests)) return null;
      this.rosterRaw = raw;
      this.rosterCached = roster;
      return roster;
    } catch (error) {
      return null;
    }
  },

  writeRoster(guests, syncedAt) {
    try {
      const admissions = this.readStored(this.admissionKey);
      guests = guests.map(guest => admissions[guest.token] ? { ...guest, checkinStatus: "validado", checkinAt: admissions[guest.token].checkinAt, checkinBy: admissions[guest.token].checkinBy } : guest);
      localStorage.setItem(this.rosterKey, JSON.stringify({ guests, syncedAt }));
      this.rosterIndexSource = null;
    } catch (error) {
      return false;
    }
    return true;
  },

  findOfflineGuest(value) {
    const token = this.extractToken(value);
    if (!token) return null;
    const roster = this.readRoster();
    if (!roster) return null;
    if (this.rosterIndexSource !== roster.syncedAt) {
      this.rosterIndex = new Map(roster.guests.map(guest => [guest.token, guest]));
      this.rosterIndexSource = roster.syncedAt;
    }
    const guest = this.rosterIndex.get(token);
    if (!guest) return null;
    const admission = this.readStored(this.admissionKey)[token];
    return admission ? { ...guest, checkinStatus: "validado", checkinAt: admission.checkinAt, checkinBy: admission.checkinBy } : { ...guest };
  },

  searchOfflineGuests(query) {
    const term = this.normalize(query);
    if (term.length < 2 || this.isRosterStale()) return [];
    return (this.readRoster()?.guests || [])
      .filter((guest) => this.normalize(guest.name).includes(term))
      .slice(0, 10);
  },

  updateOfflineGuest(updatedGuest) {
    const roster = this.readRoster();
    if (!roster) return;
    roster.guests = roster.guests.map((guest) => guest.token === updatedGuest.token ? updatedGuest : guest);
    this.writeRoster(roster.guests, roster.syncedAt);
  },

  readOfflineQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem(this.offlineQueueKey) || "[]");
      return Array.isArray(queue) ? queue : [];
    } catch (error) {
      return [];
    }
  },

  writeOfflineQueue(queue) {
    try {
      const unique = queue.filter((item, index, items) => items.findIndex((candidate) => candidate.token === item.token) === index);
      localStorage.setItem(this.offlineQueueKey, JSON.stringify(unique));
    } catch (error) {
      return false;
    }
    return true;
  },

  isOfflineTokenUsed(token) {
    return this.readOfflineQueue().some((item) => item.token === token);
  },

  isRosterStale() {
    const syncedAt = this.readRoster()?.syncedAt;
    const timestamp = new Date(syncedAt || "").getTime();
    return !timestamp || Date.now() - timestamp > this.rosterTtlMs;
  },

  renderSyncState(message) {
    const roster = this.readRoster();
    const queue = this.readOfflineQueue();
    if (!roster) {
      this.setSyncState(message || "Nenhuma lista salva neste aparelho.", "Conecte-se à internet antes de iniciar a portaria.");
      return;
    }
    const date = new Date(roster.syncedAt);
    const label = Number.isNaN(date.getTime()) ? "data desconhecida" : this.formatDate(date);
    const pendingCount = queue.filter((item) => !item.conflict).length;
    const conflictCount = queue.length - pendingCount;
    const pending = pendingCount ? ` ${pendingCount} validação(ões) pendente(s).` : "";
    const conflicts = conflictCount ? ` ${conflictCount} entrada(s) exigem conferência manual.` : "";
    const lastSent = this.readStored(this.queueSyncKey, null);
    const sentLabel = lastSent ? ` Último envio confirmado: ${this.formatDate(lastSent)}.` : "";
    const offline = this.offlineModeToggle?.checked ? " Validação offline ativa — use somente este aparelho." : "";
    const stale = this.isRosterStale() ? " A lista precisa ser atualizada antes de uso offline." : "";
    this.setSyncState(message || (this.offlineModeToggle?.checked ? "Modo offline ativo — use um único aparelho." : "Lista pronta neste aparelho."), `${roster.guests.length} confirmações sincronizadas em ${label}.${pending}${conflicts}${stale}${sentLabel}${offline}`);
  },

  setSyncState(status, details = "") {
    if (this.syncStatus) this.syncStatus.textContent = status || "";
    if (this.syncDetails) this.syncDetails.textContent = details || "";
    if (this.syncStatus) this.syncStatus.dataset.state = /Falha|Não foi|Nenhuma|Atenção/.test(status) ? "error" : "ready";
  },

  isConnectionError(error) {
    return error?.kind === "network" || error?.kind === "timeout";
  },

  extractToken(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/[?&]t=([^&#]+)/i);
    if (match) {
      try { const token = decodeURIComponent(match[1]).trim().toUpperCase(); return /^CHK-[A-Z0-9]+-[A-Z0-9]+$/.test(token) ? token : ""; } catch { return ""; }
    }
    const token = raw.match(/CHK-[A-Z0-9]+-[A-Z0-9]+/i);
    return token ? token[0].toUpperCase() : "";
  },

  renderManualResults(guests) {
    if (!guests.length) {
      this.manualResults.innerHTML = '<p class="checkin-status">Nenhum convidado confirmado encontrado.</p>';
      return;
    }

    this.manualResults.innerHTML = "";
    guests.forEach((guest) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "manual-result";
      button.innerHTML = `
        <strong>${this.escape(guest.name)}</strong>
        <span>${this.escape(this.describeGuest(guest))}</span>
      `;
      button.addEventListener("click", () => this.selectManualGuest(guest, button));
      this.manualResults.appendChild(button);
    });
  },

  selectManualGuest(guest, button) {
    if (this.validating) return;
    this.manualSelection = { guest, button };
    this.manualConfirmName.textContent = guest.name || "Convidado";
    this.manualConfirmDetails.textContent = this.describeGuest(guest);
    this.manualConfirmButton.textContent = guest.checkinStatus === "validado" ? "Conferir registro" : "Validar entrada";
    this.manualConfirmDialog.showModal();
  },

  confirmManualSelection() {
    const selection = this.manualSelection;
    if (!selection || this.validating) return;
    this.manualConfirmDialog.close();
    this.validateManualGuest(selection.guest, selection.button);
  },

  async validateManualGuest(guest, button) {
    if (this.validating) return;
    this.markManualSelection(button, guest);
    this.showResult("reading", "Aguarde a validação", "Aguarde…", "Não libere a entrada até aparecer o resultado.");
    this.scrollToResult();

    if (guest.token) {
      await this.validateToken(guest.token, {
        name: guest.name || "Convidado",
        scrollToResult: true
      });
      this.restoreManualSelection(button, guest);
      return;
    }

    this.validating = true;
    try {
      const result = await window.WeddingApi.validateCheckin({
        ...this.credentials,
        guestId: guest.guestId
      });
      this.renderValidation(result, { scrollToResult: true });
    } catch (error) {
      this.showResult("invalid", "Falha na validação", "Tente novamente", error.message || "Não foi possível validar agora.");
      this.scrollToResult();
      this.afterValidation("invalid", "Falha na validação");
    } finally {
      this.validating = false;
      this.restoreManualSelection(button, guest);
    }
  },

  restoreManualSelection(button, guest) {
    if (!button) return;
    guest = this.findOfflineGuest(guest.token) || guest;
    button.classList.remove("is-validating");
    button.disabled = false;
    button.innerHTML = `<strong>${this.escape(guest.name || "Convidado")}</strong><span>${this.escape(this.describeGuest(guest))}</span>`;
  },

  markManualSelection(button, guest) {
    if (!button) return;
    this.manualResults.querySelectorAll(".manual-result").forEach((item) => {
      item.classList.remove("is-validating");
      item.disabled = false;
    });
    button.classList.add("is-validating");
    button.disabled = true;
    button.innerHTML = `
      <strong>${this.escape(guest.name || "Convidado")}</strong>
      <span>Validando...</span>
    `;
  },

  renderValidation(result, options = {}) {
    const guest = result.guest || {};
    let persisted = true;
    if (["allowed", "used"].includes(result.status) && guest.token) {
      const admissions = this.readStored(this.admissionKey);
      admissions[guest.token] = { ...guest, checkinStatus: "validado" };
      persisted = this.writeStored(this.admissionKey, admissions);
      if (!persisted) this.renderSyncState("Atenção: registro online salvo, mas a cópia local falhou. Não use offline neste aparelho.");
      this.updateOfflineGuest(admissions[guest.token]);
    }
    this.showResult(result.status, result.title, guest.name || "Convite", result.message, guest);
    if (options.scrollToResult) this.scrollToResult();
    this.afterValidation(result.status, result.title, guest.name || "Convite", result.message);
    this.addHistory(result.status, result.title, guest.name || "Convite", result.message);
    return persisted;
  },

  scrollToResult() {
    if (!this.resultPanel) return;
    this.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      this.resultPanel.focus({ preventScroll: true });
    }, 260);
  },

  afterValidation(status, title) {
    const presentation = this.resultPresentation(status, title);
    const signalMode = status === "allowed" ? "valid" : presentation.variant === "warning" ? "warning" : "error";
    const soundMode = status === "allowed" ? "success" : status === "used" ? "warning" : "error";
    const text = status === "allowed"
      ? "Convite validado. Próxima leitura em instantes."
      : `${title || "Leitura registrada"}. Próxima leitura em instantes.`;

    this.readLockedUntil = Date.now() + 900;
    this.setScannerSignal(signalMode, text);
    this.playFeedback(soundMode);
    window.clearTimeout(this.resetTimer);
    this.resetTimer = window.setTimeout(() => {
      if (!this.scanning) return;
      this.setScannerSignal("reading", "Pronto para o próximo QR Code.");
    }, 900);
  },

  registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw-checkin.js").catch(() => {});
    });
  },

  setScannerSignal(mode, text) {
    if (!this.scannerPanel || !this.scannerSignal) return;
    this.scannerPanel.classList.remove("is-reading", "is-validating", "is-valid", "is-warning", "is-error");
    if (mode) this.scannerPanel.classList.add(`is-${mode}`);
    this.scannerSignal.textContent = text || "";
  },

  prepareAudio() {
    if (this.audioContext) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.audioContext = new AudioContext();
  },

  playFeedback(type) {
    this.prepareAudio();
    if (!this.audioContext) return;
    if (this.audioContext.state === "suspended") this.audioContext.resume();

    const patterns = {
      read: [740],
      success: [880, 1170],
      warning: [520, 390],
      error: [220, 180]
    };
    const tones = patterns[type] || patterns.read;
    tones.forEach((frequency, index) => this.playTone(frequency, index * 115));
  },

  playTone(frequency, delay) {
    const startAt = this.audioContext.currentTime + delay / 1000;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.12);
    oscillator.connect(gain);
    gain.connect(this.audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.14);
  },

  addHistory(status, title, name, message) {
    this.history.unshift({
      status: status || "invalid",
      title: title || "Leitura registrada",
      name: name || "Convite",
      message: message || "",
      time: new Date()
    });
    this.history = this.history.slice(0, 6);
    this.renderHistory();
  },

  renderHistory() {
    if (!this.historyList) return;
    this.historyList.innerHTML = "";
    this.history.forEach((item) => {
      const row = document.createElement("div");
      row.className = `checkin-history__item checkin-history__item--${this.escape(item.status)}`;
      row.innerHTML = `
        <strong>${this.escape(item.name)}</strong>
        <span>${this.escape(item.title)} · ${this.escape(this.formatTime(item.time))}</span>
        <span>${this.escape(item.message)}</span>
      `;
      this.historyList.appendChild(row);
    });
  },

  resultPresentation(status, title = "") {
    if (status === "allowed") return { variant: "allowed", heading: "Entrada liberada", icon: "✓", reason: title === "Entrada liberada" ? "" : title };
    if (status === "used") return { variant: "used", heading: "Conferir entrada", icon: "!", reason: title || "Convite já utilizado" };
    if (status === "reading") return { variant: "reading", heading: "Validando — aguarde", icon: "…", reason: title };
    if (status === "busy" || (status === "invalid" && /câmera|leitor indisponível|entrada não confirmada|falha na validação|lista offline desatualizada|não foi possível salvar/i.test(title))) {
      return { variant: "warning", heading: "Aguarde a validação", icon: "!", reason: title };
    }
    if (status === "invalid") return { variant: "invalid", heading: "Conferir convite", icon: "!", reason: title };
    return { variant: "idle", heading: title, icon: "•", reason: "" };
  },

  showResult(status, title, name, message, guest = {}) {
    const presentation = this.resultPresentation(status, title);
    this.resultPanel.className = `checkin-result checkin-result--${presentation.variant}`;
    this.resultTitle.textContent = presentation.heading;
    this.resultIcon.textContent = presentation.icon;
    this.resultReason.textContent = presentation.reason;
    this.resultReason.hidden = !presentation.reason;
    this.resultName.textContent = name || "";
    this.resultMessage.textContent = message || "";
    this.resultDetails.innerHTML = "";

    const details = [];
    if (guest.companionsConfirmed !== undefined) details.push(["Acompanhante", this.describeCompanion(guest, false)]);
    if (guest.checkinAt) details.push(["Validado em", this.formatDate(guest.checkinAt)]);
    if (guest.checkinBy) details.push(["Operador", guest.checkinBy]);

    details.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.innerHTML = `<dt>${this.escape(label)}</dt><dd>${this.escape(value)}</dd>`;
      this.resultDetails.appendChild(row);
    });
  },

  describeGuest(guest) {
    const status = guest.checkinStatus === "validado" ? "já validado" : "pendente";
    return `${this.describeCompanion(guest, true)} · ${status}`;
  },

  describeCompanion(guest, includeLabel = true) {
    const count = Number(guest.companionsConfirmed || 0);
    if (!count) return "sem acompanhante";
    const companionName = this.cleanCompanionName(guest.companionName);
    if (!companionName) return "com acompanhante";
    return includeLabel ? `acompanhante: ${companionName}` : companionName;
  },

  cleanCompanionName(value) {
    return String(value || "").replace(/^acompanhante\s*:\s*/i, "").trim();
  },

  normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  },

  formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(date);
  },

  formatTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(date);
  },

  escape(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};

document.addEventListener("DOMContentLoaded", () => window.WeddingCheckin.init());
