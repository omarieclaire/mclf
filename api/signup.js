// Save this as api/signup.js in your Vercel project
// (create an api folder in your project root if it doesn't exist)

const { google } = require('googleapis');
const nodemailer = require('nodemailer');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Signups';

// Email transporter (using a simple email service)
// For this to work, you'll need to set up nodemailer with your email service
// For now, we'll just log the confirmation - you can update this later
const sendConfirmationEmail = async (email, name, date, time) => {
  // You can integrate this with SendGrid, Mailgun, or your email provider
  // For now, just console log
  console.log(`Confirmation email would be sent to ${email}`);
};

const CAPACITY = 4;
const VALID_TIMES = ['8:30pm', '9:00pm', '9:30pm', '10:00pm', '10:30pm', '11:00pm'];
// Flexible signups ("I don't know yet") aren't tied to one date/time, so
// they never count against a slot's cap - there's no limit on these.
const UNSURE = 'unsure';

// Sum of people already booked for a date+time slot, not just number of
// signup rows - one signup can bring guests, so a slot can fill up in
// fewer than 4 signups.
const getSlotCount = async (date, time) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:G`,
    });

    const rows = response.data.values || [];
    return rows
      .slice(1)
      .filter((row) => row[2] === date && row[3] === time)
      .reduce((sum, row) => sum + (parseInt(row[5], 10) || 1), 0);
  } catch (error) {
    console.error('Error reading sheet:', error);
    throw error;
  }
};

const addSignup = async (name, email, date, time, partySize, notes) => {
  try {
    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[name, email, date, time, timestamp, partySize, notes || '']],
      },
    });

    return true;
  } catch (error) {
    console.error('Error writing to sheet:', error);
    throw error;
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { name, email, date, time, notes } = req.body;
    const partySize = parseInt(req.body.partySize, 10) || 1;

    if (!name || !email || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isFlexible = date === UNSURE || time === UNSURE;

    if (!isFlexible && !VALID_TIMES.includes(time)) {
      return res.status(400).json({ error: 'Invalid time slot' });
    }

    if (partySize < 1 || partySize > CAPACITY) {
      return res.status(400).json({ error: `Group size must be between 1 and ${CAPACITY}` });
    }

    try {
      if (!isFlexible) {
        // Check current count for this slot
        const count = await getSlotCount(date, time);
        const spotsLeft = CAPACITY - count;

        if (partySize > spotsLeft) {
          return res.status(400).json({
            error: spotsLeft <= 0 ? 'This time slot is full' : `Only ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left for that time`,
          });
        }
      }

      // Add the signup
      await addSignup(name, email, date, time, partySize, notes);

      // Send confirmation email (optional)
      await sendConfirmationEmail(email, name, date, time);

      return res.status(200).json({ success: true, message: 'Signed up!' });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
