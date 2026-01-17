import express from 'express';
import validator from 'validator';
const router = express.Router();
import Feedback from '../model/Feedback.js';


// POST /api/feedback
router.post('/', async (req, res) => {
  try {
    const nameRaw = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const emailRaw = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const messageRaw = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!nameRaw || nameRaw.length > 120) {
      return res.status(400).json({ error: 'Provide a valid name under 120 characters.' });
    }

    if (!validator.isEmail(emailRaw)) {
      return res.status(400).json({ error: 'Provide a valid email address.' });
    }

    if (!messageRaw || messageRaw.length > 2000) {
      return res.status(400).json({ error: 'Message must be between 1 and 2000 characters.' });
    }

    // Sanitize to strip scripts while preserving readable text
    const sanitizedFeedback = {
      name: validator.escape(validator.stripLow(nameRaw, true)),
      email: emailRaw,
      message: validator.escape(validator.stripLow(messageRaw, true))
    };

    const newFeedback = new Feedback(sanitizedFeedback);
    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
