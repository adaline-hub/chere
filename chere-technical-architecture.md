# Chère — Technical Architecture

## 1. System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                     │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Creation     │  │  Tribute     │  │  Living Hub    │  │
│  │  Flow (CSR)   │  │  Pages (SSR) │  │  Dashboard     │  │
│  │              │  │              │  │  (CSR)         │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬─────────┘  │
│         │                 │                  │            │
│         └─────────────────┼──────────────────┘            │
│                           │                               │
└───────────────────────────┼───────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Next.js API    │
                    │  Routes +       │
                    │  Server Actions │
                    └───────┬────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                  │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼───────┐
   │  Supabase    │  │  Claude API  │  │  Stripe       │
   │  - PostgreSQL│  │  - Text Gen  │  │  - Payments   │
   │  - Auth      │  │  - Voice     │  │  - Webhooks   │
   │  - Storage   │  │    Matching  │  │               │
   │  - Realtime  │  │              │  │               │
   └──────────────┘  └──────────────┘  └───────────────┘
          │
   ┌──────▼──────┐  ┌──────────────┐  ┌───────────────┐
   │  R2/S3       │  │  Resend      │  │  Image Gen    │
   │  - Photos    │  │  - Delivery  │  │  - Replicate  │
   │  - Generated │  │  - Clues     │  │    or fal.ai  │
   │    media     │  │  - Reminders │  │  - Style xfer │
   └──────────────┘  └──────────────┘  └───────────────┘
