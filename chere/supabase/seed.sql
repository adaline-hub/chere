-- Chère Seed Data: Prompt Questions
-- These are the guided interview questions — the core IP of the product

-- ─── Mom ─────────────────────────────────────────────────
insert into prompt_questions (id, relationship_type, question_text, placeholder_example, sort_order) values
('mom_kitchen', 'mom', 'What''s a meal or smell from her kitchen that instantly takes you back?', 'Mom''s chicken soup on snow days, the way garlic always hit you at the door...', 1),
('mom_catchphrase', 'mom', 'What''s a phrase she repeats so often it''s basically her catchphrase?', '"Call me when you get there" — every single time...', 2),
('mom_showed_up', 'mom', 'Describe a moment she showed up for you — big or small — that you never forgot.', 'When I bombed my first exam and she just sat next to me on the couch without saying anything...', 3),
('mom_annoyed_love', 'mom', 'What''s something she does that used to annoy you but you now realize was love?', 'Packing way too many snacks for a 20-minute car ride...', 4),
('mom_memorable', 'mom', 'What''s the funniest or most memorable thing you remember her doing?', 'That time she tried to learn TikTok dances and almost broke the coffee table...', 5),
('mom_unsaid', 'mom', 'If you could make sure she knew one thing you''ve never said out loud, what would it be?', 'That I notice everything she did for me, even the things she thinks went unseen...', 6),
('mom_taught', 'mom', 'What did she teach you about life without ever saying it directly?', 'How to keep going when things get hard — she just did it, every day, without complaining...', 7);

-- ─── Dad ─────────────────────────────────────────────────
insert into prompt_questions (id, relationship_type, question_text, placeholder_example, sort_order) values
('dad_activity', 'dad', 'What''s a game, sport, or activity you shared growing up?', 'Shooting hoops in the driveway until it got dark...', 1),
('dad_move', 'dad', 'Describe his go-to "dad move" — the thing only he does.', 'The way he stands at the grill giving a play-by-play to nobody...', 2),
('dad_lesson', 'dad', 'What''s a lesson he taught you without realizing it?', 'How to fix something before calling someone to fix it — even if it takes three tries...', 3),
('dad_funny', 'dad', 'What''s the funniest thing he''s ever done?', 'His impression of the family dog that''s been going for 15 years...', 4),
('dad_person', 'dad', 'When did you first see him as a person, not just your dad?', 'When I caught him watching old home videos alone late at night...', 5),
('dad_grateful', 'dad', 'What''s something you got from him that you''re grateful for?', 'His stubbornness — turns out it''s actually determination...', 6),
('dad_unsaid', 'dad', 'What would you want him to know that you''ve never said?', 'That I''m proud of him, not just the other way around...', 7);

-- ─── Partner ─────────────────────────────────────────────
insert into prompt_questions (id, relationship_type, question_text, placeholder_example, sort_order) values
('partner_meet', 'partner', 'How did you meet? (or what''s the version you always tell people?)', 'We met at a coffee shop where they got my order wrong and handed it to him instead...', 1),
('partner_knew', 'partner', 'When did you know this was different from anything before?', 'When I realized I wanted to tell them boring things too, not just the big stuff...', 2),
('partner_habit', 'partner', 'What''s a tiny habit of theirs that you secretly love?', 'The way they hum while cooking and don''t realize they''re doing it...', 3),
('partner_hard', 'partner', 'What''s the hardest thing you''ve been through together?', 'Moving across the country with nothing but a car full of boxes and a lot of faith...', 4),
('partner_tuesday', 'partner', 'Describe a random Tuesday that captures what your life together feels like.', 'Takeout on the couch, arguing about what to watch, falling asleep by episode two...', 5),
('partner_fight', 'partner', 'What do you fight about that''s actually kind of funny?', 'Whose turn it is to take out the trash — it''s been an ongoing negotiation for years...', 6),
('partner_future', 'partner', 'What do you want the next chapter to look like?', 'More of this. More ordinary days that feel like exactly where I''m supposed to be...', 7);

