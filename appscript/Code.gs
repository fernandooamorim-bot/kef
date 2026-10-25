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

const SPREADSHEET_ID = "1YxiFGWAyUUVGzD13LEjYytLPsogIQ54H2VpQjkVJybY";
const RSVP_ALREADY_REGISTERED_MESSAGE = "Obrigado pela sua resposta. Sua confirmação já foi registrada. Caso precise fazer alguma alteração, por favor, entre em contato diretamente com os noivos.";
const PUBLIC_CONFIG_CACHE_KEY = "kef_public_config_v1";
const PUBLIC_CONFIG_CACHE_SECONDS = 5 * 60;
const GUEST_SEARCH_CACHE_KEY = "kef_guest_search_v1";
const GUEST_SEARCH_CACHE_SECONDS = 60;
const GUEST_SEARCH_REVISION_KEY = "kef_guest_search_revision";

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
    "link_convite",
    "token_cancelamento",
    "link_cancelamento",
    "qr_code",
    "status_checkin",
    "checkin_realizado_em",
    "checkin_por",
    "checkin_request_id",
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
  ],
  CONVIDADOS: [
    "codigo_convidado",
    "nome",
    "grupo",
    "telefone",
    "email",
    "acompanhantes_permitidos",
    "status",
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
  invite_link: "invite_link",
  link_convite: "invite_link",
  cancellation_token: "cancellation_token",
  token_cancelamento: "cancellation_token",
  cancellation_link: "cancellation_link",
  link_cancelamento: "cancellation_link",
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

    if (action === "health") {
      return jsonResponse(true, {
        status: "online",
        version: "kef-appscript",
        checkinVersion: "20261025",
        time: new Date().toISOString()
      });
    }

    if (action === "rsvp_status") {
      const config = readKeyValueSheet_(SHEETS.CONFIG);
      return jsonResponse(true, {
        rsvp_enabled: parseBooleanConfig_(config.rsvp_enabled, false),
        rsvp_open_at: config.rsvp_open_at || config.rsvp_abre_em || "",
        rsvp_close_at: config.rsvp_close_at || config.rsvp_fecha_em || "",
        rsvp_closed_message: config.rsvp_closed_message || config.mensagem_rsvp_fechado || ""
      });
    }

    if (action === "guests") {
      return handleGuestSearch_(e.parameter.q || "");
    }

    if (action === "invite") {
      return handleInvite_(e.parameter.t || e.parameter.token || "");
    }

    if (action === "cancel_info") {
      return handleCancelInfo_(e.parameter.t || e.parameter.token || "");
    }

    if (action !== "config") {
      return jsonResponse(false, null, "Ação GET não reconhecida.");
    }

    return handlePublicConfig_(e.parameter.refresh === "1" || e.parameter.nocache === "1");
  } catch (error) {
    console.error("GET " + String(e.parameter.action || "config") + ": " + (error.stack || error));
    return jsonResponse(false, null, "Não foi possível consultar o sistema agora. Tente novamente.", "SERVER_ERROR");
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

    if (action === "checkin_sync") {
      return handleCheckinSync_(body.data || {});
    }

    if (action === "cancel_rsvp") {
      return handleCancelRsvp_(body.data || {});
    }

    if (action === "admin_cancel_gift") {
      return handleAdminCancelGift_(body.data || {});
    }

    if (action === "admin_confirm_gift") {
      return handleAdminConfirmGift_(body.data || {});
    }

    if (action === "admin_create_gift") {
      return handleAdminCreateGift_(body.data || {});
    }

    if (action === "admin_gifts") {
      return handleAdminGifts_(body.data || {});
    }

    if (action === "admin_summary") {
      return handleAdminSummary_(body.data || {});
    }

    if (action === "admin_respond_guest") {
      return handleAdminRespondGuest_(body.data || {});
    }

    if (action === "admin_create_guest") {
      return handleAdminCreateGuest_(body.data || {});
    }

    if (action === "admin_import_guests") {
      return handleAdminImportGuests_(body.data || {});
    }

    return jsonResponse(false, null, "Ação POST não reconhecida.");
  } catch (error) {
    console.error("POST: " + (error.stack || error));
    return jsonResponse(false, null, "Não foi possível concluir a operação agora. Tente novamente.", "SERVER_ERROR");
  }
}

function testarAutorizacaoEmail() {
  ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, [
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/spreadsheets"
  ]);

  const spreadsheetName = getSpreadsheet_().getName();
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("Autorização concluída para a planilha: " + spreadsheetName);
  Logger.log("Cota diária de email restante: " + quota);
}

function testarAutorizacaoPlanilha() {
  ScriptApp.requireScopes(ScriptApp.AuthMode.FULL, [
    "https://www.googleapis.com/auth/spreadsheets"
  ]);

  const spreadsheetName = getSpreadsheet_().getName();
  Logger.log("Autorização concluída para a planilha: " + spreadsheetName);
}

function handlePublicConfig_(forceRefresh) {
  const cache = CacheService.getScriptCache();
  if (!forceRefresh) {
    let cached = null;
    try {
      cached = cache.get(PUBLIC_CONFIG_CACHE_KEY);
    } catch (error) {
      console.error("Public config cache read: " + (error.stack || error));
    }
    if (cached) {
      try {
        return jsonResponse(true, JSON.parse(cached));
      } catch (error) {
        cache.remove(PUBLIC_CONFIG_CACHE_KEY);
      }
    }
  }

  const data = readPublicConfigData_();
  if (hasUsablePublicConfig_(data)) {
    try {
      cache.put(PUBLIC_CONFIG_CACHE_KEY, JSON.stringify(data), PUBLIC_CONFIG_CACHE_SECONDS);
    } catch (error) {
      console.error("Public config cache write: " + (error.stack || error));
    }
  }
  return jsonResponse(true, data);
}

function readPublicConfigData_() {
  return {
    config: readKeyValueSheet_(SHEETS.CONFIG),
    pages: readTableSheet_(SHEETS.PAGINAS),
    gifts: readTableSheet_(SHEETS.PRESENTES),
    gallery: readTableSheet_(SHEETS.GALERIA),
    messages: readTableSheet_(SHEETS.MENSAGENS)
  };
}

function hasUsablePublicConfig_(data) {
  const gifts = data && Array.isArray(data.gifts) ? data.gifts : [];
  return gifts.some(function(gift) {
    const enabled = isEnabled_(gift.enabled);
    const amount = Number(gift.amount || 0);
    const customAmount = gift.custom_amount === true || gift.customAmount === true || String(gift.custom_amount || gift.customAmount || "").toLowerCase() === "true";
    return enabled && (gift.gift_id || gift.id) && (gift.title || gift.gift_title) && (amount > 0 || customAmount);
  });
}