```

## 2. Tech Stack (Confirmed)

| Layer | Choice | Purpose |
|-------|--------|---------|
| **Framework** | Next.js 14+ (App Router) | SSR for tribute pages, CSR for creation flow |
| **Language** | TypeScript (strict mode) | Type safety across the stack |
| **Styling** | Tailwind CSS + custom design tokens | Rapid iteration + luxury aesthetic via tokens |
| **Database** | Supabase (PostgreSQL) | Users, creations, recipients, clue schedules |
| **Auth** | Supabase Auth (magic links + OAuth) | Low-friction accounts, Google/Apple sign-in |
| **File Storage** | Supabase Storage (or Cloudflare R2) | Photo uploads, generated media |
| **Payments** | Stripe | One-time payments, future subscriptions |
| **AI Text** | Claude API (Sonnet default, Opus for premium) | Tribute writing, gift copy, clue riddles |
| **AI Images** | Replicate or fal.ai (Flux/SDXL) | Gift illustrations, style transfer |
| **Email** | Resend | Delivery emails, drip clues, reminders |
| **Hosting** | Vercel | Zero-config deploys, edge network, preview URLs |
| **Analytics** | PostHog | Funnel tracking, feature flags, session replay |
| **Animations** | GSAP + Framer Motion + Lottie | Scroll effects, UI transitions, gift reveals |
| **Audio** | Howler.js | Background music on tribute pages |
| **Job Queue** | Vercel Cron + Supabase Edge Functions | Scheduled clue delivery, reminders, expiry |

## 3. Database Schema

### Core Tables

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id),
  display_name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Creations (tributes, gift reveals, or combined)
create table creations (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references profiles(id) not null,
  
  -- Type & status
  type text not null check (type in ('tribute', 'gift_reveal', 'combined')),
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'sent', 'opened', 'expired')),
  
  -- Recipient info
  recipient_name text not null,
  recipient_email text,
  recipient_phone text,
  relationship_type text not null, -- 'mom', 'dad', 'partner', 'pet', 'friend', 'grandparent', 'sibling', 'child', 'custom'
  
  -- Content
  interview_answers jsonb default '{}',   -- { question_id: answer_text }
  generated_text text,                     -- AI-generated tribute/letter
  generated_text_edited text,              -- Creator's edited version (if modified)
  dedication_message text,
  
  -- Format & design
  output_format text not null,            -- 'scrollytelling', 'memory_wrapped', 'love_letter', 'gift_reveal', 'storybook', 'companion'
  template_id text not null,              -- Which visual template
  music_track_id text,                    -- Background music selection
  
  -- Delivery
  share_token text unique not null,       -- URL-safe token for sharing: chere.app/g/{token}
  delivery_method text,                   -- 'email', 'link', 'qr'
  scheduled_reveal_at timestamptz,        -- null = immediate
  delivered_at timestamptz,
  first_opened_at timestamptz,
  
  -- Tier
  tier text not null default 'free' check (tier in ('free', 'standard', 'premium', 'deluxe')),
  stripe_payment_id text,
  
  -- Expiry (free tier)
  expires_at timestamptz,                 -- null for paid tiers
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Photos attached to a creation
create table photos (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  
  storage_path text not null,             -- Path in Supabase Storage
  thumbnail_path text,                    -- Auto-generated thumbnail
  original_filename text,
  
  -- Metadata
  caption text,
  sort_order integer not null default 0,
  exif_date timestamptz,                  -- Extracted from EXIF if available
  
  -- AI-processed versions
  watercolor_path text,                   -- Style-transferred version
  illustration_path text,
  
  -- AI analysis
  ai_description text,                    -- Vision model description for prompt suggestions
  
  created_at timestamptz default now()
);

-- Embedded gift moments within a creation
create table gift_moments (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  
  -- Gift details (from Creator)
  gift_type text not null,                -- 'trip', 'experience', 'physical', 'shopping', 'mystery'
  description text not null,              -- Creator's plain text description
  details jsonb default '{}',             -- Structured details: { destination, hotel, dates, venue, etc }
  message text,                           -- Personal message with the gift
  
  -- Generated presentation
  illustration_url text,                  -- AI-generated gift illustration
  reveal_style text default 'card',       -- 'card', 'envelope', 'ticket', 'box'
  
  -- Position in the experience
  sort_order integer not null default 0,
  position text default 'end',            -- 'inline', 'end', 'after_section_N'
  
  created_at timestamptz default now()
);

-- Drip clue system
create table drip_clues (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  
  clue_number integer not null,           -- 1, 2, 3...
  clue_type text not null,                -- 'text', 'emoji', 'photo', 'riddle', 'temperature', 'sound'
  content text not null,                  -- The clue content
  
  -- Scheduling
  scheduled_at timestamptz not null,
  delivered_at timestamptz,
  opened_at timestamptz,
  
  created_at timestamptz default now()
);

-- Collaboration
create table collaborators (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  
  invite_token text unique not null,      -- URL-safe token for invite link
  name text,                              -- Collaborator's name
  email text,
  profile_id uuid references profiles(id), -- null if no account
  
  -- Their contributions
  interview_answers jsonb default '{}',
  status text default 'invited' check (status in ('invited', 'contributing', 'submitted')),
  
  created_at timestamptz default now()
);

-- Recipient interactions
create table recipient_interactions (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid references creations(id) on delete cascade not null,
  
  interaction_type text not null,         -- 'opened', 'reaction', 'comment', 'shared'
  content text,                           -- Reaction emoji, comment text, etc
  recipient_profile_id uuid references profiles(id), -- null if no account
  
  created_at timestamptz default now()
);

-- Music library
create table music_tracks (
  id text primary key,                    -- e.g. 'warm_nostalgia_01'
  name text not null,
  mood text not null,                     -- 'warm', 'playful', 'romantic', 'bittersweet', 'uplifting'
  category text not null,                 -- 'parent', 'partner', 'pet', 'universal'
  file_url text not null,
  duration_seconds integer not null,
  attribution text                        -- Royalty-free credit if needed
);

-- Prompt question library
create table prompt_questions (
  id text primary key,                    -- e.g. 'mom_kitchen_smell'
  relationship_type text not null,
  question_text text not null,
  placeholder_example text,
  sort_order integer not null,
  is_active boolean default true,
  
  -- Performance tracking
  skip_rate float default 0,              -- How often users skip this question
  avg_answer_length integer default 0,    -- Average character count of answers
  emotional_impact_score float default 0  -- From "cry rate" feedback
);

-- Occasion reminders
create table occasion_reminders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  
  recipient_name text not null,
  occasion_type text not null,            -- 'birthday', 'anniversary', 'mothers_day', 'gotcha_day', etc
  occasion_date date not null,            -- Recurring: just month/day matters
  
  remind_days_before integer default 7,
  last_reminded_at timestamptz,
  
  created_at timestamptz default now()
);
```

