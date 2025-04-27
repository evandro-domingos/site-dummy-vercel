import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  const body = req.body;

  if (!body.data || !body.produto || !body.quantidade || !body.valor || !body.formaPagamento || !body.onde) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Gastos!A:F', // A aba Gastos, colunas A até F
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            body.data,
            body.produto,
            body.quantidade,
            body.valor,
            body.formaPagamento,
            body.onde
          ]
        ]
      }
    });

    return res.status(200).json({ message: 'Gasto recebido e adicionado à planilha!' });
  } catch (error) {
    console.error('Erro ao adicionar gasto:', error);
    return res.status(500).json({ message: 'Erro interno ao adicionar gasto.' });
  }
}
