window.WeddingCancel = {
  token: "",
  cancellation: null,

  init() {
    this.loading = document.getElementById("cancelLoading");
    this.content = document.getElementById("cancelContent");
    this.name = document.getElementById("cancelName");
    this.companion = document.getElementById("cancelCompanion");
    this.button = document.getElementById("confirmCancelButton");
    this.status = document.getElementById("cancelStatus");
    this.token = new URLSearchParams(window.location.search).get("t") || "";

    this.button?.addEventListener("click", () => this.cancel());
    this.load();
  },

  async load() {
    if (!this.token) {
      this.showError("Link de cancelamento não encontrado.");
      return;
    }

    try {
      this.cancellation = await window.WeddingApi.getCancellation(this.token);
      this.render();
    } catch (error) {
      this.showError(error.message || "Não foi possível carregar este cancelamento.");
    }
  },

  render() {
    this.name.textContent = this.cancellation.name || "Convidado";
    const companionText = this.describeCompanion(this.cancellation);
    this.companion.textContent = companionText;
    this.companion.hidden = !companionText;
    this.loading.hidden = true;
    this.content.hidden = false;
  },

  async cancel() {
    if (!this.cancellation || !this.token) return;
    this.button.disabled = true;
    this.button.textContent = "Cancelando...";
    this.status.textContent = "Registrando cancelamento...";

    try {
      const result = await window.WeddingApi.cancelRsvp({
        token: this.token,
        source: "cancelamento_link",
        userAgent: navigator.userAgent
      });
      this.status.textContent = result.message || "Cancelamento registrado com sucesso.";
      this.button.textContent = "Cancelamento registrado";
    } catch (error) {
      this.status.textContent = error.message || "Não foi possível cancelar agora.";
      this.button.disabled = false;
      this.button.textContent = "Cancelar minha presença";
    }
  },

  describeCompanion(cancellation) {
    const count = Number(cancellation.companionsConfirmed || 0);
    if (!count) return "";
    return cancellation.companionName ? `Acompanhante: ${cancellation.companionName}` : "Acompanhante: incluído";
  },

  showError(message) {
    this.loading.innerHTML = `<strong>${this.escape(message)}</strong><span>Confira se o link recebido está completo.</span>`;
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

document.addEventListener("DOMContentLoaded", () => window.WeddingCancel.init());
