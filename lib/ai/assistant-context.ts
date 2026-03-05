/**
 * MCE Assistant Context Builder
 * Loads system prompts and RAG documents for AI assistant
 */

import { hasSupabaseEnv, supabase } from '@/lib/supabase';

export interface AssistantContext {
  systemPrompt: string;
  architectureGuides: string;
  recentContext?: string;
}

/**
 * Build comprehensive system context from architecture prompts
 */
export async function buildAssistantContext(): Promise<AssistantContext> {
  try {
    if (!hasSupabaseEnv()) {
      return {
        systemPrompt: `You are the MCE Enterprise Resource Planning Assistant.
Help users with project management, tenders, documents, tasks, and reporting.
When you don't know something, ask for clarification or admit limitations.`,
        architectureGuides: '',
        recentContext: undefined
      };
    }

    const { data: prompts, error } = await supabase
      .from('system_prompts')
      .select('prompt_key, title, content, category')
      .eq('is_active', true)
      .order('category', { ascending: true }) as { data: Array<{ prompt_key: string; title: string; content: string; category: string }> | null; error: { message: string } | null };

    if (error) throw error;

    const architectureGuides = (prompts || [])
      .map((p: { title: string; content: string }) => `## ${p.title}\n${p.content}`)
      .join('\n\n');

    const systemPrompt = `You are the MCE Enterprise Resource Planning Assistant.
You help users with:
- Project management and portfolio tracking
- Tender intake and win probability analysis
- Document management and compliance
- Task orchestration and automation
- Report generation and data export
- System configuration and troubleshooting

IMPORTANT GUIDELINES:
1. Always cite evidence from system documentation when available
2. Refuse requests that lack sufficient context or evidence
3. When uncertain, ask clarifying questions
4. Explain your reasoning using the architecture guides below
5. Prioritize security and data protection in all recommendations

SYSTEM ARCHITECTURE REFERENCE:
${architectureGuides}

When users ask about features or workflows, reference the relevant architecture guide above.
Always explain your response in terms of the system's actual capabilities and limitations.`;

    return {
      systemPrompt,
      architectureGuides,
      recentContext: undefined
    };
  } catch (error) {
    console.warn('Failed to build assistant context:', error);

    const systemPrompt = `You are the MCE Enterprise Resource Planning Assistant.
Help users with project management, tenders, documents, tasks, and reporting.
When you don't know something, ask for clarification or admit limitations.`;

    return {
      systemPrompt,
      architectureGuides: '',
      recentContext: undefined
    };
  }
}

/**
 * Retrieve relevant prompts based on user query
 */
export async function retrieveRelevantContext(query: string): Promise<string> {
  try {
    if (!hasSupabaseEnv()) return '';

    const { data: prompts } = await supabase
      .from('system_prompts')
      .select('title, content')
      .eq('is_active', true) as { data: Array<{ title: string; content: string }> | null };

    if (!prompts || prompts.length === 0) return '';

    const queryLower = query.toLowerCase();
    const relevant = (prompts || []).filter((p: { title: string; content: string }) =>
      p.title.toLowerCase().includes(queryLower) ||
      p.content.toLowerCase().includes(queryLower)
    );

    return relevant
      .slice(0, 3)
      .map((p: { title: string; content: string }) => `${p.title}: ${p.content}`)
      .join('\n\n');
  } catch (error) {
    console.error('Failed to retrieve context:', error);
    return '';
  }
}
