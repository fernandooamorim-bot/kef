const SHEETS = {
  CONFIG: "CONFIG",
  PAGINAS: "PAGINAS",
  CONVIDADOS: "CONVIDADOS",
  RSVP: "RSVP",
  PRESENTES: "PRESENTES",
  PEDIDOS_PRESENTES: "PEDIDOS_PRESENTES",
  GALERIA: "GALERIA",
  MENSAGENS: "MENSAGENS"
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

    return jsonResponse(false, null, "Ação POST não reconhecida.");
  } catch (error) {
    return jsonResponse(false, null, error.message);
  }
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

  const sheet = getOrCreateSheet_(SHEETS.RSVP, [
    "timestamp",
    "guest_id",
    "guest_name",
    "attendance",
    "companions_confirmed",
    "companion_name",
    "phone",
    "email",
    "source",
    "userAgent"
  ]);

  appendRecord_(sheet, {
    timestamp: new Date(),
    guest_id: guest.guest_id,
    guest_name: guest.name,
    name: guest.name,
    attendance: data.attendance,
    companions_confirmed: companionsConfirmed,
    companion_name: data.companionName || "",
    companion: data.companionName || "",
    phone: data.phone || guest.phone || "",
    email: data.email || guest.email || "",
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

  const sheet = getOrCreateSheet_(SHEETS.PEDIDOS_PRESENTES, [
    "created_at",
    "order_id",
    "gift_id",
    "gift_title",
    "amount",
    "giver_name",
    "giver_phone",
    "giver_email",
    "message",
    "status",
    "provider",
    "provider_payment_id",
    "payment_url",
    "paid_at",
    "source",
    "userAgent"
  ]);

  const orderId = createOrderId_();
  sheet.appendRow([
    new Date(),
    orderId,
    data.giftId,
    data.giftTitle,
    Number(data.amount),
    data.name,
    data.phone,
    data.email || "",
    data.message || "",
    "created",
    "",
    "",
    "",
    "",
    data.source || "site",
    data.userAgent || ""
  ]);

  return jsonResponse(true, {
    orderId,
    status: "created",
    message: "Presente e mensagem registrados com carinho."
  });
}

function readKeyValueSheet_(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
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
  const headers = values.shift().map((header) => String(header).trim());
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
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0]
    .map(function(header) {
      return String(header || "").trim();
    });

  headers.forEach(function(header) {
    if (current.indexOf(header) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
      current.push(header);
    }
  });
}

function appendRecord_(sheet, record) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function(header) {
      return String(header || "").trim();
    });
  sheet.appendRow(headers.map(function(header) {
    return Object.prototype.hasOwnProperty.call(record, header) ? record[header] : "";
  }));
}

function createOrderId_() {
  return "KF-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 9000 + 1000);
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
