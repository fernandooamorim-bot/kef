const SHEETS = {
  CONFIG: "CONFIG",
  PAGINAS: "PAGINAS",
  CONVIDADOS: "CONVIDADOS",
  RSVP: "RSVP",
  PRESENTES: "PRESENTES",
  PEDIDOS_PRESENTES: "PEDIDOS_PRESENTES",
  OPERADORES: "OPERADORES",
  GALERIA: "GALERIA",
  MENSAGENS: "MENSAGENS"
};

const HEADERS = {
  RSVP: [
    "data_hora",
    "codigo_convidado",
    "nome_convidado",
    "presenca",
    "acompanhantes_confirmados",
    "nome_acompanhante",
    "telefone",
    "link_whatsapp",
    "email",
    "token_checkin",
    "link_checkin",
    "qr_code",
    "status_checkin",
    "checkin_realizado_em",
    "checkin_por",
    "email_confirmacao_enviado_em",
    "erro_email_confirmacao",
    "origem",
    "navegador"
  ],
  PEDIDOS_PRESENTES: [
    "criado_em",
    "codigo_pedido",
    "codigo_presente",
    "presente",
    "valor",
    "nome",
    "telefone",
    "email",
    "mensagem",
    "status",
    "provedor",
    "codigo_pagamento",
    "link_pagamento",
    "pago_em",
    "origem",
    "navegador"
  ],
  OPERADORES: [
    "usuario",
    "senha",
    "nome",
    "ativo",
    "observacoes"
  ]
};

const HEADER_ALIASES = {
  key: "key",
  chave: "key",
  value: "value",
  valor: "amount",
  description: "description",
  descricao: "description",
  "descrição": "description",
  section: "section",
  "seção": "section",
  secao: "section",
  title: "title",
  titulo: "title",
  "título": "title",
  subtitle: "subtitle",
  subtitulo: "subtitle",
  "subtítulo": "subtitle",
  text: "text",
  texto: "text",
  button_label: "button_label",
  rotulo_botao: "button_label",
  "rótulo_botão": "button_label",
  button_url: "button_url",
  link_botao: "button_url",
  "link_botão": "button_url",
  enabled: "enabled",
  ativo: "enabled",
  sort_order: "sort_order",
  ordem: "sort_order",
  guest_id: "guest_id",
  codigo_convidado: "guest_id",
  name: "name",
  nome: "name",
  guest_name: "guest_name",
  nome_convidado: "guest_name",
  phone: "phone",
  telefone: "phone",
  email: "email",
  group: "group",
  grupo: "group",
  allowed_companions: "allowed_companions",
  acompanhantes_permitidos: "allowed_companions",
  notes: "notes",
  observacoes: "notes",
  "observações": "notes",
  status: "status",
  timestamp: "timestamp",
  data_hora: "timestamp",
  attendance: "attendance",
  presenca: "attendance",
  "presença": "attendance",
  companions_confirmed: "companions_confirmed",
  acompanhantes_confirmados: "companions_confirmed",
  companion_name: "companion_name",
  nome_acompanhante: "companion_name",
  companion: "companion",
  whatsapp_link: "whatsapp_link",
  link_whatsapp: "whatsapp_link",
  checkin_token: "checkin_token",
  token_checkin: "checkin_token",
  checkin_link: "checkin_link",
  link_checkin: "checkin_link",
  qr_code: "qr_code",
  status_checkin: "checkin_status",
  checkin_status: "checkin_status",
  checkin_at: "checkin_at",
  checkin_realizado_em: "checkin_at",
  checkin_by: "checkin_by",
  checkin_por: "checkin_by",
  confirmation_email_sent_at: "confirmation_email_sent_at",
  email_confirmacao_enviado_em: "confirmation_email_sent_at",
  "email_confirmação_enviado_em": "confirmation_email_sent_at",
  confirmation_email_error: "confirmation_email_error",
  erro_email_confirmacao: "confirmation_email_error",
  "erro_email_confirmação": "confirmation_email_error",
  source: "source",
  origem: "source",
  useragent: "userAgent",
  navegador: "userAgent",
  gift_id: "gift_id",
  codigo_presente: "gift_id",
  gift_title: "gift_title",
  presente: "gift_title",
  amount: "amount",
  image: "image",
  imagem: "image",
  created_at: "created_at",
  criado_em: "created_at",
  order_id: "order_id",
  codigo_pedido: "order_id",
  giver_name: "giver_name",
  giver_phone: "giver_phone",
  giver_email: "giver_email",
  message: "message",
  mensagem: "message",
  provider: "provider",
  provedor: "provider",
  provider_payment_id: "provider_payment_id",
  codigo_pagamento: "provider_payment_id",
  payment_url: "payment_url",
  link_pagamento: "payment_url",
  paid_at: "paid_at",
  pago_em: "paid_at",
  image_id: "image_id",
  codigo_imagem: "image_id",
  file_name: "file_name",
  arquivo: "file_name",
  alt_text: "alt_text",
  texto_alternativo: "alt_text",
  featured: "featured",
  destaque: "featured",
  message_id: "message_id",
  codigo_mensagem: "message_id",
  usuario: "username",
  senha: "password",
  nome_operador: "operator_name"
};

