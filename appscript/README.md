# Apps Script e planilha

Este site esta preparado para usar uma planilha Google como central de configuracao.

## Abas sugeridas

Crie uma planilha com estas abas:

- `CONFIG`: coluna `chave` com o identificador interno e coluna `valor` com o conteúdo.
- `PAGINAS`: textos editáveis por seção. Use campos como `secao`, `titulo`, `texto`, `ativo`.
- `CONVIDADOS`: base oficial de convidados. Campos recomendados: `codigo_convidado`, `nome`, `telefone`, `email`, `grupo`, `acompanhantes_permitidos`, `observacoes`, `status`.
- `RSVP`: sera preenchida automaticamente pelo formulario, sempre vinculada ao `codigo_convidado`. Quando houver telefone, a coluna `link_whatsapp` recebe o link direto para conversa. Quando houver email, o Apps Script envia uma confirmação visual simples pelo email da conta Google que publicou o Web App, com QR Code para quem confirmou presença.
- `PRESENTES`: lista exibida no site. Campos `gift_id`, `title`, `description`, `image`, `amount`, `enabled`, `sort_order`.
- `PEDIDOS_PRESENTES`: preenchida automaticamente quando alguem escolhe um presente e envia mensagem.
- `OPERADORES`: usuários autorizados a acessar `checkin.html` no dia do evento. Campos `usuario`, `senha`, `nome`, `ativo`, `observacoes`.
- `GALERIA`: campos sugeridos `title`, `image`, `enabled`.
- `MENSAGENS`: campos sugeridos `name`, `message`, `enabled`.

## Publicacao

1. Na planilha, abra `Extensoes > Apps Script`.
2. Cole o conteudo de `Code.gs`.
3. Salve o projeto.
4. Clique em `Implantar > Nova implantacao`.
5. Tipo: `App da Web`.
6. Executar como: `Eu`.
7. Quem pode acessar: `Qualquer pessoa`.
8. Copie a URL gerada.
9. Cole a URL em `js/config.js`, no campo `appScriptUrl`.

## Teste rapido

Abra a URL do Web App com:

```text
?action=config
```

O retorno esperado e um JSON com `ok: true`.

## Ações POST

O Apps Script aceita estas ações:

- `guests`: busca nomes na aba `CONVIDADOS` para o autocomplete. Exemplo: `?action=guests&q=fer`.
- `rsvp`: valida o convidado na aba `CONVIDADOS` e salva confirmação de presença na aba `RSVP`.
- `gift_intent`: salva presente escolhido, valor e mensagem na aba `PEDIDOS_PRESENTES`.
- `checkin_login`: valida usuário e senha da aba `OPERADORES`.
- `checkin_validate`: valida o QR Code, bloqueia uso duplicado e marca `checkin_realizado_em`.
- `checkin_search`: busca manual por convidados confirmados para plano B na portaria.

Na próxima etapa de pagamento, `PEDIDOS_PRESENTES` também receberá `provider`, `provider_payment_id`, `payment_url`, `status` e `paid_at`.
