import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL("../outputs/", import.meta.url);
const outputPath = new URL("central-configuracao-krisna-fernando.xlsx", outputDir);
const outputDirPath = fileURLToPath(outputDir);
const outputFilePath = fileURLToPath(outputPath);

const palette = {
  olive: "#4E5A42",
  sage: "#75806B",
  gold: "#B29A68",
  cream: "#F8F4EC",
  paper: "#FFFAF2",
  ink: "#28241F",
  muted: "#756E62",
  lavender: "#D8D0E2"
};

const sheets = [
  {
    name: "INSTRUCOES",
    rows: [
      ["Central de configuração do site Krisna & Fernando"],
      ["Use esta planilha como base. Depois de importar para o Google Sheets, publique o Apps Script como App da Web e cole a URL em js/config.js."],
      [""],
      ["Abas principais"],
      ["CONFIG", "Configurações globais do site em chave/valor."],
      ["PAGINAS", "Textos e blocos editáveis por seção."],
      ["CONVIDADOS", "Base oficial de convidados, grupos e acompanhantes permitidos."],
      ["RSVP", "Respostas enviadas pelo formulário do site."],
      ["PRESENTES", "Lista simbólica de presentes exibida no site."],
      ["PEDIDOS_PRESENTES", "Presentes escolhidos, mensagens e status do pagamento."],
      ["GALERIA", "Fotos que podem ser exibidas no site."],
      ["MENSAGENS", "Mensagens ou depoimentos opcionais."],
      [""],
      ["Publicação do Apps Script"],
      ["1. Extensões > Apps Script"],
      ["2. Cole o conteúdo de appscript/Code.gs"],
      ["3. Implantar > Nova implantação > App da Web"],
      ["4. Executar como: Eu"],
      ["5. Quem pode acessar: Qualquer pessoa"],
      ["6. Copie a URL gerada e cole em js/config.js"]
    ],
    widths: [34, 96]
  },
  {
    name: "CONFIG",
    rows: [
      ["key", "value", "description"],
      ["couple_name", "Krisna & Fernando", "Nome exibido no site"],
      ["domain", "https://krisnaefernando.com/", "Domínio final"],
      ["wedding_date", "2026-10-29T15:30:00-03:00", "Data/hora da contagem regressiva"],
      ["hero_image", "_BQH1940.jpg", "Foto de capa. Use o nome do arquivo da GALERIA, sem a extensão final gerada"],
      ["hero_video", "assets/video/intro-casal-v2.mp4", "Vídeo de fundo do topo/hero"],
      ["ceremony_date_label", "29 de outubro de 2026", "Texto amigável da data"],
      ["ceremony_time", "15h30", "Horário da cerimônia"],
      ["venue_name", "Buffet La Maison", "Nome do local"],
      ["ceremony_room", "Salão Terrasse", "Sala da cerimônia"],
      ["reception_room", "Salão Central", "Sala da recepção"],
      ["venue_address", "Av. Eng. Luiz Vieira, 555, Papicu", "Endereço"],
      ["maps_url", "https://www.google.com/maps/search/?api=1&query=Buffet%20La%20Maison%20Av.%20Eng.%20Luiz%20Vieira%20555%20Papicu", "Link de rota"],
      ["whatsapp_contact", "", "Contato do casal ou assessoria"],
      ["instagram_url", "", "Instagram opcional"],
      ["rsvp_enabled", "TRUE", "Ativa/desativa formulário"],
      ["gifts_enabled", "TRUE", "Ativa/desativa presentes"],
      ["hero_video_enabled", "TRUE", "Ativa/desativa vídeo de fundo do topo"],
      ["site_status", "preview", "preview ou published"]
    ],
    widths: [28, 78, 56]
  },
  {
    name: "PAGINAS",
    rows: [
      ["section", "title", "subtitle", "text", "button_label", "button_url", "enabled", "sort_order"],
      ["hero", "Krisna & Fernando", "29 de outubro de 2026", "Com amor, presença de Deus e a alegria de quem encontrou no outro o seu lugar.", "Confirmar presença", "#presenca", "TRUE", 1],
      ["historia", "Uma estampa feita de encontros, fé e detalhes nossos.", "Nossa história preferida", "Nossa estampa foi criada especialmente para o casamento, unindo elementos que fazem parte da nossa história.", "", "", "TRUE", 2],
      ["casamento", "Esperamos vocês para celebrar esse dia conosco.", "O casamento", "A cerimônia acontecerá às 15h30 do dia 29 de outubro de 2026, no Buffet La Maison, no Salão Terrasse. Após a cerimônia, os convidados serão recepcionados no mesmo local, no Salão Central.", "Abrir rota", "{{maps_url}}", "TRUE", 3],
      ["presenca", "Estamos preparando tudo com muito amor e presença de Deus.", "Confirme sua presença", "Para que possamos organizar da melhor forma possível esse dia tão especial, pedimos que nos confirme sua presença.", "Enviar confirmação", "", "TRUE", 4],
      ["presentes", "Seu carinho já é parte da nossa casa.", "Presentes", "Em breve, esta seção receberá nossa lista de presentes, cotas e informações configuradas por aqui.", "", "", "TRUE", 5],
      ["rodape", "Krisna & Fernando", "", "Obrigado por fazer parte da nossa história.", "", "", "TRUE", 6]
    ],
    widths: [18, 46, 30, 92, 24, 46, 14, 14]
  },
  {
    name: "CONVIDADOS",
    rows: [
      ["guest_id", "name", "phone", "email", "group", "allowed_companions", "notes", "status"],
      ["KF-001", "Convidado Exemplo", "", "", "Família", 1, "Substituir por convidados reais", "pendente"]
    ],
    widths: [16, 34, 22, 34, 20, 22, 44, 18]
  },
  {
    name: "RSVP",
    rows: [
      ["timestamp", "guest_id", "guest_name", "attendance", "companions_confirmed", "companion_name", "phone", "email", "source", "userAgent"],
      ["", "", "", "", "", "", "", "", "", ""]
    ],
    widths: [24, 16, 34, 20, 24, 34, 22, 34, 16, 70]
  },
  {
    name: "PRESENTES",
    rows: [
      ["gift_id", "title", "description", "image", "amount", "enabled", "sort_order"],
      ["P-001", "Jantar romântico", "Uma noite especial para celebrarmos com calma depois do grande dia.", "assets/images/gifts/jantar-romantico.svg", 250, "TRUE", 1],
      ["P-002", "Cota lua de mel", "Um pedacinho da nossa primeira viagem como marido e esposa.", "assets/images/gifts/lua-de-mel.svg", 300, "TRUE", 2],
      ["P-003", "Café da manhã dos noivos", "Para começarmos um dia da lua de mel com carinho e mesa bonita.", "assets/images/gifts/cafe-da-manha.svg", 180, "TRUE", 3],
      ["P-004", "Noite de hospedagem", "Uma diária simbólica para descansarmos depois de tanta emoção.", "assets/images/gifts/hospedagem.svg", 450, "TRUE", 4],
      ["P-005", "Passeio especial", "Uma experiência para guardarmos na memória da nossa viagem.", "assets/images/gifts/passeio.svg", 220, "TRUE", 5],
      ["P-006", "Brinde dos noivos", "Uma taça levantada para agradecer por esse novo capítulo.", "assets/images/gifts/brinde.svg", 160, "TRUE", 6],
      ["P-007", "Primeiro mercado da casa", "Aquele empurrão carinhoso para abastecer o novo lar.", "assets/images/gifts/casa.svg", 350, "TRUE", 7],
      ["P-008", "Kit cozinha feliz", "Para receitas, cafés, conversas e pequenas alegrias do dia a dia.", "assets/images/gifts/cozinha.svg", 280, "TRUE", 8],
      ["P-009", "Mesa posta", "Um detalhe bonito para receber amigos e família com amor.", "assets/images/gifts/mesa-posta.svg", 240, "TRUE", 9],
      ["P-010", "Cantinho do café", "Para nossos cafés de manhã, de tarde e de depois do almoço.", "assets/images/gifts/cafe.svg", 320, "TRUE", 10],
      ["P-011", "Enxoval dos sonhos", "Lençóis, toalhas e conforto para a rotina ficar mais leve.", "assets/images/gifts/enxoval.svg", 400, "TRUE", 11],
      ["P-012", "Tete também casa", "Um mimo simbólico para nossa pequena participar desse momento.", "assets/images/gifts/tete.svg", 150, "TRUE", 12],
      ["P-013", "Domingo preguiçoso", "Delivery, filme e descanso para depois da maratona do casamento.", "assets/images/gifts/domingo.svg", 190, "TRUE", 13],
      ["P-014", "Álbum de memórias", "Para eternizar fotos e detalhes desse tempo tão especial.", "assets/images/gifts/memorias.svg", 260, "TRUE", 14],
      ["P-015", "Flores para a casa", "Um toque de beleza para o começo da nossa vida juntos.", "assets/images/gifts/flores.svg", 140, "TRUE", 15],
      ["P-016", "Ajuda para o novo lar", "Uma contribuição livre, prática e cheia de significado.", "assets/images/gifts/novo-lar.svg", 500, "TRUE", 16],
      ["P-017", "Experiência gastronômica", "Um almoço ou jantar para celebrarmos sem pressa.", "assets/images/gifts/experiencia.svg", 380, "TRUE", 17],
      ["P-018", "Cota carinho", "Um presente simbólico para participar da nossa história do seu jeito.", "assets/images/gifts/presente.svg", 100, "TRUE", 18]
    ],
    widths: [14, 34, 68, 44, 16, 14, 14]
  },
  {
    name: "PEDIDOS_PRESENTES",
    rows: [
      ["created_at", "order_id", "gift_id", "gift_title", "amount", "giver_name", "giver_phone", "giver_email", "message", "status", "provider", "provider_payment_id", "payment_url", "paid_at", "source", "userAgent"],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
    ],
    widths: [24, 24, 14, 34, 14, 32, 22, 34, 70, 16, 18, 28, 52, 24, 16, 70]
  },
  {
    name: "GALERIA",
    rows: [
      ["image_id", "file_name", "title", "alt_text", "featured", "enabled", "sort_order"],
      ["G-001", "_BQH1996.jpg", "Ensaio Krisna e Fernando", "Krisna e Fernando em ensaio do casal", "TRUE", "TRUE", 1],
      ["G-002", "_BQH1929-Editar.jpg", "Ensaio do casal", "Foto do casal em ensaio pré-casamento", "TRUE", "TRUE", 2],
      ["G-003", "_BQH1901.jpg", "Ensaio do casal", "Foto de Krisna e Fernando", "FALSE", "TRUE", 3],
      ["G-004", "_BQH1920.jpg", "Ensaio do casal", "Foto de Krisna e Fernando", "FALSE", "TRUE", 4]
    ],
    widths: [14, 28, 34, 54, 16, 14, 14]
  },
  {
    name: "MENSAGENS",
    rows: [
      ["message_id", "name", "message", "enabled", "sort_order"],
      ["M-001", "Krisna & Fernando", "Obrigado por fazer parte desse capítulo tão especial da nossa história.", "TRUE", 1]
    ],
    widths: [16, 28, 86, 14, 14]
  }
];

