# The Ethos growth playbook

"The Organic App Growth Playbook" (the PDF), applied to tryethos.io. VIRAL-FORMULA.md covers
how to write one post. This covers what to post, where, how often, and how to tell what's
working.

## 1. The problem, not the app

Nobody cares about Ethos. They care about:

- what do I get him for our anniversary
- he says he wants nothing for his birthday
- we're broke but it's our first year
- I'm bad at saying how I feel
- it's tomorrow and I have nothing

Every post starts from one of those. Ethos is the answer at the end, never the start.

## 2. Three formats

1. **Text-story carousels.** 34 so far; 29–34 are built on real occasions. Entertainment, with
   the gift as one move in the chat. Best for reach and comments.
2. **Problem-first slideshows** (section 9). "If he says he wants nothing for his birthday, do
   this." People type exactly these into TikTok search, so they keep getting found for months.
   Ethos is one idea among real ones, which is why people trust it.
3. **Reaction videos** (later). Someone opening a gift at midnight: "pov: i opened the link he
   sent me". The PDF's UGC format. Start once a carousel concept has clearly won.

The PDF's fourth format, AI UGC, is left out on purpose: this audience spots a fake couple
fast, and the whole pitch is that it's real.

## 3. Accounts

| Account | Posts | Bio link |
|---|---|---|
| 1 · couple | the text-story carousels, as her | `tryethos.io/?ref=tt-couple` |
| 2 · gift ideas | the problem-first slideshows | `tryethos.io/?ref=tt-ideas` |
| 3 · reactions (later) | opening-the-gift videos | `tryethos.io/?ref=tt-react` |

The `?ref=` is how you tell which account makes money. The site carries it through to checkout,
and `node scripts/revenue-by-ref.mjs` shows checkouts started, paid, and revenue per ref. Keep
each account's code forever, and give every new account its own (on Instagram: `ig-couple`).

People who open a gift and tap "make your own" arrive with that gift's code, so the script also
shows how many sales came from gifts themselves. That part of the loop grows without posting.

The site holds the ref in memory rather than a cookie, so it needs no cookie banner. The catch:
someone who leaves and comes back days later counts as `(none)`.

## 4. The first 30 posts are research

The PDF's days 1 to 3 are done: the problem is chosen, the angles are written, and the first
batch is made. Now post every day for two weeks on both accounts, and don't judge any concept
on one post.

| Day | 1 · couple | 2 · gift ideas |
|---|---|---|
| 1 | 30 · her 21st | slideshow 1 · he wants nothing |
| 2 | 29 · 1 year | slideshow 2 · first anniversary |
| 3 | 33 · his birthday | slideshow 3 · stop spending |
| 4 | 31 · first date | slideshow 4 · long distance |
| 5 | 24 · green flag or bare minimum | slideshow 5 · last-minute |
| 6 | 25 · where i post u, part 1 | slideshow 6 · birthday card |
| 7 | 26 · part 2 | the best slideshow so far, new hook |
| 8–11 | 30, 29, 33, 31 again, with hook 2 | the best two slideshows, two new hooks each |
| 12–14 | the best three so far, hook 3 | three new slideshows on the occasion that's winning |

That's 28 posts. 32 (Valentine's) waits for early February, 34 (Christmas) for December.

