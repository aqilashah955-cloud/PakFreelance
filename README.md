# PakFreelance

A demo freelance marketplace connecting Pakistani freelancers with local and international clients. Vanilla HTML/CSS/JS — no build step. Just open `index.html` in a browser (or serve the folder with `python3 -m http.server`).

## What's inside

- **Home** — hero with freelancer search (keyword + city), popular services, top skills, featured freelancers, latest jobs, how-it-works, trust signals
- **Find Freelancers** — filter by category, city, price, rating, availability, language
- **Freelancer profiles** — photo, bio, skills, services & pricing, portfolio, reviews, languages, experience, verification badges, Hire / Message actions
- **Find Jobs** — filter by category, budget, job type; **AI match score** on every job card with a "Why this matches" breakdown
- **Post a Job** — with optional 2–4 payment milestones and a transparent 5% fee preview
- **Freelancer & Client dashboards** — stats, proposals, orders, saved jobs, messages shortcut
- **Payout methods** — JazzCash, Easypaisa, bank transfer (demo UI, numbers masked, stored locally)
- **Escrow protection** — orders show "Held in escrow"; milestone-based release flow
- **Skill tests** — 5-question quiz per category (60% to pass) earns a "Skill test passed" badge
- **Dispute center** — open disputes from any active order; ticket with status timeline
- **Messages** — conversation list + chat UI with demo simulated replies
- **Order tracking** — status timeline, milestones, fee breakdown, revision flow
- **English/اردو toggle** — bilingual header + homepage

## Demo data

All freelancers, jobs, reviews, conversations, orders and payouts are **fictional sample data** for illustration only (marked as demo in the UI and code comments). Profile photos use `i.pravatar.cc`, portfolio images use seeded `picsum.photos` URLs.

User actions (posted jobs, proposals, saved jobs, messages, orders, disputes, payout methods, availability, quiz results, language) persist in `localStorage` under the key `pakfreelance_v1`. Clear site data in your browser to reset the demo.

## Differentiators (vs typical freelance platforms)

1. **Local payments** — JazzCash / Easypaisa / bank transfer payout methods
2. **5% flat fee** — shown transparently everywhere (vs ~20% elsewhere)
3. **Escrow + milestones** — funds held until the client approves each milestone
4. **Verified freelancers** — ID, phone and skill-test badges
5. **AI match scores** — jobs ranked/explained for the freelancer's profile
6. **Bilingual UI** — English/Urdu switcher
7. **Dispute center** — structured resolution with status tracking
