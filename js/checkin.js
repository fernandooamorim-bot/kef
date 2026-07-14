window.WeddingCheckin = {
  credentials: null,
  stream: null,
  scanning: false,
  lastToken: "",
  lastReadAt: 0,

  init() {
    this.cacheElements();
    this.bindEvents();
    this.restoreSession();
    const token = new URLSearchParams(window.location.search).get("t");
    if (token) {
      this.pendingToken = token;
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
    this.video = document.getElementById("scannerVideo");
    this.canvas = document.getElementById("scannerCanvas");
    this.startButton = document.getElementById("startScannerButton");
    this.stopButton = document.getElementById("stopScannerButton");
    this.manualForm = document.getElementById("manualForm");
    this.manualResults = document.getElementById("manualResults");
  },

  bindEvents() {
    this.loginForm.addEventListener("submit", (event) => this.login(event));
    this.logoutButton.addEventListener("click", () => this.logout());
    this.startButton.addEventListener("click", () => this.startScanner());
    this.stopButton.addEventListener("click", () => this.stopScanner());
    this.manualForm.addEventListener("submit", (event) => this.searchManual(event));
  },

  restoreSession() {
    const saved = this.readSession();
    if (saved?.username && saved?.password) {
      this.credentials = saved;
      this.showApp(saved.name || saved.username);
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
      if (this.pendingToken) this.validateToken(this.pendingToken);
    } catch (error) {
      this.loginStatus.textContent = error.message || "Não foi possível entrar.";
    }
  },

  logout() {
    this.stopScanner();
    sessionStorage.removeItem("kf_checkin_operator");
    this.credentials = null;
    this.app.hidden = true;
    this.loginPanel.hidden = false;
    this.loginForm.reset();
  },

  readSession() {
    try {
      return JSON.parse(sessionStorage.getItem("kf_checkin_operator") || "null");
    } catch (error) {
      return null;
    }
  },

  writeSession(value) {
    try {
      sessionStorage.setItem("kf_checkin_operator", JSON.stringify(value));
    } catch (error) {
      return false;
    }
    return true;
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
      this.scanFrame();
    } catch (error) {
      this.showResult("invalid", "Câmera bloqueada", "Use a busca manual", "Permita o acesso à câmera ou faça a validação pelo nome.");
    }
  },

  stopScanner() {
    this.scanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.video.srcObject = null;
    this.startButton.disabled = false;
    this.stopButton.disabled = true;
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
      if (code?.data) this.handleQrValue(code.data);
    }

    window.requestAnimationFrame(() => this.scanFrame());
  },

  handleQrValue(value) {
    const now = Date.now();
    if (value === this.lastToken && now - this.lastReadAt < 4500) return;
    this.lastToken = value;
    this.lastReadAt = now;
    this.validateToken(value);
  },

  async validateToken(token) {
    if (!this.credentials) {
      this.pendingToken = token;
      return;
    }

    this.showResult("idle", "Validando convite", "Aguarde...", "Consultando a lista de confirmações.");
    try {
      const result = await window.WeddingApi.validateCheckin({
        ...this.credentials,
        token
      });
      this.renderValidation(result);
    } catch (error) {
      this.showResult("invalid", "Falha na validação", "Tente novamente", error.message || "Não foi possível validar agora.");
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
      this.manualResults.innerHTML = `<p class="checkin-status">${this.escape(error.message || "Não foi possível buscar.")}</p>`;
    }
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
      button.addEventListener("click", () => this.validateManualGuest(guest));
      this.manualResults.appendChild(button);
    });
  },

  async validateManualGuest(guest) {
    if (guest.token) {
      this.validateToken(guest.token);
      return;
    }

    this.showResult("idle", "Validando convite", guest.name || "Convidado", "Consultando a lista de confirmações.");
    try {
      const result = await window.WeddingApi.validateCheckin({
        ...this.credentials,
        guestId: guest.guestId
      });
      this.renderValidation(result);
    } catch (error) {
      this.showResult("invalid", "Falha na validação", "Tente novamente", error.message || "Não foi possível validar agora.");
    }
  },

  renderValidation(result) {
    const guest = result.guest || {};
    this.showResult(result.status, result.title, guest.name || "Convite", result.message, guest);
    window.setTimeout(() => {
      if (result.status === "allowed") {
        this.showResult("idle", "Pronto para validar", "Aponte a câmera para o próximo QR Code", "A validação aparecerá aqui em tempo real.");
      }
    }, 2400);
  },

  showResult(status, title, name, message, guest = {}) {
    this.resultPanel.className = `checkin-result checkin-result--${status || "idle"}`;
    this.resultTitle.textContent = title || "";
    this.resultName.textContent = name || "";
    this.resultMessage.textContent = message || "";
    this.resultDetails.innerHTML = "";

    const details = [];
    if (guest.companionsConfirmed !== undefined) details.push(["Acompanhante", this.describeCompanion(guest)]);
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
    return `${this.describeCompanion(guest)} · ${status}`;
  },

  describeCompanion(guest) {
    const count = Number(guest.companionsConfirmed || 0);
    if (!count) return "sem acompanhante";
    return guest.companionName ? `acompanhante: ${guest.companionName}` : "com acompanhante";
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
