window.WeddingRsvp = {
  selectedGuest: null,
  searchTimer: null,
  searchToken: 0,

  init() {
    this.form = document.getElementById("rsvpForm");
    this.status = document.getElementById("formStatus");
    if (!this.form || !this.status) return;

    this.search = this.form.elements.guestSearch;
    this.guestId = this.form.elements.guestId;
    this.suggestions = document.getElementById("guestSuggestions");
    this.selectedBox = document.getElementById("guestSelected");
    this.selectedName = this.selectedBox?.querySelector("strong");
    this.changeGuestButton = document.getElementById("changeGuestButton");
    this.details = document.getElementById("rsvpDetails");
    this.companionChoice = document.getElementById("companionChoice");
    this.companionNameField = document.getElementById("companionNameField");
    this.phone = this.form.elements.phone;
    this.submitButton = this.form.querySelector('button[type="submit"]');

    this.restoreDraft();
    this.bindEvents();
    this.updateSubmitState();
  },

  bindEvents() {
    this.search.addEventListener("input", () => {
      this.clearSelectedGuest();
      this.persistDraft();
      this.queueSearch(this.search.value);
    });

    this.search.addEventListener("focus", () => {
      if (this.suggestions.children.length) this.showSuggestions();
    });

    this.changeGuestButton?.addEventListener("click", () => {
      this.clearSelectedGuest();
      this.search.focus();
      this.updateStatus("Digite novamente e selecione seu nome na lista.");
    });

    this.form.addEventListener("change", (event) => {
      if (event.target.name === "attendance") this.updateCompanionVisibility();
      if (event.target.name === "bringCompanion") this.updateCompanionNameVisibility();
      this.persistDraft();
      this.updateSubmitState();
    });

    this.form.addEventListener("input", (event) => {
      if (event.target === this.phone) {
        this.phone.value = this.formatPhone(this.phone.value);
      }
      if (event.target !== this.search) this.persistDraft();
      this.updateSubmitState();
    });

    this.form.addEventListener("submit", (event) => this.submit(event));

    document.addEventListener("click", (event) => {
      if (!this.form.contains(event.target)) this.hideSuggestions();
    });
  },

  restoreDraft() {
    const draft = window.WeddingCache.read(window.WEDDING_CONFIG.cache.rsvpDraftKey);
    if (!draft) return;

    ["guestSearch", "guestId", "phone", "email", "companionName"].forEach((key) => {
      if (this.form.elements[key] && draft[key]) this.form.elements[key].value = draft[key];
    });

    ["attendance", "bringCompanion"].forEach((key) => {
      if (!draft[key]) return;
      const field = this.form.querySelector(`[name="${key}"][value="${draft[key]}"]`);
      if (field) field.checked = true;
    });

    if (draft.selectedGuest) this.selectGuest(draft.selectedGuest, { silent: true });
    this.updateCompanionVisibility();
    this.updateCompanionNameVisibility();
  },

  persistDraft() {
    window.WeddingCache.write(window.WEDDING_CONFIG.cache.rsvpDraftKey, this.readForm(), 60 * 24 * 7);
  },

  queueSearch(value) {
    window.clearTimeout(this.searchTimer);
    const query = value.trim();

    if (query.length < 2) {
      this.renderSuggestions([]);
      this.updateStatus("Digite pelo menos duas letras para buscar seu nome.");
      return;
    }

    this.searchTimer = window.setTimeout(() => this.searchGuests(query), 280);
  },

  async searchGuests(query) {
    const token = ++this.searchToken;
    this.setSearching(true);
    this.updateStatus("Buscando seu nome na lista...");

    try {
      const guests = await window.WeddingApi.searchGuests(query);
      if (token !== this.searchToken) return;
      this.renderSuggestions(guests);
      this.updateStatus(guests.length ? "Selecione seu nome para continuar." : "Não encontramos esse nome na lista. Confira a escrita ou fale com os noivos.");
    } catch (error) {
      if (token !== this.searchToken) return;
      this.renderSuggestions([]);
      this.updateStatus(error.message || "Não foi possível buscar agora. Tente novamente em instantes.");
    } finally {
      if (token === this.searchToken) this.setSearching(false);
    }
  },

  renderSuggestions(guests) {
    this.suggestions.innerHTML = "";
    if (!guests.length) {
      this.hideSuggestions();
      return;
    }

    guests.forEach((guest) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "rsvp-suggestion";
      option.setAttribute("role", "option");
      option.innerHTML = `
        <strong>${this.escapeHtml(guest.name)}</strong>
        <span>${this.escapeHtml(this.describeGuest(guest))}</span>
      `;
      option.addEventListener("click", () => this.selectGuest(guest));
      this.suggestions.appendChild(option);
    });

    this.showSuggestions();
  },

  selectGuest(guest, options = {}) {
    this.selectedGuest = {
      guest_id: guest.guest_id,
      name: guest.name,
      group: guest.group || "",
      allowed_companions: Number(guest.allowed_companions || 0),
      status: guest.status || ""
    };
    this.search.value = guest.name;
    this.guestId.value = guest.guest_id;
    this.selectedName.textContent = guest.name;
    this.selectedBox.hidden = false;
    this.details.hidden = false;
    this.hideSuggestions();
    this.updateCompanionVisibility();
    this.updateSubmitState();
    this.persistDraft();
    if (!options.silent) this.updateStatus("Nome selecionado. Agora escolha sua confirmação.");
  },

  clearSelectedGuest() {
    this.selectedGuest = null;
    this.guestId.value = "";
    this.selectedBox.hidden = true;
    this.details.hidden = true;
    this.companionChoice.hidden = true;
    this.companionNameField.hidden = true;
    this.form.querySelectorAll('[name="attendance"], [name="bringCompanion"]').forEach((field) => { field.checked = false; });
    this.form.elements.companionName.value = "";
    this.submitButton.disabled = true;
  },

  updateCompanionVisibility() {
    const attendance = this.form.elements.attendance.value;
    const canBringCompanion = this.selectedGuest?.allowed_companions > 0 && attendance === "confirmed";
    this.companionChoice.hidden = !canBringCompanion;

    if (!canBringCompanion) {
      this.form.querySelectorAll('[name="bringCompanion"]').forEach((field) => { field.checked = false; });
      this.form.elements.companionName.value = "";
    }

    this.updateCompanionNameVisibility();
  },

  updateCompanionNameVisibility() {
    const bringCompanion = this.form.elements.bringCompanion.value === "yes";
    const show = !this.companionChoice.hidden && bringCompanion;
    this.companionNameField.hidden = !show;
    if (!show) this.form.elements.companionName.value = "";
  },

  updateSubmitState() {
    const data = this.readForm();
    const needsCompanionChoice = this.selectedGuest?.allowed_companions > 0 && data.attendance === "confirmed";
    const needsCompanionName = needsCompanionChoice && data.bringCompanion === "yes";
    const valid = Boolean(
      data.guestId &&
      data.attendance &&
      (!needsCompanionChoice || data.bringCompanion) &&
      (!needsCompanionName || data.companionName)
    );
    this.submitButton.disabled = !valid;
  },

  async submit(event) {
    event.preventDefault();
    const data = this.readForm();

    if (!data.guestId || !this.selectedGuest) {
      this.updateStatus("Selecione seu nome na lista antes de enviar.");
      this.search.focus();
      return;
    }

    if (!data.attendance) {
      this.updateStatus("Escolha se você confirma presença.");
      return;
    }

    this.setSubmitting(true);
    this.updateStatus("Enviando sua confirmação...");

    try {
      const result = await window.WeddingApi.submitRsvp(data);
      this.updateStatus(result.message || "Confirmação registrada. Obrigado!");
      window.WeddingCache.remove(window.WEDDING_CONFIG.cache.rsvpDraftKey);
      this.resetForm();
    } catch (error) {
      this.updateStatus(error.message || "Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      this.setSubmitting(false);
    }
  },

  readForm() {
    const attendance = this.form.elements.attendance.value;
    const bringCompanion = this.form.elements.bringCompanion.value;

    return {
      guestId: this.guestId.value.trim(),
      guestName: this.search.value.trim(),
      selectedGuest: this.selectedGuest,
      attendance,
      bringCompanion,
      companionsConfirmed: attendance === "confirmed" && bringCompanion === "yes" ? 1 : 0,
      companionName: this.form.elements.companionName.value.trim(),
      phone: this.form.elements.phone.value.trim(),
      phoneDigits: this.onlyDigits(this.form.elements.phone.value),
      email: this.form.elements.email.value.trim(),
      source: "site",
      userAgent: navigator.userAgent
    };
  },

  resetForm() {
    this.form.reset();
    this.selectedGuest = null;
    this.guestId.value = "";
    this.selectedBox.hidden = true;
    this.details.hidden = true;
    this.companionChoice.hidden = true;
    this.companionNameField.hidden = true;
    this.renderSuggestions([]);
    this.updateSubmitState();
  },

  setSearching(isLoading) {
    this.search.closest(".rsvp-search").classList.toggle("is-loading", isLoading);
    this.search.setAttribute("aria-busy", String(isLoading));
  },

  setSubmitting(isSubmitting) {
    this.submitButton.classList.toggle("is-loading", isSubmitting);
    this.submitButton.textContent = isSubmitting ? "Enviando..." : "Enviar confirmação";
    if (isSubmitting) {
      this.submitButton.disabled = true;
    } else {
      this.updateSubmitState();
    }
  },

  showSuggestions() {
    this.suggestions.hidden = false;
    this.search.setAttribute("aria-expanded", "true");
  },

  hideSuggestions() {
    this.suggestions.hidden = true;
    this.search.setAttribute("aria-expanded", "false");
  },

  updateStatus(message) {
    this.status.textContent = message;
  },

  describeGuest(guest) {
    const companions = Number(guest.allowed_companions || 0);
    const group = guest.group ? `${guest.group} · ` : "";
    return `${group}${companions > 0 ? "com acompanhante" : "sem acompanhante"}`;
  },

  formatPhone(value) {
    const digits = this.onlyDigits(value).slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";

    const area = digits.slice(0, 2);
    const number = digits.slice(2);
    const firstPartLength = digits.length > 10 ? 5 : 4;
    const firstPart = number.slice(0, firstPartLength);
    const secondPart = number.slice(firstPartLength, firstPartLength + 4);

    return `(${area}) ${firstPart}${secondPart ? `-${secondPart}` : ""}`;
  },

  onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  },

  escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }
};
