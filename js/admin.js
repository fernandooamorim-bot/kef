window.WeddingAdmin = {
  credentials: null,
  guests: [],
  filter: "all",
  sortMode: "sheet",
  importRows: [],
  importId: "",
  sessionKey: "kf_admin_operator",

  init() {
    this.loginPanel = document.getElementById("adminLogin");
    this.loginForm = document.getElementById("adminLoginForm");
    this.loginStatus = document.getElementById("adminLoginStatus");
    this.app = document.getElementById("adminApp");
    this.operatorName = document.getElementById("adminOperatorName");
    this.logoutButton = document.getElementById("adminLogoutButton");
    this.summary = document.getElementById("adminSummary");
    this.list = document.getElementById("adminGuestList");
    this.filters = document.getElementById("adminFilters");
    this.search = document.getElementById("adminSearch");
    this.sortSelect = document.getElementById("adminSort");
    this.refreshButton = document.getElementById("refreshAdminButton");
    this.createForm = document.getElementById("adminCreateForm");
    this.createStatus = document.getElementById("adminCreateStatus");
    this.companionNameField = document.getElementById("adminCompanionNameField");
    this.importForm = document.getElementById("adminImportForm");
    this.importPanel = document.getElementById("adminImportPanel");
    this.importToggle = document.getElementById("adminImportToggle");
    this.importInput = document.getElementById("adminImportInput");
    this.importStatus = document.getElementById("adminImportStatus");
    this.importPreview = document.getElementById("adminImportPreview");
    this.importSummary = document.getElementById("adminImportSummary");
    this.importRowsContainer = document.getElementById("adminImportRows");
    this.importConfirmButton = document.getElementById("adminImportConfirm");
    this.importCancelButton = document.getElementById("adminImportCancel");
    this.importReviewButton = this.importForm.querySelector('button[type="submit"]');
    this.importProgress = document.getElementById("adminImportProgress");
    this.importFeedback = document.getElementById("adminImportFeedback");
    this.importFeedbackTitle = document.getElementById("adminImportFeedbackTitle");
    this.importFeedbackMessage = document.getElementById("adminImportFeedbackMessage");
    this.importFeedbackClose = document.getElementById("adminImportFeedbackClose");

    this.bindEvents();
    this.restoreSession();
  },

  bindEvents() {
    this.loginForm.addEventListener("submit", (event) => this.login(event));
    this.logoutButton.addEventListener("click", () => this.logout());
    this.refreshButton.addEventListener("click", () => this.loadSummary());
    this.search.addEventListener("input", () => this.renderList());
    this.sortSelect.addEventListener("change", () => {
      this.sortMode = this.sortSelect.value;
      this.renderList();
    });
    this.filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      this.filter = button.dataset.filter;
      this.filters.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
      this.renderList();
    });
    this.createForm.elements.companionsConfirmed.addEventListener("change", () => {
      this.companionNameField.hidden = this.createForm.elements.companionsConfirmed.value !== "1";
    });
    this.createForm.addEventListener("submit", (event) => this.createGuest(event));
    this.importForm.addEventListener("submit", (event) => this.previewImport(event));
    this.importInput.addEventListener("input", () => this.clearImportPreview());
    this.importConfirmButton.addEventListener("click", () => this.confirmImport());
    this.importCancelButton.addEventListener("click", () => this.toggleImportPanel(false));
    this.importToggle.addEventListener("click", () => this.toggleImportPanel(this.importPanel.hidden));
    this.importFeedbackClose.addEventListener("click", () => this.hideImportFeedback());
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
      await this.loadSummary();
    } catch (error) {
      this.loginStatus.textContent = error.message || "Não foi possível entrar.";
    }
  },

  logout() {
    this.clearSession();
    this.credentials = null;
    this.guests = [];
    this.toggleImportPanel(false);
    this.app.hidden = true;
    this.loginPanel.hidden = false;
    this.loginForm.reset();
  },

  async restoreSession() {
    const saved = this.readSession();
    if (!saved?.username || !saved?.sessionToken) return;
    this.credentials = saved;
    this.showApp(saved.name || saved.username);
    await this.loadSummary();
  },

  readSession() {
    try {
      return JSON.parse(localStorage.getItem(this.sessionKey) || "null");
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
  },

  showApp(name) {
    this.operatorName.textContent = name || "Equipe";
    this.loginPanel.hidden = true;
    this.app.hidden = false;
  },

  toggleImportPanel(show) {
    if (show) this.hideImportFeedback();
    this.importPanel.hidden = !show;
    this.importToggle.setAttribute("aria-expanded", String(show));
    this.importToggle.textContent = show ? "Fechar cadastro" : "Adicionar convidados";
    if (show) {
      window.setTimeout(() => this.importInput.focus(), 0);
    } else {
      this.clearImportPreview(true);
    }
  },

  async loadSummary() {
    if (!this.credentials) return false;
    this.list.innerHTML = '<p class="admin-status">Carregando convidados...</p>';
    try {
      const result = await window.WeddingApi.getAdminSummary(this.credentials);
      this.guests = result.guests || [];
      this.renderSummary(result.totals || {});
      this.renderList();
    } catch (error) {
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Seu acesso foi atualizado. Faça login novamente.";
        return false;
      }
      this.list.innerHTML = `<p class="admin-status">${this.escape(error.message || "Não foi possível carregar.")}</p>`;
      return false;
    }
    return true;
  },

  renderSummary(totals) {
    const items = [
      ["Total", totals.total || 0],
      ["Confirmados", totals.confirmed || 0],
      ["Pessoas", totals.people || 0],
      ["Faltam", totals.pending || 0],
      ["Não vão", totals.declined || 0],
      ["Cancelados", totals.cancelled || 0]
    ];
    this.summary.innerHTML = items.map(([label, value]) => `
      <div>
        <span>${this.escape(label)}</span>
        <strong>${this.escape(value)}</strong>
      </div>
    `).join("");
  },

  renderList() {
    const term = this.normalize(this.search.value);
    const guests = this.guests.filter((guest) => {
      if (this.filter !== "all" && guest.status !== this.filter) return false;
      if (!term) return true;
      return this.normalize(`${guest.name} ${guest.group} ${guest.phone} ${guest.email}`).includes(term);
    });
    this.sortGuests(guests);

    if (!guests.length) {
      this.list.innerHTML = '<p class="admin-status">Nenhum convidado encontrado.</p>';
      return;
    }

    this.list.innerHTML = guests.map((guest) => `
      <article class="admin-guest admin-guest--${this.escape(guest.status)}">
        <div class="admin-guest__heading">
          <span>${this.escape(guest.statusLabel)}</span>
          <strong>${this.escape(guest.name)}</strong>
        </div>
        <dl class="admin-guest__keyfacts">
          <div><dt>Pessoas</dt><dd>${this.escape(guest.totalPeople || 0)}</dd></div>
          <div><dt>Acompanhante</dt><dd>${this.escape(this.describeCompanionState(guest))}</dd></div>
          <div><dt>Check-in</dt><dd>${this.escape(guest.checkinStatus || "-")}</dd></div>
          <div><dt>Última resposta</dt><dd>${this.escape(this.formatDate(guest.lastResponseAt) || "-")}</dd></div>
        </dl>
        <details class="admin-guest__details">
          <summary>Ver detalhes</summary>
          <dl>
            <div><dt>Grupo</dt><dd>${this.escape(guest.group || "Sem grupo")}</dd></div>
            <div><dt>Nome acompanhante</dt><dd>${this.escape(this.describeCompanion(guest))}</dd></div>
            <div><dt>Telefone</dt><dd>${this.escape(guest.phone || "-")}</dd></div>
            <div><dt>Email</dt><dd>${this.escape(guest.email || "-")}</dd></div>
          </dl>
          <div class="admin-guest__links">
            ${guest.inviteLink ? `<a href="${this.escapeAttr(guest.inviteLink)}" target="_blank" rel="noopener">Convite</a>` : ""}
            ${guest.cancellationLink ? `<a href="${this.escapeAttr(guest.cancellationLink)}" target="_blank" rel="noopener">Cancelar</a>` : ""}
          </div>
        </details>
      </article>
    `).join("");
  },

  sortGuests(guests) {
    if (this.sortMode === "sheet") return guests;
    return guests.sort((first, second) => {
      const firstValue = this.sortMode === "guestId" ? first.guestId : first.name;
      const secondValue = this.sortMode === "guestId" ? second.guestId : second.name;
      return String(firstValue || "").localeCompare(String(secondValue || ""), "pt-BR", {
        numeric: true,
        sensitivity: "base"
      });
    });
  },

  async createGuest(event) {
    event.preventDefault();
    if (!this.credentials) return;

    const data = {
      ...this.credentials,
      name: this.createForm.elements.name.value.trim(),
      group: this.createForm.elements.group.value.trim(),
      phone: this.createForm.elements.phone.value.trim(),
      email: this.createForm.elements.email.value.trim(),
      companionsConfirmed: Number(this.createForm.elements.companionsConfirmed.value || 0),
      companionName: this.createForm.elements.companionName.value.trim()
    };

    this.createStatus.textContent = "Gerando convidado...";
    try {
      const result = await window.WeddingApi.createAdminGuest(data);
      this.createStatus.textContent = result.message || "Convidado criado.";
      this.createForm.reset();
      this.createForm.elements.group.value = "Avulso";
      this.companionNameField.hidden = true;
      await this.loadSummary();
    } catch (error) {
      this.createStatus.textContent = error.message || "Não foi possível criar convidado.";
    }
  },

  previewImport(event) {
    event.preventDefault();
    this.hideImportFeedback();
    const rows = this.parseImport(this.importInput.value);
    if (!rows.length) {
      this.importStatus.textContent = "Cole pelo menos um nome para revisar.";
      this.clearImportPreview();
      return;
    }

    const existingNames = new Set(this.guests.map((guest) => this.normalize(guest.name)).filter(Boolean));
    const seenNames = new Map();
    rows.forEach((row) => {
      const normalized = this.normalize(row.name);
      if (normalized) {
        seenNames.set(normalized, (seenNames.get(normalized) || 0) + 1);
      }
    });

    rows.forEach((row) => {
      const normalized = this.normalize(row.name);
      if (row.name.length === 1 && !row.error) row.warnings.push("Nome muito curto: confira se está completo.");
      if (row.companions > 5 && !row.error) row.warnings.push("Quantidade alta de acompanhantes: confira o número.");
      if (normalized && seenNames.get(normalized) > 1) row.warnings.push("Nome repetido nesta importação.");
      if (normalized && existingNames.has(normalized)) row.warnings.push("Nome já existente na lista de convidados.");
    });

    this.importRows = rows;
    this.importId = this.createImportId();
    const errors = rows.filter((row) => row.error).length;
    const warnings = rows.filter((row) => row.warnings.length).length;
    const people = rows.reduce((total, row) => total + (row.error ? 0 : 1 + row.companions), 0);
    this.importSummary.innerHTML = [
      ["Convidados", rows.length],
      ["Pessoas previstas", people],
      ["Atenções", warnings],
      ["Corrigir", errors]
    ].map(([label, value]) => `<div><span>${this.escape(label)}</span><strong>${this.escape(value)}</strong></div>`).join("");
    this.importRowsContainer.innerHTML = rows.map((row) => `
      <article class="admin-import-row admin-import-row--${row.error ? "error" : row.warnings.length ? "warning" : "ready"}">
        <span>${this.escape(row.line)}</span>
        <strong>${this.escape(row.name || "Nome não identificado")}</strong>
        <em>${this.escape(this.formatCompanionCount(row.companions))}</em>
        <p>${this.escape(row.error || row.warnings.join(" ") || "Pronto para importar.")}</p>
      </article>
    `).join("");
    this.importPreview.hidden = false;
    this.importConfirmButton.disabled = Boolean(errors);
    this.importStatus.textContent = errors
      ? "Corrija as linhas destacadas antes de confirmar."
      : warnings
        ? "Confira os alertas. Você poderá importar se estiver tudo certo."
        : "Prévia pronta. Confirme a importação quando desejar.";
  },

  parseImport(value) {
    return String(value || "").replace(/\r/g, "").split("\n")
      .map((source, index) => this.parseImportLine(source, index + 1))
      .filter((row) => row.source.trim());
  },

  parseImportLine(source, line) {
    const raw = String(source || "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    let name = raw;
    let companionsRaw = "";
    if (raw.includes("\t")) {
      const columns = raw.split(/\t+/);
      name = columns.shift() || "";
      companionsRaw = columns.find((column) => column.trim() !== "") || "";
    } else if (raw.includes("|")) {
      const separator = raw.indexOf("|");
      name = raw.slice(0, separator);
      companionsRaw = raw.slice(separator + 1);
    } else {
      const match = raw.match(/^(.*?)(?:\s+)(-?\d+)\s*$/);
      if (match) {
        name = match[1];
        companionsRaw = match[2];
      }
    }
    name = name.replace(/\s+/g, " ").trim();
    companionsRaw = companionsRaw.trim();
    const row = { source, line, name, companions: 0, warnings: [], error: "" };
    if (!name || !/[A-Za-zÀ-ÿ]/.test(name)) {
      row.error = "Informe um nome válido.";
      return row;
    }
    if (companionsRaw) {
      if (!/^\d+$/.test(companionsRaw)) {
        row.error = "Acompanhantes deve ser um número inteiro a partir de 0.";
        return row;
      }
      row.companions = Number(companionsRaw);
      if (row.companions > 50) row.error = "Acompanhantes deve ser no máximo 50.";
    }
    return row;
  },

  clearImportPreview(clearInput = false) {
    this.importRows = [];
    this.importId = "";
    this.importPreview.hidden = true;
    this.importRowsContainer.innerHTML = "";
    if (clearInput) this.importInput.value = "";
  },

  async confirmImport() {
    if (!this.credentials || !this.importRows.length || this.importRows.some((row) => row.error)) return;
    this.setImportProgress(true);
    this.importStatus.textContent = "Registrando a lista com segurança...";
    try {
      const result = await window.WeddingApi.importAdminGuests({
        ...this.credentials,
        importId: this.importId,
        guests: this.importRows.map((row) => ({ name: row.name, companions: row.companions }))
      });
      const duplicates = result.duplicateNames?.length ? ` ${result.duplicateNames.length} nome(s) já existiam e foram mantidos conforme confirmado.` : "";
      this.setImportProgress(false);
      this.clearImportPreview(true);
      this.toggleImportPanel(false);
      const refreshed = await this.loadSummary();
      this.showImportFeedback(
        "Lista adicionada com sucesso",
        `${result.message || "Os convidados foram cadastrados."}${duplicates} ${refreshed ? "A lista e os contadores já foram atualizados automaticamente." : "Não foi possível atualizar a lista agora; use Atualizar para tentar novamente."}`
      );
    } catch (error) {
      this.importStatus.textContent = error.message || "Não foi possível importar agora. Sua lista continua pronta para tentar novamente.";
      this.setImportProgress(false);
    }
  },

  setImportProgress(active) {
    this.importProgress.hidden = !active;
    this.importConfirmButton.disabled = active;
    this.importCancelButton.disabled = active;
    this.importReviewButton.disabled = active;
    this.importInput.disabled = active;
  },

  showImportFeedback(title, message) {
    this.importFeedbackTitle.textContent = title;
    this.importFeedbackMessage.textContent = message;
    this.importFeedback.hidden = false;
  },

  hideImportFeedback() {
    if (this.importFeedback) this.importFeedback.hidden = true;
  },

  createImportId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `import-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  },

  isInvalidSessionError(error) {
    return /sessão inválida/i.test(String(error?.message || error || ""));
  },

  describeCompanion(guest) {
    if (!Number(guest.companionsConfirmed || 0)) return "Não";
    return guest.companionName || "Sim";
  },

  describeCompanionState(guest) {
    return Number(guest.companionsConfirmed || 0) > 0 ? "Sim" : "Não";
  },

  formatCompanionCount(value) {
    const count = Number(value || 0);
    if (count === 0) return "Sem acompanhante";
    return `${count} ${count === 1 ? "acompanhante" : "acompanhantes"}`;
  },

  formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
  },

  normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  },

  escape(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  escapeAttr(value) {
    return this.escape(value);
  }
};

document.addEventListener("DOMContentLoaded", () => window.WeddingAdmin.init());
