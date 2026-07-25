import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database URL environment missing' });

  const sql = neon(process.env.DATABASE_URL);
  const { itemId, userId } = req.body;

  try {
    const [user] = await sql`SELECT scrap_balance FROM users WHERE id = ${userId}`;
    const [item] = await sql`SELECT scrap_price, stock_count, title FROM shop_items WHERE id = ${itemId}`;

    if (!user || !item) return res.status(404).json({ error: 'Resource mismatch verification' });
    if (item.stock_count <= 0) return res.status(400).json({ error: 'Item configuration is out of stock!' });
    if (user.scrap_balance < item.scrap_price) return res.status(400).json({ error: 'Scrap balance calculation insufficient' });

    // Deduct Scraps and update row parameters
    await sql`UPDATE users SET scrap_balance = scrap_balance - ${item.scrap_price} WHERE id = ${userId}`;
    await sql`UPDATE shop_items SET stock_count = stock_count - 1 WHERE id = ${itemId}`;

    return res.status(200).json({ success: true, message: `Successfully claimed ${item.title} using Scraps!` });
  } catch (err) {
    return res.status(500).json({ error: 'Transactional database operation fault exception.' });
  }
}
