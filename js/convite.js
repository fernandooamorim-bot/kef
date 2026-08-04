window.WeddingInvite = {
  invite: null,

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadInvite();
  },

  cacheElements() {
    this.loading = document.getElementById("inviteLoading");
    this.content = document.getElementById("inviteContent");
    this.name = document.getElementById("inviteName");
    this.companion = document.getElementById("inviteCompanion");
    this.date = document.getElementById("inviteDate");
    this.time = document.getElementById("inviteTime");
    this.venue = document.getElementById("inviteVenue");
    this.status = document.getElementById("inviteStatus");
    this.qr = document.getElementById("inviteQr");
    this.code = document.getElementById("inviteCode");
    this.saveButton = document.getElementById("saveInviteButton");
    this.copyButton = document.getElementById("copyInviteButton");
    this.statusMessage = document.getElementById("inviteStatusMessage");
  },

  bindEvents() {
    this.saveButton.addEventListener("click", () => this.saveInvite());
    this.copyButton.addEventListener("click", () => this.copyLink());
  },

  async loadInvite() {
    const token = new URLSearchParams(window.location.search).get("t") || "";
    if (!token) {
      this.showError("Convite não encontrado.");
      return;
    }

    try {
      const invite = await window.WeddingApi.getInvite(token);
      this.invite = invite;
      this.renderInvite(invite);
    } catch (error) {
      this.showError(error.message || "Não foi possível carregar este convite.");
    }
  },

  renderInvite(invite) {
    const event = invite.event || {};
    this.name.textContent = invite.name || "Convidado";
    const companionText = this.describeCompanion(invite);
    this.companion.textContent = companionText;
    this.companion.hidden = !companionText;
    this.date.textContent = event.date || "29 de outubro de 2026";
    this.time.textContent = event.time || "15h30";
    this.venue.textContent = event.venue || "Buffet La Maison";
    this.status.textContent = invite.checkinStatus === "validado" ? "Já utilizado" : "Presença confirmada";
    this.qr.crossOrigin = "anonymous";
    this.qr.src = invite.qrCode || "";
    this.code.textContent = invite.token || "";
    this.loading.hidden = true;
    this.content.hidden = false;
  },

  showError(message) {
    this.loading.innerHTML = `<strong>${this.escape(message)}</strong><span>Confira se o link recebido está completo.</span>`;
  },

  describeCompanion(invite) {
    const count = Number(invite.companionsConfirmed || 0);
    if (!count) return "";
    return invite.companionName ? `Acompanhante: ${invite.companionName}` : "Acompanhante: incluído";
  },

  async copyLink() {
    const link = this.invite?.inviteLink || window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      this.setStatus("Link copiado.");
    } catch (error) {
      this.setStatus("Não foi possível copiar automaticamente. Use o link da barra do navegador.");
    }
  },

  async saveInvite() {
    if (!this.invite) return;
    this.saveButton.disabled = true;
    this.setStatus("Gerando imagem...");

    try {
      const blob = await this.renderInviteImage();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `convite-${this.slug(this.invite.name)}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      this.setStatus("Convite salvo.");
    } catch (error) {
      this.setStatus("Não foi possível salvar a imagem neste navegador.");
    } finally {
      this.saveButton.disabled = false;
    }
  },

  async renderInviteImage() {
    const canvas = document.createElement("canvas");
    const width = 1080;
    const height = 1560;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const invite = this.invite;
    const event = invite.event || {};

    ctx.fillStyle = "#4e5a42";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#fffaf2";
    this.roundRect(ctx, 70, 70, width - 140, height - 140, 0, true);
    ctx.strokeStyle = "rgba(78,90,66,0.24)";
    ctx.lineWidth = 4;
    ctx.strokeRect(100, 100, width - 200, height - 200);

    ctx.fillStyle = "#4e5a42";
    ctx.fillRect(100, 100, width - 200, 250);
    ctx.fillStyle = "#fffaf2";
    ctx.textAlign = "center";
    this.drawText(ctx, "Krisna & Fernando", width / 2, 210, 64, "Georgia");
    this.drawTrackingText(ctx, "WEDDING PASSPORT", width / 2, 292, 26, 7);

    ctx.fillStyle = "#b29a68";
    this.drawTrackingText(ctx, "CONVITE DIGITAL", width / 2, 430, 30, 6);
    ctx.fillStyle = "#28241f";
    this.drawText(ctx, invite.name || "Convidado", width / 2, 520, 76, "Georgia");

    const companionText = this.describeCompanion(invite);
    if (companionText) {
      ctx.fillStyle = "#756e62";
      this.drawText(ctx, companionText, width / 2, 585, 32, "Arial");
    }

    this.drawInfo(ctx, "Data", event.date || "29 de outubro de 2026", 150, 690);
    this.drawInfo(ctx, "Horário", event.time || "15h30", 560, 690);
    this.drawInfo(ctx, "Local", event.venue || "Buffet La Maison", 150, 820);
    this.drawInfo(ctx, "Status", invite.checkinStatus === "validado" ? "Já utilizado" : "Presença confirmada", 560, 820);

    const qr = await this.loadImage(invite.qrCode);
    ctx.fillStyle = "#fff";
    ctx.fillRect(330, 980, 420, 420);
    if (qr) {
      ctx.drawImage(qr, 350, 1000, 380, 380);
    } else {
      ctx.fillStyle = "#28241f";
      this.drawText(ctx, "QR Code", width / 2, 1160, 46, "Arial");
      this.wrapText(ctx, invite.token || "", width / 2, 1225, 330, 30, "center");
    }

    ctx.fillStyle = "#756e62";
    this.drawText(ctx, "Apresente este QR Code na recepção do evento.", width / 2, 1450, 30, "Arial");

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Falha ao gerar imagem.")), "image/png", 0.95);
    });
  },

  loadImage(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve(null);
        return;
      }
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  },

  drawInfo(ctx, label, value, x, y) {
    ctx.fillStyle = "rgba(248,244,236,0.9)";
    ctx.fillRect(x, y, 370, 92);
    ctx.strokeStyle = "rgba(78,90,66,0.18)";
    ctx.strokeRect(x, y, 370, 92);
    ctx.textAlign = "left";
    ctx.fillStyle = "#b29a68";
    this.drawText(ctx, label.toUpperCase(), x + 26, y + 32, 22, "Arial");
    ctx.fillStyle = "#28241f";
    this.wrapText(ctx, value, x + 26, y + 66, 320, 28, "left");
  },

  drawText(ctx, text, x, y, size, family) {
    ctx.font = `${size}px ${family}, sans-serif`;
    ctx.fillText(String(text || ""), x, y);
  },

  drawTrackingText(ctx, text, x, y, size, spacing) {
    ctx.font = `${size}px Arial, sans-serif`;
    ctx.textAlign = "center";
    const chars = String(text || "").split("");
    const total = chars.reduce((sum, char) => sum + ctx.measureText(char).width + spacing, 0) - spacing;
    let cursor = x - total / 2;
    chars.forEach((char) => {
      ctx.fillText(char, cursor, y);
      cursor += ctx.measureText(char).width + spacing;
    });
  },

  wrapText(ctx, text, x, y, maxWidth, lineHeight, align) {
    ctx.textAlign = align || "left";
    const words = String(text || "").split(" ");
    let line = "";
    words.forEach((word, index) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = word;
        y += lineHeight;
      } else {
        line = test;
      }
      if (index === words.length - 1) ctx.fillText(line, x, y);
    });
  },

  roundRect(ctx, x, y, width, height, radius, fill) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    if (fill) ctx.fill();
  },

  setStatus(message) {
    this.statusMessage.textContent = message || "";
  },

  slug(value) {
    return String(value || "krisna-fernando")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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

document.addEventListener("DOMContentLoaded", () => window.WeddingInvite.init());
