# PakFreelance

**Live app: https://aqilashah955-cloud.github.io/PakFreelance/**

A freelance marketplace connecting Pakistani freelancers with local and international clients. Vanilla HTML/CSS/JS — no build step. Just open `index.html` in a browser (or serve the folder with `python3 -m http.server`).

## Screenshots

![PakFreelance homepage — hero, freelancer search, featured freelancers](screenshots/01-home.jpg)
![Find Freelancers — filters and freelancer cards](screenshots/02-freelancers.jpg)
![Freelancer profile — skills, services, reviews](screenshots/03-profile.jpg)
![Post a Job — budget, milestones, 5% fee preview](screenshots/04-post-job.jpg)

## What's inside

- **Home** — hero with freelancer search (keyword + city), popular services, top skills, featured freelancers, latest jobs, how-it-works, trust signals
- **Find Freelancers** — filter by category, city, price, rating, availability, language
- **Freelancer profiles** — photo, bio, skills, services & pricing, portfolio, reviews, languages, experience, verification badges, Hire / Message actions
- **Find Jobs** — filter by category, budget, job type; **AI match score** on every job card with a "Why this matches" breakdown
- **Post a Job** — with optional 2–4 payment milestones and a transparent 5% fee preview
- **Freelancer & Client dashboards** — stats, proposals, orders, saved jobs, messages shortcut
- **Payout methods** — JazzCash, Easypaisa, bank transfer, card, Wise, Payoneer (numbers masked, stored locally)
- **Escrow protection** — orders show "Held in escrow"; milestone-based release flow
- **Skill tests** — 5-question quiz per category (60% to pass) earns a "Skill test passed" badge
- **Dispute center** — open disputes from any active order; ticket with status timeline
- **Messages** — conversation list + chat UI with simulated replies
- **Order tracking** — status timeline, milestones, fee breakdown, revision flow
- **English/اردو toggle** — bilingual header + homepage
- **PKR/USD currency toggle** — prices convert at an approximate rate (1 USD ≈ Rs 280)
- **Trust pages** — About, Terms of Service, Privacy Policy, Contact (linked in the footer)

## Sample data

All freelancers, jobs, reviews, conversations, orders and payouts are **fictional sample data** for illustration only. Profile photos use `i.pravatar.cc`, portfolio images use seeded `picsum.photos` URLs.

User actions (posted jobs, proposals, saved jobs, messages, orders, disputes, payout methods, availability, quiz results, language) persist in `localStorage` under the key `pakfreelance_v1`. Clear site data in your browser to reset the sample.

## Differentiators (vs typical freelance platforms)

1. **Global payments in, local payouts out** — clients pay by card, Wise, or Payoneer; freelancers withdraw via JazzCash, Easypaisa, or bank transfer
2. **5% flat fee** — shown transparently everywhere (vs ~20% elsewhere)
3. **Escrow + milestones** — funds held until the client approves each milestone
4. **Verified freelancers** — ID, phone and skill-test badges
5. **AI match scores** — jobs ranked/explained for the freelancer's profile
6. **Bilingual UI** — English/Urdu switcher, plus a PKR/USD currency toggle
7. **Dispute center** — structured resolution with status tracking

## Contact

Service requests and partnership inquiries: **aqilashah955@gmail.com**