function doGet(e) {
  try {
    const action = (e.parameter.action || "config").toLowerCase();

    if (action === "guests") {
      return handleGuestSearch_(e.parameter.q || "");
    }

    if (action !== "config") {
      return jsonResponse(false, null, "Ação GET não reconhecida.");
    }

    return jsonResponse(true, {
      config: readKeyValueSheet_(SHEETS.CONFIG),
      pages: readTableSheet_(SHEETS.PAGINAS),
      gifts: readTableSheet_(SHEETS.PRESENTES),
      gallery: readTableSheet_(SHEETS.GALERIA),
      messages: readTableSheet_(SHEETS.MENSAGENS)
    });
  } catch (error) {
    return jsonResponse(false, null, error.message);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = String(body.action || "").toLowerCase();

    if (action === "rsvp") {
      return handleRsvp_(body.data || {});
    }

    if (action === "gift_intent") {
      return handleGiftIntent_(body.data || {});
    }

    if (action === "checkin_login") {
      return handleCheckinLogin_(body.data || {});
    }

    if (action === "checkin_validate") {
      return handleCheckinValidate_(body.data || {});
    }

    if (action === "checkin_search") {
      return handleCheckinSearch_(body.data || {});
    }

    return jsonResponse(false, null, "Ação POST não reconhecida.");
  } catch (error) {
    return jsonResponse(false, null, error.message);
  }
}

function testarAutorizacaoEmail() {
  ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, [
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/spreadsheets.currentonly"
  ]);

  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("Autorização de email concluída. Cota diária restante: " + quota);
}

