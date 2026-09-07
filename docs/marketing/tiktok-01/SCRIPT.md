# TikTok carousel 01 · "he made me something at 11pm"

Format: 10-slide photo carousel (TikTok "Photo" mode, swipe, 1080×1920). The first five
slides are a late-night chat that turns into a link; the rest is the gift itself. The
viewer is not told what the product is until slide 5, and by then they want to see it.

Why this format works: slide 1 reads in under a second, every slide ends on something
unresolved, the chat feels overheard rather than advertised, and the payoff (the gift)
is genuinely nice to look at. The link preview on slide 5 and the last line on slide 10
carry the domain; the caption carries it again.

## Slides

Slides 1–5 and 10 are rendered for you: `slide-01.png` … `slide-06.png` (slide-06.png is
slide 10 of the carousel). Regenerate after editing `script.json`:
`node scripts/tiktok-slides.mjs docs/marketing/tiktok-01/script.json docs/marketing/tiktok-01`

| # | What | Content |
| --- | --- | --- |
| 1 | chat | "you asleep?" / "no" / "why" / "no reason" (timestamp Today 23:12) |
| 2 | chat | "that's never no reason" / "ok fine" / "I made you something" / "made me what" |
| 3 | chat | "just open it" / "is this a prank" / "no" / "maybe a bit cheesy" / "how cheesy" |
| 4 | chat | "on a scale of 1 to 10" / "an 11" / "oh no" / "ok send it" |
| 5 | chat | link card **For Ana · tryethos.io** / "opening" / "sound on" / "and be nice" / "no promises" / "fair" |
| 6 | gift | The Letter, closed: the envelope with the wax seal and "For Ana". Add the TikTok text sticker `Continue →` bottom right (pink pill, small). |
| 7 | gift | The letter open, handwriting fully typed out (screenshot after the typewriter finishes). Letter text below. |
| 8 | gift | Photos on the desk, captions visible. Six photos, captions below. |
| 9 | gift | The song. Either the Vinyl template screen ("Drop the needle", the record with their song title) or the end screen credit "Music: …". Sticker: `their song plays the whole time`. |
| 10 | chat | "ok" / "I'm crying in the bathroom at work" / "you MADE this??" / "took me ten minutes" / "lies" / "tryethos.io. go look" (timestamp Today 23:31) |

### The letter (slide 7), 92 words

> Ana. It's 11pm, you're doing your skincare, and I'm lying here thinking about how you
> always answer "almost" when I ask if you're in bed. I don't know when that became my
> favourite word. I don't want a big life. I want the one where you say almost and I
> wait. I made this instead of a card because a card can't play our song, and because I
> wanted you to have something you can open twice. Happy birthday. Come to bed.

Change "birthday" to whatever the occasion is. Keep one specific, slightly stupid detail
(the skincare, the "almost"). That's what makes it read as real.

### The six photos (slide 8), captions

Use your own photos. They should look like phone photos, not a shoot: one slightly
blurry, one badly lit, one where nobody is looking at the camera.

1. The first coffee, half drunk. Caption: *the coffee you didn't finish*
2. A train or car window, road ahead. *first trip, zero plans*
3. Dark tent or a sky with stars. *the night with no signal*
4. A kitchen in morning light. *your kitchen, 7am*
5. Them mid-laugh, bad angle. *the one you hate (I love it)*
6. Airport, arrivals or departures board. *airport, again*

### Making the gift (10 minutes)

On tryethos.io → The Letter → recipient "Ana", sender "Marco" (or real names) → paste the
letter → the six photos with the captions → Music: "A real song", search the song you want
(a 30-second preview loops; the credit shows at the end) → accent colour: leave the wax red.
Your account has every template unlocked, so no payment step. Open the published link on
your phone, sound on, and screen-record it from the seal to the end; take slides 6–9 as
frames or screenshots from that recording.

## Caption, tags, sound

Caption (pick one):
- "he said it was maybe a bit cheesy. it was an 11 😭 tryethos.io"
- "ten minutes, he said. TEN. tryethos.io"

Tags: #loveletter #digitalgift #boyfriend #giftideas #longdistance #anniversary #fyp #romance

Sound: something slow and known. The reference used Sufjan Stevens ("Mystery of Love");
similar: "Visions of Gideon", "The Night We Met", "Apocalypse (slowed)". Keep the volume
low so the slides feel quiet.

Post between 21:00 and 23:00 local. Pin a comment with just `tryethos.io`. Reply to the
first 20 comments within the hour; each reply is a new impression. Make three versions of
this carousel (birthday, long distance, apology) with the same first four slides and a
different letter, and post them a day apart to see which hook wins.

## Your own chat screenshots, if you want variations

- Most authentic: two phones (or a second Apple ID) in a real iMessage thread, dark mode,
  then crop the top so no name or number shows, exactly as above.
- The renderer in this folder: edit `script.json`, run the command at the top. It uses the
  Mac's real system font, so it matches iMessage more closely than online generators.
- Generators if you need them fast: ifaketextmessage.com, fakedetail.com (both let you
  set dark mode and hide the header). Avoid showing read receipts and "Delivered" labels
  inconsistently; real threads only show one at the bottom.
