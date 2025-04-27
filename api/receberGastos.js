import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  let rawBody = '';
  
  try {
    // Lê manualmente o body
    await new Promise((resolve, reject) => {
      req.on('data', chunk => {
        rawBody += chunk.toString();
      });
      req.on('end', resolve);
      req.on('error', reject);
    });

    const { data } = JSON.parse(rawBody);

    if (!data) {
      return res.status(400).json({ message: 'Dados não fornecidos no corpo da requisição.' });
    }

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: scopes,
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });

    return res.status(200).json({ message: 'Gasto registrado com sucesso no Google Sheets!' });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}