function handleRsvp_(data) {
  if (!data.guestId || !data.guestName) {
    return jsonResponse(false, null, "Selecione seu nome na lista de convidados.");
  }

  if (!data.attendance) {
    return jsonResponse(false, null, "Informe se você confirma presença.");
  }

  const guest = findGuestById_(data.guestId);
  if (!guest) {
    return jsonResponse(false, null, "Convidado não encontrado. Confira o nome selecionado.");
  }

  const allowedCompanions = Number(guest.allowed_companions || 0);
  const companionsConfirmed = Number(data.companionsConfirmed || 0);
  if (companionsConfirmed > allowedCompanions) {
    return jsonResponse(false, null, "Este convite não possui acompanhante disponível.");
  }

  if (companionsConfirmed > 0 && !data.companionName) {
    return jsonResponse(false, null, "Informe o nome do acompanhante.");
  }

  const phone = data.phone || guest.phone || "";
  const whatsappLink = buildWhatsappLink_(data.phoneDigits || phone);
  const guestEmail = data.email || guest.email || "";
  const checkinToken = data.attendance === "confirmed" ? createCheckinToken_(guest.guest_id) : "";
  const checkinLink = checkinToken ? buildCheckinLink_(checkinToken) : "";
  const qrCode = checkinLink ? buildQrCodeUrl_(checkinLink) : "";
  const emailResult = sendRsvpConfirmationEmail_(guest, {
    attendance: data.attendance,
    companionsConfirmed: companionsConfirmed,
    companionName: data.companionName || "",
    email: guestEmail,
    checkinToken: checkinToken,
    checkinLink: checkinLink,
    qrCode: qrCode
  });

  const sheet = getOrCreateSheet_(SHEETS.RSVP, HEADERS.RSVP);

  appendRecord_(sheet, {
    timestamp: new Date(),
    guest_id: guest.guest_id,
    guest_name: guest.name,
    name: guest.name,
    attendance: data.attendance,
    companions_confirmed: companionsConfirmed,
    companion_name: data.companionName || "",
    companion: data.companionName || "",
    phone: phone,
    whatsapp_link: whatsappLink,
    email: guestEmail,
    checkin_token: checkinToken,
    checkin_link: checkinLink,
    qr_code: qrCode,
    checkin_status: checkinToken ? "pendente" : "",
    checkin_at: "",
    checkin_by: "",
    confirmation_email_sent_at: emailResult.sentAt || "",
    confirmation_email_error: emailResult.error || "",
    source: data.source || "site",
    userAgent: data.userAgent || ""
  });

  return jsonResponse(true, {
    message: data.attendance === "confirmed" ? "Presença confirmada com sucesso." : "Resposta registrada com sucesso."
  });
}

function handleGuestSearch_(query) {
  const term = normalizeText_(query);
  if (term.length < 2) {
    return jsonResponse(true, { guests: [] });
  }

  const guests = readTableSheet_(SHEETS.CONVIDADOS)
    .filter(function(guest) {
      const status = normalizeText_(guest.status || "");
      return status !== "cancelado" && status !== "inativo" && normalizeText_(guest.name).indexOf(term) !== -1;
    })
    .slice(0, 8)
    .map(function(guest) {
      return {
        guest_id: guest.guest_id,
        name: guest.name,
        group: guest.group || "",
        allowed_companions: Number(guest.allowed_companions || 0),
        status: guest.status || ""
      };
    });

  return jsonResponse(true, { guests: guests });
}

function handleGiftIntent_(data) {
  if (!data.giftId || !data.giftTitle || !data.amount) {
    return jsonResponse(false, null, "Presente inválido.");
  }

  if (!data.name || !data.phone) {
    return jsonResponse(false, null, "Nome e telefone são obrigatórios.");
  }

  const sheet = getOrCreateSheet_(SHEETS.PEDIDOS_PRESENTES, HEADERS.PEDIDOS_PRESENTES);

  const orderId = createOrderId_();
  appendRecord_(sheet, {
    created_at: new Date(),
    order_id: orderId,
    gift_id: data.giftId,
    gift_title: data.giftTitle,
    amount: Number(data.amount),
    giver_name: data.name,
    name: data.name,
    giver_phone: data.phone,
    phone: data.phone,
    giver_email: data.email || "",
    email: data.email || "",
    message: data.message || "",
    status: data.paymentUrl ? "aguardando_pagamento" : "created",
    provider: data.paymentUrl ? "pagbank" : "",
    provider_payment_id: "",
    payment_url: data.paymentUrl || "",
    paid_at: "",
    source: data.source || "site",
    userAgent: data.userAgent || ""
  });

  return jsonResponse(true, {
    orderId,
    status: data.paymentUrl ? "aguardando_pagamento" : "created",
    message: data.paymentUrl
      ? "Registro salvo. Redirecionando para o pagamento..."
      : "Presente e mensagem registrados com sucesso."
  });
}

function handleCheckinLogin_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  return jsonResponse(true, {
    operator: {
      username: operator.username,
      name: operator.name
    },
    message: "Acesso liberado."
  });
}

