# Buffet Alabarse — Landing Page V2

Versão refeita com foco em conversão para WhatsApp.

## O que mudou

- Hero reposicionada para benefício: "Sua festa completa. Você só precisa aproveitar."
- CTA direto para WhatsApp, sem modal Rita/Cláudio.
- Distribuição automática e persistente dos visitantes entre Rita e Cláudio.
- Prova social com nota 5,0 do Google e link para avaliações.
- Nova seção de experiência com galeria otimizada.
- Seção "Como funciona" para reduzir insegurança.
- Seção de eventos: casamento, aniversário/bodas e corporativo.
- Foto da equipe adicionada à seção institucional.
- Orçamento express com só 4 informações.
- CTA fixo no mobile.
- Header reduzido para ocupar menos tela.
- Imagens em WebP e `loading="lazy"` para melhorar performance.
- Eventos de funil enviados ao `dataLayer` e `gtag`.
- Integração opcional para salvar leads no Google Sheets antes de abrir o WhatsApp.

## Google Ads — falta apenas o Conversion Label

O projeto já possui o ID `AW-17899946680`.

Para registrar o clique como conversão nativa do Google Ads, abra `script.js` e preencha:

```js
ADS_CONVERSION_SEND_TO: "AW-17899946680/SEU_LABEL_AQUI"
```

O `SEU_LABEL_AQUI` é fornecido pelo Google Ads dentro da ação de conversão.

## Salvar leads no Google Sheets

O site funciona normalmente sem essa integração. Para registrar o formulário antes da abertura do WhatsApp:

1. Crie uma planilha no Google Sheets.
2. Abra `Extensões > Apps Script`.
3. Cole o conteúdo de `integrations/google-apps-script/Code.gs`.
4. Faça uma implantação como **Aplicativo da Web**.
5. Execute como você e permita acesso a qualquer pessoa.
6. Copie a URL final `/exec`.
7. Em `script.js`, preencha:

```js
LEAD_ENDPOINT: "SUA_URL_DO_APPS_SCRIPT"
```

## Contatos usados

- Rita: 14 99613-9532
- Cláudio: 14 99138-0914

A primeira visita recebe um dos dois atendimentos aleatoriamente e o navegador mantém o mesmo contato nas visitas seguintes. Isso remove o atrito do antigo modal sem fazer o mesmo cliente alternar entre atendentes.

## Deploy

O projeto é estático. Pode substituir os arquivos do repositório atual e publicar novamente no Vercel/GitHub Pages, conforme a hospedagem que já utiliza.
