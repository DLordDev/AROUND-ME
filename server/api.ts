import express from 'express';
import type { Request, Response } from 'express';
import {
  discoverRestaurants,
  chatAssistant,
  generateTTS,
  generateDishVisualization,
} from './geminiService.ts';
import { searchGooglePlaces } from './googlePlacesService.ts';

const router = express();

router.use(express.json());

// Public configuration endpoint for Google Client ID
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    googleClientId:
      process.env.GOOGLE_CLIENT_ID ||
      process.env.VITE_GOOGLE_CLIENT_ID ||
      '716617446825-v665jsuh1nfl0o9l9gbupu78gtbckq4q.apps.googleusercontent.com',
  });
});

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AroundMe AI API', timestamp: new Date().toISOString() });
});

// Places Endpoint (Fetches real Google Places with authentic photos)
const handlePlaces = async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || (req.body.query as string) || 'Top places in Benin City';
    const city = (req.query.city as string) || (req.body.city as string) || 'Benin City';
    const lat = parseFloat((req.query.lat as string) || (req.body.lat as string) || '6.3350');
    const lng = parseFloat((req.query.lng as string) || (req.body.lng as string) || '5.6037');

    let places = await searchGooglePlaces(query, lat, lng, city);
    if (!places || places.length === 0) {
      const fallback = await discoverRestaurants(query, { latitude: lat, longitude: lng, city }, {}, 'maps');
      places = fallback.places as any;
    }

    res.json({ places: places || [] });
  } catch (error: any) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: error.message || 'Places fetch error' });
  }
};

router.get('/places', handlePlaces);
router.post('/places', handlePlaces);

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

// Floating AI assistant chat (support both /chat-assistant and /assistant-chat)
const handleChatAssistant = async (req: Request, res: Response) => {
  try {
    const questionText = req.body.question || req.body.message || '';
    const query = req.body.currentQuery || req.body.query || '';
    const currentPlaces = req.body.currentPlaces || req.body.places || [];
    const loc = req.body.userLocation || req.body.location || { latitude: 6.3350, longitude: 5.6037, city: 'Benin City' };

    if (!questionText.trim()) {
      return res.status(400).json({ error: 'Message or question is required.' });
    }

    const reply = await chatAssistant(
      questionText,
      query,
      currentPlaces,
      loc
    );

    res.json({
      reply: reply.text || (reply as any).reply,
      action: reply.action,
      placeIds: reply.filteredPlaceIds || (reply as any).placeIds,
    });
  } catch (error: any) {
    console.error('Error in assistant chat:', error);
    res.status(500).json({ error: error.message || 'Assistant error' });
  }
};

router.post('/chat-assistant', handleChatAssistant);
router.post('/assistant-chat', handleChatAssistant);

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