function handleRsvp_(data) {
  const availability = getRsvpAvailability_();
  if (!availability.open) {
    return jsonResponse(false, null, availability.message);
  }

  if (!data.guestId || !data.guestName) {
    return jsonResponse(false, null, "Selecione seu nome na lista de convidados.");
  }

  if (["confirmed", "declined"].indexOf(data.attendance) === -1) {
    return jsonResponse(false, null, "Informe se você confirma presença.");
  }

  const companionsConfirmed = Number(data.companionsConfirmed || 0);
  if (!Number.isInteger(companionsConfirmed) || companionsConfirmed < 0 || (data.attendance !== "confirmed" && companionsConfirmed !== 0)) {
    return jsonResponse(false, null, "Quantidade de acompanhantes inválida.");
  }
  if (companionsConfirmed > 0 && !data.companionName) {
    return jsonResponse(false, null, "Informe o nome do acompanhante.");
  }
  if (!data.email || String(data.email).indexOf("@") === -1) {
    return jsonResponse(false, null, "Informe um email válido.");
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return jsonResponse(false, null, "A confirmação está ocupada. Aguarde alguns segundos e tente novamente.");
  }

  let confirmation;
  try {
    const currentAvailability = getRsvpAvailability_();
    if (!currentAvailability.open) {
      return jsonResponse(false, null, currentAvailability.message);
    }

    const guest = findGuestById_(data.guestId);
    if (!guest) {
      return jsonResponse(false, null, "Convidado não encontrado. Confira o nome selecionado.");
    }

    const existingRsvp = findLatestRsvpByGuestId_(guest.guest_id);
    if (existingRsvp) {
      return jsonResponse(true, {
        alreadyRegistered: true,
        attendance: existingRsvp.attendance || "",
        message: RSVP_ALREADY_REGISTERED_MESSAGE
      });
    }

    if (companionsConfirmed > Number(guest.allowed_companions || 0)) {
      return jsonResponse(false, null, "Não foi possível registrar a quantidade de pessoas informada.");
    }

    const phone = data.phone || guest.phone || "";
    if (!phone || String(data.phoneDigits || phone).replace(/\D/g, "").length < 10) {
      return jsonResponse(false, null, "Informe um WhatsApp válido.");
    }

    const guestEmail = data.email || guest.email || "";
    const showDigitalInvite = parseBooleanConfig_(readKeyValueSheet_(SHEETS.CONFIG).rsvp_show_digital_invite, false);
    const checkinToken = data.attendance === "confirmed" ? createCheckinToken_(guest.guest_id) : "";
    const checkinLink = checkinToken ? buildCheckinLink_(checkinToken) : "";
    const inviteLink = checkinToken ? buildInviteLink_(checkinToken) : "";
    const cancellationToken = checkinToken ? createCancellationToken_(guest.guest_id) : "";
    const cancellationLink = cancellationToken ? buildCancellationLink_(cancellationToken) : "";
    const qrCode = checkinLink ? buildQrCodeUrl_(checkinLink) : "";
    const whatsappLink = buildWhatsappLink_(data.phoneDigits || phone, {
      guestName: guest.name,
      inviteLink: inviteLink,
      cancellationLink: cancellationLink,
      attendance: data.attendance
    });
    const sheet = getOrCreateSheet_(SHEETS.RSVP, HEADERS.RSVP);
    const rowNumber = sheet.getLastRow() + 1;
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
      invite_link: inviteLink,
      cancellation_token: cancellationToken,
      cancellation_link: cancellationLink,
      qr_code: qrCode,
      checkin_status: checkinToken ? "pendente" : "",
      checkin_at: "",
      checkin_by: "",
      confirmation_email_sent_at: "",
      confirmation_email_error: "",
      source: data.source || "site",
      userAgent: data.userAgent || ""
    });
    SpreadsheetApp.flush();
    invalidateGuestSearchCache_();
    confirmation = { guest, sheet, rowNumber, guestEmail, checkinToken, checkinLink, inviteLink, cancellationLink, qrCode, showDigitalInvite };
  } finally {
    lock.releaseLock();
  }

  let emailResult;
  try {
    emailResult = sendRsvpConfirmationEmail_(confirmation.guest, {
      attendance: data.attendance,
      companionsConfirmed: companionsConfirmed,
      companionName: data.companionName || "",
      email: confirmation.guestEmail,
      checkinToken: confirmation.checkinToken,
      checkinLink: confirmation.checkinLink,
      inviteLink: confirmation.inviteLink,
      cancellationLink: confirmation.cancellationLink,
      qrCode: confirmation.qrCode
    });
  } catch (error) {
    emailResult = { sentAt: "", error: String(error.message || error) };
  }
  recordConfirmationEmailResult_(confirmation.sheet, confirmation.rowNumber, emailResult);

  return jsonResponse(true, {
    message: data.attendance === "confirmed" ? "Presença confirmada com sucesso." : "Resposta registrada com sucesso.",
    inviteLink: data.attendance === "confirmed" && confirmation.showDigitalInvite ? confirmation.inviteLink : ""
  });
}

function handleInvite_(tokenValue) {
  const token = extractCheckinToken_(tokenValue);
  if (!token) {
    return jsonResponse(false, null, "Convite não encontrado.");
  }

  const record = findRsvpByCheckinToken_(token);
  if (!record || record.attendance !== "confirmed") {
    return jsonResponse(false, null, "Este convite não está disponível.");
  }

  const latest = findLatestRsvpByGuestId_(record.guest_id);
  if (!latest || latest.attendance !== "confirmed" || latest.checkin_token !== record.checkin_token) {
    return jsonResponse(false, null, "Este convite foi substituído ou não está mais ativo.");
  }

  return jsonResponse(true, {
    invite: publicInvite_(record)
  });
}

function handleCancelInfo_(tokenValue) {
  const record = findActiveRsvpByCancellationToken_(tokenValue);
  if (!record) {
    return jsonResponse(false, null, "Este link de cancelamento não está disponível ou não está mais ativo.");
  }

  return jsonResponse(true, {
    cancellation: publicCancellation_(record)
  });
}

function handleCancelRsvp_(data) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return jsonResponse(false, null, "O sistema está ocupado. Aguarde alguns segundos e tente novamente.");
  }

  let record;
  try {
    record = findActiveRsvpByCancellationToken_(data.token || data.cancellationToken || "");
    if (!record) {
      return jsonResponse(false, null, "Este link de cancelamento não está disponível ou não está mais ativo.");
    }

    const latest = findLatestRsvpByGuestId_(record.guest_id);
    if (!latest || latest.attendance !== "confirmed" || latest.cancellation_token !== record.cancellation_token) {
      return jsonResponse(false, null, "Esta confirmação já foi alterada. Fale diretamente com os noivos.");
    }
    if (latest.checkin_at) {
      return jsonResponse(false, null, "Este convite já foi validado na entrada. Para qualquer ajuste, fale diretamente com os noivos.");
    }

    const sheet = getOrCreateSheet_(SHEETS.RSVP, HEADERS.RSVP);
    appendRecord_(sheet, {
    timestamp: new Date(),
    guest_id: record.guest_id,
    guest_name: record.guest_name,
    name: record.guest_name,
    attendance: "cancelled",
    companions_confirmed: 0,
    companion_name: "",
    companion: "",
    phone: record.phone || "",
    whatsapp_link: record.whatsapp_link || "",
    email: record.email || "",
    checkin_token: "",
    checkin_link: "",
    invite_link: "",
    cancellation_token: "",
    cancellation_link: "",
    qr_code: "",
    checkin_status: "cancelado",
    checkin_at: "",
    checkin_by: "",
    confirmation_email_sent_at: "",
    confirmation_email_error: "",
    source: data.source || "cancelamento_link",
    userAgent: data.userAgent || ""
    });
    SpreadsheetApp.flush();
    invalidateGuestSearchCache_();
  } finally {
    lock.releaseLock();
  }

  try {
    sendCancellationEmail_(record);
  } catch (error) {
    console.error("Cancellation email: " + (error.stack || error));
  }

  return jsonResponse(true, {
    message: "Cancelamento registrado com sucesso."
  });
}

function handleGuestSearch_(query) {
  const availability = getRsvpAvailability_();
  if (!availability.open) {
    return jsonResponse(false, null, availability.message);
  }

  const term = normalizeText_(query);
  if (term.length < 2) {
    return jsonResponse(true, { guests: [] });
  }

  const guests = getGuestSearchIndex_()
    .filter(function(guest) {
      const status = normalizeText_(guest.status || "");
      return status !== "cancelado" && status !== "inativo" && normalizeText_(guest.name).indexOf(term) !== -1;
    })
    .slice(0, 8);

  return jsonResponse(true, { guests: guests });
}

