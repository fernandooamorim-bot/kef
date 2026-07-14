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
      ["OPERADORES", "Acessos da equipe para validar QR Codes no dia do evento."],
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
      ["chave", "valor", "descricao"],
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
      ["secao", "titulo", "subtitulo", "texto", "rotulo_botao", "link_botao", "ativo", "ordem"],
      ["hero", "Krisna & Fernando", "29 de outubro de 2026", "Com amor, presença de Deus e a alegria de quem encontrou no outro o seu lugar.", "Confirmar presença", "#presenca", "TRUE", 1],
      ["historia", "Uma estampa feita de encontros, fé e detalhes nossos.", "Nossa história preferida", "Nossa estampa foi criada especialmente para o casamento, unindo elementos que fazem parte da nossa história.", "", "", "TRUE", 2],
      ["casamento", "Esperamos vocês para celebrar esse dia conosco.", "O casamento", "A cerimônia acontecerá às 15h30 do dia 29 de outubro de 2026, no Buffet La Maison, no Salão Terrasse. Após a cerimônia, os convidados serão recepcionados no mesmo local, no Salão Central.", "Abrir rota", "{{maps_url}}", "TRUE", 3],
      ["presenca", "Estamos preparando tudo com muito amor e presença de Deus.", "Confirme sua presença", "Para que possamos organizar da melhor forma possível esse dia tão especial, pedimos que nos confirme sua presença.", "Enviar confirmação", "", "TRUE", 4],
      ["presentes", "Sua contribuição nos ajuda a começar essa nova etapa.", "Presentes", "Em breve, esta seção receberá nossa lista de presentes, cotas e informações configuradas por aqui.", "", "", "TRUE", 5],
      ["rodape", "Krisna & Fernando", "", "Obrigado por fazer parte da nossa história.", "", "", "TRUE", 6]
    ],
    widths: [18, 46, 30, 92, 24, 46, 14, 14]
  },
  {
    name: "CONVIDADOS",
    rows: [
      ["codigo_convidado", "nome", "telefone", "email", "grupo", "acompanhantes_permitidos", "observacoes", "status"],
      ["KF-001", "Convidado Exemplo", "", "", "Família", 1, "Substituir por convidados reais", "pendente"]
    ],
    widths: [16, 34, 22, 34, 20, 22, 44, 18]
  },
  {
    name: "RSVP",
    rows: [
      ["data_hora", "codigo_convidado", "nome_convidado", "presenca", "acompanhantes_confirmados", "nome_acompanhante", "telefone", "link_whatsapp", "email", "token_checkin", "link_checkin", "qr_code", "status_checkin", "checkin_realizado_em", "checkin_por", "email_confirmacao_enviado_em", "erro_email_confirmacao", "origem", "navegador"],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
    ],
    widths: [24, 16, 34, 20, 24, 34, 22, 42, 34, 34, 52, 52, 20, 26, 24, 30, 34, 16, 70]
  },
  {
    name: "PRESENTES",
    rows: [
      ["codigo_presente", "titulo", "descricao", "imagem", "posicao_imagem", "valor", "ativo", "ordem"],
      ["P-001", "Petiscos Gourmet da Tereza", "Porque a verdadeira dona da casa também merece participar.", "assets/images/gifts/custom/1.jpeg", "52% 58%", 280, "TRUE", 1],
      ["P-002", "Afinação Matrimonial", "Contribuição para manter a sanfona afinada e o casamento também.", "assets/images/gifts/custom/2.jpeg", "50% 42%", 300, "TRUE", 2],
      ["P-003", "Aulas de Paciência para Conviver com um Artista", "Investimento contínuo.", "assets/images/gifts/custom/3.jpeg", "50% 36%", 400, "TRUE", 3],
      ["P-004", "Passagem para a Tereza também curtir a lua de mel", "Para ela entrar no clima da viagem junto com os noivos.", "assets/images/gifts/custom/4.jpeg", "50% 48%", 450, "TRUE", 4],
      ["P-005", "Fundo para manter o estoque de whey e creatina do noivo", "Não é porque casou que vai sair de forma.", "assets/images/gifts/custom/5.jpeg", "50% 40%", 500, "TRUE", 5],
      ["P-006", "Mini sanfona pro futuro Fernando Júnior", "Primeiro investimento musical da próxima geração.", "assets/images/gifts/custom/6.jpeg", "50% 0%", 600, "TRUE", 6],
      ["P-007", "Um Dia de Lua de Mel Sem Pensar em Boletos", "Sonho patrocinado.", "assets/images/gifts/custom/7.jpeg", "50% 48%", 700, "TRUE", 7],
      ["P-008", "Milhas para conseguir ter uma lua de mel em 2027", "Ajude os noivos a decolarem nessa próxima aventura.", "assets/images/gifts/custom/8.jpeg", "50% 44%", 1000, "TRUE", 8],
      ["P-009", "Compensação por Horas de Plantão Perdidas Planejando Casamento", "Investimento na terapia.", "assets/images/gifts/custom/9.jpeg", "50% 38%", 2000, "TRUE", 9],
      ["P-010", "Ajude em uma mesa de jantar 8 lugares pra você jantar conosco", "Um convite antecipado para muitos encontros no novo lar.", "assets/images/gifts/custom/10.jpeg", "50% 46%", 5000, "TRUE", 10],
      ["P-011", "Mostre o quanto você é fã do noivo e invista na carreira dele", "Para a noiva não precisar mais pegar plantão.", "assets/images/gifts/custom/11.jpeg", "50% 50%", 10000, "TRUE", 11]
    ],
    widths: [14, 34, 68, 44, 18, 16, 14, 14]
  },
  {
    name: "PEDIDOS_PRESENTES",
    rows: [
      ["criado_em", "codigo_pedido", "codigo_presente", "presente", "valor", "nome", "telefone", "email", "mensagem", "status", "provedor", "codigo_pagamento", "link_pagamento", "pago_em", "origem", "navegador"],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
    ],
    widths: [24, 24, 14, 34, 14, 32, 22, 34, 70, 16, 18, 28, 52, 24, 16, 70]
  },
  {
    name: "OPERADORES",
    rows: [
      ["usuario", "senha", "nome", "ativo", "observacoes"],
      ["portaria", "trocar-esta-senha", "Equipe Portaria", "TRUE", "Troque a senha antes do evento"]
    ],
    widths: [22, 28, 34, 14, 52]
  },
  {
    name: "GALERIA",
    rows: [
      ["codigo_imagem", "arquivo", "titulo", "texto_alternativo", "destaque", "ativo", "ordem"],
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
      ["codigo_mensagem", "nome", "mensagem", "ativo", "ordem"],
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
