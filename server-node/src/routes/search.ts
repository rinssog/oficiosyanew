import { Router } from 'express';
import { searchSuggest } from '../services/search.js';

const router = Router();

router.get('/search/suggest', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const rubro = typeof req.query.rubro === 'string' ? req.query.rubro : undefined;
  const subrubro = typeof req.query.subrubro === 'string' ? req.query.subrubro : undefined;
  const result = await searchSuggest(q || '', { rubro, subrubro });
  res.json({ ok: true, suggestions: (result as any).hits || [] });
});

export default router;

