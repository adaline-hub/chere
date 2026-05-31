"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { RelationshipType } from "@/lib/supabase/types";
import StepHeader from "@/components/creation/StepHeader";

// ─── Question Data ────────────────────────────────────────

interface Question {
  id: string;
  question: string;
  placeholder: string;
}

const QUESTIONS: Record<RelationshipType, Question[]> = {
  mom: [
    { id: "mom_kitchen", question: "What's a meal or smell from her kitchen that instantly takes you back?", placeholder: "Mom's chicken soup on snow days, the way garlic always hit you at the door..." },
    { id: "mom_catchphrase", question: "What's a phrase she repeats so often it's basically her catchphrase?", placeholder: '"Call me when you get there" — every single time...' },
    { id: "mom_showed_up", question: "Describe a moment she showed up for you — big or small — that you never forgot.", placeholder: "When I bombed my first exam and she just sat next to me on the couch without saying anything..." },
    { id: "mom_annoyed_love", question: "What's something she does that used to annoy you but you now realize was love?", placeholder: "Packing way too many snacks for a 20-minute car ride..." },
    { id: "mom_memorable", question: "What's the funniest or most memorable thing you remember her doing?", placeholder: "That time she tried to learn TikTok dances and almost broke the coffee table..." },
    { id: "mom_unsaid", question: "If you could make sure she knew one thing you've never said out loud, what would it be?", placeholder: "That I notice everything she did for me, even the things she thinks went unseen..." },
    { id: "mom_taught", question: "What did she teach you about life without ever saying it directly?", placeholder: "How to keep going when things get hard — she just did it, every day, without complaining..." },
    { id: "mom_sacrifice", question: "What's something she gave up for you that you didn't understand until you were older?", placeholder: "She stopped painting when I was born. I found her old canvases in the garage last year..." },
    { id: "mom_comfort", question: "What does she do when you're sad that nobody else does?", placeholder: "She doesn't ask what's wrong. She just makes tea and sits next to me..." },
    { id: "mom_embarrass", question: "What's her most embarrassing habit that you secretly love?", placeholder: "She talks to every dog she sees on the street like they're old friends..." },
    { id: "mom_look", question: "Describe 'the look' — the one that says everything without words.", placeholder: "One eyebrow raised, lips pressed together, arms crossed. You know you're done..." },
    { id: "mom_strength", question: "When did you realize she was the strongest person you know?", placeholder: "When she handled everything after dad's surgery without letting us see her worry..." },
    { id: "mom_tradition", question: "What's a tradition between you two that nobody else understands?", placeholder: "Every Sunday we call each other at exactly 4pm. No one remembers how it started..." },
    { id: "mom_voice", question: "What does her voice sound like when she says your name?", placeholder: "She stretches it out, adds a syllable that isn't there. It's how I know I'm home..." },
    { id: "mom_hands", question: "What do her hands look like? What have they done for you?", placeholder: "Rough from gardening, always warm. They braided my hair every morning for 12 years..." },
  ],
  dad: [
    { id: "dad_activity", question: "What's a game, sport, or activity you shared growing up?", placeholder: "Shooting hoops in the driveway until it got dark..." },
    { id: "dad_move", question: 'Describe his go-to "dad move" — the thing only he does.', placeholder: "The way he stands at the grill giving a play-by-play to nobody..." },
    { id: "dad_lesson", question: "What's a lesson he taught you without realizing it?", placeholder: "How to fix something before calling someone to fix it — even if it takes three tries..." },
    { id: "dad_funny", question: "What's the funniest thing he's ever done?", placeholder: "His impression of the family dog that's been going for 15 years..." },
    { id: "dad_person", question: "When did you first see him as a person, not just your dad?", placeholder: "When I caught him watching old home videos alone late at night..." },
    { id: "dad_grateful", question: "What's something you got from him that you're grateful for?", placeholder: "His stubbornness — turns out it's actually determination..." },
    { id: "dad_unsaid", question: "What would you want him to know that you've never said?", placeholder: "That I'm proud of him, not just the other way around..." },
    { id: "dad_advice", question: "What's the best advice he ever gave you, even if he doesn't remember saying it?", placeholder: "Don't worry about being the smartest person in the room. Be the most prepared..." },
    { id: "dad_silence", question: "What's something he communicates without ever saying it?", placeholder: "He puts gas in my car every time I visit. Never mentions it..." },
    { id: "dad_pride", question: "When did you see him proudest?", placeholder: "He didn't say anything at my graduation. Just stood there with wet eyes and a grin..." },
    { id: "dad_hobby", question: "What's his thing — the hobby or interest that lights him up?", placeholder: "Classic cars. He can talk for three hours about a carburetor and somehow make it interesting..." },
    { id: "dad_sacrifice", question: "What did he give up that you only appreciate now?", placeholder: "He worked doubles every holiday season so we'd have good Christmases. I thought he just liked working..." },
    { id: "dad_smell", question: "What smell reminds you of him?", placeholder: "Sawdust and coffee. His workshop and his morning, in one breath..." },
    { id: "dad_aging", question: "What moment made you realize he was getting older?", placeholder: "When he asked me to read the menu for him because the font was too small..." },
    { id: "dad_laugh", question: "Describe his laugh.", placeholder: "Loud. Unapologetic. The whole room knows when he thinks something is funny..." },
  ],
  partner: [
    { id: "partner_meet", question: "How did you meet? (or what's the version you always tell people?)", placeholder: "We met at a coffee shop where they got my order wrong and handed it to him instead..." },
    { id: "partner_knew", question: "When did you know this was different from anything before?", placeholder: "When I realized I wanted to tell them boring things too, not just the big stuff..." },
    { id: "partner_habit", question: "What's a tiny habit of theirs that you secretly love?", placeholder: "The way they hum while cooking and don't realize they're doing it..." },
    { id: "partner_hard", question: "What's the hardest thing you've been through together?", placeholder: "Moving across the country with nothing but a car full of boxes and a lot of faith..." },
    { id: "partner_tuesday", question: "Describe a random Tuesday that captures what your life together feels like.", placeholder: "Takeout on the couch, arguing about what to watch, falling asleep by episode two..." },
    { id: "partner_fight", question: "What do you fight about that's actually kind of funny?", placeholder: "Whose turn it is to take out the trash — it's been an ongoing negotiation for years..." },
    { id: "partner_future", question: "What do you want the next chapter to look like?", placeholder: "More of this. More ordinary days that feel like exactly where I'm supposed to be..." },
    { id: "partner_safe", question: "When do you feel safest with them?", placeholder: "When it's raining and we're both on the couch and neither of us is looking at a phone..." },
    { id: "partner_annoy", question: "What do they do that drives you crazy but you'd miss if it stopped?", placeholder: "They leave cabinet doors open. Every single one. It's unhinged and somehow endearing..." },
    { id: "partner_proud", question: "When were you proudest of them?", placeholder: "When they stood up to their boss about something everyone else was afraid to say..." },
    { id: "partner_smell", question: "What do they smell like?", placeholder: "Clean laundry and whatever that lotion is. I'd recognize it anywhere..." },
    { id: "partner_world", question: "How did they change the way you see the world?", placeholder: "They notice people. Like really notice them. It taught me to slow down..." },
    { id: "partner_morning", question: "What does a perfect morning with them look like?", placeholder: "Slow. Coffee. Them reading out loud something weird they found on the internet..." },
    { id: "partner_miss", question: "What do you miss about them when they're not around?", placeholder: "The sound of them in the next room. Just knowing they're there..." },
    { id: "partner_grow", question: "How have you both changed since you met?", placeholder: "We're quieter now. But it's a good quiet. The kind where everything's already been said..." },
  ],
  pet: [
    { id: "pet_origin", question: "How did you find each other?", placeholder: "I wasn't even looking — my friend's dog had puppies and one just walked right up to me..." },
    { id: "pet_weird", question: "What's their weirdest habit?", placeholder: "She barks at the vacuum but then follows it around like she's supervising..." },
    { id: "pet_spot", question: "Where's their favorite spot?", placeholder: "The one patch of sun that moves across the living room floor — she tracks it all day..." },
    { id: "pet_chaos", question: "What's the most expensive or chaotic thing they've done?", placeholder: "Ate an entire loaf of bread off the counter and looked genuinely proud of himself..." },
    { id: "pet_comfort", question: "Describe a moment they made everything better without trying.", placeholder: "After the worst day at work, I came home and she was just sitting at the door waiting..." },
    { id: "pet_talk", question: "If they could talk, what would they say to you?", placeholder: '"Is that chicken? That\'s chicken. I would like some chicken please."' },
    { id: "pet_taught", question: "What have they taught you that a human never could?", placeholder: "That being happy is actually pretty simple if you stop overcomplicating it..." },
    { id: "pet_name", question: "Why did you name them that?", placeholder: "We didn't. They came with the name and it was so wrong for them that it became perfect..." },
    { id: "pet_routine", question: "What's your daily routine together?", placeholder: "6am: she wakes me up. 6:01am: I pretend to be asleep. 6:02am: she wins..." },
    { id: "pet_person", question: "Who's their favorite person? (Be honest.)", placeholder: "My partner. And I've accepted it. Mostly..." },
    { id: "pet_smart", question: "What's the smartest thing they've ever done?", placeholder: "She learned how to open the treat drawer. We had to install a childproof lock. She figured that out too..." },
    { id: "pet_sleep", question: "How do they sleep?", placeholder: "On her back, all four legs in the air, tongue slightly out. Zero dignity. Maximum comfort..." },
    { id: "pet_sound", question: "What sounds do they make?", placeholder: "This little grumble when she's settling in. Not a bark, not a growl. Just... commentary..." },
    { id: "pet_look", question: "Describe the look they give you that melts you every time.", placeholder: "Head tilted, ears forward, one paw slightly raised. It's weaponized cuteness..." },
    { id: "pet_understand", question: "What's something they seem to understand that they shouldn't?", placeholder: "She knows when I'm about to cry before I do. She's there before the first tear..." },
  ],
  pet_memorial: [
    { id: "petm_origin", question: "How did you find each other?", placeholder: "She was the runt of the litter, hiding behind her siblings..." },
    { id: "petm_miss", question: "What's the thing you miss most about their daily routine?", placeholder: "The sound of her nails on the kitchen floor every morning at 6am sharp..." },
    { id: "petm_place", question: "Where was their favorite place?", placeholder: "Under the oak tree in the backyard — she'd lie there for hours watching squirrels..." },
    { id: "petm_chaos", question: "What's the funniest or most chaotic thing they ever did?", placeholder: "Stole an entire turkey off the Thanksgiving table and had zero regrets..." },
    { id: "petm_talk", question: "If they could talk, what would they say to you right now?", placeholder: '"It\'s okay. I had the best life because of you."' },
    { id: "petm_taught", question: "What did they teach you about love?", placeholder: "That showing up is the whole thing. Just being there is enough..." },
    { id: "petm_habit", question: "What was their favorite daily ritual?", placeholder: "Every morning she'd sit at the window and watch the birds before breakfast..." },
    { id: "petm_personality", question: "What one word sums up their personality?", placeholder: "Joyful. Everything was exciting — a walk, a sound, a smell. Pure joy..." },
    { id: "petm_remember", question: "What do you never want to forget about them?", placeholder: "The way they'd spin in circles when they were excited. Pure, unfiltered happiness..." },
    { id: "petm_impact", question: "How did they change your life?", placeholder: "They made me slow down. Made me notice the small things. Made me more present..." },
  ],
  grandparent: [
    { id: "grand_meet", question: "How did they meet? (or what's the family legend?)", placeholder: "Grandpa says he saw her at a dance and knew immediately. Grandma says he stepped on her foot..." },
    { id: "grand_apart", question: "What's the longest they were ever apart?", placeholder: "When grandpa was stationed overseas for 18 months — they wrote letters every week..." },
    { id: "grand_argue", question: "What do they argue about that's actually kind of adorable?", placeholder: "The thermostat. For 50 years. Neither has ever won..." },
    { id: "grand_tradition", question: "What's a tradition they built together?", placeholder: "Sunday drives with no destination — they just drive and talk..." },
    { id: "grand_lesson", question: "What does their love teach you about your own life?", placeholder: "That love isn't the big moments — it's 50 years of choosing the same person for Sunday drives..." },
    { id: "grand_wisdom", question: "What's the wisest thing they ever said to you?", placeholder: "She told me 'Worry is praying for what you don't want.' I think about it every day..." },
    { id: "grand_food", question: "What dish of theirs will you never stop craving?", placeholder: "His pot roast. Nobody's has ever come close. It was love made edible..." },
    { id: "grand_young", question: "What do you know about who they were before they were a grandparent?", placeholder: "She was a dancer in her twenties. I found photos once. She was electric..." },
    { id: "grand_together", question: "What's a thing you always do when you're together?", placeholder: "Watch old movies. He falls asleep by the second act but always wakes up for the ending..." },
    { id: "grand_love", question: "What do they do that shows love without saying it?", placeholder: "She presses money into my hand every time I leave. Even now. Even when I say no..." },
  ],
  friend: [
    { id: "friend_how", question: "How did you become friends?", placeholder: "We sat next to each other in biology and bonded over how bad we both were at dissection..." },
    { id: "friend_joke", question: "What's an inside joke only you two understand?", placeholder: '"Don\'t order the fish" — it makes sense if you were there...' },
    { id: "friend_showed_up", question: "When did they show up for you in a way that mattered?", placeholder: "They drove three hours at 2am just because I sounded off on the phone..." },
    { id: "friend_ridiculous", question: "What's the most ridiculous thing you've done together?", placeholder: "Road trip with no map, no plan, and one shared phone charger..." },
    { id: "friend_unique", question: "What do they bring to your life that nobody else does?", placeholder: "The ability to make me laugh about things I should probably cry about..." },
    { id: "friend_support", question: "How do they support you in a way nobody else does?", placeholder: "They never fix things. They just listen. Really listen. And somehow that's enough..." },
    { id: "friend_grown", question: "How have you both grown or changed together?", placeholder: "We're both completely different people than when we met. But we still make sense..." },
    { id: "friend_longdistance", question: "How do you stay close even when life gets in the way?", placeholder: "A random meme at 2am. No context needed. That's enough..." },
    { id: "friend_home", question: "When did they feel like home?", placeholder: "The moment I didn't feel like I had to explain myself. I was just... me..." },
    { id: "friend_secret", question: "What's a secret only they know about you?", placeholder: "Every embarrassing phase, every bad decision. They know all of it and stayed anyway..." },
  ],
  sibling: [
    { id: "sib_memory", question: "What's a childhood memory only you two share?", placeholder: "Building blanket forts in the living room and pretending the floor was lava..." },
    { id: "sib_fight", question: "What did you fight about as kids that's funny now?", placeholder: "Who got to sit in the front seat. Every. Single. Time..." },
    { id: "sib_defend", question: "When did they have your back when it mattered?", placeholder: "When someone made fun of me at school and they showed up like a tiny bodyguard..." },
    { id: "sib_alike", question: "What's one way you're alike that surprises people?", placeholder: "We both do the same nervous laugh — identical..." },
    { id: "sib_unsaid", question: "What would you want them to know?", placeholder: "That growing up with them made me who I am, and I wouldn't trade it..." },
    { id: "sib_different", question: "What's one way you're completely different from each other?", placeholder: "They're the organized one. I'm still not sure where my keys are right now..." },
    { id: "sib_grew_up", question: "What's something you realized about them when you both grew up?", placeholder: "That they were always paying attention to everything. Even when I thought they weren't..." },
    { id: "sib_proud", question: "What are you most proud of them for?", placeholder: "Becoming the kind of person they always said they wanted to be. They actually did it..." },
    { id: "sib_protected", question: "When did they protect you?", placeholder: "Not always from big things. Sometimes just from being alone in hard moments..." },
    { id: "sib_always", question: "What will always make you think of them?", placeholder: "That specific song from a road trip we took ten years ago. It still gets me every time..." },
  ],
  child: [
    { id: "child_first", question: "What's the first moment you remember with them?", placeholder: "The first time they grabbed my finger and held on..." },
    { id: "child_funny", question: "What's the funniest thing they've ever said or done?", placeholder: "When they told the waiter their mom's real age and the whole table went quiet..." },
    { id: "child_proud", question: "What moment made you the proudest?", placeholder: "Watching them stand up for a kid being left out on the playground..." },
    { id: "child_remind", question: "What do they do that reminds you of yourself?", placeholder: "The way they talk to animals like they're people who just haven't learned English yet..." },
    { id: "child_hope", question: "What do you hope they always remember?", placeholder: "That home is wherever we are together..." },
    { id: "child_teach", question: "What have they taught you that you didn't expect to learn from a child?", placeholder: "That curiosity is a choice. That you can still be amazed by ordinary things..." },
    { id: "child_note", question: "What do you notice about them that they don't know you notice?", placeholder: "The way they look out for the younger kids. The way they hold doors. They're kinder than they realize..." },
    { id: "child_imagine", question: "What do you imagine their future looks like?", placeholder: "Big. Loud. Full of people who love them and adventures they haven't even dreamed of yet..." },
    { id: "child_moment", question: "What's a moment you want to freeze in time?", placeholder: "Last summer, falling asleep in the car after the beach. Sand everywhere. Perfect..." },
    { id: "child_letter", question: "If you wrote them a letter they'd open in 20 years, what would you want to make sure it said?", placeholder: "That this time — right now — was the best of my life. And that it was because of them..." },
  ],
  custom: [
    { id: "custom_how", question: "How did you meet or come to know this person?", placeholder: "We met at..." },
    { id: "custom_memory", question: "What's a memory with them that always makes you smile?", placeholder: "The time we..." },
    { id: "custom_quality", question: "What's a quality of theirs that you admire?", placeholder: "Their ability to..." },
    { id: "custom_moment", question: "Describe a moment they made a difference in your life.", placeholder: "When they..." },
    { id: "custom_unsaid", question: "What would you want them to know?", placeholder: "That they..." },
    { id: "custom_world", question: "How have they made your world larger or better?", placeholder: "By showing me there are ways of looking at things I hadn't considered..." },
    { id: "custom_laugh", question: "What makes you laugh together?", placeholder: "Inside jokes that have outlived their original context by years..." },
    { id: "custom_impact", question: "What's the most meaningful impact they've had on your life?", placeholder: "They arrived at exactly the right moment. I didn't know how much I needed them..." },
    { id: "custom_admire", question: "What do you most admire about the way they move through life?", placeholder: "Their steadiness. Nothing rattles them. They're the calm in every storm..." },
    { id: "custom_grateful", question: "What's something specific you're grateful for about them?", placeholder: "A specific thing they did or said that changed how I see something important..." },
  ],
};