function getGuestSearchIndex_(retryCount) {
  const properties = PropertiesService.getScriptProperties();
  const revision = properties.getProperty(GUEST_SEARCH_REVISION_KEY) || "0";
  const cacheKey = GUEST_SEARCH_CACHE_KEY + "_" + revision;
  const cache = CacheService.getScriptCache();
  let cached = null;
  try {
    cached = cache.get(cacheKey);
  } catch (error) {
    console.error("Guest search cache read: " + (error.stack || error));
  }
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      cache.remove(cacheKey);
    }
  }

  const latestRsvps = getLatestRsvpByGuestIdMap_();
  const guests = readTableSheet_(SHEETS.CONVIDADOS).map(function(guest) {
    const rsvp = latestRsvps[String(guest.guest_id || "").trim()] || null;
    return {
      guest_id: guest.guest_id,
      name: guest.name,
      group: guest.group || "",
      allowed_companions: Number(guest.allowed_companions || 0),
      status: guest.status || "",
      rsvp: rsvp ? {
        registered: true,
        attendance: rsvp.attendance || "",
        message: RSVP_ALREADY_REGISTERED_MESSAGE
      } : null
    };
  });

  if ((properties.getProperty(GUEST_SEARCH_REVISION_KEY) || "0") !== revision) {
    if ((retryCount || 0) < 2) return getGuestSearchIndex_((retryCount || 0) + 1);
    return guests;
  }

  try {
    const serialized = JSON.stringify(guests);
    if (Utilities.newBlob(serialized).getBytes().length < 90000) {
      cache.put(cacheKey, serialized, GUEST_SEARCH_CACHE_SECONDS);
    }
  } catch (error) {
    console.error("Guest search cache: " + (error.stack || error));
  }
  return guests;
}

function invalidateGuestSearchCache_() {
  try {
    PropertiesService.getScriptProperties().setProperty(GUEST_SEARCH_REVISION_KEY, Utilities.getUuid());
  } catch (error) {
    console.error("Guest search cache invalidation: " + (error.stack || error));
  }
}

function handleGiftIntent_(data) {
  if (!data.giftId) {
    return jsonResponse(false, null, "Presente inválido.");
  }

  if (!data.name || !data.phone) {
    return jsonResponse(false, null, "Nome e telefone são obrigatórios.");
  }

  const incomingCustomAmount = data.customAmount === true || String(data.customAmount || "").toLowerCase() === "true";
  const gift = findGiftById_(data.giftId) || createCustomGiftFromRequest_(data, incomingCustomAmount);
  if (!gift) {
    return jsonResponse(false, null, "Este presente não está disponível no momento.");
  }

  const customAmount = incomingCustomAmount || isCustomGift_(gift);
  const amount = customAmount ? Number(data.amount || 0) : Number(gift.amount || 0);
  const officialGiftTitle = String(gift.title || gift.gift_title || data.giftTitle || "").trim();
  const giftTitle = customAmount ? String(data.giftTitle || officialGiftTitle).trim() : officialGiftTitle;
  const paymentUrl = data.paymentMethod === "card" ? String(gift.payment_url || "").trim() : "";

  if (!giftTitle || amount <= 0) {
    return jsonResponse(false, null, "Presente inválido.");
  }

  if (data.paymentMethod === "card" && !paymentUrl) {
    return jsonResponse(false, null, "Este presente ainda não possui link de pagamento.");
  }

  const sheet = getOrCreateSheet_(SHEETS.PEDIDOS_PRESENTES, HEADERS.PEDIDOS_PRESENTES);

  const orderId = createOrderId_();
  appendRecord_(sheet, {
    created_at: new Date(),
    order_id: orderId,
    gift_id: gift.gift_id || data.giftId,
    gift_title: giftTitle,
    amount: amount,
    giver_name: data.name,
    name: data.name,
    giver_phone: data.phone,
    phone: data.phone,
    giver_email: data.email || "",
    email: data.email || "",
    message: data.message || "",
    status: data.paymentMethod ? "aguardando_pagamento" : "created",
    provider: data.paymentMethod === "pix" ? "pix" : paymentUrl ? "pagbank" : "",
    provider_payment_id: "",
    payment_url: paymentUrl,
    paid_at: "",
    source: data.source || "site",
    userAgent: data.userAgent || ""
  });
  return jsonResponse(true, {
    orderId,
    status: data.paymentMethod ? "aguardando_pagamento" : "created",
    giftTitle,
    amount,
    paymentUrl,
    message: data.paymentMethod
      ? "Registro salvo. Abrindo pagamento..."
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
    sessionToken: createOperatorSession_(operator),
    message: "Acesso liberado."
  });
}

function handleCheckinValidate_(data) {
  const startedAt = Date.now();
  const requestId = String(data.requestId || "").trim();
  if (requestId && !/^[a-zA-Z0-9_-]{16,100}$/.test(requestId)) return jsonResponse(false, null, "Identificador de entrada inválido.");
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return jsonResponse(true, {
      status: "busy",
      title: "Validação em andamento",
      message: "Aguarde um instante e faça a leitura novamente."
    });
  }

  try {
    const token = extractCheckinToken_(data.token || data.value || "");
    const records = readRsvpRecords_();
    const record = token
      ? findRsvpByCheckinTokenInRecords_(records, token)
      : findLatestConfirmedRsvpByGuestIdInRecords_(records, data.guestId);
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

    const latest = findLatestRsvpByGuestIdInRecords_(records, record.guest_id);
    if (!latest || latest.attendance !== "confirmed" || latest.checkin_token !== record.checkin_token) {
      return jsonResponse(true, {
        status: "invalid",
        title: "QR Code substituído",
        message: token
          ? "Este QR pertence a uma confirmação anterior ou não está mais ativo."
          : "Este convidado possui uma resposta mais recente e não tem confirmação ativa.",
        guest: publicCheckinGuest_(record)
      });
    }

    if (record.checkin_at && requestId && record.checkin_request_id === requestId) {
      return jsonResponse(true, { status: "allowed", reconciled: true, title: "Entrada confirmada",
        message: "O registro desta operação já foi salvo.", guest: publicCheckinGuest_(record), durationMs: Date.now() - startedAt });
    }

    if (record.checkin_at) {
      return jsonResponse(true, {
        status: "used",
        title: "Convite já utilizado",
        message: "Este QR Code já foi validado anteriormente.",
        guest: publicCheckinGuest_(record)
      });
    }

    const offlineTime = new Date(data.checkedInAt || "");
    const checkedInAt = data.offline && !isNaN(offlineTime.getTime()) && offlineTime.getTime() <= Date.now() && Date.now() - offlineTime.getTime() < 24 * 60 * 60 * 1000 ? offlineTime : new Date();
    markCheckin_(record.rowNumber, operator.name || operator.username, requestId, checkedInAt, records);
    SpreadsheetApp.flush();

    record.checkin_at = checkedInAt;
    record.checkin_request_id = requestId;
    record.checkin_by = operator.name || operator.username;
    record.checkin_status = "validado";

    return jsonResponse(true, {
      status: "allowed",
      title: "Entrada liberada",
      durationMs: Date.now() - startedAt,
      message: "Convite validado com sucesso.",
      guest: publicCheckinGuest_(record)
    });
  } finally {
    lock.releaseLock();
  }
}

function handleCheckinSync_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const latestByGuest = getLatestRsvpByGuestIdMap_();
  const guests = Object.keys(latestByGuest)
    .map(function(key) {
      return latestByGuest[key];
    })
    .filter(function(record) {
      return record.attendance === "confirmed" && record.checkin_token;
    })
    .map(function(record) {
      return publicCheckinGuest_(record);
    });

  return jsonResponse(true, {
    syncedAt: new Date().toISOString(),
    capabilities: { checkinRequestId: true },
    guests: guests
  });
}

function handleCheckinSearch_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const term = normalizeText_(data.query || "");
  if (term.length < 2) {
    return jsonResponse(true, { guests: [] });
  }

  const latestByGuest = getLatestRsvpByGuestIdMap_();
  const guests = Object.keys(latestByGuest)
    .map(function(key) {
      return latestByGuest[key];
    })
    .filter(function(record) {
      return record.attendance === "confirmed" && normalizeText_(record.guest_name).includes(term);
    })
    .map(function(record) {
      return publicCheckinGuest_(record);
    })
    .slice(0, 10);

  return jsonResponse(true, { guests: guests });
}

function handleAdminConfirmGift_(data) {
  return handleAdminGiftPayment_(data, false);
}

function handleAdminCancelGift_(data) {
  return handleAdminGiftPayment_(data, true);
}

