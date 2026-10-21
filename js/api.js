window.WeddingApi = {
  async requestJson(url, options = {}, fallbackMessage) {
    const timeoutMs = options.timeoutMs || 14000;
    const startedAt = Date.now();
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
        const invalid = new Error("Resposta inválida do servidor.");
        invalid.kind = "invalid_response";
        throw invalid;
      }
      return { response, payload };
    } catch (error) {
      const kind = error.kind || (error.name === "AbortError" ? "timeout" : "network");
      const failure = new Error(kind === "invalid_response"
        ? "O servidor enviou uma resposta inválida. Tente novamente em instantes."
        : fallbackMessage || "Não foi possível conectar ao sistema agora. Verifique sua internet e tente novamente.");
      failure.kind = kind;
      failure.retryable = kind === "timeout" || kind === "network";
      console.warn("WeddingApi", { action: new URL(url).searchParams.get("action") || requestOptions.method || "POST", kind, durationMs: Date.now() - startedAt });
      throw failure;
    } finally {
      if (timer) window.clearTimeout(timer);
    }
  },

  async requestJsonWithRetry(url, options, fallbackMessage, attempts = 3) {
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const result = await this.requestJson(url, options, fallbackMessage);
        if (result.payload?.errorCode === "SERVER_ERROR" || result.response.status === 429 || result.response.status >= 500) {
          const failure = new Error(result.payload?.error || fallbackMessage);
          failure.kind = "server";
          failure.retryable = true;
          throw failure;
        }
        return result;
      } catch (error) {
        lastError = error;
        if (!error.retryable || attempt === attempts) break;
        await this.delay(550 * attempt);
      }
    }

    throw lastError || new Error(fallbackMessage);
  },

  delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  },

  async getRsvpStatus() {
    const config = window.WEDDING_CONFIG;
    const cacheKey = "kf_rsvp_status_v1";
    if (!config.appScriptUrl) return null;
    try {
      const { response, payload } = await this.requestJsonWithRetry(`${config.appScriptUrl}?action=rsvp_status`, {
        method: "GET",
        headers: { Accept: "application/json" },
        timeoutMs: 12000
      }, "Não foi possível consultar as confirmações agora.", 2);
      if (!response.ok || !payload.ok || !payload.data) return window.WeddingCache.read(cacheKey);
      window.WeddingCache.write(cacheKey, payload.data, 1);
      return payload.data;
    } catch (error) {
      return window.WeddingCache.read(cacheKey);
    }
  },

  async getPublicConfig() {
    const config = window.WEDDING_CONFIG;
    const cached = window.WeddingCache.read(config.cache.publicConfigKey);
    const cachedIsSafe = Boolean(cached?.config);

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
      if (!payload.data?.config) {
        throw new Error("Configuração do evento não disponível.");
      }
      window.WeddingCache.write(
        config.cache.publicConfigKey,
        payload.data,
        config.cache.publicConfigTtlMinutes
      );
      return payload.data;
    } catch (error) {
      if (cachedIsSafe) return cached;
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
      timeoutMs: 9000
    }, "Não foi possível buscar a lista de convidados agora. Verifique sua internet e tente novamente.", 2);
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
      body: JSON.stringify({ action: "rsvp", data }),
      timeoutMs: 25000
    }, "Não foi possível confirmar a resposta do servidor agora. Sua confirmação pode ter sido registrada. Atualize a página e procure seu nome antes de tentar novamente.");
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

  async checkinRequest(action, data, options = {}) {
    const config = window.WEDDING_CONFIG;
    if (!config.appScriptUrl) {
      throw new Error("Configure o Apps Script para usar o check-in.");
    }

    const { response, payload } = await this.requestJson(config.appScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, data }),
      timeoutMs: options.timeoutMs || 14000
    }, options.message || "Não foi possível conectar ao sistema de check-in agora. Verifique sua internet e tente novamente.");
    if (!response.ok || !payload.ok) {
      const error = new Error(payload.error || "Não foi possível concluir a operação.");
      error.kind = response.status >= 500 || response.status === 429 || payload.errorCode === "SERVER_ERROR" ? "server" : "business";
      throw error;
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

  async syncCheckinRoster(credentials) {
    return this.checkinRequest("checkin_sync", {
      ...credentials,
      userAgent: navigator.userAgent
    });
  },

  async getAdminSummary(credentials) {
    return this.checkinRequest("admin_summary", {
      ...credentials,
      userAgent: navigator.userAgent
    });
  },

  async createAdminGift(data) {
    try {
      return await this.checkinRequest("admin_create_gift", data, { timeoutMs: 35000, message: "A resposta do cadastro não chegou. Tente novamente com os mesmos dados; o registro não será duplicado." });
    } catch (error) {
      if (!["timeout", "network", "invalid_response", "server"].includes(error.kind)) throw error;
      try {
        const result = await this.getAdminGifts(data);
        const orderId = `MANUAL-${data.requestId}`;
        if (result?.gifts?.some((gift) => gift.orderId === orderId)) return { orderId, alreadyRegistered: true };
      } catch (readError) {
        if (readError.kind === "business") throw readError;
      }
      throw error;
    }
  },

  async cancelAdminGift(data, onProgress) {
    return this.updateAdminGift("admin_cancel_gift", data, onProgress);
  },

  async confirmAdminGift(data, onProgress) {
    return this.updateAdminGift("admin_confirm_gift", data, onProgress);
  },

  async updateAdminGift(action, data, onProgress = () => {}) {
    const cancelled = action === "admin_cancel_gift";
    const matches = (gift) => gift?.orderId === data.orderId && (cancelled
      ? ["cancelado", "cancelled"].includes(gift.status)
      : ["pago", "paid", "approved", "aprovado", "confirmed", "confirmado"].includes(gift.status) && Boolean(gift.paidAt));
    try {
      const result = await this.checkinRequest(action, data, {
        timeoutMs: 35000,
        message: "A resposta da gravação demorou ou a conexão foi interrompida."
      });
      if (matches(result)) return result;
      const error = new Error("Resposta de gravação incompleta.");
      error.kind = "invalid_response";
      throw error;
    } catch (error) {
      // A failed response does not mean the write failed. Read back before offering a retry.
      if (!["timeout", "network", "invalid_response", "server"].includes(error.kind)) throw error;
      onProgress("Verificando se a alteração foi salva...");
      for (let attempt = 0; attempt < 2; attempt++) {
        await this.delay(attempt ? 1800 : 800);
        try {
          const result = await this.getAdminGifts(data);
          const gift = result?.gifts?.find((item) => item.orderId === data.orderId);
          if (matches(gift)) return { ...gift, status: cancelled ? "cancelado" : "pago", reconciled: true };
        } catch (readError) {
          if (readError.kind === "business") throw readError;
        }
      }
      const uncertain = new Error("Não foi possível verificar o resultado agora. A alteração pode ter sido salva. Atualize os presentes ou tente novamente; o pedido não será duplicado.");
      uncertain.kind = "unverified";
      throw uncertain;
    }
  },

  async getAdminGifts(credentials) {
    return this.checkinRequest("admin_gifts", credentials, {
      timeoutMs: 25000,
      message: "Não foi possível consultar os presentes agora."
    });
  },

  async respondAdminGuest(data) {
    return this.checkinRequest("admin_respond_guest", {
      ...data,
      userAgent: navigator.userAgent
    });
  },

  async createAdminGuest(data) {
    return this.checkinRequest("admin_create_guest", {
      ...data,
      userAgent: navigator.userAgent
    });
  },

  async importAdminGuests(data) {
    return this.checkinRequest("admin_import_guests", {
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
