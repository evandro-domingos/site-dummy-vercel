import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  let body = {};

  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (error) {
    return res.status(400).json({ message: 'JSON inválido no corpo da requisição.' });
  }

  if (!Array.isArray(body)) {
    return res.status(400).json({ message: 'Formato de dados inválido. Esperado um array de itens.' });
  }

  try {
    const serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SPREADSHEET_ID;

    const values = body.map(item => [
      item.data,
      item.produto,
      item.quantidade,
      item.valor,
      item.forma_pagamento,
      item.onde,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      },
    });

    return res.status(200).json({ message: 'Gastos registrados com sucesso no Google Sheets!' });
  } catch (error) {
    console.error('Erro na função serverless:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
}