// ─── Slide variants for guided mode ──────────────────────

const slideVariants = {
  enter: { x: 24, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -24, opacity: 0 },
};

// ─── Component ────────────────────────────────────────────

export default function InterviewFlow() {
  const {
    relationshipType,
    recipientName,
    interviewAnswers,
    setInterviewAnswer,
    creationType,
    outputFormat,
    setStep,
  } = useCreationStore();

  const [mode, setMode] = useState<"guided" | "all-at-once">("guided");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = (relationshipType ? QUESTIONS[relationshipType] : null) ?? QUESTIONS.custom;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = interviewAnswers[currentQuestion?.id ?? ""] ?? "";
  const total = questions.length;
  const answeredCount = questions.filter((q) => (interviewAnswers[q.id] ?? "").trim().length > 0).length;

  // Auto-expand first unanswered question when switching to all-at-once
  useEffect(() => {
    if (mode === "all-at-once") {
      const first = questions.find((q) => !(interviewAnswers[q.id] ?? "").trim());
      setExpandedId(first?.id ?? questions[0]?.id ?? null);
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.max(120, ta.scrollHeight)}px`;
      const t = setTimeout(() => ta.focus(), 420);
      return () => clearTimeout(t);
    }
  }, [currentIndex]);

  function resize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.max(120, el.scrollHeight)}px`;
  }

  function advance() {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setShowCompletion(true);
      completionTimerRef.current = setTimeout(() => {
        const next = creationType === "tribute" ? "photos" : "gift";
        setStep(next);
      }, 2200);
    }
  }

  function finishAllAtOnce() {
    setShowCompletion(true);
    completionTimerRef.current = setTimeout(() => {
      const next = creationType === "tribute" ? "photos" : "gift";
      setStep(next);
    }, 2200);
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="font-serif text-2xl md:text-3xl text-charcoal text-center px-6"
        >
          Beautiful. Let&apos;s keep going.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-6 py-16">
      <div className="w-full max-w-xl">
        {/* Header */}
        <StepHeader step="interview" title={<>Tell us about <span className="text-charcoal">{recipientName}</span></>} className="mb-2" />

        {/* Mode toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="flex justify-center mb-2"
        >
          <div
            className="inline-flex items-center rounded-full p-1 gap-1"
            style={{ border: "1px solid var(--color-parchment)" }}
          >
            {(["guided", "all-at-once"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="px-4 py-1.5 rounded-full text-sm transition-all duration-200"
                style={
                  mode === m
                    ? { backgroundColor: "var(--color-espresso)", color: "var(--color-cream)" }
                    : { backgroundColor: "transparent", color: "var(--color-stone)", border: "1px solid var(--color-parchment)" }
                }
              >
                {m === "guided" ? "Guided" : "All at once"}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-xs text-center mb-8"
          style={{ color: "var(--color-warm-gray)" }}
        >
          {mode === "guided"
            ? "We'll walk you through each question one by one."
            : "Pick and choose the questions that speak to you."}
        </motion.p>

        {/* Storybook callout */}
        {outputFormat === "storybook" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl px-5 py-4 mb-8"
            style={{
              backgroundColor: "var(--color-cream)",
              borderLeft: "4px solid var(--color-muted-gold)",
              border: "1px solid var(--color-parchment)",
              borderLeftWidth: "4px",
            }}
          >
            <p className="font-serif text-base mb-1" style={{ color: "var(--color-espresso)" }}>
              You chose Storybook — nice choice.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-stone)" }}>
              The more memories you share, the richer your book will be. Each answer becomes a page in the story. Take your time — this is worth it.
            </p>
          </motion.div>
        )}

        {/* ── GUIDED MODE ── */}
        {mode === "guided" && (
          <>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-xs text-warm-gray text-center mb-12 tracking-[0.1em]"
            >
              {currentIndex + 1} of {total}
            </motion.p>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <h2
                  className="font-serif text-espresso mb-8 leading-relaxed"
                  style={{ fontSize: "clamp(1.35rem, 3vw, 1.75rem)" }}
                >
                  {currentQuestion?.question}
                </h2>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) => {
                      setInterviewAnswer(currentQuestion.id, e.target.value);
                      resize(e.currentTarget);
                    }}
                    className="textarea"
                    style={{ overflow: "hidden" }}
                  />
                  <AnimatePresence>
                    {!currentAnswer && (
                      <motion.p
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute top-3 left-4 right-4 text-sm leading-relaxed italic pointer-events-none select-none"
                        style={{ color: "var(--color-warm-gray)" }}
                      >
                        {currentQuestion?.placeholder}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={advance}
                  className="mt-4 text-sm transition-colors duration-300 block"
                  style={{ color: "var(--color-warm-gray)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-stone)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-warm-gray)")}
                >
                  Skip this one
                </button>

                <AnimatePresence>
                  {currentAnswer.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mt-8"
                    >
                      <button onClick={advance} className="btn-primary">
                        {currentIndex === total - 1 ? "Done" : "Next"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {/* ── ALL AT ONCE MODE ── */}
        {mode === "all-at-once" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-3"
          >
            {questions.map((q) => {
              const answer = interviewAnswers[q.id] ?? "";
              const isAnswered = answer.trim().length > 0;
              const isExpanded = expandedId === q.id;

              return (
                <div
                  key={q.id}
                  className="rounded-xl overflow-hidden transition-shadow duration-200"
                  style={{
                    border: isExpanded
                      ? "1px solid var(--color-muted-gold)"
                      : "1px solid var(--color-parchment)",
                    backgroundColor: "var(--color-cream)",
                  }}
                >
                  {/* Header row */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-3"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isAnswered && (
                        <span style={{ color: "var(--color-sage-green)", flexShrink: 0, fontSize: "0.875rem" }}>
                          ✓
                        </span>
                      )}
                      <span
                        className="font-serif leading-snug"
                        style={{
                          color: "var(--color-espresso)",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {q.question}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isAnswered && !isExpanded && (
                        <span
                          className="text-xs italic truncate max-w-[120px] hidden sm:block"
                          style={{ color: "var(--color-stone)" }}
                        >
                          {answer.substring(0, 30)}{answer.length > 30 ? "…" : ""}
                        </span>
                      )}
                      <span style={{ fontSize: "0.65rem", color: "var(--color-warm-gray)" }}>
                        {isExpanded ? "▲" : "+"}
                      </span>
                    </div>
                  </button>

                  {/* Expanded body */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0">
                          <div className="relative">
                            <textarea
                              value={answer}
                              onChange={(e) => {
                                setInterviewAnswer(q.id, e.target.value);
                                resize(e.currentTarget);
                              }}
                              className="textarea w-full"
                              style={{ overflow: "hidden", minHeight: "100px" }}
                              autoFocus={expandedId === q.id}
                              onFocus={(e) => resize(e.currentTarget)}
                            />
                            {!answer && (
                              <p
                                className="absolute top-3 left-4 right-4 text-sm leading-relaxed italic pointer-events-none select-none"
                                style={{ color: "var(--color-warm-gray)" }}
                              >
                                {q.placeholder}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Continue button — appears after 2+ answered */}
            <AnimatePresence>
              {answeredCount >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6"
                >
                  <button onClick={finishAllAtOnce} className="btn-primary w-full">
                    Continue ({answeredCount} answered)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
