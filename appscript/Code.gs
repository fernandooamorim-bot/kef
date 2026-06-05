const SHEETS = {
  CONFIG: "CONFIG",
  PAGINAS: "PAGINAS",
  CONVIDADOS: "CONVIDADOS",
  RSVP: "RSVP",
  PRESENTES: "PRESENTES",
  GALERIA: "GALERIA",
  MENSAGENS: "MENSAGENS"
};

function doGet(e) {
  try {
    const action = (e.parameter.action || "config").toLowerCase();
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
    if (body.action !== "rsvp") {
      return jsonResponse(false, null, "Ação POST não reconhecida.");
    }

    const data = body.data || {};
    if (!data.name || !data.phone) {
      return jsonResponse(false, null, "Nome e telefone são obrigatórios.");
    }

    const sheet = getOrCreateSheet_(SHEETS.RSVP, [
      "timestamp",
      "name",
      "phone",
      "email",
      "companion",
      "source",
      "userAgent"
    ]);

    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.email || "",
      data.companion || "",
      data.source || "site",
      data.userAgent || ""
    ]);

    return jsonResponse(true, {
      message: "Presença confirmada com sucesso."
    });
  } catch (error) {
    return jsonResponse(false, null, error.message);
  }
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

function getOrCreateSheet_(name, headers) {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
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
