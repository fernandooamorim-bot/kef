# Apps Script e planilha

Este site esta preparado para usar uma planilha Google como central de configuracao.

## Abas sugeridas

Crie uma planilha com estas abas:

- `CONFIG`: coluna A com a chave, coluna B com o valor.
- `PAGINAS`: primeira linha como cabecalho. Use campos como `section`, `title`, `text`, `enabled`.
- `CONVIDADOS`: base oficial de convidados. Campos recomendados: `guest_id`, `name`, `phone`, `email`, `group`, `allowed_companions`, `notes`, `status`.
- `RSVP`: sera preenchida automaticamente pelo formulario, sempre vinculada ao `guest_id`.
- `PRESENTES`: lista exibida no site. Campos `gift_id`, `title`, `description`, `image`, `amount`, `enabled`, `sort_order`.
- `PEDIDOS_PRESENTES`: preenchida automaticamente quando alguem escolhe um presente e envia mensagem.
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

Na próxima etapa de pagamento, `PEDIDOS_PRESENTES` também receberá `provider`, `provider_payment_id`, `payment_url`, `status` e `paid_at`.
