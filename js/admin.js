window.WeddingAdmin = {
  credentials: null,
  guests: [],
  filter: "all",

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
    this.refreshButton = document.getElementById("refreshAdminButton");
    this.createForm = document.getElementById("adminCreateForm");
    this.createStatus = document.getElementById("adminCreateStatus");
    this.companionNameField = document.getElementById("adminCompanionNameField");

    this.bindEvents();
  },

  bindEvents() {
    this.loginForm.addEventListener("submit", (event) => this.login(event));
    this.logoutButton.addEventListener("click", () => this.logout());
    this.refreshButton.addEventListener("click", () => this.loadSummary());
    this.search.addEventListener("input", () => this.renderList());
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
      this.showApp(this.credentials.name);
      this.loginStatus.textContent = "";
      await this.loadSummary();
    } catch (error) {
      this.loginStatus.textContent = error.message || "Não foi possível entrar.";
    }
  },

  logout() {
    this.credentials = null;
    this.guests = [];
    this.app.hidden = true;
    this.loginPanel.hidden = false;
    this.loginForm.reset();
  },

  showApp(name) {
    this.operatorName.textContent = name || "Equipe";
    this.loginPanel.hidden = true;
    this.app.hidden = false;
  },

  async loadSummary() {
    if (!this.credentials) return;
    this.list.innerHTML = '<p class="admin-status">Carregando convidados...</p>';
    try {
      const result = await window.WeddingApi.getAdminSummary(this.credentials);
      this.guests = result.guests || [];
      this.renderSummary(result.totals || {});
      this.renderList();
    } catch (error) {
      this.list.innerHTML = `<p class="admin-status">${this.escape(error.message || "Não foi possível carregar.")}</p>`;
    }
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

    if (!guests.length) {
      this.list.innerHTML = '<p class="admin-status">Nenhum convidado encontrado.</p>';
      return;
    }

    this.list.innerHTML = guests.map((guest) => `
      <article class="admin-guest admin-guest--${this.escape(guest.status)}">
        <div>
          <span>${this.escape(guest.statusLabel)}</span>
          <strong>${this.escape(guest.name)}</strong>
          <p>${this.escape(guest.group || "Sem grupo")}</p>
        </div>
        <dl>
          <div><dt>Pessoas</dt><dd>${this.escape(guest.totalPeople || 0)}</dd></div>
          <div><dt>Acompanhante</dt><dd>${this.escape(this.describeCompanion(guest))}</dd></div>
          <div><dt>Telefone</dt><dd>${this.escape(guest.phone || "-")}</dd></div>
          <div><dt>Email</dt><dd>${this.escape(guest.email || "-")}</dd></div>
          <div><dt>Check-in</dt><dd>${this.escape(guest.checkinStatus || "-")}</dd></div>
          <div><dt>Última resposta</dt><dd>${this.escape(this.formatDate(guest.lastResponseAt) || "-")}</dd></div>
        </dl>
        <div class="admin-guest__links">
          ${guest.inviteLink ? `<a href="${this.escapeAttr(guest.inviteLink)}" target="_blank" rel="noopener">Convite</a>` : ""}
          ${guest.cancellationLink ? `<a href="${this.escapeAttr(guest.cancellationLink)}" target="_blank" rel="noopener">Cancelar</a>` : ""}
        </div>
      </article>
    `).join("");
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

  describeCompanion(guest) {
    if (!Number(guest.companionsConfirmed || 0)) return "Não";
    return guest.companionName || "Sim";
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
