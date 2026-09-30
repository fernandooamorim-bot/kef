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
