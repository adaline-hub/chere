"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCreationStore } from "@/stores/creation-store";
import type { RelationshipType } from "@/lib/supabase/types";

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
  ],
  dad: [
    { id: "dad_activity", question: "What's a game, sport, or activity you shared growing up?", placeholder: "Shooting hoops in the driveway until it got dark..." },
    { id: "dad_move", question: 'Describe his go-to "dad move" — the thing only he does.', placeholder: "The way he stands at the grill giving a play-by-play to nobody..." },
    { id: "dad_lesson", question: "What's a lesson he taught you without realizing it?", placeholder: "How to fix something before calling someone to fix it — even if it takes three tries..." },
    { id: "dad_funny", question: "What's the funniest thing he's ever done?", placeholder: "His impression of the family dog that's been going for 15 years..." },
    { id: "dad_person", question: "When did you first see him as a person, not just your dad?", placeholder: "When I caught him watching old home videos alone late at night..." },
    { id: "dad_grateful", question: "What's something you got from him that you're grateful for?", placeholder: "His stubbornness — turns out it's actually determination..." },
    { id: "dad_unsaid", question: "What would you want him to know that you've never said?", placeholder: "That I'm proud of him, not just the other way around..." },
  ],
  partner: [
    { id: "partner_meet", question: "How did you meet? (or what's the version you always tell people?)", placeholder: "We met at a coffee shop where they got my order wrong and handed it to him instead..." },
    { id: "partner_knew", question: "When did you know this was different from anything before?", placeholder: "When I realized I wanted to tell them boring things too, not just the big stuff..." },
    { id: "partner_habit", question: "What's a tiny habit of theirs that you secretly love?", placeholder: "The way they hum while cooking and don't realize they're doing it..." },
    { id: "partner_hard", question: "What's the hardest thing you've been through together?", placeholder: "Moving across the country with nothing but a car full of boxes and a lot of faith..." },
    { id: "partner_tuesday", question: "Describe a random Tuesday that captures what your life together feels like.", placeholder: "Takeout on the couch, arguing about what to watch, falling asleep by episode two..." },
    { id: "partner_fight", question: "What do you fight about that's actually kind of funny?", placeholder: "Whose turn it is to take out the trash — it's been an ongoing negotiation for years..." },
    { id: "partner_future", question: "What do you want the next chapter to look like?", placeholder: "More of this. More ordinary days that feel like exactly where I'm supposed to be..." },
  ],
  pet: [
    { id: "pet_origin", question: "How did you find each other?", placeholder: "I wasn't even looking — my friend's dog had puppies and one just walked right up to me..." },
    { id: "pet_weird", question: "What's their weirdest habit?", placeholder: "She barks at the vacuum but then follows it around like she's supervising..." },
    { id: "pet_spot", question: "Where's their favorite spot?", placeholder: "The one patch of sun that moves across the living room floor — she tracks it all day..." },
    { id: "pet_chaos", question: "What's the most expensive or chaotic thing they've done?", placeholder: "Ate an entire loaf of bread off the counter and looked genuinely proud of himself..." },
    { id: "pet_comfort", question: "Describe a moment they made everything better without trying.", placeholder: "After the worst day at work, I came home and she was just sitting at the door waiting..." },
    { id: "pet_talk", question: "If they could talk, what would they say to you?", placeholder: '"Is that chicken? That\'s chicken. I would like some chicken please."' },
    { id: "pet_taught", question: "What have they taught you that a human never could?", placeholder: "That being happy is actually pretty simple if you stop overcomplicating it..." },
  ],
  pet_memorial: [
    { id: "petm_origin", question: "How did you find each other?", placeholder: "She was the runt of the litter, hiding behind her siblings..." },
    { id: "petm_miss", question: "What's the thing you miss most about their daily routine?", placeholder: "The sound of her nails on the kitchen floor every morning at 6am sharp..." },
    { id: "petm_place", question: "Where was their favorite place?", placeholder: "Under the oak tree in the backyard — she'd lie there for hours watching squirrels..." },
    { id: "petm_chaos", question: "What's the funniest or most chaotic thing they ever did?", placeholder: "Stole an entire turkey off the Thanksgiving table and had zero regrets..." },
    { id: "petm_talk", question: "If they could talk, what would they say to you right now?", placeholder: '"It\'s okay. I had the best life because of you."' },
    { id: "petm_taught", question: "What did they teach you about love?", placeholder: "That showing up is the whole thing. Just being there is enough..." },
  ],
  grandparent: [
    { id: "grand_meet", question: "How did they meet? (or what's the family legend?)", placeholder: "Grandpa says he saw her at a dance and knew immediately. Grandma says he stepped on her foot..." },
    { id: "grand_apart", question: "What's the longest they were ever apart?", placeholder: "When grandpa was stationed overseas for 18 months — they wrote letters every week..." },
    { id: "grand_argue", question: "What do they argue about that's actually kind of adorable?", placeholder: "The thermostat. For 50 years. Neither has ever won..." },
    { id: "grand_tradition", question: "What's a tradition they built together?", placeholder: "Sunday drives with no destination — they just drive and talk..." },
    { id: "grand_lesson", question: "What does their love teach you about your own life?", placeholder: "That love isn't the big moments — it's 50 years of choosing the same person for Sunday drives..." },
  ],
  friend: [
    { id: "friend_how", question: "How did you become friends?", placeholder: "We sat next to each other in biology and bonded over how bad we both were at dissection..." },
    { id: "friend_joke", question: "What's an inside joke only you two understand?", placeholder: '"Don\'t order the fish" — it makes sense if you were there...' },
    { id: "friend_showed_up", question: "When did they show up for you in a way that mattered?", placeholder: "They drove three hours at 2am just because I sounded off on the phone..." },
    { id: "friend_ridiculous", question: "What's the most ridiculous thing you've done together?", placeholder: "Road trip with no map, no plan, and one shared phone charger..." },
    { id: "friend_unique", question: "What do they bring to your life that nobody else does?", placeholder: "The ability to make me laugh about things I should probably cry about..." },
  ],
  sibling: [
    { id: "sib_memory", question: "What's a childhood memory only you two share?", placeholder: "Building blanket forts in the living room and pretending the floor was lava..." },
    { id: "sib_fight", question: "What did you fight about as kids that's funny now?", placeholder: "Who got to sit in the front seat. Every. Single. Time..." },
    { id: "sib_defend", question: "When did they have your back when it mattered?", placeholder: "When someone made fun of me at school and they showed up like a tiny bodyguard..." },
    { id: "sib_alike", question: "What's one way you're alike that surprises people?", placeholder: "We both do the same nervous laugh — identical..." },
    { id: "sib_unsaid", question: "What would you want them to know?", placeholder: "That growing up with them made me who I am, and I wouldn't trade it..." },
  ],
  child: [
    { id: "child_first", question: "What's the first moment you remember with them?", placeholder: "The first time they grabbed my finger and held on..." },
    { id: "child_funny", question: "What's the funniest thing they've ever said or done?", placeholder: "When they told the waiter their mom's real age and the whole table went quiet..." },
    { id: "child_proud", question: "What moment made you the proudest?", placeholder: "Watching them stand up for a kid being left out on the playground..." },
    { id: "child_remind", question: "What do they do that reminds you of yourself?", placeholder: "The way they talk to animals like they're people who just haven't learned English yet..." },
    { id: "child_hope", question: "What do you hope they always remember?", placeholder: "That home is wherever we are together..." },
  ],
  custom: [
    { id: "custom_how", question: "How did you meet or come to know this person?", placeholder: "We met at..." },
    { id: "custom_memory", question: "What's a memory with them that always makes you smile?", placeholder: "The time we..." },
    { id: "custom_quality", question: "What's a quality of theirs that you admire?", placeholder: "Their ability to..." },
    { id: "custom_moment", question: "Describe a moment they made a difference in your life.", placeholder: "When they..." },
    { id: "custom_unsaid", question: "What would you want them to know?", placeholder: "That they..." },
  ],
};