function handleCheckinValidate_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const token = extractCheckinToken_(data.token || data.value || "");
  const record = token ? findRsvpByCheckinToken_(token) : findLatestConfirmedRsvpByGuestId_(data.guestId);
  if (!record) {
    return jsonResponse(true, {
      status: "invalid",
      title: "Convite inválido",
      message: token ? "Este QR Code não foi encontrado na lista de confirmações." : "Este convidado não possui confirmação válida."
    });
  }

  if (record.attendance !== "confirmed") {
    return jsonResponse(true, {
      status: "invalid",
      title: "Convite não confirmado",
      message: "Este convite não está marcado como presença confirmada.",
      guest: publicCheckinGuest_(record)
    });
  }

  const latest = findLatestConfirmedRsvpByGuestId_(record.guest_id);
  if (token && latest && latest.checkin_token !== record.checkin_token) {
    return jsonResponse(true, {
      status: "invalid",
      title: "QR Code substituído",
      message: "Este QR pertence a uma confirmação anterior. Use o QR Code mais recente enviado ao convidado.",
      guest: publicCheckinGuest_(record)
    });
  }

  if (record.checkin_at) {
    return jsonResponse(true, {
      status: "used",
      title: "Convite já utilizado",
      message: "Este QR Code já foi validado anteriormente.",
      guest: publicCheckinGuest_(record)
    });
  }

  markCheckin_(record.rowNumber, operator.name || operator.username);

  record.checkin_at = new Date();
  record.checkin_by = operator.name || operator.username;
  record.checkin_status = "validado";

  return jsonResponse(true, {
    status: "allowed",
    title: "Entrada liberada",
    message: "Convite validado com sucesso.",
    guest: publicCheckinGuest_(record)
  });
}

function handleCheckinSearch_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const term = normalizeText_(data.query || "");
  if (term.length < 2) {
    return jsonResponse(true, { guests: [] });
  }

  const latestByGuest = {};
  readRsvpRecords_().forEach(function(record) {
    if (record.attendance !== "confirmed") return;
    if (!normalizeText_(record.guest_name).includes(term)) return;
    latestByGuest[record.guest_id || record.checkin_token || record.rowNumber] = record;
  });

  const guests = Object.keys(latestByGuest)
    .map(function(key) {
      return publicCheckinGuest_(latestByGuest[key]);
    })
    .slice(0, 10);

  return jsonResponse(true, { guests: guests });
}

function readKeyValueSheet_(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
  if (values.length > 1 && canonicalHeader_(values[0][0]) === "key") values.shift();
  return values.reduce((acc, row) => {
    if (row[0]) acc[String(row[0]).trim()] = row[1];
    return acc;
  }, {});
}

function readTableSheet_(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values.shift().map((header) => canonicalHeaderForSheet_(name, header));
  return values
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => headers.reduce((acc, header, index) => {
      acc[header] = row[index];
      return acc;
    }, {}));
}

function findGuestById_(guestId) {
  const id = String(guestId || "").trim();
  if (!id) return null;
  const guests = readTableSheet_(SHEETS.CONVIDADOS);
  return guests.find(function(guest) {
    return String(guest.guest_id || "").trim() === id;
  }) || null;
}

function getOrCreateSheet_(name, headers) {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  ensureHeaders_(sheet, headers);
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  const sheetName = sheet.getName();
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0]
    .map(function(header) {
      return String(header || "").trim();
    });

  headers.forEach(function(header) {
    const canonical = canonicalHeaderForSheet_(sheetName, header);
    const currentIndex = current.findIndex(function(currentHeader) {
      return canonicalHeaderForSheet_(sheetName, currentHeader) === canonical;
    });

    if (currentIndex === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      current.push(header);
    } else if (current[currentIndex] !== header) {
      sheet.getRange(1, currentIndex + 1).setValue(header);
      current[currentIndex] = header;
    }
  });
}

