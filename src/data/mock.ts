export type Category = { key: string; label: string };

export const categories: Category[] = [
  { key: "research-papers", label: "Research & Papers" },
  { key: "website-builders", label: "Website Builders" },
  { key: "automation-agents", label: "Automation/Agents" },
  { key: "marketing", label: "Marketing" },
  { key: "customer-support", label: "Customer Support" },
  { key: "sales-enablement", label: "Sales Enablement" },
  { key: "education", label: "Education" },
  { key: "content-writing", label: "Content Writing" },
  { key: "video-editing", label: "Video Editing" },
  { key: "image-generation", label: "Image Generation" },
  { key: "data-analysis-bi", label: "Data Analysis/BI" },
  { key: "cybersecurity", label: "Cybersecurity" },
  { key: "finance-fintech", label: "Finance/Fintech" },
  { key: "healthcare", label: "Healthcare" },
  { key: "gaming", label: "Gaming" },
  { key: "coding-devtools", label: "Coding & DevTools" },
  { key: "ecommerce", label: "E-commerce" },
  { key: "translation-localization", label: "Translation/Localization" },
  { key: "hr-recruiting", label: "HR/Recruiting" },
  { key: "legal-compliance", label: "Legal/Compliance" },
  { key: "product-ux", label: "Product/UX" },
  { key: "audio-voice", label: "Audio/Voice" },
  { key: "search-rag-infra", label: "Search & RAG Infra" },
  { key: "mlops-llmops", label: "MLOps/LLMOps" },
];

const toolNames = [
  "OpenAI", "Anthropic", "Midjourney", "Stability AI", "Perplexity", "Replit",
  "Vercel v0", "Cursor", "Claude Artifacts", "ElevenLabs", "Runway", "Pika",
  "Zapier", "Make", "Superhuman AI", "Jasper", "Writer", "Notion AI",
  "Gamma", "Tome", "Cohere", "Mistral", "Llama via Providers", "Pinecone",
  "Weaviate", "Qdrant", "LangChain", "LlamaIndex", "Modal", "Replicate",
  "Baseten", "OctoAI"
];

export interface Tool {
  id: string;
  name: string;
  vendor: string;
  homepageUrl: string;
  description: string;
  oss?: boolean;
  priceFromUsd: number;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function hash(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

function seededRandom(key: string) {
  // xorshift-like
  let x = hash(key) || 123456789;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return ((x >>> 0) % 10000) / 10000;
}

export const tools: Tool[] = toolNames.map((name) => {
  const id = slug(name);
  const price = Math.round(seededRandom(id + "price") * 80) + 10; // $10 - $90
  return {
    id,
    name,
    vendor: name,
    homepageUrl: `https://example.com/${id}`,
    description: `${name} is an AI product used widely across industries. This is demo content for layout and UX.`,
    oss: seededRandom(id + "oss") > 0.8,
    priceFromUsd: price,
  };
});

export type RankingEntry = {
  rank: number;
  toolId: string;
  score: number;
  delta: number;
};

export function scoreFor(toolId: string, categoryKey: string) {
  return Math.round(60 + seededRandom(toolId + categoryKey) * 40); // 60-100
}

function deltaFor(toolId: string, categoryKey: string) {
  return Math.round(seededRandom("delta" + toolId + categoryKey) * 16 - 8); // -8..+8
}

export function getCategoryRanking(categoryKey: string, topN = 15): RankingEntry[] {
  const list = tools
    .map((t) => ({ toolId: t.id, score: scoreFor(t.id, categoryKey), delta: deltaFor(t.id, categoryKey) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((e, i) => ({ rank: i + 1, ...e }));
  return list;
}

export function getTool(toolId: string) {
  return tools.find((t) => t.id === toolId);
}

export function getTopMovers(categoryKey: string, topN = 8) {
  return getCategoryRanking(categoryKey, 30)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, topN);
}

export const updateLog: { ts: string; text: string }[] = [
  { ts: new Date().toISOString(), text: "New Runway release improves video inpainting" },
  { ts: new Date().toISOString(), text: "Pinecone raises limits for free tier namespaces" },
  { ts: new Date().toISOString(), text: "Claude Artifacts adds live preview refresh" },
  { ts: new Date().toISOString(), text: "Perplexity launches Collections" },
  { ts: new Date().toISOString(), text: "LangChain updates prompt router" },
];
