/**
 * Integração opcional para registrar o orçamento express em uma Google Sheet.
 * 1) Crie uma planilha no Google Sheets.
 * 2) Extensões > Apps Script.
 * 3) Cole este código.
 * 4) Implantar > Nova implantação > Aplicativo da Web.
 * 5) Executar como: você. Quem tem acesso: qualquer pessoa.
 * 6) Copie a URL /exec e cole em CONFIG.LEAD_ENDPOINT no script.js do site.
 */
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Leads') || ss.insertSheet('Leads');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Recebido em',
      'Data/hora do navegador',
      'Evento',
      'Data do evento',
      'Convidados',
      'Cidade',
      'Atendimento',
      'Origem'
    ]);
  }

  var data = {};
  try {
    data = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    data = {};
  }

  sheet.appendRow([
    new Date(),
    data.timestamp || '',
    data.evento || '',
    data.data || '',
    data.pessoas || '',
    data.cidade || '',
    data.contact_assigned || '',
    data.source || ''
  ]);

  return ContentService.createTextOutput('ok');
}
