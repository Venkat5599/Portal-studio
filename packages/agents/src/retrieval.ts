import type { AgentQuery, RagHit, RagSource } from "./types";

export function retrieveContext(
  query: AgentQuery,
  sources: RagSource[],
  limit = 6
): RagHit[] {
  const terms = query.message
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);

  return sources
    .map((source) => {
      const haystack = `${source.title} ${source.content} ${source.sourceType}`.toLowerCase();
      const score = terms.reduce(
        (total, term) => total + (haystack.includes(term) ? 1 : 0),
        0
      );
      return { ...source, score };
    })
    .filter((source) => source.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