function handleAdminGiftPayment_(data, cancel) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);
  const orderId = String(data.orderId || "").trim();
  if (!orderId) return jsonResponse(false, null, "Selecione um presente válido.");
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse(false, null, "Outro registro está sendo salvo. Tente novamente.");
  try {
    const sheet = getSpreadsheet_().getSheetByName(SHEETS.PEDIDOS_PRESENTES);
    if (!sheet) return jsonResponse(false, null, "Presente não encontrado.");
    const values = sheet.getDataRange().getValues();
    const headers = (values.shift() || []).map(function(header) { return canonicalHeaderForSheet_(SHEETS.PEDIDOS_PRESENTES, header); });
    const idColumn = headers.indexOf("order_id");
    const statusColumn = headers.indexOf("status");
    const paidColumn = headers.indexOf("paid_at");
    if ([idColumn, statusColumn, paidColumn].some(function(column) { return column < 0; })) {
      return jsonResponse(false, null, "Confira as colunas codigo_pedido, status e pago_em na planilha.");
    }
    const matches = values.map(function(row, index) { return { row: row, number: index + 2 }; })
      .filter(function(item) { return String(item.row[idColumn] || "").trim() === orderId; });
    if (matches.length !== 1) return jsonResponse(false, null, "Pedido não encontrado ou com código duplicado. Confira a planilha.");
    const item = matches[0];
    const status = normalizeText_(item.row[statusColumn] || "");
    const paidStatuses = ["paid", "pago", "approved", "aprovado", "confirmed", "confirmado"];
    const pendingStatuses = ["", "created", "pending", "aguardando_pagamento", "pendente"];
    if (cancel) {
      if (["cancelado", "cancelled"].indexOf(status) >= 0) {
        return jsonResponse(true, { orderId: orderId, status: "cancelado", alreadyCancelled: true });
      }
      if (pendingStatuses.indexOf(status) < 0 || item.row[paidColumn]) {
        return jsonResponse(false, null, "Só é possível cancelar pedidos pendentes. Este pedido pode ter sido confirmado por outra pessoa; atualize o painel.");
      }
      setRecordValue_(sheet, item.number, headers, "status", "cancelado");
      SpreadsheetApp.flush();
      return jsonResponse(true, { orderId: orderId, status: "cancelado", alreadyCancelled: false });
    }
    if (paidStatuses.indexOf(status) < 0 && pendingStatuses.indexOf(status) < 0) {
      return jsonResponse(false, null, "Este pedido não está aguardando pagamento. Confira o status na planilha.");
    }
    const alreadyConfirmed = paidStatuses.indexOf(status) >= 0 || Boolean(item.row[paidColumn]);
    // Preserve the first confirmation timestamp when a response is lost and retried.
    const paidAt = item.row[paidColumn] || new Date();
    let changed = false;
    if (!item.row[paidColumn]) {
      setRecordValue_(sheet, item.number, headers, "paid_at", paidAt);
      changed = true;
    }
    if (item.row[statusColumn] !== "pago") {
      setRecordValue_(sheet, item.number, headers, "status", "pago");
      changed = true;
    }
    if (changed) SpreadsheetApp.flush();
    return jsonResponse(true, { orderId: orderId, status: "pago", paidAt: paidAt, alreadyConfirmed: alreadyConfirmed });
  } finally {
    lock.releaseLock();
  }
}

function handleAdminCreateGift_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);
  const requestId = String(data.requestId || "");
  const name = String(data.name || "").trim();
  const title = String(data.title || "").trim();
  const type = String(data.type || "");
  const date = String(data.receivedDate || "");
  const amount = type === "physical" ? 0 : Number(data.amount);
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(requestId) || !name || name.length > 150 || !title || title.length > 200 ||
      ["pix", "transfer", "cash", "physical"].indexOf(type) < 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(amount) || (type !== "physical" && (amount < 0.01 || amount > 10000000))) {
    return jsonResponse(false, null, "Confira nome, descrição, data e valor do presente.");
  }
  const receivedAt = new Date(date + "T12:00:00-03:00");
  if (isNaN(receivedAt.getTime()) || receivedAt.toISOString().slice(0, 10) !== date || date > Utilities.formatDate(new Date(), "America/Fortaleza", "yyyy-MM-dd")) {
    return jsonResponse(false, null, "Informe uma data de recebimento válida, até hoje.");
  }
  const orderId = "MANUAL-" + requestId;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse(false, null, "Outro registro está sendo salvo. Tente novamente.");
  try {
    const existing = readTableSheet_(SHEETS.PEDIDOS_PRESENTES).find(function(row) { return row.order_id === orderId; });
    if (existing) return jsonResponse(true, { orderId: orderId, alreadyRegistered: true });
    const sheet = getOrCreateSheet_(SHEETS.PEDIDOS_PRESENTES, HEADERS.PEDIDOS_PRESENTES);
    // Prevent user text from becoming a spreadsheet formula.
    const safeText = function(value) { return /^[=+@-]/.test(value) ? "'" + value : value; };
    appendRecord_(sheet, {
      order_id: orderId, created_at: receivedAt, gift_id: "manual", gift_title: safeText(title),
      name: safeText(name), giver_name: safeText(name), amount: type === "physical" ? "" : Math.round(amount * 100) / 100,
      status: type === "physical" ? "recebido" : "pago", paid_at: type === "physical" ? "" : receivedAt,
      provider: "manual_" + type, source: "admin_manual"
    });
    SpreadsheetApp.flush();
    return jsonResponse(true, { orderId: orderId, alreadyRegistered: false });
  } finally {
    lock.releaseLock();
  }
}

function handleAdminGifts_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);
  const gifts = readTableSheet_(SHEETS.PEDIDOS_PRESENTES).map(function(row) {
    return {
      orderId: row.order_id || "",
      title: row.gift_title || "",
      name: row.giver_name || row.name || "",
      message: row.message || "",
      amount: Number(row.amount) || 0,
      createdAt: row.created_at || "",
      paidAt: row.paid_at || "",
      status: row.status || "",
      paymentMethod: row.payment_method || (row.provider === "pix" ? "pix" : row.provider === "pagbank" ? "card" : ""),
      source: row.source || "",
      provider: row.provider || ""
    };
  });
  return jsonResponse(true, { gifts: gifts, capabilities: { confirmGift: true, cancelGift: true, createGift: true } });
}

function handleAdminSummary_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const guests = readTableSheet_(SHEETS.CONVIDADOS);
  const latestRsvps = getLatestRsvpByGuestIdMap_();
  const rows = guests
    .filter(function(guest) {
      const status = normalizeText_(guest.status || "");
      return status !== "cancelado" && status !== "inativo";
    })
    .map(function(guest) {
      const rsvp = latestRsvps[String(guest.guest_id || "").trim()] || null;
      return publicAdminGuest_(guest, rsvp);
    });

  const totals = rows.reduce(function(acc, row) {
    acc.total += 1;
    acc[row.status] = (acc[row.status] || 0) + 1;
    const invited = 1 + Math.max(0, Number(row.allowedCompanions) || 0);
    const confirmed = Number(row.totalPeople || 0);
    const pending = row.status === "pending" ? invited : 0;
    acc.invitedPeople += invited;
    acc.confirmedPeople += confirmed;
    acc.pendingPeople += pending;
    acc.releasedPeople += invited - confirmed - pending;
    if (row.status === "declined") acc.declinedPeople += invited;
    if (row.status === "cancelled") acc.cancelledPeople += invited;
    if (row.status === "confirmed") acc.unusedCompanions += invited - confirmed;
    return acc;
  }, {
    total: 0, confirmed: 0, declined: 0, cancelled: 0, pending: 0,
    invitedPeople: 0, confirmedPeople: 0, pendingPeople: 0, releasedPeople: 0,
    declinedPeople: 0, cancelledPeople: 0, unusedCompanions: 0
  });
  totals.projectedPeople = totals.confirmedPeople + totals.pendingPeople;
  totals.people = totals.confirmedPeople;

  return jsonResponse(true, {
    operator: {
      username: operator.username,
      name: operator.name
    },
    capabilities: { adminRespondGuest: true },
    totals: totals,
    guests: rows
  });
}

