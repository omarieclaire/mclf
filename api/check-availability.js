// Save this as api/check-availability.js in your Vercel project

const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Signups';

const dates = [
  'Aug 15, 2026',
  'Aug 17, 2026',
  'Aug 18, 2026',
  'Aug 19, 2026',
];

// 20 minutes to play plus a 10 minute buffer between groups, so slots run
// every half hour and the last one still wraps up by the 11:30pm close.
const times = ['8:30pm', '9:00pm', '9:30pm', '10:00pm', '10:30pm', '11:00pm'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:G`,
      });

      const rows = response.data.values || [];

      // Sum people booked per date+time slot, not just number of signup
      // rows - one signup can bring guests, filling more than one spot.
      const slots = {};
      dates.forEach((date) => {
        slots[date] = {};
        times.forEach((time) => {
          slots[date][time] = rows
            .slice(1)
            .filter((row) => row[2] === date && row[3] === time)
            .reduce((sum, row) => sum + (parseInt(row[5], 10) || 1), 0);
        });
      });

      return res.status(200).json({ slots });
    } catch (error) {
      console.error('Error checking availability:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
