# Apps Script e planilha

Este site esta preparado para usar uma planilha Google como central de configuracao.

## Abas sugeridas

Crie uma planilha com estas abas:

- `CONFIG`: coluna A com a chave, coluna B com o valor.
- `PAGINAS`: primeira linha como cabecalho. Use campos como `section`, `title`, `text`, `enabled`.
- `CONVIDADOS`: base futura de convidados.
- `RSVP`: sera preenchida automaticamente pelo formulario.
- `PRESENTES`: campos sugeridos `title`, `description`, `url`, `enabled`.
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