function appendRecord_(sheet, record) {
  const sheetName = sheet.getName();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function(header) {
      return String(header || "").trim();
    });
  sheet.appendRow(headers.map(function(header) {
    const canonical = canonicalHeaderForSheet_(sheetName, header);
    return Object.prototype.hasOwnProperty.call(record, canonical) ? record[canonical] : "";
  }));
}

function validateOperator_(data) {
  const username = String(data.username || data.usuario || "").trim();
  const password = String(data.password || data.senha || "").trim();
  if (!username || !password) {
    return { ok: false, error: "Informe usuário e senha do operador." };
  }

  getOrCreateSheet_(SHEETS.OPERADORES, HEADERS.OPERADORES);
  const operators = readTableSheet_(SHEETS.OPERADORES);
  const operator = operators.find(function(item) {
    return String(item.username || "").trim().toLowerCase() === username.toLowerCase() &&
      String(item.password || "").trim() === password &&
      isEnabled_(item.ativo !== undefined ? item.ativo : item.enabled);
  });

  if (!operator) {
    return { ok: false, error: "Usuário ou senha inválidos." };
  }

  return {
    ok: true,
    username: username,
    name: operator.operator_name || operator.name || username
  };
}

function readRsvpRecords_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.RSVP);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values.shift().map(function(header) {
    return canonicalHeaderForSheet_(SHEETS.RSVP, header);
  });

  return values
    .map(function(row, index) {
      const record = headers.reduce(function(acc, header, columnIndex) {
        acc[header] = row[columnIndex];
        return acc;
      }, {});
      record.rowNumber = index + 2;
      return record;
    })
    .filter(function(record) {
      return record.guest_name || record.checkin_token;
    });
}

function findRsvpByCheckinToken_(token) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) return null;
  const records = readRsvpRecords_();
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (String(records[index].checkin_token || "").trim() === normalizedToken) {
      return records[index];
    }
  }
  return null;
}

function findLatestConfirmedRsvpByGuestId_(guestId) {
  const id = String(guestId || "").trim();
  if (!id) return null;
  const records = readRsvpRecords_();
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (String(records[index].guest_id || "").trim() === id && records[index].attendance === "confirmed") {
      return records[index];
    }
  }
  return null;
}

function markCheckin_(rowNumber, operatorName) {
  const sheet = getOrCreateSheet_(SHEETS.RSVP, HEADERS.RSVP);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function(header) {
      return canonicalHeaderForSheet_(SHEETS.RSVP, header);
    });

  setRecordValue_(sheet, rowNumber, headers, "checkin_status", "validado");
  setRecordValue_(sheet, rowNumber, headers, "checkin_at", new Date());
  setRecordValue_(sheet, rowNumber, headers, "checkin_by", operatorName);
}

function setRecordValue_(sheet, rowNumber, headers, canonicalHeader, value) {
  const columnIndex = headers.indexOf(canonicalHeader);
  if (columnIndex === -1) return;
  sheet.getRange(rowNumber, columnIndex + 1).setValue(value);
}

function publicCheckinGuest_(record) {
  return {
    token: record.checkin_token || "",
    guestId: record.guest_id || "",
    name: record.guest_name || "",
    attendance: record.attendance || "",
    companionsConfirmed: Number(record.companions_confirmed || 0),
    companionName: record.companion_name || "",
    checkinStatus: record.checkin_status || (record.checkin_at ? "validado" : "pendente"),
    checkinAt: record.checkin_at || "",
    checkinBy: record.checkin_by || ""
  };
}

function isEnabled_(value) {
  if (value === undefined || value === null || value === "") return true;
  return String(value).toLowerCase() !== "false" && String(value).toUpperCase() !== "FALSE" && String(value).toLowerCase() !== "não";
}

function canonicalHeaderForSheet_(sheetName, header) {
  const canonical = canonicalHeader_(header);
  if (sheetName === SHEETS.RSVP) {
    if (canonical === "name") return "guest_name";
    if (canonical === "companion") return "companion_name";
  }
  if (sheetName === SHEETS.PEDIDOS_PRESENTES) {
    if (canonical === "name") return "giver_name";
    if (canonical === "phone") return "giver_phone";
    if (canonical === "email") return "giver_email";
  }
  return canonical;
}

