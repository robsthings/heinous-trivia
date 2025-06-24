import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock API endpoints for testing
app.get('/api/trivia-questions/:hauntId', (req, res) => {
  const mockQuestions = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    question: `Horror question ${i + 1}?`,
    answers: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
    correctAnswer: 0,
    difficulty: 'medium'
  }));
  res.json(mockQuestions);
});

app.get('/api/haunt-config/:hauntId', (req, res) => {
  const mockConfig = {
    id: req.params.hauntId,
    name: req.params.hauntId === 'headquarters' ? 'Headquarters' : 'Sorcerer\'s Lair',
    theme: 'horror',
    backgroundColor: '#000000',
    primaryColor: '#8B0000'
  };
  res.json(mockConfig);
});

app.get('/api/ads/:hauntId', (req, res) => {
  const mockAds = [
    {
      id: 1,
      title: 'Spooky Ad',
      content: 'Visit our haunted attraction!',
      link: 'https://example.com'
    }
  ];
  res.json(mockAds);
});

app.get('/api/branding/assets', (req, res) => {
  res.json([]);
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});