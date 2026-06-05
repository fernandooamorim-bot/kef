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
    return payload;
  }
};
