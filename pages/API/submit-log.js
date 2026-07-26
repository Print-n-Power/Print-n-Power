// pages/api/submit-log.js - Writing New Print Progress Logs
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const sql = neon(process.env.DATABASE_URL);
  const { text, userId } = req.body;

  try {
    const scrapsReward = 40; // Base scrap tokens issued per logging action
    
    // Insert log entry and increment user scrap balance account
    const [newLog] = await sql`
      INSERT INTO logs (user_id, text, scraps_gained) 
      VALUES (${userId}, ${text}, ${scrapsReward}) 
      RETURNING id, text, scraps_gained, timestamp
    `;
    await sql`UPDATE users SET scrap_balance = scrap_balance + ${scrapsReward} WHERE id = ${userId}`;

    return res.status(200).json({ success: true, newLog, pointsGained: scrapsReward });
  } catch (err) {
    return res.status(500).json({ error: 'Could not append logging sequence rows.' });
  }
}
