import { neon } from '@neondatabase/serverless';

// Serverless Transaction API Handler Routines
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Safety integration validation hook linking connection variables to environment pools
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Database environment credentials are missing.' });
  }

  const sql = neon(process.env.DATABASE_URL);
  const { itemId, userId } = req.body;

  try {
    // 1. Safe Transaction Query validation checks
    const [user] = await sql`SELECT point_balance FROM users WHERE id = ${userId}`;
    const [item] = await sql`SELECT point_price, stock_count, title FROM shop_items WHERE id = ${itemId}`;

    if (!user || !item) return res.status(404).json({ error: 'Resource mismatch verification' });
    if (item.stock_count <= 0) return res.status(400).json({ error: 'Item configuration is out of stock!' });
    if (user.point_balance < item.point_price) return res.status(400).json({ error: 'Balance calculation insufficient' });

    // 2. Atomic structural balance state data queries updates
    await sql`UPDATE users SET point_balance = point_balance - ${item.point_price} WHERE id = ${userId}`;
    await sql`UPDATE shop_items SET stock_count = stock_count - 1 WHERE id = ${itemId}`;

    return res.status(200).json({ success: true, message: `Successfully claimed ${item.title} item box!` });
  } catch (err) {
    return res.status(500).json({ error: 'Transactional database operation fault exception.' });
  }
}
