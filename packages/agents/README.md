# Agents

RAG agent and autonomous firewall services will live here.

Current frontend API routes already include the first server-side agent path:

- `apps/frontend/app/api/agent/route.ts`
- `apps/frontend/lib/rag-corpus.ts`

As the product grows, move durable agent workers, retrieval pipelines,
embeddings, vector indexes, and monitoring services into this package.