### Indexes

```sql
-- Fast lookup for tribute pages (the most common query)
create index idx_creations_share_token on creations(share_token);

-- Creator's dashboard
create index idx_creations_creator on creations(creator_id, created_at desc);

-- Drip clue scheduling
create index idx_drip_clues_scheduled on drip_clues(scheduled_at) where delivered_at is null;

-- Expiry cleanup
create index idx_creations_expires on creations(expires_at) where expires_at is not null and status != 'expired';

-- Collaborator invite lookup
create index idx_collaborators_token on collaborators(invite_token);
```

### Row Level Security (RLS)

```sql
-- Creators can only see their own creations
alter table creations enable row level security;
create policy "Creators see own creations" on creations
  for all using (creator_id = auth.uid());

-- Anyone with share_token can read (handled in API, not RLS)
-- Collaborators can read/write their assigned creation (via invite_token verification in API)

-- Photos follow creation access
alter table photos enable row level security;
create policy "Photos follow creation access" on photos
  for all using (
    creation_id in (select id from creations where creator_id = auth.uid())
  );
```

## 4. Application Routes

### Public Routes (No Auth Required)
```
/                           → Landing page (SSR)
/g/[shareToken]             → Tribute/gift viewer (SSR — the recipient experience)
/g/[shareToken]/clue/[n]    → Individual drip clue page
/invite/[inviteToken]       → Collaborator contribution page
/auth/login                 → Magic link login
/auth/callback              → OAuth callback
```

### Protected Routes (Auth Required)
```
/create                     → Start creation flow (choose type)
/create/[creationId]        → Multi-step creation wizard
/create/[creationId]/preview → Full preview before payment
/dashboard                  → Living Hub (My Creations)
/dashboard/recipients       → My Recipients
/dashboard/occasions        → Upcoming Occasions
/dashboard/drafts           → Drafts
/settings                   → Account settings
```

### API Routes
```
/api/creations              → CRUD for creations
/api/creations/[id]/generate → Trigger AI text generation
/api/creations/[id]/photos  → Photo upload/management
/api/creations/[id]/gifts   → Gift moment CRUD
/api/creations/[id]/clues   → Drip clue CRUD
/api/creations/[id]/deliver → Send to recipient
/api/creations/[id]/collaborate → Manage collaborators
/api/webhooks/stripe        → Stripe payment webhooks
/api/cron/deliver-clues     → Scheduled clue delivery
/api/cron/expire-free       → Expire free-tier creations at 30 days
/api/cron/send-reminders    → Occasion reminder emails
/api/ai/generate-text       → Claude API for tribute text
/api/ai/generate-illustration → Image generation for gift moments
/api/ai/analyze-photo       → Vision model for photo analysis
/api/ai/style-transfer      → Photo to watercolor/illustration
```

## 5. AI Pipeline Architecture

### Text Generation Flow
```
Creator Interview Answers
        │
        ▼
┌─────────────────────────┐
│  Build Claude Prompt     │
│  - System: golden example│
│  - System: voice rules   │
│  - User: relationship    │
│  - User: all answers     │
│  - User: photo context   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Claude API Call         │
│  - Model: sonnet (std)   │
│  - Model: opus (premium) │
│  - Max tokens: ~2000     │
│  - Temperature: 0.7      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  Post-Processing         │
│  - Verify voice match    │
│  - Check for AI-isms     │
│  - Format for template   │
│  - Store in DB           │
└─────────────────────────┘
```