-- ─── Pet ─────────────────────────────────────────────────
insert into prompt_questions (id, relationship_type, question_text, placeholder_example, sort_order) values
('pet_origin', 'pet', 'How did you find each other?', 'I wasn''t even looking — my friend''s dog had puppies and one just walked right up to me...', 1),
('pet_weird', 'pet', 'What''s their weirdest habit?', 'She barks at the vacuum but then follows it around like she''s supervising...', 2),
('pet_spot', 'pet', 'Where''s their favorite spot?', 'The one patch of sun that moves across the living room floor — she tracks it all day...', 3),
('pet_chaos', 'pet', 'What''s the most expensive or chaotic thing they''ve done?', 'Ate an entire loaf of bread off the counter and looked genuinely proud of himself...', 4),
('pet_comfort', 'pet', 'Describe a moment they made everything better without trying.', 'After the worst day at work, I came home and she was just sitting at the door waiting...', 5),
('pet_talk', 'pet', 'If they could talk, what would they say to you?', '"Is that chicken? That''s chicken. I would like some chicken please."', 6),
('pet_taught', 'pet', 'What have they taught you that a human never could?', 'That being happy is actually pretty simple if you stop overcomplicating it...', 7);

-- ─── Pet Memorial ────────────────────────────────────────
insert into prompt_questions (id, relationship_type, question_text, placeholder_example, sort_order) values
('petm_origin', 'pet_memorial', 'How did you find each other?', 'She was the runt of the litter, hiding behind her siblings...', 1),
('petm_miss', 'pet_memorial', 'What''s the thing you miss most about their daily routine?', 'The sound of her nails on the kitchen floor every morning at 6am sharp...', 2),
('petm_place', 'pet_memorial', 'Where was their favorite place?', 'Under the oak tree in the backyard — she''d lie there for hours watching squirrels...', 3),
('petm_chaos', 'pet_memorial', 'What''s the funniest or most chaotic thing they ever did?', 'Stole an entire turkey off the Thanksgiving table and had zero regrets...', 4),
('petm_talk', 'pet_memorial', 'If they could talk, what would they say to you right now?', '"It''s okay. I had the best life because of you."', 5),
('petm_taught', 'pet_memorial', 'What did they teach you about love?', 'That showing up is the whole thing. Just being there is enough...', 6);

-- ─── Grandparents Love Story ─────────────────────────────
insert into prompt_questions (id, relationship_type, question_text, placeholder_example, sort_order) values
('grand_meet', 'grandparent', 'How did they meet? (or what''s the family legend?)', 'Grandpa says he saw her at a dance and knew immediately. Grandma says he stepped on her foot...', 1),
('grand_apart', 'grandparent', 'What''s the longest they were ever apart?', 'When grandpa was stationed overseas for 18 months — they wrote letters every week...', 2),
('grand_argue', 'grandparent', 'What do they argue about that''s actually kind of adorable?', 'The thermostat. For 50 years. Neither has ever won...', 3),
('grand_tradition', 'grandparent', 'What''s a tradition they built together?', 'Sunday drives with no destination — they just drive and talk...', 4),
('grand_lesson', 'grandparent', 'What does their love teach you about your own life?', 'That love isn''t the big moments — it''s 50 years of choosing the same person for Sunday drives...', 5);

-- ─── Friend ──────────────────────────────────────────────
insert into prompt_questions (id, relationship_type, question_text, placeholder_example, sort_order) values
('friend_how', 'friend', 'How did you become friends?', 'We sat next to each other in biology and bonded over how bad we both were at dissection...', 1),
('friend_joke', 'friend', 'What''s an inside joke only you two understand?', '"Don''t order the fish" — it makes sense if you were there...', 2),
('friend_showed_up', 'friend', 'When did they show up for you in a way that mattered?', 'They drove three hours at 2am just because I sounded off on the phone...', 3),
('friend_ridiculous', 'friend', 'What''s the most ridiculous thing you''ve done together?', 'Road trip with no map, no plan, and one shared phone charger...', 4),
('friend_unique', 'friend', 'What do they bring to your life that nobody else does?', 'The ability to make me laugh about things I should probably cry about...', 5);