function handleAdminRespondGuest_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const guestId = String(data.guestId || "").trim();
  const attendance = String(data.attendance || "").trim();
  const companionsConfirmed = Number(data.companionsConfirmed || 0);
  if (!guestId || ["confirmed", "declined"].indexOf(attendance) === -1) {
    return jsonResponse(false, null, "Selecione um convidado e a resposta recebida.");
  }
  if (!Number.isInteger(companionsConfirmed) || companionsConfirmed < 0 || (attendance === "declined" && companionsConfirmed !== 0)) {
    return jsonResponse(false, null, "Quantidade de acompanhantes inválida.");
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return jsonResponse(false, null, "A lista está sendo atualizada. Aguarde e tente novamente.");
  }

  try {
    const guest = findGuestById_(guestId);
    const guestStatus = normalizeText_(guest && guest.status || "");
    if (!guest || guestStatus === "cancelado" || guestStatus === "inativo") {
      return jsonResponse(false, null, "Convidado não encontrado na lista ativa.");
    }

    const existing = findLatestRsvpByGuestId_(guestId);
    if (existing) {
      return jsonResponse(true, {
        alreadyRegistered: true,
        guest: publicAdminGuest_(guest, existing),
        message: "Este convidado já possui uma resposta registrada. Atualize a lista."
      });
    }

    if (companionsConfirmed > Number(guest.allowed_companions || 0)) {
      return jsonResponse(false, null, "A quantidade de acompanhantes supera o convite.");
    }

    const checkinToken = attendance === "confirmed" ? createCheckinToken_(guestId) : "";
    const checkinLink = checkinToken ? buildCheckinLink_(checkinToken) : "";
    const inviteLink = checkinToken ? buildInviteLink_(checkinToken) : "";
    const cancellationToken = checkinToken ? createCancellationToken_(guestId) : "";
    const cancellationLink = cancellationToken ? buildCancellationLink_(cancellationToken) : "";
    const phone = String(guest.phone || "").trim();
    const email = String(guest.email || "").trim();
    const companionName = attendance === "confirmed" ? String(data.companionName || "").trim() : "";
    const sheet = getOrCreateSheet_(SHEETS.RSVP, HEADERS.RSVP);

    appendRecord_(sheet, {
      timestamp: new Date(),
      guest_id: guestId,
      guest_name: guest.name,
      name: guest.name,
      attendance: attendance,
      companions_confirmed: companionsConfirmed,
      companion_name: companionName,
      companion: companionName,
      phone: phone,
      whatsapp_link: "",
      email: email,
      checkin_token: checkinToken,
      checkin_link: checkinLink,
      invite_link: inviteLink,
      cancellation_token: cancellationToken,
      cancellation_link: cancellationLink,
      qr_code: checkinLink ? buildQrCodeUrl_(checkinLink) : "",
      checkin_status: checkinToken ? "pendente" : "",
      checkin_at: "",
      checkin_by: "",
      confirmation_email_sent_at: "",
      confirmation_email_error: "",
      source: "gestao_manual:" + (operator.name || operator.username),
      userAgent: data.userAgent || ""
    });
    SpreadsheetApp.flush();
    invalidateGuestSearchCache_();

    return jsonResponse(true, {
      guest: publicAdminGuest_(guest, {
        attendance: attendance,
        companions_confirmed: companionsConfirmed,
        companion_name: companionName,
        phone: phone,
        email: email,
        checkin_token: checkinToken,
        checkin_link: checkinLink,
        invite_link: inviteLink,
        cancellation_token: cancellationToken,
        cancellation_link: cancellationLink,
        qr_code: checkinLink ? buildQrCodeUrl_(checkinLink) : "",
        checkin_status: checkinToken ? "pendente" : ""
      }),
      message: attendance === "confirmed" ? "Presença registrada pela gestão. O convite está disponível nos detalhes." : "Ausência registrada pela gestão."
    });
  } finally {
    lock.releaseLock();
  }
}

function handleAdminCreateGuest_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const name = String(data.name || "").trim();
  if (!name) {
    return jsonResponse(false, null, "Informe o nome do convidado avulso.");
  }

  const companionsConfirmed = Math.max(0, Math.min(1, Number(data.companionsConfirmed || 0)));
  const companionName = companionsConfirmed > 0 ? String(data.companionName || "").trim() : "";
  if (companionsConfirmed > 0 && !companionName) {
    return jsonResponse(false, null, "Informe o nome do acompanhante.");
  }

  const guestId = createAdHocGuestId_();
  const phone = String(data.phone || "").trim();
  const email = String(data.email || "").trim();
  const checkinToken = createCheckinToken_(guestId);
  const checkinLink = buildCheckinLink_(checkinToken);
  const inviteLink = buildInviteLink_(checkinToken);
  const cancellationToken = createCancellationToken_(guestId);
  const cancellationLink = buildCancellationLink_(cancellationToken);
  const qrCode = buildQrCodeUrl_(checkinLink);
  const whatsappLink = buildWhatsappLink_(phone, {
    guestName: name,
    inviteLink: inviteLink,
    cancellationLink: cancellationLink,
    attendance: "confirmed"
  });

  appendGuestRecord_({
    guest_id: guestId,
    name: name,
    group: data.group || "Avulso",
    phone: phone,
    email: email,
    allowed_companions: companionsConfirmed,
    status: "avulso",
    notes: "Criado pela gestão em " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm")
  });

  const sheet = getOrCreateSheet_(SHEETS.RSVP, HEADERS.RSVP);
  const rowNumber = sheet.getLastRow() + 1;
  appendRecord_(sheet, {
    timestamp: new Date(),
    guest_id: guestId,
    guest_name: name,
    name: name,
    attendance: "confirmed",
    companions_confirmed: companionsConfirmed,
    companion_name: companionName,
    companion: companionName,
    phone: phone,
    whatsapp_link: whatsappLink,
    email: email,
    checkin_token: checkinToken,
    checkin_link: checkinLink,
    invite_link: inviteLink,
    cancellation_token: cancellationToken,
    cancellation_link: cancellationLink,
    qr_code: qrCode,
    checkin_status: "pendente",
    checkin_at: "",
    checkin_by: "",
    confirmation_email_sent_at: "",
    confirmation_email_error: "",
    source: "gestao_avulsa",
    userAgent: data.userAgent || ""
  });
  invalidateGuestSearchCache_();
  let emailResult;
  try {
    emailResult = sendRsvpConfirmationEmail_({ name: name }, {
      attendance: "confirmed",
      companionsConfirmed: companionsConfirmed,
      companionName: companionName,
      email: email,
      checkinToken: checkinToken,
      checkinLink: checkinLink,
      inviteLink: inviteLink,
      cancellationLink: cancellationLink,
      qrCode: qrCode
    });
  } catch (error) {
    emailResult = { sentAt: "", error: String(error.message || error) };
  }
  recordConfirmationEmailResult_(sheet, rowNumber, emailResult);

  return jsonResponse(true, {
    guest: publicAdminGuest_({
      guest_id: guestId,
      name: name,
      group: data.group || "Avulso",
      allowed_companions: companionsConfirmed,
      status: "avulso"
    }, {
      guest_id: guestId,
      guest_name: name,
      attendance: "confirmed",
      companions_confirmed: companionsConfirmed,
      companion_name: companionName,
      phone: phone,
      email: email,
      checkin_token: checkinToken,
      checkin_link: checkinLink,
      invite_link: inviteLink,
      cancellation_token: cancellationToken,
      cancellation_link: cancellationLink,
      qr_code: qrCode,
      checkin_status: "pendente"
    }),
    message: "Convidado avulso criado com QR Code ativo."
  });
}