// ─── Component ────────────────────────────────────────────

const slideVariants = {
  enter: { x: 24, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -24, opacity: 0 },
};

export default function InterviewFlow() {
  const {
    relationshipType,
    recipientName,
    interviewAnswers,
    setInterviewAnswer,
    creationType,
    setStep,
  } = useCreationStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = (relationshipType ? QUESTIONS[relationshipType] : null) ?? QUESTIONS.custom;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = interviewAnswers[currentQuestion?.id ?? ""] ?? "";
  const total = questions.length;

  // Clean up completion timer on unmount
  useEffect(() => {
    return () => {
      if (completionTimerRef.current) clearTimeout(completionTimerRef.current);
    };
  }, []);

  // Auto-focus and resize when question changes
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-sm text-stone text-center mb-2 tracking-wide"
        >
          Tell us about{" "}
          <span className="text-charcoal">{recipientName}</span>
        </motion.p>

        {/* Counter */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-xs text-warm-gray text-center mb-12 tracking-[0.1em]"
        >
          {currentIndex + 1} of {total}
        </motion.p>

        {/* Question + Answer */}
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

            {/* Textarea with overlay placeholder */}
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

            {/* Skip */}
            <button
              onClick={advance}
              className="mt-4 text-sm transition-colors duration-300 block"
              style={{ color: "var(--color-warm-gray)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-stone)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-warm-gray)")
              }
            >
              Skip this one
            </button>

            {/* Next button */}
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
      </div>
    </div>
  );
}
