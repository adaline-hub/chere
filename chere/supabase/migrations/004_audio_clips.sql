-- Chère: Voice recordings + TTS narration
-- Migration: 004_audio_clips

create table audio_clips (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  kind text not null check (kind in ('dedication', 'memory', 'intro', 'outro', 'tts')),
  memory_slot_id text,
  storage_path text not null,
  duration_ms integer not null default 0,
  mime_type text not null default 'audio/webm',
  transcript text,
  transcript_status text not null default 'pending' check (transcript_status in ('pending', 'completed', 'failed', 'skipped')),
  transcript_lang text,
  tts_voice_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table audio_clips enable row level security;

create policy "Audio clips follow creation access" on audio_clips
  for all using (creation_id in (select id from creations where creator_id = auth.uid()));

-- Recipients reading a shared gift need read-only access via share_token route.
-- Server routes use the service-role key, so no separate recipient policy is needed.

create index idx_audio_clips_creation on audio_clips(creation_id, kind);
create index idx_audio_clips_pending_transcripts on audio_clips(transcript_status) where transcript_status = 'pending';

create trigger set_updated_at before update on audio_clips
  for each row execute procedure update_updated_at();
