import express from 'express';
import type { Request, Response } from 'express';
import {
  discoverRestaurants,
  chatAssistant,
  generateTTS,
  generateDishVisualization,
} from './geminiService.ts';

const router = express();

router.use(express.json());

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AroundMe AI API', timestamp: new Date().toISOString() });
});

// Main discovery endpoint
router.post('/discover', async (req: Request, res: Response) => {
  try {
    const { query, location, filters, mode } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const defaultLocation = location || { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco, CA' };
    const result = await discoverRestaurants(
      query,
      defaultLocation,
      filters || {},
      mode || 'maps'
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/discover:', error);
    res.status(500).json({ error: error.message || 'Failed to discover restaurants' });
  }
});

// Floating AI assistant chat
router.post('/chat-assistant', async (req: Request, res: Response) => {
  try {
    const { message, currentQuery, places, location } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const defaultLocation = location || { latitude: 37.7749, longitude: -122.4194 };
    const reply = await chatAssistant(
      message,
      currentQuery || '',
      places || [],
      defaultLocation
    );

    res.json(reply);
  } catch (error: any) {
    console.error('Error in /api/chat-assistant:', error);
    res.status(500).json({ error: error.message || 'Assistant error' });
  }
});

// Voice TTS endpoint
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const audioBase64 = await generateTTS(text);
    res.json({ audioBase64 });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    res.status(500).json({ error: error.message || 'TTS generation error' });
  }
});

// High quality dish image visualization (1K, 2K, 4K affordance)
router.post('/visualize-craving', async (req: Request, res: Response) => {
  try {
    const { dishDescription, imageSize } = req.body;
    if (!dishDescription) {
      return res.status(400).json({ error: 'dishDescription is required' });
    }

    const size = (imageSize === '2K' || imageSize === '4K' || imageSize === '1K') ? imageSize : '1K';
    const imageUrl = await generateDishVisualization(dishDescription, size);

    res.json({ imageUrl });
  } catch (error: any) {
    console.error('Error in /api/visualize-craving:', error);
    res.status(500).json({ error: error.message || 'Image generation error' });
  }
});

export default router;