function handleAdminImportGuests_(data) {
  const operator = validateOperator_(data);
  if (!operator.ok) return jsonResponse(false, null, operator.error);

  const importId = String(data.importId || "").trim();
  const items = Array.isArray(data.guests) ? data.guests : [];
  if (!importId) return jsonResponse(false, null, "Não foi possível identificar esta importação. Revise a lista e tente novamente.");
  if (!items.length) return jsonResponse(false, null, "Inclua pelo menos um convidado para importar.");
  if (items.length > 300) return jsonResponse(false, null, "Importe no máximo 300 convidados por vez.");

  const cleanGuests = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index] || {};
    const name = String(item.name || "").replace(/\s+/g, " ").trim();
    const companions = Number(item.companions || 0);
    if (!name || !/[A-Za-zÀ-ÿ]/.test(name)) {
      return jsonResponse(false, null, "Revise o nome na linha " + (index + 1) + ".");
    }
    if (!Number.isInteger(companions) || companions < 0 || companions > 50) {
      return jsonResponse(false, null, "Revise os acompanhantes na linha " + (index + 1) + ".");
    }
    cleanGuests.push({ name: name, companions: companions });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse(false, null, "A lista está sendo atualizada. Aguarde alguns segundos e tente novamente.");

  try {
    const properties = PropertiesService.getScriptProperties();
    const idempotencyKey = "guest_import_" + importId;
    const previous = properties.getProperty(idempotencyKey);
    if (previous) return jsonResponse(true, JSON.parse(previous));

    const currentGuests = readTableSheet_(SHEETS.CONVIDADOS);
    const usedIds = currentGuests.reduce(function(ids, guest) {
      const id = String(guest.guest_id || "").trim();
      if (id) ids[id] = true;
      return ids;
    }, {});
    const existingNames = currentGuests.reduce(function(names, guest) {
      const normalized = normalizeText_(guest.name);
      if (normalized) names[normalized] = true;
      return names;
    }, {});
    const seenNames = {};
    const warnings = [];
    const now = new Date();
    const stamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
    const records = cleanGuests.map(function(guest) {
      const normalized = normalizeText_(guest.name);
      if (existingNames[normalized] || seenNames[normalized]) warnings.push(guest.name);
      seenNames[normalized] = true;
      return {
        guest_id: createBulkGuestId_(usedIds),
        name: guest.name,
        group: "Lista principal",
        phone: "",
        email: "",
        allowed_companions: guest.companions,
        status: "ativo",
        notes: "Importado pela gestão em " + stamp
      };
    });

    appendRecords_(getOrCreateSheet_(SHEETS.CONVIDADOS, HEADERS.CONVIDADOS), records);
    invalidateGuestSearchCache_();
    const result = {
      imported: records.length,
      duplicateNames: warnings,
      importedAt: now.toISOString(),
      message: records.length + " convidado" + (records.length === 1 ? " adicionado." : "s adicionados.")
    };
    properties.setProperty(idempotencyKey, JSON.stringify(result));
    return jsonResponse(true, result);
  } finally {
    lock.releaseLock();
  }
}

// Reuse only the spreadsheet handle within this execution; never cache its cell data.
let executionSpreadsheet_ = null;
function getSpreadsheet_() {
  if (!executionSpreadsheet_) executionSpreadsheet_ = SpreadsheetApp.openById(SPREADSHEET_ID);
  return executionSpreadsheet_;
}

function readKeyValueSheet_(name) {
  const sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
  if (values.length > 1 && canonicalHeader_(values[0][0]) === "key") values.shift();
  return values.reduce((acc, row) => {
    if (row[0]) acc[String(row[0]).trim()] = row[1];
    return acc;
  }, {});
}

function getRsvpAvailability_() {
  const config = readKeyValueSheet_(SHEETS.CONFIG);
  const enabled = parseBooleanConfig_(config.rsvp_enabled, false);
  const opensAt = parseConfigDate_(config.rsvp_open_at || config.rsvp_abre_em);
  const closesAt = parseConfigDate_(config.rsvp_close_at || config.rsvp_fecha_em);
  const closedMessage = String(config.rsvp_closed_message || config.mensagem_rsvp_fechado || "").trim();
  const now = new Date();

  if (!enabled) {
    return {
      open: false,
      message: closedMessage || "As confirmações de presença serão liberadas em breve."
    };
  }

  if (opensAt && now < opensAt) {
    return {
      open: false,
      message: "As confirmações de presença estarão disponíveis a partir de " + formatDateLabel_(opensAt) + "."
    };
  }

  if (closesAt && now > closesAt) {
    return {
      open: false,
      message: "O prazo para confirmação de presença foi encerrado."
    };
  }

  return { open: true, message: "" };
}

function parseBooleanConfig_(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ["false", "não", "nao", "no", "0", "off", "disabled"].indexOf(normalized) === -1;
}

function parseConfigDate_(value) {
  if (!value) return null;
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) return value;
  const raw = String(value).trim();
  const normalized = raw.indexOf("T") !== -1 ? raw : raw.replace(" ", "T");
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date;
}

function formatDateLabel_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy");
}

function readTableSheet_(name) {
  const sheet = getSpreadsheet_().getSheetByName(name);
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

function findGiftById_(giftId) {
  const id = String(giftId || "").trim();
  if (!id) return null;
  const gifts = readTableSheet_(SHEETS.PRESENTES);
  return gifts.find(function(gift) {
    return String(gift.gift_id || gift.id || "").trim() === id && isEnabled_(gift.enabled);
  }) || null;
}

function createCustomGiftFromRequest_(data, customAmount) {
  if (!customAmount) return null;
  const amount = Number(data.amount || 0);
  const title = String(data.giftTitle || "").trim();
  if (!data.giftId || !title || amount <= 0) return null;
  return {
    gift_id: data.giftId,
    title: title,
    amount: amount,
    payment_url: "",
    customAmount: true,
    enabled: "TRUE"
  };
}

function isCustomGift_(gift) {
  return gift.custom_amount === true || gift.customAmount === true || String(gift.custom_amount || gift.customAmount || "").toLowerCase() === "true";
}

function getOrCreateSheet_(name, headers) {
  const spreadsheet = getSpreadsheet_();
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

function appendRecords_(sheet, records) {
  if (!records.length) return;
  const sheetName = sheet.getName();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function(header) {
      return String(header || "").trim();
    });
  const values = records.map(function(record) {
    return headers.map(function(header) {
      const canonical = canonicalHeaderForSheet_(sheetName, header);
      return Object.prototype.hasOwnProperty.call(record, canonical) ? record[canonical] : "";
    });
  });
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
}

function appendGuestRecord_(record) {
  const sheet = getOrCreateSheet_(SHEETS.CONVIDADOS, HEADERS.CONVIDADOS);
  appendRecord_(sheet, record);
}

function validateOperator_(data) {
  const sessionToken = String(data.sessionToken || "").trim();
  if (sessionToken) return validateOperatorSession_(sessionToken);

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
    name: operator.operator_name || operator.name || username,
    password: String(operator.password || "")
  };
}

function createOperatorSession_(operator) {
  const payload = {
    username: String(operator.username || "").trim().toLowerCase(),
    fingerprint: operatorSessionFingerprint_(operator.username, operator.password)
  };
  const encoded = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(encoded, getOperatorSessionSecret_()));
  return encoded + "." + signature;
}

function validateOperatorSession_(token) {
  const pieces = String(token || "").split(".");
  if (pieces.length !== 2) return { ok: false, error: "Sessão inválida. Faça login novamente." };

  const expectedSignature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(pieces[0], getOperatorSessionSecret_()));
  if (pieces[1] !== expectedSignature) return { ok: false, error: "Sessão inválida. Faça login novamente." };

  try {
    const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(pieces[0])).getDataAsString());
    const username = String(payload.username || "").trim().toLowerCase();
    if (!username || !payload.fingerprint) return { ok: false, error: "Sessão inválida. Faça login novamente." };

    // A signed session must refer to an existing operator. Reading canonical headers
    // is sufficient; schema creation/repair belongs to setup/login, not every action.
    const operator = readTableSheet_(SHEETS.OPERADORES).find(function(item) {
      return String(item.username || "").trim().toLowerCase() === username &&
        isEnabled_(item.ativo !== undefined ? item.ativo : item.enabled);
    });
    if (!operator || payload.fingerprint !== operatorSessionFingerprint_(operator.username, operator.password)) {
      return { ok: false, error: "Sessão inválida. Faça login novamente." };
    }
    return {
      ok: true,
      username: String(operator.username || "").trim(),
      name: operator.operator_name || operator.name || operator.username
    };
  } catch (error) {
    return { ok: false, error: "Sessão inválida. Faça login novamente." };
  }
}