### System Prompt Structure (Conceptual)
```
You are an invisible ghostwriter for Chère, a luxury gift platform.

ROLE: Write a first-person letter from the Creator to their {recipient}.

VOICE RULES:
- Mirror the Creator's exact vocabulary, names, and phrasing
- If they say "mama" don't write "mother"
- If they're casual, be casual. If they're poetic, be poetic
- Short sentences for emotional moments. Let them breathe.
- Never use: journey, cherish, blessed, unconditional, heartfelt, tapestry
- Never explain emotions — show them through specific details
- The last line should be short and land in silence

STRUCTURE:
- Open with a specific sensory detail or unexpected moment
- Weave memories in order of emotional escalation
- Humor creates trust — if the Creator was funny, be funny
- Save the biggest emotional beat for the end
- End with a short, devastating line

GOLDEN EXAMPLE:
[Insert hand-crafted golden example for this relationship type]

CREATOR'S INTERVIEW ANSWERS:
[Insert all Q&A pairs]

PHOTO CONTEXT:
[Insert AI-generated photo descriptions if available]

Write the tribute letter now. Do not add a title or header.
```

## 6. Tribute Page Rendering Architecture

### Two Rendering Modes

**1. Server-Side Rendered (SSR) — For Recipients**
When a recipient opens `chere.app/g/{shareToken}`:
- Next.js server fetches creation data from Supabase
- Renders full HTML with tribute content, photos, and animations
- Returns complete page — works even with JS disabled
- Open Graph meta tags for beautiful link previews
- Minimal client JS: only for interactions (music toggle, page-flip, reactions)

**2. Client-Side Preview — For Creators**
During creation flow, the preview uses the same components but renders client-side with live data from the creation wizard state. This ensures WYSIWYG — what the Creator sees is exactly what the recipient gets.

### Tribute Page Component Architecture
```
TributePage (SSR shell)
├── FirstOpenExperience (Lottie animation)
│   ├── ChèreLogo (fade in)
│   ├── "A gift for you, from {Creator}" (fade in)
│   └── "Open" button (gentle pulse)
│
├── TributeRenderer (switches on output_format)
│   ├── ScrollytellingRenderer
│   │   ├── ParallaxPhotoSection (GSAP ScrollTrigger)
│   │   ├── TextRevealSection (intersection observer)
│   │   ├── GiftMomentReveal (embedded gift card)
│   │   └── DedicationSection
│   │
│   ├── MemoryWrappedRenderer
│   │   ├── SwipeableCardStack (touch/mouse gestures)
│   │   ├── StatCard ("32 years of love")
│   │   ├── QuoteCard (Creator's words)
│   │   ├── PhotoCard (full-bleed image)
│   │   └── GiftRevealCard
│   │
│   ├── LoveLetterRenderer
│   │   ├── EnvelopeAnimation (CSS 3D transform)
│   │   ├── HandwrittenText (custom font + animation)
│   │   ├── GiftMomentInsert
│   │   └── WaxSeal (Creator's initial)
│   │
│   └── GiftRevealRenderer
│       ├── CountdownTimer (if scheduled)
│       ├── RevealAnimation (box/envelope/ribbon)
│       ├── GiftIllustration (AI-generated)
│       ├── TripDetails (if trip reveal)
│       └── PersonalMessage
│
├── MusicPlayer (Howler.js, ambient background)
│   └── Toggle button (subtle, bottom corner)
│
├── RecipientActions
│   ├── ReactionSelector (emoji reactions, no account needed)
│   ├── "Leave a message" (requires free account)
│   └── "Make one for someone you love" (CTA → growth loop)
│
└── WatermarkFooter
    └── "Made with Chère" (links to chere.app)
```

## 7. First Open Experience

### Design Specification
The moment a recipient taps the link is the most emotionally charged 3 seconds of the product. This is NOT a loading screen — it's a gift unwrapping moment.

