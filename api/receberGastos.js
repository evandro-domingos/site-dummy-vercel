export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido. Use POST.' });
  }

  const { data, produto, quantidade, valor, formaPagamento, onde } = req.body;

  if (!data || !produto || !quantidade || !valor || !formaPagamento || !onde) {
    return res.status(400).json({ message: 'Dados incompletos. Verifique o JSON enviado.' });
  }

  console.log('Gasto recebido:', { data, produto, quantidade, valor, formaPagamento, onde });

  return res.status(200).json({ message: 'Gasto recebido com sucesso!' });
}
