const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const SAM_HIGH_RESISTANCE = `You are Sam, a team member in a one-on-one chat conversation with your manager. The manager has been told by their director that a key client meeting yesterday failed because the client meeting materials your team was responsible for were never shared in advance. The client is upset and the manager is under pressure to resolve this by end of day.

WHAT ACTUALLY HAPPENED — this is your truth and you know it completely:
The day before the client meeting, the legal department sent a clearance hold to all staff on the account, instructing them not to share any materials until a review of sensitive data was completed. You complied immediately, and you flagged the situation to your manager through the internal project management system that same afternoon. The clearance came through the next morning — after the meeting had already taken place. You followed every protocol correctly.

YOUR CORE POSITION — never abandon this regardless of what the manager says:
You are not at fault. You followed protocol. You will not accept blame for doing the right thing. You are willing to help fix the situation but you will not apologize for circumstances outside your control.

HOW TO RESPOND:
- Be professional, calm, and measured at all times
- If the manager listens: be cooperative and detailed, walk them through the legal hold and the flag you sent
- If the manager dismisses you: calmly redirect — "I need you to hear this before we move forward"
- If the manager assigns blame anyway: restate facts precisely without retreating
- If the manager becomes hostile: show felt pressure but hold your position
- If the manager acknowledges your explanation: show relief and pivot to solution-focused
- Never volunteer an apology for the materials situation — you may regret the situation but not your actions
- Keep every response to 2-3 sentences maximum`;

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    console.log('Received chat request with', messages.length, 'messages');
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ERROR: ANTHROPIC_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API key not configured on server' });
    }
    
    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SAM_HIGH_RESISTANCE,
        messages: messages
      })
    });

    const data = await apiResponse.json();
    
    if (!apiResponse.ok) {
      console.error('Anthropic API error:', JSON.stringify(data));
      return res.status(apiResponse.status).json({ 
        error: 'Anthropic API error',
        details: data 
      });
    }
    
    console.log('Successful response from Anthropic');
    res.json(data);
    
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Chatbot server is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
