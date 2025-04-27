import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  let body = '';

  try {
    // Captura manual dos dados enviados na requisição
    for await (const chunk of req) {
      body += chunk;
    }

    body = JSON.parse(body); // Transforma em objeto
  } catch (error) {
    console.error('Erro ao ler/parsing do body:', error);
    return res.status(400).json({ message: 'Erro ao interpretar o corpo da requisição.', error: error.message });
  }

  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const { data } = body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: 'Formato de dados inválido. Esperado um array.' });
    }

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
    console.error('Erro na função serverless:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}
