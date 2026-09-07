# TikTok carousel 01 · "who was that girl"

Format: 13-slide photo carousel (TikTok "Photo" mode, 1080×1920), her point of view (blue
bubbles). A friend sends a photo of him with his arm around a girl at the station. He
denies nothing and explains nothing, which reads as guilt. Then a link. The girl was his
half-sister, who came to help him make the gift, and there's a second gift that unlocks on
Sunday. The product is never named in the chat; the domain only appears inside the link
preview on slide 7, the way it would in a real thread.

Why this one travels: slide 1 is a fight everyone has had or watched ("who was that
girl"), the denial sounds guilty, the twist only lands after the gift, and the last slide is
her going over at 10pm. Comments will argue about the sister for days, which is the point.

## Slides

Chat slides are rendered: `slide-01.png` … `slide-09.png`. Slides 8 to 11 of the carousel
are the gift (see below), so the file order maps like this:

| # | File | Content |
| --- | --- | --- |
| 1 | slide-01 | Yesterday 23:52 · "who was that girl" / "at the station" / "dont say what girl" / "What girl" / "im not doing this" |
| 2 | slide-02 | "Ana it's not what you think" / "you had your arm around her" / "lea sent me the pic" / "Lea sent you a pic??" / "so you dont deny it" |
| 3 | slide-03 | "I'm not denying I was there" / "I'm saying it's not what you think" / "thats literally what people say when it is what i think" / "dont come tomorrow" (Read 23:58) / "Ana" / "Please" / typing… |
| 4 | slide-04 | Today 07:14 · "You up" / "I didn't sleep" / "Can I just explain" · 09:31 · "no" / "It was my sister" / "you dont have a sister loool" |
| 5 | slide-05 | "Half sister. Nora. From my dad" / "I told you about her once and you said "cute" and forgot" / "...." / "why was your arm around her at 11pm at a train station" / "Because she came from Valencia to help me with something" / "with what" |
| 6 | slide-06 | "I can't tell you yet" / "wow ok" / "so convenient" / "istg if this is a lie" (Read 09:40) / typing… |
| 7 | slide-07 | Today 21:58 · "Ok" / "Just look at this. Then you can block me" / link card **Just look at this first · tryethos.io** / "what is this" / "It's what Nora came to help me with" / "I'm bad at this stuff. She did the photos" |
| 8 | gift | The Letter, closed: envelope, wax seal, "For Ana". Sticker `Continue →`. |
| 9 | gift | The letter, fully typed. Text below. |
| 10 | gift | The photos with captions. Six photos, captions below. The first one is the twist. |
| 11 | gift | The end screen with "A voice message from Marco · Tap to listen" and the final surprise line, or the Vinyl screen with the song. |
| 12 | slide-08 | Today 22:31 · "im literally sobbing" / "your SISTER" / "why didnt you just say" / "Because you'd have asked what she was helping with" / "And I wanted sunday to be a surprise" / "what's sunday" / "There's a second one. It unlocks sunday" |
| 13 | slide-09 | "i hate you" / "im coming over" / "It's 10pm" / "i said what i said" / "Door's open" / "tell nora i owe her a coffee loool" / "She says two" |

Regenerate after editing `script.json`:
`node scripts/tiktok-slides.mjs docs/marketing/tiktok-01/script.json docs/marketing/tiktok-01`
(supports `"status": "Read 23:58"` under a blue bubble, `{ "ts": "Today 09:31" }` for a
time gap, and `{ "from": "them", "typing": true }` for the dots.)

### The letter (slide 9), 126 words. Paste into Message; Greeting stays empty.

> I know exactly how the station looked. If Lea had sent me that photo of you, I'd have
> been worse than you were. So here's all of it, in order, because I should have said it
> at 23:52 instead of "what girl".
>
> Nora is my sister. She came from Valencia for two days because every time I try to write
> to you I delete it, and she doesn't. She chose the photos. She said the one of you asleep
> on the train was the one, and she's right.
>
> I'm not good at saying things. I'm going to get better at it, and this is the first one:
> I have never once looked at anyone the way I look at you when you're not watching.
>
> I'm sorry for the silence. I'm not sorry for the surprise.

Sign-off: `Nora says hi,` (it lands under the letter with his name, and it's the punchline).

Final surprise (Extras → Final surprise, on): `Sunday, 11am. Wear the green thing.`

### The six photos (slide 10), captions

Phone photos, not a shoot. The first photo is the whole twist, so it has to look like the
"evidence": him and a girl, side by side, arm around her, at a station at night.

1. Him and Nora at the station, the same angle Lea's photo would have. *nora. my sister. the arm-around-her at the station.*
2. Her asleep against a train window. *you asleep on the train. nora says this is the one*
3. Two coffees on a table. *first coffee. you ordered for me and got it wrong*
4. A messy flat, morning light. *the flat, the first morning*
5. A photo of her she hates, mid-laugh. *the one you hate. keeping it forever*
6. A blurred photo of something wrapped, or a door. *sunday. wait for it.*

### Editor fields (tryethos.io → The Letter)

Their name `Ana` · Your name `Marco` · Title `Just look at this first` (it's the link
preview) · Message: the letter above · Typed out · Photos: the six above · Music: A real
song, something slow ("The Night We Met", "Mystery of Love") · Your voice: record 15
seconds, low, tired: "Hey. It's me. Nora made me do this part. I'm sorry. I'm outside on
Sunday at eleven, okay? Okay." · Look: first swatch (wax red), Editorial, seal letter `M`,
Cream, Walnut, black ink · Greeting empty · Sign-off `Nora says hi,` · Reaction on ·
Countdown off · Final surprise on with the line above · Password empty · Schedule off ·
Footer: leave it.

## Gift slides, take two: Jar of Reasons (use this instead of The Letter)

The Letter is one long screen. The jar gives you a new punchline per slide: a closed jar,
then one note at a time, then the letter, then the surprise. Every slide has one line of
text big enough to read at thumbnail size, and the pastel notes are the exact aesthetic
this audience screenshots. It is also premium, which sells the $7.99 in the comments.

### Editor fields (tryethos.io → Jar of Reasons)

Their name `Ana` · Your name `Marco` · Title `Just look at this first` (link preview) ·
Jar label `12 reasons it was always you` · Note paper `Pastel mix` · Accent: the forest
green (it pays off the "green thing" line) · Typed out · Reaction on · Countdown off ·
Final surprise on, reveal by holding: `Sunday, 11am. Wear the green thing.` · Music:
library "Quiet Hours" (the TikTok gets its own sound anyway) · Password empty · Schedule off.

### The 12 reasons, one per line in the Reasons box (max 160 characters each)

Photos attach to the first notes in order, so reasons 1 to 4 carry the pictures.

1. `The girl at the station is my sister. Her name is Nora. She has wanted to meet you since March.`
2. `You fell asleep on the train with your mouth open and I still thought: yeah. That one.`
3. `You send me 14 tiktoks a day and I watch every single one. Even the cat ones. Especially the cat ones.`
4. `You cried at the dog video in the kebab place and blamed the onions. There were no onions.`
5. `Oat, no sugar, "not too hot". I hate that I know your order better than mine.`
6. `Three days of you not replying was the worst part of this whole year. Nothing else came close.`
7. `You wear my hoodie to bed and act like it just ended up there.`
8. `You put your ice-cold feet on me every night like it's a legal right.`
9. `You remember my mum's birthday. I forgot yours last year and you still made me a cake on mine.`
10. `Nora picked the photos. She said "the train one, obviously". My whole family is on your side.`
11. `I said "what girl" because I panicked, not because there was one. There was never one.`
12. `I'm bad at saying things. So here are 12. I'll say the rest to your face on Sunday.`

### Photos, in this order (captions in the box under each)

1. The station photo, the one Lea sent: `nora. my sister. the arm-around-her at the station.`
2. Her asleep on the train: `the train one. nora's pick.`
3. A screenshot-of-a-screenshot of your chat with 14 unread tiktoks: `14. in one day.`
4. The kebab place, both of you, bad lighting: `no onions.`
5. Her in your hoodie, from behind: `"it just ended up here"`
6. Anything with something green on her: `sunday. 11am.`

### Message (the "Read the letter" screen). Paste the v3 letter above, then add these two lines at the end

`Nora says hi.`
`M`

### Gift slides, new order (after the nine chat slides)

| # | What is on screen | Why it is there |
|---|---|---|
| 10 | Closed jar. `MARCO → ANA`, `12 reasons it was always you`, `12/12` | "he made her a jar" |
| 11 | Note 1 open, with the station photo | the plot twist |
| 12 | Note 2 open, the train photo | the melt |
| 13 | Note 6 open, text only | the gut punch |
| 14 | The letter half typed, cursor still moving | proof it is real |
| 15 | The surprise revealed: `Sunday, 11am. Wear the green thing.` above `Made by Marco for Ana` | the ending people save |

Capture notes: add the gift to your home screen first (Share → Add to Home Screen) so
it opens without Safari bars. Tap "Enable motion" once before you start shooting so the
black pill disappears. Tap the jar to pull a note, tap the note to fold it back, and use
"Read the letter" when you have the four notes you want.

## Caption, tags, sound

Caption (pick one):
- "my friend sent me a photo of him with another girl. this was 24 hours later."
- "he said "what girl". read slide 7."
- "the sister twist. i'm not ok."

Tags: #boyfriend #relationship #cheating #plottwist #apology #storytime #fyp #couples

Sound: slow and a little sad for the first half so the reveal lands: "The Night We Met",
"Francis Forever (slowed)", "Apocalypse (slowed)". Low volume.

Post between 21:00 and 23:00. No link in the caption on the first post; pin `tryethos.io`
as a comment once people ask where he made it (they will ask about the sister first, let
them). Reply to the first 20 comments within the hour. Make two more versions with the
same first six slides and a different reveal (he was buying the ring; he was at her mum's
place planning her birthday) and post them a day apart.

## Your own chat screenshots, if you want variations

- Most authentic: two phones (or a second Apple ID) in a real iMessage thread, dark mode,
  then crop the top so no name or number shows, exactly as above.
- The renderer in this folder: edit `script.json`, run the command at the top. It uses the
  Mac's real system font, so it matches iMessage more closely than online generators.
- Generators if you need them fast: ifaketextmessage.com, fakedetail.com (both let you
  set dark mode and hide the header). Avoid showing read receipts and "Delivered" labels
  inconsistently; real threads only show one at the bottom.
