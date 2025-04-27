import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  try {
    // Parse do corpo da requisição
    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (error) {
      return res.status(400).json({ message: "JSON inválido no corpo da requisição." });
    }

    // Carrega as credenciais do serviço do Google
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: scopes,
    });

    const sheets = google.sheets({ version: 'v4', auth });

    if (!body.data) {
      return res.status(400).json({ message: 'Dados não fornecidos no corpo da requisição.' });
    }

    const spreadsheetId = process.env.SPREADSHEET_ID;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [body.data],
      },
    });

    return res.status(200).json({ message: 'Gasto registrado com sucesso no Google Sheets!' });

  } catch (error) {
    console.error('Erro na função serverless:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}
