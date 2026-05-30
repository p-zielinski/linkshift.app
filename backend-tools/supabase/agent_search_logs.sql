-- Run in Supabase SQL Editor for docs assistant analytics and feedback.

CREATE TABLE public.agent_search_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources_used JSONB NOT NULL DEFAULT '[]'::jsonb,
    rating INTEGER DEFAULT 0,
    critic_notes TEXT,
    execution_time_ms INTEGER,
    llm_prompt_tokens INTEGER,
    llm_completion_tokens INTEGER,
    llm_estimated_cost_usd NUMERIC(12, 8),
    llm_usage_detail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_agent_logs_rating ON public.agent_search_logs(rating) WHERE rating = -1;
