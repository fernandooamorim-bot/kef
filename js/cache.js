window.WeddingCache = {
  read(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const record = JSON.parse(raw);
      if (record.expiresAt && Date.now() > record.expiresAt) {
        localStorage.removeItem(key);
        return null;
      }
      return record.value;
    } catch (error) {
      return null;
    }
  },

  write(key, value, ttlMinutes) {
    try {
      const expiresAt = ttlMinutes ? Date.now() + ttlMinutes * 60 * 1000 : null;
      localStorage.setItem(key, JSON.stringify({ value, expiresAt }));
      return true;
    } catch (error) {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      return false;
    }
    return true;
  }
};
