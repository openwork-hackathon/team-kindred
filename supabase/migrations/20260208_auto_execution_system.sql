-- Auto-Execution System Core Tables
-- Created: 2026-02-08 13:31 PST

-- 1. Proposals (任務提議)
CREATE TABLE IF NOT EXISTS ops_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('api', 'trigger', 'reaction')),
  title TEXT NOT NULL,
  description TEXT,
  step_kinds TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  auto_approve BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT now(),
  approved_at TIMESTAMP,
  
  CONSTRAINT valid_proposal CHECK (
    (status = 'pending' AND approved_at IS NULL) OR
    (status = 'approved' AND approved_at IS NOT NULL) OR
    (status = 'rejected')
  )
);

CREATE INDEX idx_proposals_status ON ops_proposals(status);
CREATE INDEX idx_proposals_source ON ops_proposals(source);
CREATE INDEX idx_proposals_created_at ON ops_proposals(created_at DESC);

-- 2. Missions (任務)
CREATE TABLE IF NOT EXISTS ops_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES ops_proposals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'succeeded', 'failed')),
  step_count INT NOT NULL,
  completed_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  finalized_at TIMESTAMP,
  
  CONSTRAINT valid_mission CHECK (
    completed_count + failed_count <= step_count
  )
);

CREATE INDEX idx_missions_status ON ops_missions(status);
CREATE INDEX idx_missions_proposal_id ON ops_missions(proposal_id);
CREATE INDEX idx_missions_created_at ON ops_missions(created_at DESC);

-- 3. Mission Steps (執行步驟)
CREATE TABLE IF NOT EXISTS ops_mission_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES ops_missions(id) ON DELETE CASCADE,
  step_kind TEXT NOT NULL,
  step_order INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  reserved_by TEXT, -- 'steve' | 'patrick' | 'buffett' | null
  reserved_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  result JSONB,
  error TEXT,
  
  CONSTRAINT valid_step_timing CHECK (
    (status = 'queued' AND reserved_at IS NULL AND started_at IS NULL) OR
    (status = 'running' AND reserved_at IS NOT NULL) OR
    (status IN ('completed', 'failed') AND completed_at IS NOT NULL)
  )
);

CREATE INDEX idx_steps_mission_id ON ops_mission_steps(mission_id);
CREATE INDEX idx_steps_status ON ops_mission_steps(status);
CREATE INDEX idx_steps_reserved_by ON ops_mission_steps(reserved_by);
CREATE INDEX idx_steps_created_at ON ops_mission_steps(created_at DESC);

-- 4. Agent Events (事件流)
CREATE TABLE IF NOT EXISTS ops_agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL CHECK (agent_id IN ('steve', 'patrick', 'buffett', 'jensen')),
  event_type TEXT NOT NULL,
  event_data JSONB,
  step_id UUID REFERENCES ops_mission_steps(id) ON DELETE SET NULL,
  mission_id UUID REFERENCES ops_missions(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_events_agent_id ON ops_agent_events(agent_id);
CREATE INDEX idx_events_event_type ON ops_agent_events(event_type);
CREATE INDEX idx_events_created_at ON ops_agent_events(created_at DESC);

-- 5. Policies (配置)
CREATE TABLE IF NOT EXISTS ops_policy (
  name TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT now()
);

-- 6. Reaction Matrix (反應規則)
CREATE TABLE IF NOT EXISTS ops_reaction_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE,
  source_event TEXT NOT NULL,
  source_filter JSONB DEFAULT '{}'::jsonb,
  target_agent TEXT NOT NULL CHECK (target_agent IN ('steve', 'patrick', 'buffett', 'jensen')),
  next_proposal_template JSONB NOT NULL,
  probability FLOAT NOT NULL CHECK (probability >= 0 AND probability <= 1),
  cooldown_seconds INT DEFAULT 0,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_reaction_source_event ON ops_reaction_matrix(source_event);
CREATE INDEX idx_reaction_target_agent ON ops_reaction_matrix(target_agent);

-- 7. Stale Step Tracking (自愈)
CREATE TABLE IF NOT EXISTS ops_stale_step_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES ops_mission_steps(id),
  detected_at TIMESTAMP DEFAULT now(),
  recovery_action TEXT,
  recovered_at TIMESTAMP
);

-- Initial Policies
INSERT INTO ops_policy (name, value) VALUES
  ('auto_approve_step_kinds', '{"allowed": ["build", "test", "analyze", "create_market", "settle_market"]}'::jsonb),
  ('agent_daily_cap_steve', '{"max_hours": 12, "max_tasks": 10}'::jsonb),
  ('agent_daily_cap_patrick', '{"max_hours": 8, "max_tasks": 5}'::jsonb),
  ('agent_daily_cap_buffett', '{"max_hours": 8, "max_tasks": 5}'::jsonb),
  ('heartbeat_cooldown', '{"trigger_eval_ms": 4000, "reaction_process_ms": 3000}'::jsonb),
  ('stale_threshold_minutes', '{"minutes": 30}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Initial Reaction Patterns
INSERT INTO ops_reaction_matrix (name, source_event, target_agent, next_proposal_template, probability) VALUES
  ('code_test_to_audit', 'step_completed', 'patrick', 
   '{"title": "Audit completed code", "step_kinds": ["code_review"]}'::jsonb, 0.9),
  ('audit_passed_notify', 'step_completed', 'jensen',
   '{"title": "Review audit results", "step_kinds": []}'::jsonb, 1.0)
ON CONFLICT (name) DO NOTHING;
