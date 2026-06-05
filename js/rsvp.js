window.WeddingRsvp = {
  init() {
    const form = document.getElementById("rsvpForm");
    const status = document.getElementById("formStatus");
    if (!form || !status) return;

    const draft = window.WeddingCache.read(window.WEDDING_CONFIG.cache.rsvpDraftKey);
    if (draft) {
      Object.entries(draft).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
    }

    form.addEventListener("input", () => {
      window.WeddingCache.write(window.WEDDING_CONFIG.cache.rsvpDraftKey, this.readForm(form), 60 * 24 * 7);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "Enviando sua confirmação...";
      const data = this.readForm(form);

      if (!data.name || !data.phone) {
        status.textContent = "Preencha pelo menos nome e telefone.";
        return;
      }

      try {
        const result = await window.WeddingApi.submitRsvp(data);
        status.textContent = result.message || "Presença confirmada com carinho. Obrigado!";
        window.WeddingCache.remove(window.WEDDING_CONFIG.cache.rsvpDraftKey);
        form.reset();
      } catch (error) {
        status.textContent = error.message || "Não foi possível enviar agora. Tente novamente em instantes.";
      }
    });
  },

  readForm(form) {
    return {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      companion: form.elements.companion.value.trim(),
      source: "site",
      userAgent: navigator.userAgent
    };
  }
};