function applyTableStyle(sheet, rowCount, colCount, widths) {
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  const used = sheet.getRangeByIndexes(0, 0, rowCount, colCount);
  used.format = {
    font: { size: 11, color: palette.ink },
    wrapText: true,
    verticalAlignment: "top"
  };

  const header = sheet.getRangeByIndexes(0, 0, 1, colCount);
  header.format = {
    fill: palette.olive,
    font: { size: 11, bold: true, color: "#FFFFFF" },
    wrapText: true,
    verticalAlignment: "middle"
  };
  header.format.rowHeight = 30;

  for (let index = 0; index < colCount; index += 1) {
    const width = widths[index] || 24;
    sheet.getRangeByIndexes(0, index, rowCount, 1).format.columnWidth = width;
  }

  if (rowCount > 1) {
    const body = sheet.getRangeByIndexes(1, 0, rowCount - 1, colCount);
    body.format = {
      fill: palette.paper,
      font: { size: 10, color: palette.ink },
      wrapText: true,
      verticalAlignment: "top"
    };
  }
}

async function build() {
  await fs.mkdir(outputDirPath, { recursive: true });

  const workbook = Workbook.create();
  for (const spec of sheets) {
    const sheet = workbook.worksheets.add(spec.name);
    const rowCount = spec.rows.length;
    const colCount = Math.max(...spec.rows.map((row) => row.length));
    const normalized = spec.rows.map((row) => {
      const next = [...row];
      while (next.length < colCount) next.push("");
      return next;
    });

    sheet.getRangeByIndexes(0, 0, rowCount, colCount).values = normalized;
    applyTableStyle(sheet, rowCount, colCount, spec.widths);

    if (spec.name === "INSTRUCOES") {
      sheet.getRange("A1:B1").merge();
      sheet.getRange("A1:B1").format = {
        fill: palette.olive,
        font: { size: 18, bold: true, color: "#FFFFFF" },
        verticalAlignment: "middle",
        wrapText: true
      };
      sheet.getRange("A2:B2").merge();
      sheet.getRange("A2:B2").format = {
        fill: palette.cream,
        font: { size: 11, color: palette.muted },
        wrapText: true,
        verticalAlignment: "top"
      };
      sheet.freezePanes.unfreeze();
    }
  }

  const errors = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 100 },
    summary: "scan de erros"
  });
  console.log(errors.ndjson);

  const xlsx = await SpreadsheetFile.exportXlsx(workbook);
  await xlsx.save(outputFilePath);
  console.log(outputFilePath);
}

await build();