function canonicalHeader_(header) {
  const key = normalizeText_(header)
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return HEADER_ALIASES[key] || key;
}

function createOrderId_() {
  return "KF-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 9000 + 1000);
}

function createCheckinToken_(guestId) {
  const cleanId = String(guestId || "KF").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const random = Utilities.getUuid().replace(/-/g, "").slice(0, 14).toUpperCase();
  return "CHK-" + cleanId + "-" + random;
}

function buildCheckinLink_(token) {
  const domain = String(readKeyValueSheet_(SHEETS.CONFIG).domain || "https://krisnaefernando.com/").replace(/\/?$/, "/");
  return domain + "checkin.html?t=" + encodeURIComponent(token);
}

function buildQrCodeUrl_(value) {
  return "https://quickchart.io/qr?size=260&margin=2&text=" + encodeURIComponent(value);
}

function extractCheckinToken_(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(/[?&]t=([^&#]+)/);
  if (match) return decodeURIComponent(match[1]).trim();
  return raw.replace(/^.*(CHK-[A-Z0-9]+-[A-Z0-9]+).*$/i, "$1").trim().toUpperCase();
}

function buildWhatsappLink_(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if ((digits.length === 10 || digits.length === 11) && digits.indexOf("55") !== 0) {
    digits = "55" + digits;
  }
  return "https://wa.me/" + digits;
}

function sendRsvpConfirmationEmail_(guest, data) {
  const email = String(data.email || "").trim();
  if (!email || email.indexOf("@") === -1) {
    return { sentAt: "", error: "" };
  }

  const isConfirmed = data.attendance === "confirmed";
  const subject = isConfirmed
    ? "Confirmação de presença - Krisna & Fernando"
    : "Resposta registrada - Krisna & Fernando";
  const htmlBody = buildRsvpEmailHtml_(guest, data);
  const plainBody = buildRsvpEmailText_(guest, data);

  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      name: "Krisna & Fernando",
      htmlBody: htmlBody,
      body: plainBody
    });
    return { sentAt: new Date(), error: "" };
  } catch (error) {
    return { sentAt: "", error: error.message || String(error) };
  }
}

