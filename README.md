# Site do casamento Krisna & Fernando

Site estatico em HTML, CSS e JavaScript, preparado para deploy no Netlify e para configuracao futura por Google Sheets + Apps Script.

## Estrutura

```text
site-casamento/
  index.html
  css/
  js/
  assets/
  appscript/
  netlify.toml
```

## Rodar localmente

Na pasta `site-casamento`, rode:

```bash
python3 -m http.server 4173
```

Depois abra:

```text
http://localhost:4173
```

## Configuracao principal

Edite `js/config.js` para trocar:

- `appScriptUrl`: URL do Web App publicado no Apps Script.
- `weddingDate`: data/hora oficial da contagem regressiva.
- `gallery`: ordem das fotos.
- `mapsUrl`: link de rota.

O topo usa `heroVideo` como vídeo de fundo em loop, com fallback automático para `heroImage`.

O site funciona sem Apps Script, usando fallback local. Nesse modo, o RSVP fica salvo apenas no navegador para teste.

## Apps Script

Veja `appscript/README.md`. O arquivo `appscript/Code.gs` ja contem uma API inicial com:

- `doGet` para configuracoes publicas.
- `doGet` para autocomplete da aba `CONVIDADOS`.
- `doPost` para RSVP validado pela lista oficial de convidados.
- `doPost` para registrar presente escolhido e mensagem na aba `PEDIDOS_PRESENTES`.
- retorno JSON padronizado.

## RSVP e convidados

O formulario de presença usa a aba `CONVIDADOS` como fonte oficial. O convidado digita o início do nome, seleciona uma sugestão real e só então vê as opções de confirmação.

Na aba `CONVIDADOS`, use:

- `guest_id`: identificador único, como `KF-001`.
- `name`: nome exibido no autocomplete.
- `group`: família, amigos, trabalho ou outro grupo interno.
- `allowed_companions`: `0` para sem acompanhante, `1` ou mais para liberar acompanhante.
- `status`: deixe como `pendente` ou `ativo`; use `cancelado` ou `inativo` para ocultar da busca.

Quando houver acompanhante permitido, o site pergunta se a pessoa levará acompanhante e só pede o nome se a resposta for sim.

## Presentes

A lista de presentes e simbolica. Cada item vem da aba `PRESENTES`, com:

- `gift_id`
- `title`
- `description`
- `image`
- `amount`
- `enabled`
- `sort_order`

Quando alguem escolhe um presente, o site abre um formulario com nome, telefone, email e mensagem. Nesta fase, o registro e salvo em `PEDIDOS_PRESENTES` com status `created`. Na proxima etapa, esse mesmo registro sera conectado ao PagBank ou Mercado Pago para gerar Pix/cartao e atualizar o status de pagamento.

## Assets

As fotos originais foram convertidas para:

- `assets/images/gallery`: imagens reduzidas para galeria.
- `assets/images/thumbs`: miniaturas.
- `assets/images/optimized`: imagens especificas do layout.

O monograma e a estampa foram extraidos dos PDFs para `assets/brand`.

## Video

O video original permanece fora da pasta do site, em:

```text
../Design/OBQH1913.mp4
```

Foi gerada uma versao otimizada e publicada como `.mp4` para melhor compatibilidade com GitHub Pages e navegadores:

```text
assets/video/intro-casal-v2.mp4
```

A versao otimizada e usada no HTML. Antes do deploy final, ainda pode valer gerar uma versao WebM adicional com `ffmpeg`, por exemplo:

```bash
ffmpeg -i Design/OBQH1913.mp4 -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 96k assets/video/intro-casal-v2.mp4
ffmpeg -i Design/OBQH1913.mp4 -vf "scale='min(1280,iw)':-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -c:a libopus assets/video/intro-casal.webm
```

## Deploy no Netlify

1. Suba a pasta `site-casamento` para o repositorio Git.
2. No Netlify, configure o publish directory como a propria pasta do site.
3. Se o repositorio tiver a pasta raiz acima de `site-casamento`, configure o base directory como `site-casamento`.
4. Aponte o dominio `krisnaefernando.com` no painel do Netlify.

## Proximos ajustes recomendados

- Conectar pagamentos da lista de presentes ao PagBank ou Mercado Pago.
- Publicar o Apps Script e inserir a URL em `js/config.js`.
- Revisar a ordem definitiva da galeria.