`tracker.csv` has a row for each. Fill it in 48 hours after posting: views, likes, comments,
shares, saves, profile views (TikTok's analytics shows them), and link clicks if TikTok shows
them for your account. Sales can't be tied to one post, because everyone comes through the bio
link, so the script gives them per account and per day. A jump the day after a post is that
post.

## 5. Variations, not single posts

The hook decides most of the result, and nobody can tell which one wins until it's posted. Each
occasion carousel has five. The hook is the text you put at the top of slide 1, in the empty
black above the messages.

| # | Hook 1 | Hook 2 | Hook 3 | Hook 4 | Hook 5 |
|---|---|---|---|---|---|
| 29 · 1 year | he said "1 year of what" 😭 | our 1 year and he counted how many times i stole the duvet | pov: ur bf keeps a spreadsheet of ur crimes | i said happy 1 year and he said this | 365 days and he remembered the blurry photo |
| 30 · her 21st | he had to be the first one to say it | 23:58 "stay awake 2 more mins" 😭 | my 21st and he beat my mum by 40 seconds | i blew out the candles on my PHONE | pov: ur bf stays up to say it first |
| 31 · first date | a year since i was 15 mins late to our first date | he remembered the restaurant AND how late i was | our first date anniversary and he made fortune cookies | a year later and he still brings up that i was late | i say 15 mins. he says 20. |
| 32 · Valentine's | he said valentines is a scam | "flowers die in 3 days" 😭 | he says its a scam every year and then does this | pov: ur bf is anti valentines | the flower opened when i held it |
| 33 · his birthday | he said he wanted nothing for his birthday | men deserve this too 🥹 | i made my bf a game for his birthday and he cried | "nobodys ever made me anything" 😭 | got a photo of him at 5 from his mum |
| 34 · Christmas | we said no presents this year | "technically its not a present" 😭 | our first christmas and he lied | we're broke so we said no presents. he did this. | pov: u said no presents and meant it |

A repost with a new hook changes slide 1, which is the slide people judge. To make the chat look
new as well, change the names and times in the carousel's `script.json` and render it again:
`node scripts/tiktok-slides.mjs docs/marketing/tiktok-30/script.json docs/marketing/tiktok-30/v2`.

Test no hook at all, too. Plenty of big text-story posts open straight on the messages.

## 6. When one hits, don't move on

A post that does three times your average is the most valuable thing you'll get. Don't
celebrate and move to a new idea. Work out why it worked:

- What was the hook, and what made someone stop scrolling?
- How fast did it get to the point?
- What did it make people feel?
- What made them comment or share?

Then make five more, keeping the idea and changing the example: a new couple, new names, a new
occasion. If "first one to say it" wins, the next posts are first one to say happy anniversary,
first one to say merry christmas, first one to say happy new year.

## 7. The numbers that matter

Views → profile views → link clicks → checkouts started → paid.

- **Views, but few profile views:** people liked the story without wondering who posted it. Make
  the gift a bigger part of the story, or pin a comment that names it.
- **Profile views, but few clicks:** the bio isn't selling it. One line is enough: "make one for
  ur person 👇".
- **Clicks, but few checkouts:** people land and leave, or start a gift and give up. That's a
  site problem, not a content problem.
- **Checkouts started, but few paid:** the price or the checkout page.

Views are useful. Revenue decides what gets made more of.

## 8. Hook bank

The PDF's 25 hook templates, rewritten for gifts. Use them on the slideshows, and as slide-1
hooks when a carousel runs again.

| # | The PDF's template | Ours |
|---|---|---|
| 1 | I wish someone told me this sooner | i wish someone told me this before our first anniversary |
| 2 | If you use [thing], you need to know this | if ur bf says he wants nothing for his birthday, u need to know this |
| 3 | I just found out why [problem] keeps happening | i just found out why every gift i buy him ends up in a drawer |
| 4 | This is probably why you can't [result] | this is probably why u never know what to get her |
| 5 | Nobody talks about this part of [topic] | nobody talks about how hard it is to buy for someone who has everything |
| 6 | I tested [thing] for 7 days | i made his gift instead of buying it. heres what happened |
| 7 | 3 things I wish I knew before [thing] | 3 things i wish i knew before our first valentines |
| 8 | If you're struggling with [problem], try this | if u never know what to get him, try this |
| 9 | I thought [belief] was true until I tried this | i thought a good gift had to be expensive until i tried this |
| 10 | This completely changed how I [activity] | this completely changed how i do birthdays |
| 11 | The easiest way I've found to [result] | the easiest way ive found to make her cry (the good kind) |
| 12 | Stop doing [mistake] | stop buying her jewellery she didnt ask for |
| 13 | You are probably doing [thing] wrong | ur probably doing anniversaries wrong |
| 14 | Here's why [problem] keeps happening | heres why he says "i dont need anything" every year |
| 15 | I found an app that does something kind of insane | i found a website that does something kind of insane |
| 16 | This feels like cheating | this feels like cheating. 20 minutes and she cried |
| 17 | I can't believe this actually worked | i cant believe this worked on my dry boyfriend |
| 18 | I wish I had this when I was [situation] | i wish i had this when we were long distance |
| 19 | If I had to start over, I'd do this | if i could redo our first anniversary id do this |
| 20 | Here's the fastest way to [result] | the fastest last-minute gift that doesnt look last-minute |
| 21 | I tried the method everyone keeps talking about | i tried the digital gift everyone keeps posting |
| 22 | This is your sign to stop [thing] | this is ur sign to stop buying him socks |
| 23 | One tiny change made a ridiculous difference | i sent it at midnight instead of the morning. ridiculous difference |
| 24 | I found a way to [result] without [obstacle] | how i made our anniversary special without spending money |
| 25 | Why is nobody talking about this? | why is nobody talking about this 😭 |

## 9. Problem-first slideshows

For account 2. Six slides each: a hook, four ideas, and a last slide pointing to Ethos. Put the
text over your own photos in TikTok's editor: aesthetic, real, a bit blurry. Every Ethos idea
below is a real template, so the claims hold up when people click.

**1 · "If he says he wants nothing for his birthday, do this"** (Arcade)
1. If he says he wants nothing for his birthday, do this
2. Ask his mum for a photo of him at 5. Don't tell him.
3. Write down one thing he does that nobody else notices
4. Get his favourite snack. The big one, not the normal one.
5. Hide the photo and the note in a game he has to play to unlock
6. I made mine on tryethos.io, it's the arcade one

**2 · "I wish someone told me this before our first anniversary"** (Jar of Reasons)
1. I wish someone told me this before our first anniversary
2. She doesn't want jewellery she didn't ask for
3. Recreate your first date. Same place, same order, same table.
4. Write down 12 things only you would notice about her
5. Put them in a jar she shakes out one at a time
6. The jar one on tryethos.io, it took me 20 minutes

**3 · "Stop spending £100 on your anniversary"** (The Letter, Text Thread, Vinyl, Midnight
Countdown)
1. Stop spending £100 on your anniversary
2. A letter. Words are free.
3. The first thing you ever texted each other, sent again
4. A song that's yours, with your photos as the album covers
5. A countdown that hits zero at midnight
6. All of these are on tryethos.io, and the letter is free

**4 · "Long distance gift ideas that actually made her cry"** (Passport, Fortune Cookie,
Midnight Countdown)
1. Long distance gift ideas that actually made her cry
2. A voice note for the nights she can't sleep
3. A passport that draws the route from your city to hers
4. A cookie for every bad day, each with a note from you
5. A countdown to the second your flight lands
6. I did the passport one on tryethos.io 🌍

**5 · "Last-minute anniversary gifts that don't look last-minute"** (Constellations, Jar of
Reasons, The Letter)
1. Last-minute anniversary gifts that don't look last-minute
2. A night sky where every star is one of your memories
3. A jar of reasons she shakes out one at a time
4. A letter under a wax seal that writes itself out in your words
5. Each one takes about 20 minutes to make
6. tryethos.io, and you can send it tonight

**6 · "What to write in his birthday card when you're bad at words"** (The Letter)
1. What to write in his birthday card when you're bad at words
2. The first thing you noticed about him
3. Something he does that nobody else sees
4. One thing you want to do with him this year
5. Read it back. That's the card.
6. Or put it in a letter that opens with a wax seal. tryethos.io, it's free.

The captions are the search terms themselves: "birthday gift ideas for boyfriend",
"anniversary gift ideas cheap", "long distance gift ideas". That's how they get found.

## 10. The loop, and creators

Problem → content → testing → winner → more of the winner → creators → more accounts →
purchases → repeat.

Creators come last. Once three concepts have clearly won, pay creators to post their own
versions of those, and not before: paying to spread an untested idea is paying to find out it
didn't work. Run it as a pay-per-view campaign on Whop, where creators post and get paid per
1,000 views, with the winning carousels and their SCRIPT.md files as the brief. The PDF's last
section pushes a different platform through the author's affiliate link; any pay-per-view
platform does the job.
