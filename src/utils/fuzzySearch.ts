import MiniSearch from 'minisearch';
import { Product, Cause } from '../types.ts';
import { MISSION_DOCUMENTS } from '../data/missionDocuments.ts';

export interface SearchableDoc {
  id: string;
  kind: 'product' | 'digital' | 'mission';
  title: string;
  subtitle: string;
  body: string;
  refId: string;
}

export function buildUnifiedSearchIndex(products: Product[], causes: Cause[]) {
  const miniSearch = new MiniSearch<SearchableDoc>({
    fields: ['title', 'subtitle', 'body'],
    storeFields: ['id', 'kind', 'title', 'subtitle', 'refId'],
    searchOptions: {
      boost: { title: 3, subtitle: 2 },
      fuzzy: 0.25,
      prefix: true,
    },
  });

  const docs: SearchableDoc[] = [];

  for (const p of products) {
    docs.push({
      id: `prod:${p.id}`,
      kind: p.product_type === 'digital' ? 'digital' : 'product',
      title: p.name,
      subtitle: p.product_type === 'digital' ? p.subcategory || 'eBooks' : p.category,
      body: `${p.description || ''} ${p.cause_title || ''} ${p.cause_impact_text || ''}`,
      refId: p.id,
    });
  }

  for (const c of causes) {
    const doc = MISSION_DOCUMENTS[c.id];
    const sectionTitles = doc ? doc.sections.map((s) => s.heading).join(' ') : '';
    docs.push({
      id: `mission:${c.id}`,
      kind: 'mission',
      title: c.title,
      subtitle: `${c.category} — ${c.tagline}`,
      body: `${c.description} ${doc?.executiveSummary || ''} ${sectionTitles}`,
      refId: c.id,
    });
  }

  miniSearch.addAll(docs);
  return miniSearch;
}
