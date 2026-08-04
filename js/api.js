window.WeddingApi = {
  async getPublicConfig() {
    const config = window.WEDDING_CONFIG;
    const cached = window.WeddingCache.read(config.cache.publicConfigKey);

    if (!config.appScriptUrl) {
      return cached || config.fallbackData;
    }

    try {
      const response = await fetch(`${config.appScriptUrl}?action=config`, {
        method: "GET",
        headers: { Accept: "application/json" }
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Não foi possível carregar as configurações.");
      }
      window.WeddingCache.write(
        config.cache.publicConfigKey,
        payload.data,
        config.cache.publicConfigTtlMinutes
      );
      return payload.data;
    } catch (error) {
      return cached || config.fallbackData;
    }
  },

  async searchGuests(query) {
    const config = window.WEDDING_CONFIG;
    const term = String(query || "").trim();
    if (term.length < 2) return [];

    if (!config.appScriptUrl) {
      const guests = config.fallbackData.guests || [];
      return guests
        .filter((guest) => this.normalize(guest.name).includes(this.normalize(term)))
        .slice(0, 8);
    }

    const url = `${config.appScriptUrl}?action=guests&q=${encodeURIComponent(term)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      if (payload.error === "Ação GET não reconhecida.") {
        throw new Error("A lista de convidados está sendo atualizada. Tente novamente em instantes.");
      }
      throw new Error(payload.error || "Não foi possível buscar a lista de convidados.");
    }
    return payload.data?.guests || [];
  },

  async getInvite(token) {
    const config = window.WEDDING_CONFIG;
    const cleanToken = String(token || "").trim();
    if (!cleanToken) {
      throw new Error("Convite não encontrado.");
    }

    if (!config.appScriptUrl) {
      return {
        token: cleanToken,
        name: "Convidado Exemplo",
        attendance: "confirmed",
        companionsConfirmed: 1,
        companionName: "Acompanhante",
        checkinStatus: "pendente",
        checkinLink: `${config.domain}checkin.html?t=${encodeURIComponent(cleanToken)}`,
        inviteLink: `${config.domain}convite.html?t=${encodeURIComponent(cleanToken)}`,
        qrCode: `https://quickchart.io/qr?size=260&margin=2&text=${encodeURIComponent(`${config.domain}checkin.html?t=${cleanToken}`)}`,
        event: {
          couple: config.couple,
          date: "29 de outubro de 2026",
          time: "15h30",
          venue: "Buffet La Maison",
          address: "Av. Eng. Luiz Vieira, 555 - Papicu"
        }
      };
    }

    const url = `${config.appScriptUrl}?action=invite&t=${encodeURIComponent(cleanToken)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" }
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível carregar este convite.");
    }
    return payload.data?.invite;
  },

  async submitRsvp(data) {
    const config = window.WEDDING_CONFIG;

    if (!config.appScriptUrl) {
      const localList = window.WeddingCache.read("kf_local_rsvps") || [];
      localList.push({ ...data, createdAt: new Date().toISOString(), localOnly: true });
      window.WeddingCache.write("kf_local_rsvps", localList);
      return {
        ok: true,
        localOnly: true,
        message: "Confirmação registrada neste navegador. Configure o Apps Script para enviar para a planilha."
      };
    }

    const response = await fetch(config.appScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "rsvp", data })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível enviar sua confirmação.");
    }
    return {
      ok: payload.ok,
      ...(payload.data || {})
    };
  },

  normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  },

  async checkinRequest(action, data) {
    const config = window.WEDDING_CONFIG;
    if (!config.appScriptUrl) {
      throw new Error("Configure o Apps Script para usar o check-in.");
    }

    const response = await fetch(config.appScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, data })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível concluir a operação.");
    }
    return payload.data;
  },

  async checkinLogin(credentials) {
    return this.checkinRequest("checkin_login", credentials);
  },

  async validateCheckin(data) {
    return this.checkinRequest("checkin_validate", data);
  },

  async searchCheckinGuests(data) {
    return this.checkinRequest("checkin_search", data);
  },

  async submitGiftIntent(data) {
    const config = window.WEDDING_CONFIG;

    if (!config.appScriptUrl) {
      const localList = window.WeddingCache.read("kf_local_gift_intents") || [];
      localList.push({ ...data, createdAt: new Date().toISOString(), localOnly: true });
      window.WeddingCache.write("kf_local_gift_intents", localList);
      return {
        ok: true,
        localOnly: true,
        message: "Presente registrado neste navegador. Configure o Apps Script para enviar para a planilha."
      };
    }

    const response = await fetch(config.appScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "gift_intent", data })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível registrar o presente.");
    }
    return payload;
  }
};