function operatorSessionFingerprint_(username, password) {
  const value = String(username || "").trim().toLowerCase() + "\u0000" + String(password || "");
  return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(value, getOperatorSessionSecret_()));
}

function getOperatorSessionSecret_() {
  const properties = PropertiesService.getScriptProperties();
  const key = "operator_session_secret_v1";
  let secret = properties.getProperty(key);
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    properties.setProperty(key, secret);
  }
  return secret;
}

function readRsvpRecords_() {
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.RSVP);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values.shift().map(function(header) {
    return canonicalHeaderForSheet_(SHEETS.RSVP, header);
  });

  const records = values
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
  records.byToken = Object.create(null);
  records.latestByGuest = Object.create(null);
  records.forEach(function(record) {
    const token = String(record.checkin_token || "").trim();
    const guestId = String(record.guest_id || "").trim();
    if (token) records.byToken[token] = record;
    if (guestId) records.latestByGuest[guestId] = record;
  });
  records.sheet = sheet;
  records.headers = headers;
  return records;
}

function findRsvpByCheckinToken_(token) {
  return findRsvpByCheckinTokenInRecords_(readRsvpRecords_(), token);
}

function findRsvpByCheckinTokenInRecords_(records, token) {
  const normalizedToken = String(token || "").trim();
  if (!normalizedToken) return null;
  if (records.byToken) return records.byToken[normalizedToken] || null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (String(records[index].checkin_token || "").trim() === normalizedToken) {
      return records[index];
    }
  }
  return null;
}

function findLatestRsvpByGuestId_(guestId) {
  return findLatestRsvpByGuestIdInRecords_(readRsvpRecords_(), guestId);
}

function findLatestRsvpByGuestIdInRecords_(records, guestId) {
  const id = String(guestId || "").trim();
  if (!id) return null;
  if (records.latestByGuest) return records.latestByGuest[id] || null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (String(records[index].guest_id || "").trim() === id) {
      return records[index];
    }
  }
  return null;
}

function getLatestRsvpByGuestIdMap_() {
  const records = readRsvpRecords_();
  return records.reduce(function(acc, record) {
    const id = String(record.guest_id || "").trim();
    if (id) acc[id] = record;
    return acc;
  }, {});
}

function findLatestConfirmedRsvpByGuestId_(guestId) {
  return findLatestConfirmedRsvpByGuestIdInRecords_(readRsvpRecords_(), guestId);
}

function findLatestConfirmedRsvpByGuestIdInRecords_(records, guestId) {
  const id = String(guestId || "").trim();
  if (!id) return null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (String(records[index].guest_id || "").trim() === id && records[index].attendance === "confirmed") {
      return records[index];
    }
  }
  return null;
}

function markCheckin_(rowNumber, operatorName, requestId, checkedInAt, records) {
  const sheet = records && records.sheet || getSpreadsheet_().getSheetByName(SHEETS.RSVP);
  if (!sheet) throw new Error("Lista de confirmações indisponível.");
  const headers = records && records.headers || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function(header) { return canonicalHeaderForSheet_(SHEETS.RSVP, header); });
  // Reuse the headers already read under the lock. Migrate only missing columns.
  ["checkin_status", "checkin_at", "checkin_by", "checkin_request_id"].forEach(function(header) {
    if (headers.indexOf(header) !== -1) return;
    sheet.getRange(1, headers.length + 1).setValue(header);
    headers.push(header);
  });
  // Persist the operation before the admission marker so a retry can finish a partial write.
  setRecordValue_(sheet, rowNumber, headers, "checkin_request_id", requestId || "");
  const columns = ["checkin_status", "checkin_at", "checkin_by"].map(function(header) { return headers.indexOf(header); });
  const values = ["validado", checkedInAt || new Date(), operatorName];
  if (columns.every(function(column, index) { return index === 0 || column === columns[index - 1] + 1; })) {
    sheet.getRange(rowNumber, columns[0] + 1, 1, 3).setValues([values]);
    return;
  }
  // Write the admission timestamp last when columns have been rearranged.
  [0, 2, 1].forEach(function(index) { sheet.getRange(rowNumber, columns[index] + 1).setValue(values[index]); });
}

function setRecordValue_(sheet, rowNumber, headers, canonicalHeader, value) {
  const columnIndex = headers.indexOf(canonicalHeader);
  if (columnIndex === -1) return;
  sheet.getRange(rowNumber, columnIndex + 1).setValue(value);
}

function recordConfirmationEmailResult_(sheet, rowNumber, result) {
  try {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(function(header) { return canonicalHeaderForSheet_(SHEETS.RSVP, header); });
    setRecordValue_(sheet, rowNumber, headers, "confirmation_email_sent_at", result.sentAt || "");
    setRecordValue_(sheet, rowNumber, headers, "confirmation_email_error", result.error || "");
  } catch (error) {
    console.error("Email status update: " + (error.stack || error));
  }
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

function publicInvite_(record) {
  const checkinLink = record.checkin_link || buildCheckinLink_(record.checkin_token);
  const inviteLink = record.invite_link || buildInviteLink_(record.checkin_token);
  return {
    token: record.checkin_token || "",
    name: record.guest_name || "",
    attendance: record.attendance || "",
    companionsConfirmed: Number(record.companions_confirmed || 0),
    companionName: record.companion_name || "",
    checkinStatus: record.checkin_status || (record.checkin_at ? "validado" : "pendente"),
    checkinAt: record.checkin_at || "",
    checkinLink: checkinLink,
    inviteLink: inviteLink,
    qrCode: record.qr_code || buildQrCodeUrl_(checkinLink),
    event: {
      couple: "Krisna & Fernando",
      date: "29 de outubro de 2026",
      time: "15h30",
      venue: "Buffet La Maison",
      address: "Av. Eng. Luiz Vieira, 555 - Papicu"
    }
  };
}

function findActiveRsvpByCancellationToken_(tokenValue) {
  const token = String(tokenValue || "").trim();
  if (!token) return null;

  const records = readRsvpRecords_();
  let record = null;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (String(records[index].cancellation_token || "").trim() === token) {
      record = records[index];
      break;
    }
  }

  if (!record || record.attendance !== "confirmed") return null;
  const latest = findLatestRsvpByGuestIdInRecords_(records, record.guest_id);
  if (!latest || latest.attendance !== "confirmed" || latest.cancellation_token !== record.cancellation_token) return null;
  return record;
}

function publicCancellation_(record) {
  return {
    token: record.cancellation_token || "",
    name: record.guest_name || "",
    attendance: record.attendance || "",
    companionsConfirmed: Number(record.companions_confirmed || 0),
    companionName: record.companion_name || "",
    inviteLink: record.invite_link || "",
    checkinStatus: record.checkin_status || (record.checkin_at ? "validado" : "pendente")
  };
}

function publicAdminGuest_(guest, rsvp) {
  const attendance = rsvp ? String(rsvp.attendance || "") : "";
  const status = attendance === "confirmed"
    ? "confirmed"
    : attendance === "declined"
      ? "declined"
      : attendance === "cancelled" || attendance === "canceled"
        ? "cancelled"
        : "pending";
  const companions = rsvp ? Number(rsvp.companions_confirmed || 0) : 0;

  return {
    guestId: guest.guest_id || "",
    name: guest.name || guest.guest_name || "",
    group: guest.group || "",
    allowedCompanions: Math.max(0, Number(guest.allowed_companions) || 0),
    status: status,
    statusLabel: adminStatusLabel_(status),
    totalPeople: status === "confirmed" ? 1 + companions : 0,
    attendance: attendance,
    companionsConfirmed: companions,
    companionName: rsvp ? rsvp.companion_name || "" : "",
    phone: rsvp ? rsvp.phone || "" : guest.phone || "",
    email: rsvp ? rsvp.email || "" : guest.email || "",
    lastResponseAt: rsvp ? rsvp.timestamp || "" : "",
    checkinStatus: rsvp ? rsvp.checkin_status || (rsvp.checkin_at ? "validado" : "") : "",
    checkinAt: rsvp ? rsvp.checkin_at || "" : "",
    checkinBy: rsvp ? rsvp.checkin_by || "" : "",
    inviteLink: rsvp ? rsvp.invite_link || "" : "",
    cancellationLink: rsvp ? rsvp.cancellation_link || "" : "",
    qrCode: rsvp ? rsvp.qr_code || "" : "",
    source: rsvp ? rsvp.source || "" : "",
    notes: guest.notes || ""
  };
}

