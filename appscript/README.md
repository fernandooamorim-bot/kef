# Apps Script e planilha

Este site esta preparado para usar uma planilha Google como central de configuracao.

## Abas sugeridas

Crie uma planilha com estas abas:

- `CONFIG`: coluna `chave` com o identificador interno e coluna `valor` com o conteúdo.
- `PAGINAS`: textos editáveis por seção. Use campos como `secao`, `titulo`, `texto`, `ativo`.
- `CONVIDADOS`: base oficial de convidados. Campos recomendados: `codigo_convidado`, `nome`, `telefone`, `email`, `grupo`, `acompanhantes_permitidos`, `observacoes`, `status`.
- `RSVP`: sera preenchida automaticamente pelo formulario, sempre vinculada ao `codigo_convidado`. Quando houver telefone, a coluna `link_whatsapp` recebe o link direto para conversa. Quando houver email, o Apps Script envia uma confirmação visual simples pelo email da conta Google que publicou o Web App, com QR Code para quem confirmou presença.

A página `admin.html` também permite importar até 300 convidados por vez, usando apenas nome e quantidade de acompanhantes. A prévia sinaliza dados inválidos e possíveis nomes repetidos antes de gravar; a importação é confirmada em uma única operação e cria os códigos dos convidados automaticamente.

Para exibir, após uma confirmação de presença, o botão individual **Ver convite digital**, adicione em `CONFIG` a chave `rsvp_show_digital_invite` com o valor `sim`. Com a chave ausente ou vazia, o botão fica oculto; o e-mail de confirmação continua sendo enviado normalmente.

Os acessos de `admin.html` e `checkin.html` permanecem ativos após atualizar a página, sem salvar a senha no aparelho. A sessão é invalidada automaticamente se o operador for desativado, removido ou tiver usuário/senha alterados na aba `OPERADORES`.
- `PRESENTES`: lista exibida no site. Campos `gift_id`, `title`, `description`, `image`, `amount`, `enabled`, `sort_order`.
- `PEDIDOS_PRESENTES`: preenchida automaticamente quando alguem escolhe um presente e envia mensagem.
- `OPERADORES`: usuários autorizados a acessar `checkin.html` no dia do evento. Campos `usuario`, `senha`, `nome`, `ativo`, `observacoes`.
- `GALERIA`: campos sugeridos `title`, `image`, `enabled`.
- `MENSAGENS`: campos sugeridos `name`, `message`, `enabled`.

## Publicacao

1. Na planilha, abra `Extensoes > Apps Script`.
2. Cole o conteudo de `Code.gs`.
3. Cole o conteudo de `appsscript.json` no manifesto do projeto.
4. Salve o projeto.
5. Execute manualmente `testarAutorizacaoPlanilha` e aceite as permissoes solicitadas.
6. Execute manualmente `testarAutorizacaoEmail` para validar tambem o envio de email.
7. Clique em `Implantar > Nova implantacao` ou `Gerenciar implantacoes > Editar`.
8. Tipo: `App da Web`.
9. Executar como: `Eu`.
10. Quem pode acessar: `Qualquer pessoa`.
11. Em alteracoes futuras, selecione sempre `Nova versao` antes de implantar.
12. Copie a URL gerada.
13. Cole a URL em `js/config.js`, no campo `appScriptUrl`.

## Teste rapido

Abra a URL do Web App com:

```text
?action=config
```

O retorno esperado e um JSON com `ok: true`.

Para verificar somente a disponibilidade da confirmação, use `?action=rsvp_status`.
Para verificar se o Web App responde sem ler a planilha, use `?action=health`.
Depois de atualizar `Code.gs`, publique uma **nova versão na implantação existente**. Confirme que `?action=rsvp_status` retorna `ok: true` antes de distribuir a página atualizada. A URL do Web App deve continuar a mesma configurada em `js/config.js`.

A busca pública usa um índice temporário no Apps Script por até 60 segundos. Confirmações, cancelamentos e inclusões feitas pelo próprio sistema invalidam esse índice. Edições manuais na planilha aparecem após o prazo máximo do índice. A confirmação e o check-in consultam os registros atuais.

## Ações POST

O Apps Script aceita estas ações:

- `guests`: busca nomes na aba `CONVIDADOS` para o autocomplete. Exemplo: `?action=guests&q=fer`.
- `rsvp`: valida o convidado na aba `CONVIDADOS` e salva confirmação de presença na aba `RSVP`.
- `gift_intent`: salva presente escolhido, valor e mensagem na aba `PEDIDOS_PRESENTES`.
- `checkin_login`: valida usuário e senha da aba `OPERADORES`.
- `checkin_validate`: valida o QR Code, bloqueia uso duplicado e marca `checkin_realizado_em`.
- `checkin_search`: busca manual por convidados confirmados para plano B na portaria.
- `checkin_sync`: entrega ao aparelho autorizado a lista atual de confirmações para uso offline.

## Operação da portaria

Antes de abrir a recepção, cada aparelho da equipe deve entrar em `checkin.html` com internet e clicar em **Atualizar lista**. Isso baixa a lista de confirmações para aquele aparelho. A lista offline pode ser usada por até duas horas após a sincronização.

Quando houver internet, a validação é feita diretamente na planilha e bloqueia leituras simultâneas do mesmo QR Code. Em caso de queda, o operador pode marcar **Permitir validação offline neste aparelho** após atualizar a lista. A entrada offline fica registrada no aparelho e é sincronizada quando a conexão voltar. Uma entrada já validada ou cancelada em outro aparelho aparece como conflito e exige conferência manual. Para evitar divergências, prefira uma única fila/dispositivo durante a queda.

Na próxima etapa de pagamento, `PEDIDOS_PRESENTES` também receberá `provider`, `provider_payment_id`, `payment_url`, `status` e `paid_at`.

### Painel de presentes no admin

A página `admin.html` abre sempre em **Convidados**. A área **Presentes** consulta a ação autenticada `admin_gifts`, que lê `PEDIDOS_PRESENTES` apenas quando a área é aberta ou atualizada. Depois de atualizar `Code.gs`, publique uma nova versão da implantação existente do Apps Script (mantendo a URL configurada no site) e publique os arquivos HTML, CSS e JS alterados.

O painel mostra remetente, presente, mensagem, valor, data de criação e forma de pagamento, com busca, filtro de status e ordenação por data, valor ou remetente. O padrão é a data de criação mais recente; registros sem data válida ficam no final. O provedor `pix` é exibido como Pix e `pagbank` como Cartão, conforme o fluxo atual de escolha do presente.

O fluxo atual registra intenções de pagamento e não confirma recebimentos automaticamente. O total recebido usa registros com `paid_at`/`pago_em` preenchido ou status `paid`, `pago`, `approved`, `aprovado`, `confirmed` ou `confirmado`. Registros cancelados, recusados ou reembolsados não entram nesse total. Use **Confirmar recebimento** no painel após conferir o crédito na sua conta. A ação autenticada `admin_confirm_gift` grava `pago` e a data da confirmação em `pago_em`. O diálogo mostra um indicador de processamento e bloqueia novos cliques durante a gravação. Repetir uma solicitação preserva a data já salva e não duplica o recebimento. Pedidos cancelados ou reembolsados não podem ser confirmados por essa ação. Atualize a implantação do Apps Script para habilitar o botão.

O resumo também mostra o **valor pendente** e o **total ativo** (recebido + pendente), sempre sobre todos os registros, sem depender dos filtros. Cancelados e outros status ficam fora desses valores. A ação autenticada `admin_cancel_gift` permite cancelar uma duplicidade pendente, com confirmação e loading visual, preservando o pedido na planilha e no filtro **Cancelados**. Ela não realiza estornos nem cancela cobranças externas. Pedidos já pagos são bloqueados; uma repetição do cancelamento é segura. Atualize a implantação para disponibilizar a capacidade `cancelGift`.

### Presentes recebidos fora do site

A ação autenticada `admin_create_gift` registra nome, descrição, tipo e data, sem telefone ou e-mail. Pix, transferência e dinheiro exigem valor positivo e entram como pagos. Presentes físicos usam `provider=manual_physical`, status `recebido` e valor vazio: entram na contagem e no histórico, sem compor totais financeiros. A origem é `admin_manual`. O código `MANUAL-<requestId>` torna as novas tentativas do mesmo cadastro idempotentes. O formulário mantém o mesmo pedido após falha de conexão; o servidor rejeita datas inválidas ou futuras. Não é necessário alterar manualmente as colunas da planilha.