**Sequence (total: ~4 seconds):**
1. **0.0s** — Solid warm background (#F5F0EB — warm linen) fills screen
2. **0.5s** — Chère logo fades in (small, centered, soft serif, muted gold)
3. **1.5s** — Logo fades up slightly, "A gift for you" appears below in light text
4. **2.0s** — "from {Creator's Name}" fades in below, slightly warmer color
5. **2.5s** — Gentle pause (let anticipation build)
6. **3.0s** — "Open" button appears with a soft, slow pulse animation
7. **On tap** — Button ripples outward, entire screen transitions into the tribute

**For Gift Reveals with Countdown:**
If the reveal is scheduled for a future date, the sequence changes:
1. Same logo + "A gift for you from {Name}" sequence
2. Instead of "Open" button: countdown timer with "Opens in 3 days, 4 hours"
3. Below: accumulated drip clues (if any)

**Design Rules:**
- Animation is Lottie-based (consistent across all devices)
- No sound on the opening (music starts only after "Open" is tapped)
- Background color matches the chosen template's palette
- Works on the oldest iPhone someone's mom might have
- Total JS payload for First Open: < 50KB

## 8. File Storage Strategy

### Photo Upload Pipeline
```
User selects photo(s)
        │
        ▼
Client-side resize (max 2048px, preserve EXIF orientation)
        │
        ▼
Upload to Supabase Storage: /creations/{creationId}/originals/{photoId}.webp
        │
        ▼
Supabase Image Transform: auto-generate thumbnail (400px)
Store at: /creations/{creationId}/thumbnails/{photoId}.webp
        │
        ▼
(Optional) AI Vision analysis → store description in photos.ai_description
        │
        ▼
(If premium) Style transfer → store at: /creations/{creationId}/watercolor/{photoId}.webp
```

### Storage Buckets
```
chere-uploads/
├── creations/{creationId}/
│   ├── originals/          # Full-size photos (private)
│   ├── thumbnails/         # Auto-generated thumbnails (private)
│   ├── watercolor/         # Style-transferred versions (private)
│   └── illustrations/      # AI-generated gift illustrations (private)
│
├── music/                  # Royalty-free background tracks (public)
│
└── lottie/                 # Animation files for First Open, reveals (public)
```

**Access Control:**
- All creation media is private by default
- When a creation status is 'sent', generate signed URLs for recipient access
- Signed URLs expire after 24 hours, refreshed on each page load
- Music and Lottie files are public (CDN-cached)

## 9. Payment Flow

### Stripe Integration
```
Creator finishes creation
        │
        ▼
Preview page shows all tier options with live preview
        │
        ▼
Creator selects tier + add-ons
        │
        ▼
Stripe Checkout Session (server-side)
  - line_items: selected tier + add-ons
  - metadata: { creationId, tier, addons[] }
  - success_url: /create/{creationId}/deliver
  - cancel_url: /create/{creationId}/preview
        │
        ▼
Stripe redirects to success URL
        │
        ▼
Webhook confirms payment
  - Update creation.tier
  - Update creation.stripe_payment_id
  - If premium add-ons: trigger AI generation jobs
  - Set creation.expires_at = null (paid = permanent)
        │
        ▼
Creator proceeds to delivery step
```

### Free Tier Flow
```
Creator selects "Free" tier
        │
        ▼
No Stripe — proceed directly to delivery
  - creation.tier = 'free'
  - creation.expires_at = now() + 30 days
  - Watermark enabled
  - Limited to 5 photos, 1 format
```

## 10. Scheduled Jobs (Cron)

### Drip Clue Delivery
```
Every 15 minutes: check drip_clues where scheduled_at <= now() and delivered_at is null
        │
        ▼
For each due clue:
  1. Send email via Resend with clue content + link to clue page
  2. Update drip_clues.delivered_at = now()
  3. If this is the last clue, notify Creator: "All clues delivered!"
```

### Free Tier Expiry
```
Daily at midnight UTC:
  1. Find creations where expires_at <= now() and status != 'expired'
  2. Update status = 'expired'
  3. Send Creator email: "Your Chère for {recipient} has expired. Upgrade to keep it forever."
```

### Occasion Reminders
```
Daily at 9am Creator's timezone (or UTC if unknown):
  1. Find occasion_reminders where occasion_date is {remind_days_before} days from now
  2. Send email: "{Recipient}'s birthday is in 7 days. Make something they'll never forget."
  3. Update last_reminded_at
```

## 11. Project Structure

```
chere/
├── public/
│   ├── fonts/                    # Custom serif fonts for luxury feel
│   ├── music/                    # Royalty-free ambient tracks
│   └── lottie/                   # Lottie animation JSON files
│
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Landing page, about, pricing
│   │   │   ├── page.tsx          # Homepage
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (auth)/               # Login, callback
│   │   │   ├── login/page.tsx
│   │   │   └── callback/route.ts
│   │   │
│   │   ├── (protected)/          # Requires auth
│   │   │   ├── create/           # Creation wizard
│   │   │   │   ├── page.tsx      # Step 1: Choose type
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # Multi-step wizard
│   │   │   │       └── preview/page.tsx
│   │   │   │
│   │   │   ├── dashboard/        # Living Hub
│   │   │   │   ├── page.tsx      # My Creations
│   │   │   │   ├── recipients/page.tsx
│   │   │   │   ├── occasions/page.tsx
│   │   │   │   └── drafts/page.tsx
│   │   │   │
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── g/[shareToken]/       # Recipient experience (SSR, public)
│   │   │   ├── page.tsx          # Main tribute/gift viewer
│   │   │   └── clue/[n]/page.tsx # Individual clue page
│   │   │
│   │   ├── invite/[token]/       # Collaborator contribution (public)
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── creations/        # CRUD
│   │       ├── ai/               # AI generation endpoints
│   │       ├── webhooks/         # Stripe webhooks
│   │       └── cron/             # Scheduled jobs
│   │
│   ├── components/
│   │   ├── ui/                   # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── creation/             # Creation flow components
│   │   │   ├── TypeSelector.tsx
│   │   │   ├── RelationshipPicker.tsx
│   │   │   ├── InterviewFlow.tsx
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── GiftDescriber.tsx
│   │   │   ├── ClueBuilder.tsx
│   │   │   ├── FormatPicker.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── TributeEditor.tsx
│   │   │   └── PreviewRenderer.tsx
│   │   │
│   │   ├── tribute/              # Tribute page renderers
│   │   │   ├── FirstOpenExperience.tsx
│   │   │   ├── ScrollytellingRenderer.tsx
│   │   │   ├── MemoryWrappedRenderer.tsx
│   │   │   ├── LoveLetterRenderer.tsx
│   │   │   ├── GiftRevealRenderer.tsx
│   │   │   ├── StoryBookRenderer.tsx
│   │   │   ├── MusicPlayer.tsx
│   │   │   ├── GiftMomentCard.tsx
│   │   │   └── WatermarkFooter.tsx
│   │   │
│   │   ├── dashboard/            # Living Hub components
│   │   │   ├── CreationGrid.tsx
│   │   │   ├── RecipientList.tsx
│   │   │   ├── OccasionCalendar.tsx
│   │   │   └── CreationCard.tsx
│   │   │
│   │   └── shared/               # Cross-cutting components
│   │       ├── Logo.tsx
│   │       ├── Navigation.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase client
│   │   │   ├── server.ts         # Server-side Supabase client
│   │   │   └── admin.ts          # Service role client (for cron jobs)
│   │   │
│   │   ├── ai/
│   │   │   ├── generate-tribute.ts    # Claude text generation
│   │   │   ├── generate-illustration.ts # Gift illustration
│   │   │   ├── style-transfer.ts      # Photo style transfer
│   │   │   ├── analyze-photo.ts       # Vision analysis
│   │   │   └── prompts/
│   │   │       ├── system-base.ts     # Base system prompt
│   │   │       ├── mom.ts             # Mom-specific prompt additions
│   │   │       ├── dad.ts
│   │   │       ├── partner.ts
│   │   │       ├── pet.ts
│   │   │       └── golden-examples/   # Hand-crafted examples
│   │   │           ├── mom-letter.txt
│   │   │           ├── pet-letter.txt
│   │   │           └── ...
│   │   │
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── webhooks.ts
│   │   │
│   │   ├── email/
│   │   │   ├── send-delivery.ts       # Gift delivery email
│   │   │   ├── send-clue.ts           # Drip clue email
│   │   │   ├── send-reminder.ts       # Occasion reminder
│   │   │   └── send-notification.ts   # "They opened it!" email
│   │   │
│   │   └── utils/
│   │       ├── share-token.ts         # Generate URL-safe tokens
│   │       ├── image-resize.ts        # Client-side photo resize
│   │       └── format-helpers.ts
│   │
│   ├── hooks/
│   │   ├── useCreationWizard.ts       # Multi-step form state
│   │   ├── usePhotoUpload.ts          # Upload with progress
│   │   ├── useCollaboration.ts        # Realtime collab state
│   │   └── useMusicPlayer.ts          # Audio playback control
│   │
│   ├── stores/
│   │   └── creation-store.ts          # Zustand store for creation wizard
│   │
│   └── styles/
│       ├── globals.css                # Tailwind base + custom tokens
│       ├── design-tokens.ts           # Color palette, typography, spacing
│       └── tribute-themes/            # Per-template CSS
│           ├── warm-linen.css
│           ├── soft-sage.css
│           └── midnight-gold.css
│
├── supabase/
│   ├── migrations/                    # Database migrations
│   └── seed.sql                       # Seed data (prompts, music)
│
├── .env.local                         # Local env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 12. Design Tokens — Quiet Luxury Aesthetic

```typescript
// src/styles/design-tokens.ts

export const tokens = {
  colors: {
    // Warm neutrals (primary palette)
    linen:      '#F5F0EB',    // Backgrounds, First Open
    cream:      '#FAF7F2',    // Card backgrounds
    parchment:  '#EDE6DB',    // Subtle borders, dividers
    warmGray:   '#B8AFA6',    // Secondary text
    charcoal:   '#3D3832',    // Primary text
    espresso:   '#2A2420',    // Headlines, emphasis
    
    // Accent (used sparingly)
    mutedGold:  '#C4A97D',    // CTAs, watermark, accents
    softRose:   '#D4A5A5',    // Hover states, gentle highlights
    sageGreen:  '#A8B5A0',    // Success states, pet themes
    dustyBlue:  '#9EB1C1',    // Link color, info states
    
    // Template-specific palettes defined per theme
  },
  
  fonts: {
    serif:     '"Cormorant Garamond", "Georgia", serif',      // Headlines, tribute text
    sansSerif: '"Inter", "Helvetica Neue", sans-serif',       // UI, navigation, body
    handwriting: '"Caveat", cursive',                          // Love letter format, personal notes
  },
  
  fontSize: {
    xs:   '0.75rem',    // 12px — watermark, fine print
    sm:   '0.875rem',   // 14px — captions, secondary
    base: '1rem',       // 16px — body text
    lg:   '1.125rem',   // 18px — tribute body text
    xl:   '1.25rem',    // 20px — section headers
    '2xl': '1.5rem',    // 24px — page titles
    '3xl': '2rem',      // 32px — hero text
    '4xl': '2.5rem',    // 40px — emotional pull quotes
  },
  
  spacing: {
    // Generous whitespace — let content breathe
    sectionGap: '4rem',       // Between tribute sections
    paragraphGap: '1.5rem',   // Between paragraphs
    photoMargin: '2rem',      // Around photos
    pageMargin: '2rem',       // Page edges (mobile: 1.5rem)
  },
  
  animation: {
    // Slow, gentle — nothing snappy or bouncy
    fadeIn:     'opacity 0.8s ease-in-out',
    slideUp:    'transform 0.6s ease-out, opacity 0.6s ease-out',
    pageFlip:   'transform 0.5s ease-in-out',
    reveal:     'clip-path 1.2s ease-in-out',
    pulse:      'opacity 2s ease-in-out infinite',  // Gentle, slow pulse for "Open" button
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  
  shadows: {
    // Soft, warm shadows — not harsh drop shadows
    card:    '0 2px 8px rgba(42, 36, 32, 0.06)',
    photo:   '0 4px 16px rgba(42, 36, 32, 0.08)',
    elevated: '0 8px 24px rgba(42, 36, 32, 0.10)',
  },
} as const;
```

## 13. Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxxxx
STRIPE_SECRET_KEY=sk_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Image Generation (Replicate or fal.ai)
REPLICATE_API_TOKEN=xxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=gifts@chere.app

# App
NEXT_PUBLIC_APP_URL=https://chere.app
NEXT_PUBLIC_APP_NAME=Chère

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## 14. MVP Build Order

### Phase 1: Foundation (Week 1-2)
- [ ] Next.js project setup with TypeScript, Tailwind, design tokens
- [ ] Supabase project setup, database migrations, RLS policies
- [ ] Authentication flow (magic links + Google OAuth)
- [ ] Basic layout, navigation, logo/wordmark

### Phase 2: Creation Flow (Week 3-4)
- [ ] Type selector (tribute / gift reveal / combined)
- [ ] Relationship picker
- [ ] Interview flow with relationship-specific prompts
- [ ] Photo uploader with client-side resize
- [ ] Gift description flow
- [ ] Drip clue builder
- [ ] Format picker with live preview thumbnails

### Phase 3: AI Pipeline (Week 5)
- [ ] Claude integration for tribute text generation
- [ ] System prompts with golden examples
- [ ] Voice-matching logic (mirror Creator's vocabulary)
- [ ] AI-ism post-processing filter
- [ ] Gift illustration generation (Replicate/fal.ai)

### Phase 4: Tribute Renderers (Week 6-7)
- [ ] First Open Experience (Lottie)
- [ ] Scrollytelling Renderer (GSAP ScrollTrigger)
- [ ] Memory Wrapped Renderer (swipeable cards)
- [ ] Love Letter Renderer (envelope animation, handwriting font)
- [ ] Gift Reveal Renderer (box/envelope/ribbon animations)
- [ ] Music player integration
- [ ] Watermark footer

### Phase 5: Payment & Delivery (Week 8)
- [ ] Stripe Checkout integration
- [ ] Tier enforcement (free limits, premium features)
- [ ] Email delivery via Resend (beautiful templates)
- [ ] Shareable link generation
- [ ] QR code generation
- [ ] Scheduled reveal / countdown

### Phase 6: Living Hub (Week 9)
- [ ] Dashboard — My Creations grid
- [ ] Dashboard — My Recipients
- [ ] Dashboard — Upcoming Occasions
- [ ] Dashboard — Drafts
- [ ] "Opened" notification system
- [ ] Occasion reminder setup

### Phase 7: Collaboration (Week 10)
- [ ] Invite link generation
- [ ] Collaborator contribution page
- [ ] Combined answers in AI generation
- [ ] Creator editorial control (approve/reorder)
- [ ] Realtime updates via Supabase Realtime

### Phase 8: Polish & Launch (Week 11-12)
- [ ] Template design refinement (3 templates minimum)
- [ ] Music library curation (10-15 royalty-free tracks)
- [ ] Mobile responsive QA
- [ ] Performance optimization (Core Web Vitals)
- [ ] Open Graph meta tags for beautiful link previews
- [ ] Error handling and edge cases
- [ ] Manual QA of first 10 test tributes
- [ ] Landing page with demo tribute
- [ ] Launch

---

*Total estimated timeline: 10-12 weeks for solo developer*
*This is a living document. Update as implementation decisions are made.*