function adminStatusLabel_(status) {
  if (status === "confirmed") return "Confirmado";
  if (status === "declined") return "Não vai";
  if (status === "cancelled") return "Cancelado";
  return "Falta confirmar";
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

function createCancellationToken_(guestId) {
  const cleanId = String(guestId || "KF").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const random = Utilities.getUuid().replace(/-/g, "").slice(0, 18).toUpperCase();
  return "CXL-" + cleanId + "-" + random;
}

function createAdHocGuestId_() {
  return "AV-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 9000 + 1000);
}

function createBulkGuestId_(usedIds) {
  let number = 1;
  Object.keys(usedIds).forEach(function(id) {
    const match = /^KF-(\d+)$/i.exec(id);
    if (match) number = Math.max(number, Number(match[1]) + 1);
  });
  let candidate = "KF-" + String(number).padStart(4, "0");
  while (usedIds[candidate]) {
    number += 1;
    candidate = "KF-" + String(number).padStart(4, "0");
  }
  usedIds[candidate] = true;
  return candidate;
}

function buildCheckinLink_(token) {
  const domain = String(readKeyValueSheet_(SHEETS.CONFIG).domain || "https://krisnaefernando.com/").replace(/\/?$/, "/");
  return domain + "checkin.html?t=" + encodeURIComponent(token);
}

function buildInviteLink_(token) {
  const domain = String(readKeyValueSheet_(SHEETS.CONFIG).domain || "https://krisnaefernando.com/").replace(/\/?$/, "/");
  return domain + "convite.html?t=" + encodeURIComponent(token);
}

function buildCancellationLink_(token) {
  const domain = String(readKeyValueSheet_(SHEETS.CONFIG).domain || "https://krisnaefernando.com/").replace(/\/?$/, "/");
  return domain + "cancelar.html?t=" + encodeURIComponent(token);
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

function buildWhatsappLink_(phone, data) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if ((digits.length === 10 || digits.length === 11) && digits.indexOf("55") !== 0) {
    digits = "55" + digits;
  }
  const inviteLink = data && data.attendance === "confirmed" ? String(data.inviteLink || "") : "";
  if (!inviteLink) return "https://wa.me/" + digits;

  const firstName = String(data.guestName || "").trim().split(/\s+/)[0] || "Olá";
  const lines = [
    "Olá, " + firstName + "! Sua presença no casamento de Krisna & Fernando foi confirmada.",
    "",
    "Acesse seu convite digital com QR Code:",
    inviteLink,
    "",
    "No dia do evento, apresente este QR Code na recepção para agilizar sua entrada."
  ];
  if (data.cancellationLink) {
    lines.push("", "Se precisar cancelar sua presença, use este link: " + data.cancellationLink);
  }
  const message = lines.join("\n");

  return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message);
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

function sendCancellationEmail_(record) {
  const email = String(record.email || "").trim();
  if (!email || email.indexOf("@") === -1) {
    return { sentAt: "", error: "" };
  }

  const name = record.guest_name || "Convidado";
  const plainBody = [
    "Olá, " + name + ".",
    "",
    "Recebemos o cancelamento da sua presença.",
    "",
    "Agradecemos por nos avisar.",
    "",
    "Krisna & Fernando"
  ].join("\n");
  const htmlBody = [
    '<div style="margin:0;padding:0;background:#f8f4ec;font-family:Arial,Helvetica,sans-serif;color:#28241f;">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f4ec;margin:0;padding:28px 12px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf2;border:1px solid rgba(78,90,66,0.18);">',
    '<tr><td style="background:#4e5a42;padding:28px 30px;text-align:center;">',
    '<div style="font-family:Georgia,serif;color:#fffaf2;font-size:34px;line-height:1.1;">Krisna &amp; Fernando</div>',
    '</td></tr>',
    '<tr><td style="padding:34px 30px;">',
    '<div style="color:#b29a68;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Cancelamento registrado</div>',
    '<h1 style="margin:12px 0 14px;font-family:Georgia,serif;font-size:30px;line-height:1.15;color:#28241f;font-weight:400;">Olá, ' + escapeHtml_(name) + ".</h1>",
    '<p style="margin:0 0 18px;color:#756e62;font-size:16px;line-height:1.7;">Recebemos o cancelamento da sua presença.</p>',
    '<p style="margin:0;color:#756e62;font-size:16px;line-height:1.7;">Agradecemos por nos avisar.</p>',
    '</td></tr>',
    '<tr><td style="padding:24px 30px 32px;text-align:center;">',
    '<div style="height:1px;background:rgba(78,90,66,0.16);margin-bottom:20px;"></div>',
    '<div style="font-family:Georgia,serif;color:#4e5a42;font-size:22px;">Krisna &amp; Fernando</div>',
    '</td></tr>',
    '</table>',
    '</td></tr>',
    '</table>',
    '</div>'
  ].join("");

  try {
    MailApp.sendEmail({
      to: email,
      subject: "Cancelamento registrado - Krisna & Fernando",
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
    : "Recebemos sua resposta informando que você não poderá comparecer.";
  const companionLine = Number(data.companionsConfirmed || 0) > 0
    ? '<tr><td style="padding:10px 0;color:#756e62;">Acompanhante</td><td style="padding:10px 0;text-align:right;color:#28241f;font-weight:700;">' + escapeHtml_(data.companionName || "Confirmado") + "</td></tr>"
    : "";
  const eventDetails = isConfirmed
    ? [
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid rgba(78,90,66,0.16);border-bottom:1px solid rgba(78,90,66,0.16);font-size:15px;">',
      '<tr><td style="padding:14px 0 10px;color:#756e62;">Data</td><td style="padding:14px 0 10px;text-align:right;color:#28241f;font-weight:700;">29 de outubro de 2026</td></tr>',
      '<tr><td style="padding:10px 0;color:#756e62;">Horário</td><td style="padding:10px 0;text-align:right;color:#28241f;font-weight:700;">15h30</td></tr>',
      '<tr><td style="padding:10px 0;color:#756e62;">Local</td><td style="padding:10px 0;text-align:right;color:#28241f;font-weight:700;">Buffet La Maison</td></tr>',
      companionLine,
      "</table>"
    ].join("")
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
  const cancellationBlock = isConfirmed && data.cancellationLink
    ? [
      '<div style="margin:18px 0 0;padding:16px;border:1px solid rgba(78,90,66,0.12);background:rgba(248,244,236,0.52);">',
      '<p style="margin:0 0 8px;color:#756e62;font-size:13px;line-height:1.6;">Se você precisar cancelar sua presença, use o link abaixo. O QR Code será desativado após o cancelamento.</p>',
      '<a href="' + escapeHtml_(data.cancellationLink) + '" style="color:#4e5a42;font-size:13px;font-weight:700;text-decoration:none;">Cancelar minha presença</a>',
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
    eventDetails,
    qrBlock,
    cancellationBlock,
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
      : "Recebemos sua resposta informando que você não poderá comparecer."
  ];

  if (isConfirmed) {
    lines.push(
      "",
      "Data: 29 de outubro de 2026",
      "Horário: 15h30",
      "Local: Buffet La Maison"
    );
  }

  if (isConfirmed && Number(data.companionsConfirmed || 0) > 0) {
    lines.push("Acompanhante: " + (data.companionName || "Confirmado"));
  }

  if (isConfirmed && data.checkinToken) {
    lines.push("", "QR Code de entrada: " + data.checkinLink, "Código: " + data.checkinToken);
  }

  if (isConfirmed && data.cancellationLink) {
    lines.push("", "Se precisar cancelar sua presença, use este link: " + data.cancellationLink);
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

function jsonResponse(ok, data, error, errorCode) {
  const output = {
    ok,
    data,
    error: error || null,
    errorCode: errorCode || null,
    timestamp: new Date().toISOString()
  };
  return ContentService
    .createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