function buildRsvpEmailHtml_(guest, data) {
  const isConfirmed = data.attendance === "confirmed";
  const statusLabel = isConfirmed ? "Presença confirmada" : "Resposta registrada";
  const statusText = isConfirmed
    ? "Recebemos sua confirmação para o casamento de Krisna e Fernando."
    : "Recebemos sua resposta para o casamento de Krisna e Fernando.";
  const companionLine = Number(data.companionsConfirmed || 0) > 0
    ? '<tr><td style="padding:10px 0;color:#756e62;">Acompanhante</td><td style="padding:10px 0;text-align:right;color:#28241f;font-weight:700;">' + escapeHtml_(data.companionName || "Confirmado") + "</td></tr>"
    : "";
  const qrBlock = isConfirmed && data.qrCode
    ? [
      '<div style="margin:26px 0 0;padding:22px;background:#f8f4ec;border:1px solid rgba(78,90,66,0.14);text-align:center;">',
      '<div style="color:#4e5a42;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">QR Code de entrada</div>',
      '<p style="margin:10px auto 16px;max-width:420px;color:#756e62;font-size:14px;line-height:1.6;">Apresente este QR Code na entrada do evento para agilizar a validação do convite.</p>',
      '<img src="' + escapeHtml_(data.qrCode) + '" alt="QR Code de entrada" width="220" height="220" style="display:block;margin:0 auto 14px;border:10px solid #fffaf2;">',
      '<a href="' + escapeHtml_(data.checkinLink || "") + '" style="color:#4e5a42;font-size:12px;word-break:break-all;text-decoration:none;">' + escapeHtml_(data.checkinToken || "") + "</a>",
      "</div>"
    ].join("")
    : "";

  return [
    '<div style="margin:0;padding:0;background:#f8f4ec;font-family:Arial,Helvetica,sans-serif;color:#28241f;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f4ec;margin:0;padding:28px 12px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf2;border:1px solid rgba(78,90,66,0.18);">',
    '<tr><td style="background:#4e5a42;padding:28px 30px;text-align:center;">',
    '<div style="font-family:Georgia,serif;color:#fffaf2;font-size:34px;line-height:1.1;">Krisna &amp; Fernando</div>',
    '<div style="margin-top:8px;color:#e8dfd0;font-size:12px;letter-spacing:2px;text-transform:uppercase;">29 de outubro de 2026</div>',
    '</td></tr>',
    '<tr><td style="padding:34px 30px 10px;">',
    '<div style="color:#b29a68;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">' + statusLabel + "</div>",
    '<h1 style="margin:12px 0 14px;font-family:Georgia,serif;font-size:30px;line-height:1.15;color:#28241f;font-weight:400;">Olá, ' + escapeHtml_(guest.name) + ".</h1>",
    '<p style="margin:0 0 22px;color:#756e62;font-size:16px;line-height:1.7;">' + statusText + "</p>",
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid rgba(78,90,66,0.16);border-bottom:1px solid rgba(78,90,66,0.16);font-size:15px;">',
    '<tr><td style="padding:14px 0 10px;color:#756e62;">Data</td><td style="padding:14px 0 10px;text-align:right;color:#28241f;font-weight:700;">29 de outubro de 2026</td></tr>',
    '<tr><td style="padding:10px 0;color:#756e62;">Horário</td><td style="padding:10px 0;text-align:right;color:#28241f;font-weight:700;">15h30</td></tr>',
    '<tr><td style="padding:10px 0;color:#756e62;">Local</td><td style="padding:10px 0;text-align:right;color:#28241f;font-weight:700;">Buffet La Maison</td></tr>',
    companionLine,
    "</table>",
    qrBlock,
    '<p style="margin:24px 0 0;color:#756e62;font-size:15px;line-height:1.7;">' + (isConfirmed ? "Nos vemos no grande dia." : "Agradecemos por nos avisar.") + "</p>",
    '</td></tr>',
    '<tr><td style="padding:24px 30px 32px;text-align:center;">',
    '<div style="height:1px;background:rgba(78,90,66,0.16);margin-bottom:20px;"></div>',
    '<div style="font-family:Georgia,serif;color:#4e5a42;font-size:22px;">Krisna &amp; Fernando</div>',
    '<div style="margin-top:6px;color:#756e62;font-size:12px;">krisnaefernando.com</div>',
    '</td></tr>',
    '</table>',
    '</td></tr>',
    '</table>',
    '</div>'
  ].join("");
}

function buildRsvpEmailText_(guest, data) {
  const isConfirmed = data.attendance === "confirmed";
  const lines = [
    "Olá, " + guest.name + ".",
    "",
    isConfirmed
      ? "Recebemos sua confirmação para o casamento de Krisna e Fernando."
      : "Recebemos sua resposta para o casamento de Krisna e Fernando.",
    "",
    "Data: 29 de outubro de 2026",
    "Horário: 15h30",
    "Local: Buffet La Maison"
  ];

  if (Number(data.companionsConfirmed || 0) > 0) {
    lines.push("Acompanhante: " + (data.companionName || "Confirmado"));
  }

  if (isConfirmed && data.checkinToken) {
    lines.push("", "QR Code de entrada: " + data.checkinLink, "Código: " + data.checkinToken);
  }

  lines.push("", isConfirmed ? "Nos vemos no grande dia." : "Agradecemos por nos avisar.", "", "Krisna & Fernando");
  return lines.join("\n");
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeText_(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function jsonResponse(ok, data, error) {
  const output = {
    ok,
    data,
    error: error || null,
    timestamp: new Date().toISOString()
  };
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
