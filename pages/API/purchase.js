// pages/api/dashboard-data.js - Fetching Platform States
import { neon } from '@neondatabase/serverless';
export const runtime = 'edge'; // Tells Cloudflare to run this dynamically on its serverless edge

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!process.env.DATABASE_URL) return res.status(500).json({ error: 'Database environment credentials missing.' });

  const sql = neon(process.env.DATABASE_URL);
  const userId = 1; // Testing defaults matching seeded records

  try {
    // Query individual rows simultaneously 
    const [user] = await sql`SELECT scrap_balance FROM users WHERE id = ${userId}`;
    const logs = await sql`SELECT id, text, scraps_gained, timestamp FROM logs WHERE user_id = ${userId} ORDER BY timestamp DESC`;
    const shopItems = await sql`SELECT id, title AS name, scrap_price AS price, stock_count AS stock FROM shop_items ORDER BY id ASC`;

    return res.status(200).json({
      scraps: user ? user.scrap_balance : 0,
      logs: logs || [],
      shopItems: shopItems || []
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to stream platform metric datasets.' });
  }
}
