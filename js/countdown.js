window.WeddingCountdown = {
  start() {
    const target = new Date(window.WEDDING_CONFIG.weddingDate).getTime();
    const nodes = {
      days: document.querySelector('[data-count="days"]'),
      hours: document.querySelector('[data-count="hours"]'),
      minutes: document.querySelector('[data-count="minutes"]'),
      seconds: document.querySelector('[data-count="seconds"]')
    };

    const update = () => {
      const distance = Math.max(0, target - Date.now());
      const days = Math.floor(distance / 86400000);
      const hours = Math.floor((distance % 86400000) / 3600000);
      const minutes = Math.floor((distance % 3600000) / 60000);
      const seconds = Math.floor((distance % 60000) / 1000);

      nodes.days.textContent = String(days);
      nodes.hours.textContent = String(hours).padStart(2, "0");
      nodes.minutes.textContent = String(minutes).padStart(2, "0");
      nodes.seconds.textContent = String(seconds).padStart(2, "0");
    };

    update();
    window.setInterval(update, 1000);
  }
};
