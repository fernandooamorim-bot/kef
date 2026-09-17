window.WeddingCheckin = {
  credentials: null,
  stream: null,
  scanning: false,
  validating: false,
  lastToken: "",
  lastReadAt: 0,
  readLockedUntil: 0,
  resetTimer: null,
  audioContext: null,
  history: [],
  sessionKey: "kf_checkin_operator",
  rosterKey: "kf_checkin_roster_v1",
  offlineQueueKey: "kf_checkin_queue_v1",
  rosterTtlMs: 7 * 24 * 60 * 60 * 1000,

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
    this.historyList = document.getElementById("checkinHistory");
    this.syncButton = document.getElementById("syncRosterButton");
    this.syncStatus = document.getElementById("syncStatus");
    this.syncDetails = document.getElementById("syncDetails");
  },

  bindEvents() {
    this.loginForm.addEventListener("submit", (event) => this.login(event));
    this.logoutButton.addEventListener("click", () => this.logout());
    this.startButton.addEventListener("click", () => this.startScanner());
    this.stopButton.addEventListener("click", () => this.stopScanner());
    this.manualForm.addEventListener("submit", (event) => this.searchManual(event));
    this.syncButton?.addEventListener("click", () => this.syncRoster());
  },

  restoreSession() {
    const saved = this.readSession();
    if (saved?.username && saved?.password) {
      this.credentials = saved;
      this.showApp(saved.name || saved.username);
      this.renderSyncState();
      this.syncRoster({ silent: true });
      if (this.pendingToken) this.validateToken(this.pendingToken);
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
        ...credentials,
        name: result.operator?.name || credentials.username
      };
      this.writeSession(this.credentials);
      this.showApp(this.credentials.name);
      this.loginStatus.textContent = "";
      this.renderSyncState();
      await this.syncRoster({ silent: true });
      if (this.pendingToken) this.validateToken(this.pendingToken);
    } catch (error) {
      this.loginStatus.textContent = error.message || "Não foi possível entrar.";
    }
  },

  logout() {
    this.stopScanner();
    this.clearSession();
    this.credentials = null;
    this.app.hidden = true;
    this.loginPanel.hidden = false;
    this.loginForm.reset();
  },

  readSession() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(this.sessionKey) || "null");
      if (!saved) return null;
      return saved;
    } catch (error) {
      this.clearSession();
      return null;
    }
  },

  writeSession(value) {
    try {
      sessionStorage.setItem(this.sessionKey, JSON.stringify(value));
    } catch (error) {
      return false;
    }
    return true;
  },

  clearSession() {
    localStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.sessionKey);
  },

  showApp(name) {
    this.operatorName.textContent = name || "Equipe";
    this.loginPanel.hidden = true;
    this.app.hidden = false;
  },

  async startScanner() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.showResult("invalid", "Câmera indisponível", "Use a busca manual", "Este navegador não liberou acesso à câmera.");
      return;
    }

    if (!window.jsQR) {
      this.showResult("invalid", "Leitor indisponível", "Use a busca manual", "A biblioteca de QR Code não carregou.");
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
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
      this.setScannerSignal("error", "Câmera bloqueada.");
    }
  },

  stopScanner() {
    this.scanning = false;
    this.validating = false;
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
    const context = this.canvas.getContext("2d", { willReadFrequently: true });
    const width = this.video.videoWidth;
    const height = this.video.videoHeight;

    if (width && height) {
      this.canvas.width = width;
      this.canvas.height = height;
      context.drawImage(this.video, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);
      const code = window.jsQR(imageData.data, width, height);
      if (code?.data && Date.now() >= this.readLockedUntil && !this.validating) this.handleQrValue(code.data);
    }

    window.requestAnimationFrame(() => this.scanFrame());
  },

  handleQrValue(value) {
    const now = Date.now();
    if (value === this.lastToken && now - this.lastReadAt < 5500) return;
    this.lastToken = value;
    this.lastReadAt = now;
    this.readLockedUntil = now + 3200;
    this.setScannerSignal("validating", "QR Code lido. Validando convite...");
    this.playFeedback("read");
    this.validateToken(value);
  },

  async validateToken(token, options = {}) {
    if (!this.credentials) {
      this.pendingToken = token;
      return;
    }

    this.validating = true;
    this.showResult("reading", "Validando convite", options.name || "Aguarde...", "Consultando a lista de confirmações.");
    if (options.scrollToResult) this.scrollToResult();
    try {
      const result = await window.WeddingApi.validateCheckin({
        ...this.credentials,
        token
      });
      this.renderValidation(result, options);
    } catch (error) {
      if (this.isConnectionError(error) && this.validateOffline(token, options)) return;
      this.showResult("invalid", "Falha na validação", "Tente novamente", error.message || "Não foi possível validar agora.");
      if (options.scrollToResult) this.scrollToResult();
      this.afterValidation("invalid", "Falha na validação");
    } finally {
      this.validating = false;
    }
  },

  async searchManual(event) {
    event.preventDefault();
    const query = this.manualForm.elements.query.value.trim();
    if (query.length < 2) {
      this.manualResults.innerHTML = '<p class="checkin-status">Digite pelo menos duas letras.</p>';
      return;
    }

    this.manualResults.innerHTML = '<p class="checkin-status">Buscando...</p>';
    try {
      const result = await window.WeddingApi.searchCheckinGuests({
        ...this.credentials,
        query
      });
      this.renderManualResults(result.guests || []);
    } catch (error) {
      const guests = this.searchOfflineGuests(query);
      if (guests.length) {
        this.renderManualResults(guests);
        this.setSyncState("Modo offline", "Busca feita na última lista sincronizada.");
        return;
      }
      this.manualResults.innerHTML = `<p class="checkin-status">${this.escape(error.message || "Não foi possível buscar.")}</p>`;
    }
  },

  async syncRoster(options = {}) {
    if (!this.credentials) return false;
    if (this.syncButton) this.syncButton.disabled = true;
    if (!options.silent) this.setSyncState("Atualizando lista...", "Baixando confirmações e enviando validações pendentes.");

    try {
      const queueResult = await this.flushOfflineQueue();
      const result = await window.WeddingApi.syncCheckinRoster(this.credentials);
      this.writeRoster(result.guests || [], result.syncedAt || new Date().toISOString());
      const suffix = queueResult.pending
        ? ` ${queueResult.pending} validação(ões) ainda aguardam internet.`
        : queueResult.synced
          ? ` ${queueResult.synced} validação(ões) offline foram sincronizadas.`
          : "";
      this.renderSyncState(`Lista atualizada.${suffix}`);
      return true;
    } catch (error) {
      this.renderSyncState("Modo offline: usando a última lista disponível.");
      return false;
    } finally {
      if (this.syncButton) this.syncButton.disabled = false;
    }
  },

  async flushOfflineQueue() {
    const queue = this.readOfflineQueue();
    if (!queue.length) return { synced: 0, pending: 0 };

    const remaining = [];
    let synced = 0;
    for (const item of queue) {
      try {
        const result = await window.WeddingApi.validateCheckin({
          ...this.credentials,
          token: item.token
        });
        if (result.status === "allowed" || result.status === "used") {
          synced += 1;
        } else {
          remaining.push(item);
        }
      } catch (error) {
        remaining.push(item);
      }
    }
    this.writeOfflineQueue(remaining);
    return { synced, pending: remaining.length };
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

    guest.checkinStatus = "validado";
    guest.checkinAt = new Date().toISOString();
    guest.checkinBy = this.credentials?.name || this.credentials?.username || "Equipe";
    this.updateOfflineGuest(guest);
    this.writeOfflineQueue([...this.readOfflineQueue(), {
      token: guest.token,
      checkedInAt: guest.checkinAt
    }]);
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
      const roster = JSON.parse(localStorage.getItem(this.rosterKey) || "null");
      if (!roster?.guests || !Array.isArray(roster.guests)) return null;
      return roster;
    } catch (error) {
      return null;
    }
  },

  writeRoster(guests, syncedAt) {
    try {
      localStorage.setItem(this.rosterKey, JSON.stringify({ guests, syncedAt }));
    } catch (error) {
      return false;
    }
    return true;
  },

  findOfflineGuest(value) {
    const token = this.extractToken(value);
    if (!token) return null;
    return this.readRoster()?.guests.find((guest) => String(guest.token || "") === token) || null;
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
    const pending = queue.length ? ` ${queue.length} validação(ões) pendente(s).` : "";
    const stale = this.isRosterStale() ? " A lista precisa ser atualizada antes de uso offline." : "";
    this.setSyncState(message || "Lista disponível neste aparelho.", `${roster.guests.length} confirmações sincronizadas em ${label}.${pending}${stale}`);
  },

  setSyncState(status, details = "") {
    if (this.syncStatus) this.syncStatus.textContent = status || "";
    if (this.syncDetails) this.syncDetails.textContent = details || "";
  },

  isConnectionError(error) {
    return /não foi possível conectar|não foi possível concluir/i.test(String(error?.message || error || ""));
  },

  extractToken(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/[?&]t=([^&#]+)/i);
    if (match) return decodeURIComponent(match[1]).trim().toUpperCase();
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
        <span>${this.describeGuest(guest)}</span>
      `;
      button.addEventListener("click", () => this.validateManualGuest(guest, button));
      this.manualResults.appendChild(button);
    });
  },

  async validateManualGuest(guest, button) {
    this.markManualSelection(button, guest);
    this.showResult("reading", "Validando convite", guest.name || "Convidado", "Consultando a lista de confirmações.");
    this.scrollToResult();

    if (guest.token) {
      await this.validateToken(guest.token, {
        name: guest.name || "Convidado",
        scrollToResult: true
      });
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
    }
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
    this.showResult(result.status, result.title, guest.name || "Convite", result.message, guest);
    if (options.scrollToResult) this.scrollToResult();
    this.afterValidation(result.status, result.title, guest.name || "Convite", result.message);
    this.addHistory(result.status, result.title, guest.name || "Convite", result.message);
  },

  scrollToResult() {
    if (!this.resultPanel) return;
    this.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      this.resultPanel.focus({ preventScroll: true });
    }, 260);
  },

  afterValidation(status, title) {
    const signalMode = status === "allowed" ? "valid" : status === "used" ? "warning" : "error";
    const soundMode = status === "allowed" ? "success" : status === "used" ? "warning" : "error";
    const text = status === "allowed"
      ? "Convite validado. Próxima leitura em instantes."
      : `${title || "Leitura registrada"}. Próxima leitura em instantes.`;

    this.readLockedUntil = Date.now() + 3200;
    this.setScannerSignal(signalMode, text);
    this.playFeedback(soundMode);
    window.clearTimeout(this.resetTimer);
    this.resetTimer = window.setTimeout(() => {
      if (!this.scanning) return;
      this.setScannerSignal("reading", "Pronto para o próximo QR Code.");
    }, 3200);
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

  showResult(status, title, name, message, guest = {}) {
    this.resultPanel.className = `checkin-result checkin-result--${status || "idle"}`;
    this.resultTitle.textContent = title || "";
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
