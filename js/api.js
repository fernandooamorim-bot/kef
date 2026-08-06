window.WeddingApi = {
  async requestJson(url, options = {}, fallbackMessage) {
    const timeoutMs = options.timeoutMs || 14000;
    const requestOptions = { ...options };
    delete requestOptions.timeoutMs;
    const controller = "AbortController" in window ? new AbortController() : null;
    const timer = controller
      ? window.setTimeout(() => controller.abort(), timeoutMs)
      : null;

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller?.signal
      });
      const text = await response.text();
      let payload = null;
      try {
        payload = text ? JSON.parse(text) : {};
      } catch (error) {
        throw new Error("Resposta inválida do servidor.");
      }
      return { response, payload };
    } catch (error) {
      throw new Error(fallbackMessage || "Não foi possível conectar ao sistema agora. Verifique sua internet e tente novamente.");
    } finally {
      if (timer) window.clearTimeout(timer);
    }
  },

  async requestJsonWithRetry(url, options, fallbackMessage, attempts = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await this.requestJson(url, options, fallbackMessage);
      } catch (error) {
        lastError = error;
        if (attempt < attempts) await this.delay(550 * attempt);
      }
    }

    throw lastError || new Error(fallbackMessage);
  },

  delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  },

  async getPublicConfig() {
    const config = window.WEDDING_CONFIG;
    const cached = window.WeddingCache.read(config.cache.publicConfigKey);
    const cachedIsSafe = this.hasUsableGiftList(cached);

    if (!config.appScriptUrl) {
      return cachedIsSafe ? cached : config.fallbackData;
    }

    try {
      const { response, payload } = await this.requestJsonWithRetry(`${config.appScriptUrl}?action=config`, {
        method: "GET",
        headers: { Accept: "application/json" },
        timeoutMs: 11000
      }, "Não foi possível carregar as configurações agora.");
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Não foi possível carregar as configurações.");
      }
      if (!this.hasUsableGiftList(payload.data)) {
        throw new Error("Configuração recebida sem lista de presentes válida.");
      }
      window.WeddingCache.write(
        config.cache.publicConfigKey,
        payload.data,
        config.cache.publicConfigTtlMinutes
      );
      return payload.data;
    } catch (error) {
      if (cachedIsSafe) return cached;
      window.WeddingCache.remove(config.cache.publicConfigKey);
      return config.fallbackData;
    }
  },

  hasUsableGiftList(data) {
    return Array.isArray(data?.gifts) && data.gifts.some((gift) => {
      const enabled = gift.enabled === undefined || gift.enabled === null || gift.enabled === "" || String(gift.enabled).toLowerCase() !== "false";
      const amount = Number(gift.amount || 0);
      const customAmount = gift.custom_amount === true || gift.customAmount === true || String(gift.custom_amount || gift.customAmount || "").toLowerCase() === "true";
      return enabled && (gift.gift_id || gift.id) && (gift.title || gift.gift_title) && (amount > 0 || customAmount);
    });
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
    const { response, payload } = await this.requestJsonWithRetry(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      timeoutMs: 12000
    }, "Não foi possível buscar a lista de convidados agora. Verifique sua internet e tente novamente.");
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
    const { response, payload } = await this.requestJsonWithRetry(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      timeoutMs: 12000
    }, "Não foi possível carregar este convite agora. Verifique sua internet e tente novamente.");
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível carregar este convite.");
    }
    if (!payload.data?.invite) {
      throw new Error("Convite não encontrado.");
    }
    return payload.data.invite;
  },

  async getCancellation(token) {
    const config = window.WEDDING_CONFIG;
    const cleanToken = String(token || "").trim();
    if (!cleanToken) {
      throw new Error("Link de cancelamento não encontrado.");
    }

    const url = `${config.appScriptUrl}?action=cancel_info&t=${encodeURIComponent(cleanToken)}`;
    const { response, payload } = await this.requestJsonWithRetry(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      timeoutMs: 12000
    }, "Não foi possível carregar este cancelamento agora. Verifique sua internet e tente novamente.");
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível carregar este cancelamento.");
    }
    if (!payload.data?.cancellation) {
      throw new Error("Link de cancelamento não encontrado.");
    }
    return payload.data.cancellation;
  },

  async cancelRsvp(data) {
    const config = window.WEDDING_CONFIG;
    const { response, payload } = await this.requestJson(config.appScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "cancel_rsvp", data })
    }, "Não foi possível cancelar sua presença agora. Verifique sua internet e tente novamente.");
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível cancelar sua presença.");
    }
    return payload.data;
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

    const { response, payload } = await this.requestJson(config.appScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "rsvp", data })
    }, "Não foi possível enviar sua confirmação agora. Verifique sua internet e tente novamente.");
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

    const { response, payload } = await this.requestJson(config.appScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, data })
    }, "Não foi possível conectar ao sistema de check-in agora. Verifique sua internet e tente novamente.");
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

  async getAdminSummary(credentials) {
    return this.checkinRequest("admin_summary", {
      ...credentials,
      userAgent: navigator.userAgent
    });
  },

  async createAdminGuest(data) {
    return this.checkinRequest("admin_create_guest", {
      ...data,
      userAgent: navigator.userAgent
    });
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

    const { response, payload } = await this.requestJson(config.appScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "gift_intent", data })
    }, "Não foi possível registrar o presente agora. Verifique sua internet e tente novamente.");
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Não foi possível registrar o presente.");
    }
    return payload.data || {};
  }
};
