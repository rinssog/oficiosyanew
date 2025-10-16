import { MeiliSearch } from 'meilisearch';

let client: MeiliSearch | null = null;
function getClient() {
  if (client) return client;
  try {
    client = new MeiliSearch({ host: process.env.MEILI_HOST || 'http://localhost:7700', apiKey: process.env.MEILI_API_KEY || undefined });
    return client;
  } catch {
    return null;
  }
}

export async function indexCatalog(items: any[]) {
  const c = getClient();
  if (!c) return;
  const idx = await c.getIndex('catalog').catch(() => c.createIndex('catalog', { primaryKey: 'id' }));
  await idx.updateSettings({ searchableAttributes: ['nombre','rubro','subrubro','sinonimos'], filterableAttributes: ['rubro','subrubro'], synonyms: { 'enchufe':['toma','tomacorriente'], 'canilla':['grifo','griferia'] } });
  await idx.addDocuments(items.map(it => ({ id: it.id, rubro: it.rubro, subrubro: it.subrubro || null, nombre: it.nombre, sinonimos: it.sinonimos || [] })));
}

export async function searchSuggest(q: string, filters?: { rubro?: string; subrubro?: string }) {
  const c = getClient();
  if (!c) return { hits: [] };
  const idx = await c.getIndex('catalog').catch(() => null);
  if (!idx) return { hits: [] };
  const filter: string[] = [];
  if (filters?.rubro) filter.push(`rubro = "${filters.rubro}"`);
  if (filters?.subrubro) filter.push(`subrubro = "${filters.subrubro}"`);
  const res = await idx.search(q || '', { filter: filter.length ? filter.join(' AND ') : undefined, limit: 10 });
  return res;
}

