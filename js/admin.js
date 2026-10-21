window.WeddingAdmin = {
  credentials: null,
  guests: [],
  guestsRequest: 0,
  guestsLoaded: false,
  gifts: [],
  giftsLoaded: false,
  giftsRequest: 0,
  filter: "all",
  sortMode: "recent",
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
    this.actionFeedback = document.getElementById("adminActionFeedback");
    this.list = document.getElementById("adminGuestList");
    this.responseDialog = document.getElementById("adminResponseDialog");
    this.responseForm = document.getElementById("adminResponseForm");
    this.responseMode = document.getElementById("adminResponseMode");
    this.responseTitle = document.getElementById("adminResponseTitle");
    this.responseDescription = document.getElementById("adminResponseDescription");
    this.responseCompanionFields = document.getElementById("adminResponseCompanionFields");
    this.responseStatus = document.getElementById("adminResponseStatus");
    this.responseSubmit = document.getElementById("adminResponseSubmit");
    this.responseCancel = document.getElementById("adminResponseCancel");
    this.filters = document.getElementById("adminFilters");
    this.search = document.getElementById("adminSearch");
    this.sortSelect = document.getElementById("adminSort");
    this.groupSelect = document.getElementById("adminGroupFilter");
    this.listCount = document.getElementById("adminListCount");
    this.refreshButton = document.getElementById("refreshAdminButton");
    this.guestsLoading = document.getElementById("adminGuestsLoading");
    this.guestsStatus = document.getElementById("adminGuestsStatus");
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

    this.manualGiftForm = document.getElementById("adminManualGiftForm");
    this.manualGiftPanel = document.getElementById("adminManualGiftPanel");
    this.manualGiftToggle = document.getElementById("adminManualGiftToggle");
    this.manualGiftStatus = document.getElementById("adminManualGiftStatus");
    this.manualGiftProgress = document.getElementById("adminManualGiftProgress");
    this.manualGiftToggle.addEventListener("click", () => {
      this.manualGiftPanel.hidden = !this.manualGiftPanel.hidden;
      this.manualGiftToggle.setAttribute("aria-expanded", String(!this.manualGiftPanel.hidden));
      if (!this.manualGiftPanel.hidden && !this.manualGiftForm.elements.receivedDate.value) {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        this.manualGiftForm.elements.receivedDate.value = today;
        this.manualGiftForm.elements.receivedDate.max = today;
      }
    });
    this.manualGiftForm.elements.type.addEventListener("change", () => this.updateManualGiftType());
    this.manualGiftForm.addEventListener("submit", (event) => this.saveManualGift(event));
    this.giftDialog = document.getElementById("adminGiftDialog");
    this.giftConfirmForm = document.getElementById("adminGiftConfirmForm");
    this.giftDialogTitle = document.getElementById("adminGiftDialogTitle");
    this.giftDialogDescription = document.getElementById("adminGiftDialogDescription");
    this.giftSavingTitle = document.querySelector("#adminGiftSaving strong");
    this.giftSavingDescription = document.querySelector("#adminGiftSaving p");
    this.giftConfirmDetails = document.getElementById("adminGiftConfirmDetails");
    this.giftConfirmStatus = document.getElementById("adminGiftConfirmStatus");
    this.giftConfirmSubmit = document.getElementById("adminGiftConfirmSubmit");
    this.giftConfirmCancel = document.getElementById("adminGiftConfirmCancel");
    this.giftSaving = document.getElementById("adminGiftSaving");
    this.giftConfirmForm.addEventListener("submit", (event) => this.confirmGift(event));
    this.giftConfirmCancel.addEventListener("click", () => this.giftDialog.close());
    this.giftDialog.addEventListener("cancel", (event) => { if (this.giftConfirmBusy) event.preventDefault(); });
    this.giftDialog.addEventListener("close", () => { this.selectedGiftId = null; });
    this.giftsView = document.getElementById("adminGiftsView");
    this.guestsView = document.getElementById("adminGuestsView");
    this.giftList = document.getElementById("adminGiftList");
    this.giftList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-confirm-gift]");
      if (button) this.openGiftConfirmation(button.dataset.confirmGift);
      const cancel = event.target.closest("[data-cancel-gift]");
      if (cancel) this.openGiftConfirmation(cancel.dataset.cancelGift, "cancel");
    });
    this.giftSearch = document.getElementById("adminGiftSearch");
    this.giftSort = document.getElementById("adminGiftSort");
    this.giftStatusFilter = document.getElementById("adminGiftStatus");
    this.giftsStatus = document.getElementById("adminGiftsStatus");
    this.giftsSummary = document.getElementById("adminGiftsSummary");
    this.giftsCount = document.getElementById("adminGiftsCount");
    this.refreshGiftsButton = document.getElementById("refreshGiftsButton");
    document.querySelectorAll("[data-admin-view]").forEach((button) => {
      button.addEventListener("click", () => this.selectView(button.dataset.adminView));
    });
    this.refreshGiftsButton.addEventListener("click", () => this.loadGifts());
    this.giftSearch.addEventListener("input", () => this.renderGifts());
    this.giftSort.addEventListener("change", () => this.renderGifts());
    this.giftStatusFilter.addEventListener("change", () => this.renderGifts());
    this.bindEvents();
    this.restoreSession();
  },

  bindEvents() {
    this.loginForm.addEventListener("submit", (event) => this.login(event));
    this.logoutButton.addEventListener("click", () => this.logout());
    this.refreshButton.addEventListener("click", () => this.loadSummary());
    this.list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-admin-response]");
      if (button) this.openResponse(button.dataset.guestId, button.dataset.adminResponse);
    });
    this.responseForm.addEventListener("submit", (event) => this.submitResponse(event));
    this.responseCancel.addEventListener("click", () => this.responseDialog.close());
    this.responseDialog.addEventListener("close", () => { this.selectedResponse = null; });
    this.responseDialog.addEventListener("cancel", (event) => {
      if (this.responseSubmit.disabled) event.preventDefault();
    });
    this.search.addEventListener("input", () => this.renderList());
    this.sortSelect.addEventListener("change", () => {
      this.sortMode = this.sortSelect.value;
      this.renderList();
    });
    this.groupSelect.addEventListener("change", () => this.renderList());
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
    this.importCancelButton.addEventListener("click", () => {
      this.clearImportPreview(false);
      this.importStatus.textContent = "Lista mantida. Faça os ajustes e revise novamente.";
      this.importInput.focus();
    });
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
    if (this.manualGiftForm) {
      this.manualGiftForm.reset();
      this.manualGiftPayload = null;
      this.manualGiftPanel.hidden = true;
      this.manualGiftToggle.hidden = true;
      this.manualGiftToggle.setAttribute("aria-expanded", "false");
      this.manualGiftStatus.textContent = "";
    }
    if (this.giftDialog?.open) this.giftDialog.close();
    this.confirmGiftAvailable = false;
    this.cancelGiftAvailable = false;
    if (this.responseDialog.open) this.responseDialog.close();
    this.clearSession();
    this.credentials = null;
    this.guests = [];
    this.guestsRequest += 1;
    this.guestsLoaded = false;
    this.setGuestsLoading(false);
    this.list.innerHTML = "";
    this.summary.innerHTML = "";
    this.listCount.textContent = "";
    this.guestsStatus.textContent = "";
    this.gifts = [];
    this.giftsLoaded = false;
    this.giftsRequest += 1;
    this.giftsLoading = false;
    this.refreshGiftsButton.disabled = false;
    this.giftList.innerHTML = "";
    this.giftsSummary.innerHTML = "";
    this.giftsCount.textContent = "";
    this.giftsStatus.textContent = "";
    this.giftSearch.value = "";
    this.giftSort.value = "recent";
    this.giftStatusFilter.value = "all";
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
    this.selectView("guests");
    this.operatorName.textContent = name || "Equipe";
    this.loginPanel.hidden = true;
    this.app.hidden = false;
  },

  selectView(view) {
    const gifts = view === "gifts";
    this.guestsView.hidden = gifts;
    this.giftsView.hidden = !gifts;
    document.querySelectorAll("[data-admin-view]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.adminView === view));
    });
    if (gifts && !this.giftsLoaded) this.loadGifts();
  },

  async loadGifts() {
    if (!this.credentials || this.giftsLoading) return;
    const request = ++this.giftsRequest;
    this.giftsLoading = true;
    this.refreshGiftsButton.disabled = true;
    this.giftsView.setAttribute("aria-busy", "true");
    this.giftsStatus.textContent = "Carregando presentes...";
    try {
      const result = await window.WeddingApi.getAdminGifts(this.credentials);
      if (request !== this.giftsRequest) return;
      if (!Array.isArray(result?.gifts)) throw new Error("Atualize a implantação do Apps Script para consultar os presentes.");
      this.confirmGiftAvailable = result.capabilities?.confirmGift === true;
      this.cancelGiftAvailable = result.capabilities?.cancelGift === true;
      this.manualGiftToggle.hidden = result.capabilities?.createGift !== true;
      this.gifts = result.gifts;
      this.giftsLoaded = true;
      this.renderGifts();
      this.giftsStatus.textContent = this.confirmGiftAvailable ? "" : "Atualize a implantação do Apps Script para confirmar recebimentos por este painel.";
    } catch (error) {
      if (request !== this.giftsRequest) return;
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Seu acesso foi atualizado. Faça login novamente.";
        return;
      }
      this.giftsStatus.textContent = `${error.message || "Não foi possível carregar os presentes."} ${this.giftsLoaded ? "Exibindo a última consulta. " : ""}Tente atualizar. Se o painel ainda não estiver disponível, atualize a implantação do Apps Script.`;
    } finally {
      if (request === this.giftsRequest) {
        this.giftsLoading = false;
        this.refreshGiftsButton.disabled = false;
        this.giftsView.setAttribute("aria-busy", "false");
      }
    }
  },

  updateManualGiftType() {
    const physical = this.manualGiftForm.elements.type.value === "physical";
    document.getElementById("adminManualGiftAmount").hidden = physical;
    this.manualGiftForm.elements.amount.required = !physical;
    this.manualGiftForm.elements.amount.disabled = physical;
  },

  async saveManualGift(event) {
    event.preventDefault();
    if (this.manualGiftBusy || !this.credentials) return;
    const fields = this.manualGiftForm.elements;
    const credentials = this.credentials;
    const payload = this.manualGiftPayload || {
      requestId: this.createImportId(), name: fields.name.value.trim(), title: fields.title.value.trim(),
      type: fields.type.value, receivedDate: fields.receivedDate.value,
      amount: fields.type.value === "physical" ? null : Number(fields.amount.value)
    };
    this.manualGiftPayload = payload;
    this.manualGiftBusy = true;
    this.manualGiftProgress.hidden = false;
    this.manualGiftStatus.textContent = "";
    this.manualGiftForm.setAttribute("aria-busy", "true");
    Array.from(fields).forEach((field) => { field.disabled = true; });
    try {
      const result = await window.WeddingApi.createAdminGift({ ...credentials, ...payload });
      if (this.credentials !== credentials) return;
      if (result?.orderId !== `MANUAL-${payload.requestId}`) throw new Error("O servidor não confirmou o cadastro. Tente novamente.");
      this.manualGiftPayload = null;
      this.manualGiftForm.reset();
      this.manualGiftStatus.textContent = "Presente registrado. Atualizando os totais...";
      this.giftsRequest += 1;
      this.giftsLoading = false;
      await this.loadGifts();
      if (this.credentials !== credentials) return;
      this.manualGiftStatus.textContent = "Presente registrado com sucesso. Se a lista não foi atualizada, use Atualizar presentes.";
    } catch (error) {
      if (this.credentials !== credentials) return;
      if (this.isInvalidSessionError(error)) { this.logout(); this.loginStatus.textContent = "Faça login novamente."; return; }
      if (error.kind === "business") this.manualGiftPayload = null;
      this.manualGiftStatus.textContent = `${error.message || "Não foi possível salvar."}${this.manualGiftPayload ? " Os dados foram mantidos para repetir o mesmo cadastro com segurança." : ""}`;
    } finally {
      this.manualGiftBusy = false;
      this.manualGiftProgress.hidden = true;
      this.manualGiftForm.setAttribute("aria-busy", "false");
      Array.from(fields).forEach((field) => { field.disabled = Boolean(this.manualGiftPayload) && field.type !== "submit"; });
      if (!this.manualGiftPayload) this.updateManualGiftType();
    }
  },

  openGiftConfirmation(orderId, action = "confirm") {
    if (this.giftConfirmBusy || !(action === "cancel" ? this.cancelGiftAvailable : this.confirmGiftAvailable)) return;
    const gift = this.gifts.find((item) => item.orderId === orderId);
    if (!gift || !orderId || this.giftPaymentState(gift) !== "pending") return;
    this.selectedGiftAction = action;
    this.selectedGiftId = orderId;
    const cancel = action === "cancel";
    this.giftDialogTitle.textContent = cancel ? "Cancelar pedido duplicado" : "Confirmar recebimento";
    this.giftDialogDescription.textContent = cancel
      ? "Cancele apenas o pedido pendente duplicado. O registro continuará no histórico, fora dos totais ativos. Esta ação não cancela cobranças nem realiza estornos no banco ou no PagBank."
      : "Confirme somente após conferir que o valor chegou à sua conta. O presente será marcado como pago e a data desta confirmação será registrada.";
    this.giftSavingTitle.textContent = cancel ? "Cancelando pedido..." : "Confirmando recebimento...";
    this.giftSavingDescription.textContent = "Salvando a alteração. Aguarde um instante.";
    this.setGiftSaving(false);
    const amount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(this.giftAmount(gift));
    this.giftConfirmDetails.textContent = `${gift.name || "Remetente não informado"} · ${gift.title || "Presente"} · ${amount}`;
    this.giftConfirmStatus.textContent = "";
    this.giftDialog.showModal();
  },

  setGiftSaving(active) {
    this.giftConfirmBusy = active;
    this.giftSaving.hidden = !active;
    this.giftConfirmSubmit.disabled = active;
    this.giftConfirmCancel.disabled = active;
    this.giftConfirmSubmit.textContent = active ? "Salvando..." : this.selectedGiftAction === "cancel" ? "Sim, cancelar pedido" : "Sim, recebi o valor";
    this.giftConfirmForm.setAttribute("aria-busy", String(active));
  },

  async confirmGift(event) {
    event.preventDefault();
    if (this.giftConfirmBusy || !this.selectedGiftId || !this.credentials) return;
    const orderId = this.selectedGiftId;
    const credentials = this.credentials;
    const cancel = this.selectedGiftAction === "cancel";
    this.setGiftSaving(true);
    this.giftConfirmStatus.textContent = "";
    const progress = (message) => {
      if (this.credentials === credentials) {
        this.giftSavingTitle.textContent = message;
        this.giftSavingDescription.textContent = "Conferindo o registro no servidor. Não é necessário clicar novamente.";
      }
    };
    try {
      const result = cancel
        ? await window.WeddingApi.cancelAdminGift({ ...credentials, orderId }, progress)
        : await window.WeddingApi.confirmAdminGift({ ...credentials, orderId }, progress);
      if (this.credentials !== credentials) return;
      if (result?.orderId !== orderId || result.status !== (cancel ? "cancelado" : "pago") || (!cancel && !result.paidAt)) throw new Error("O servidor não confirmou a gravação.");
      // Invalidate an older refresh so it cannot overwrite the saved payment.
      this.giftsRequest += 1;
      this.giftsLoading = false;
      this.refreshGiftsButton.disabled = false;
      this.giftsView.setAttribute("aria-busy", "false");
      this.gifts = this.gifts.map((gift) => gift.orderId === orderId ? { ...gift, status: result.status, paidAt: result.paidAt || gift.paidAt } : gift);
      this.renderGifts();
      this.giftDialog.close();
      this.giftsStatus.textContent = cancel ? "Pedido cancelado. O registro foi mantido no histórico e retirado dos totais ativos." : result.alreadyConfirmed ? "Este recebimento já estava confirmado. O painel foi atualizado." : "Recebimento confirmado! O status e o total recebido foram atualizados.";
    } catch (error) {
      if (this.credentials !== credentials) return;
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Seu acesso foi atualizado. Faça login novamente.";
        return;
      }
      this.giftConfirmStatus.textContent = error.message || "Não foi possível concluir a operação. Tente novamente.";
    } finally {
      this.setGiftSaving(false);
    }
  },

  giftPaymentState(gift) {
    if (gift.provider === "manual_physical" && gift.status === "recebido") return "physical";
    const status = this.normalize(gift.status).trim();
    if (["cancelled", "cancelado"].includes(status)) return "cancelled";
    if (["refunded", "reembolsado", "estornado", "rejected", "recusado"].includes(status)) return "other";
    if (gift.paidAt || ["paid", "pago", "approved", "aprovado", "confirmed", "confirmado"].includes(status)) return "paid";
    if (!status || ["created", "pending", "aguardando_pagamento", "pendente"].includes(status)) return "pending";
    return "other";
  },

  giftAmount(gift) {
    const value = Number(gift.amount);
    return Number.isFinite(value) ? value : 0;
  },

  giftDate(gift) {
    const value = new Date(gift.createdAt).getTime();
    return Number.isFinite(value) ? value : null;
  },

  sortGifts(gifts) {
    const mode = this.giftSort.value;
    return gifts.sort((a, b) => {
      if (mode === "name") return String(a.name || "").localeCompare(String(b.name || ""), "pt-BR", { sensitivity: "base" });
      if (mode === "highest" || mode === "lowest") return (this.giftAmount(a) - this.giftAmount(b)) * (mode === "highest" ? -1 : 1);
      const first = this.giftDate(a), second = this.giftDate(b);
      if (first === null) return second === null ? 0 : 1;
      if (second === null) return -1;
      return (first - second) * (mode === "oldest" ? 1 : -1);
    });
  },

  renderGifts() {
    if (!this.giftsLoaded) return;
    const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    const paid = this.gifts.filter((gift) => this.giftPaymentState(gift) === "paid");
    const pending = this.gifts.filter((gift) => this.giftPaymentState(gift) === "pending");
    const paidTotal = paid.reduce((sum, gift) => sum + this.giftAmount(gift), 0);
    const pendingTotal = pending.reduce((sum, gift) => sum + this.giftAmount(gift), 0);
    const cancelled = this.gifts.filter((gift) => this.giftPaymentState(gift) === "cancelled");
    this.giftsSummary.innerHTML = [
      ["Presentes registrados", this.gifts.length],
      ["Valor recebido", money(paidTotal)],
      ["Valor pendente", money(pendingTotal)],
      ["Total ativo · recebido + pendente", money(paidTotal + pendingTotal)],
      ["Pedidos pendentes", pending.length],
      ["Pedidos cancelados", cancelled.length],
      ["Físicos recebidos · sem valor", this.gifts.filter((gift) => this.giftPaymentState(gift) === "physical").length]
    ].map(([label, value]) => `<div><span>${this.escape(label)}</span><strong>${this.escape(value)}</strong></div>`).join("");
    const term = this.normalize(this.giftSearch.value);
    const gifts = this.sortGifts(this.gifts.filter((gift) => {
      return (this.giftStatusFilter.value === "all" || this.giftPaymentState(gift) === this.giftStatusFilter.value)
        && this.normalize(`${gift.name || ""} ${gift.title || ""} ${gift.message || ""}`).includes(term);
    }));
    this.giftsCount.textContent = `${gifts.length} de ${this.gifts.length} presentes`;
    this.giftList.innerHTML = gifts.length ? gifts.map((gift) => {
      const state = this.giftPaymentState(gift);
      const label = state === "physical" ? "Presente físico recebido" : state === "paid" ? "Pagamento confirmado" : state === "pending" ? "Aguardando confirmação" : state === "cancelled" ? "Pedido cancelado" : gift.status || "Não informado";
      const method = gift.paymentMethod === "pix" ? "Pix" : gift.paymentMethod === "card" ? "Cartão · PagBank" : ({ manual_pix: "Pix fora do site", manual_transfer: "Transferência bancária", manual_cash: "Dinheiro", manual_physical: "Presente físico" }[gift.provider] || gift.paymentMethod || gift.provider || "Não informada");
      return `<article class="admin-gift">
        <div class="admin-gift__heading"><div><span class="admin-gift__status admin-gift__status--${state}">${this.escape(label)}</span><h3>${this.escape(gift.name || "Remetente não informado")}</h3><p>${this.escape(gift.title || "Presente sem descrição")}</p></div><strong class="admin-gift__amount">${gift.provider === "manual_physical" ? "Sem valor atribuído" : this.escape(money(this.giftAmount(gift)))}</strong></div>
        <dl class="admin-gift__facts"><div><dt>${gift.source === "admin_manual" ? "Data do recebimento" : "Data do presente"}</dt><dd>${this.escape(this.formatDate(gift.createdAt) || "Não informada")}</dd></div><div><dt>${gift.provider === "manual_physical" ? "Tipo" : "Forma de pagamento"}</dt><dd>${this.escape(method)}</dd></div>${gift.paidAt ? `<div><dt>Pagamento confirmado em</dt><dd>${this.escape(this.formatDate(gift.paidAt))}</dd></div>` : ""}</dl>
        ${gift.source === "admin_manual" ? '<p class="admin-list-count">Lançamento manual · recebido fora do site</p>' : ""}
        <div class="admin-gift__message"><span>Mensagem enviada</span><p>${this.escape(gift.message || "Nenhuma mensagem enviada.")}</p></div>
        ${state === "pending" && gift.orderId ? `<div class="admin-guest__actions">
          ${this.confirmGiftAvailable ? `<button class="admin-button admin-button--small" type="button" data-confirm-gift="${this.escapeAttr(gift.orderId)}">Confirmar recebimento</button>` : ""}
          ${this.cancelGiftAvailable ? `<button class="admin-button admin-button--small admin-button--cancel" type="button" data-cancel-gift="${this.escapeAttr(gift.orderId)}">Cancelar duplicidade</button>` : ""}
        </div>` : ""}
      </article>`;
    }).join("") : `<p class="admin-gifts-empty">${this.gifts.length ? "Nenhum presente encontrado. Experimente outra busca ou status." : "Ainda não há presentes registrados."}</p>`;
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

  setGuestsLoading(active) {
    this.guestsLoading.hidden = !active;
    this.refreshButton.disabled = active;
    this.refreshButton.textContent = active ? "Atualizando..." : "Atualizar";
    this.list.setAttribute("aria-busy", String(active));
  },

  async loadSummary() {
    if (!this.credentials) return false;
    const request = ++this.guestsRequest;
    this.setGuestsLoading(true);
    this.guestsStatus.textContent = "";
    try {
      const result = await window.WeddingApi.getAdminSummary(this.credentials);
      if (request !== this.guestsRequest) return false;
      if (!Array.isArray(result?.guests)) throw new Error("Resposta de convidados inválida. Tente atualizar novamente.");
      this.guestsLoaded = true;
      this.guests = result.guests || [];
      this.manualResponseAvailable = result.capabilities?.adminRespondGuest === true;
      this.renderSummary(result.totals || {});
      this.renderGroupOptions();
      this.renderList();
      if (!this.manualResponseAvailable) {
        this.showActionFeedback("warning", "Para registrar respostas por esta página, atualize primeiro o Apps Script. A lista permanece disponível para consulta.", true);
      } else if (this.actionFeedback.dataset.backendNotice === "true") {
        this.actionFeedback.hidden = true;
        this.actionFeedback.dataset.backendNotice = "false";
      }
    } catch (error) {
      if (request !== this.guestsRequest) return false;
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Seu acesso foi atualizado. Faça login novamente.";
        return false;
      }
      this.guestsStatus.textContent = `${error.message || "Não foi possível carregar os convidados."}${this.guestsLoaded ? " A lista anterior foi mantida. Toque em Atualizar para tentar novamente." : " Toque em Atualizar para tentar novamente."}`;
      return false;
    } finally {
      if (request === this.guestsRequest) this.setGuestsLoading(false);
    }
    return true;
  },

  renderGroupOptions() {
    const selected = this.groupSelect.value;
    const groups = [...new Set(this.guests.map((guest) => String(guest.group || "").trim()).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, "pt-BR", { sensitivity: "base" }));
    this.groupSelect.innerHTML = "";
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "Todos os grupos";
    this.groupSelect.appendChild(all);
    groups.forEach((group) => {
      const option = document.createElement("option");
      option.value = group;
      option.textContent = group;
      this.groupSelect.appendChild(option);
    });
    this.groupSelect.value = groups.includes(selected) ? selected : "";
  },

  renderSummary(totals) {
    const metric = (value) => Number.isFinite(value) ? value : "—";
    const items = [
      ["Convites", totals.total || 0],
      ["Pessoas convidadas", metric(totals.invitedPeople)],
      ["Presenças confirmadas", metric(totals.confirmedPeople)],
      ["Presenças possíveis", metric(totals.projectedPeople)],
      ["Aguardando resposta", metric(totals.pendingPeople)],
      ["Faltam responder", totals.pending || 0],
      ["Não vão / cancelaram", (totals.declined || 0) + (totals.cancelled || 0)],
      ["Vagas liberadas", metric(totals.releasedPeople)],
    ];
    this.summary.innerHTML = items.map(([label, value]) => `
      <div>
        <span>${this.escape(label)}</span>
        <strong>${this.escape(value)}</strong>
      </div>
    `).join("");
    const counts = { all: totals.total, confirmed: totals.confirmed, pending: totals.pending, declined: totals.declined, cancelled: totals.cancelled };
    this.filters.querySelectorAll("[data-filter]").forEach((button) => {
      const label = button.dataset.label || button.textContent.trim();
      button.dataset.label = label;
      button.textContent = `${label} (${Number(counts[button.dataset.filter] || 0)})`;
    });
  },

  renderList() {
    const term = this.normalize(this.search.value);
    const guests = this.guests.filter((guest) => {
      if (this.filter !== "all" && guest.status !== this.filter) return false;
      if (this.groupSelect.value && String(guest.group || "").trim() !== this.groupSelect.value) return false;
      if (!term) return true;
      return this.normalize(`${guest.name} ${guest.group} ${guest.phone} ${guest.email}`).includes(term);
    });
    this.sortGuests(guests);
    const invitedPeople = guests.reduce((total, guest) => total + 1 + Math.max(0, Number(guest.allowedCompanions) || 0), 0);
    this.listCount.textContent = `${guests.length} de ${this.guests.length} convites · ${invitedPeople} vagas convidadas neste filtro`;

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
          <div><dt>Pessoas</dt><dd>${this.escape(guest.status === "pending" ? `até ${1 + Number(guest.allowedCompanions || 0)}` : guest.totalPeople || 0)}</dd></div>
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
        ${guest.status === "pending" && this.manualResponseAvailable ? `<div class="admin-guest__actions">
          <button class="admin-button admin-button--small" type="button" data-admin-response="confirmed" data-guest-id="${this.escapeAttr(guest.guestId)}">Confirmar presença</button>
          <button class="admin-button admin-button--small admin-button--ghost" type="button" data-admin-response="declined" data-guest-id="${this.escapeAttr(guest.guestId)}">Registrar ausência</button>
        </div>` : ""}
      </article>
    `).join("");
  },

  openResponse(guestId, attendance) {
    const guest = this.guests.find((item) => item.guestId === guestId);
    if (!guest || guest.status !== "pending" || !["confirmed", "declined"].includes(attendance)) return;
    this.selectedResponse = { guestId, attendance };
    this.responseForm.reset();
    this.responseStatus.textContent = "";
    this.responseMode.textContent = attendance === "confirmed" ? "Confirmar presença" : "Registrar ausência";
    this.responseTitle.textContent = guest.name;
    this.responseDescription.textContent = attendance === "confirmed"
      ? "A resposta será registrada e o convite com QR ficará disponível nos detalhes. Nenhum e-mail será enviado."
      : "A resposta será registrada como não comparecimento. Nenhum e-mail será enviado.";
    this.responseCompanionFields.hidden = attendance !== "confirmed" || Number(guest.allowedCompanions || 0) === 0;
    this.responseForm.elements.companionsConfirmed.innerHTML = Array.from(
      { length: Math.max(0, Number(guest.allowedCompanions || 0)) + 1 },
      (_, count) => `<option value="${count}">${count}</option>`
    ).join("");
    this.responseSubmit.textContent = attendance === "confirmed" ? "Confirmar presença" : "Registrar ausência";
    this.responseDialog.showModal();
  },

  async submitResponse(event) {
    event.preventDefault();
    const selected = this.selectedResponse;
    if (!selected || this.responseSubmit.disabled || !this.credentials) return;
    this.responseSubmit.disabled = true;
    this.responseCancel.disabled = true;
    this.responseStatus.textContent = "Registrando resposta...";
    try {
      const result = await window.WeddingApi.respondAdminGuest({
        ...this.credentials,
        ...selected,
        companionsConfirmed: selected.attendance === "confirmed" ? Number(this.responseForm.elements.companionsConfirmed.value || 0) : 0,
        companionName: selected.attendance === "confirmed" ? this.responseForm.elements.companionName.value.trim() : ""
      });
      const refreshed = await this.loadSummary();
      this.responseDialog.close();
      this.showActionFeedback(
        refreshed && !result.alreadyRegistered ? "success" : "warning",
        refreshed ? result.message : `${result.message} Não foi possível atualizar a lista agora; confira na planilha antes de repetir a ação.`
      );
    } catch (error) {
      if (this.isInvalidSessionError(error)) {
        this.logout();
        this.loginStatus.textContent = "Seu acesso foi atualizado. Faça login novamente.";
        return;
      }
      this.responseStatus.textContent = `${error.message || "Não foi possível registrar."} Se a conexão caiu após o envio, atualize a lista antes de tentar novamente.`;
    } finally {
      this.responseSubmit.disabled = false;
      this.responseCancel.disabled = false;
    }
  },

  showActionFeedback(mode, message, backendNotice = false) {
    this.actionFeedback.hidden = false;
    this.actionFeedback.className = `admin-action-feedback is-${mode}`;
    this.actionFeedback.textContent = message;
    this.actionFeedback.dataset.backendNotice = String(backendNotice);
    this.actionFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  sortGuests(guests) {
    if (this.sortMode === "sheet") return guests;
    if (this.sortMode === "recent") {
      return guests.sort((first, second) => {
        const firstDate = first.lastResponseAt ? new Date(first.lastResponseAt).getTime() : 0;
        const secondDate = second.lastResponseAt ? new Date(second.lastResponseAt).getTime() : 0;
        return (Number.isFinite(secondDate) ? secondDate : 0) - (Number.isFinite(firstDate) ? firstDate : 0);
      });
    }
    return guests.sort((first, second) => {
      return String(first.name || "").localeCompare(String(second.name || ""), "pt-BR", {
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
    if (guest.status === "pending") {
      const allowed = Math.max(0, Number(guest.allowedCompanions) || 0);
      return allowed ? `Até ${allowed}` : "Não";
    }
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
    return String(value ?? "")
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
