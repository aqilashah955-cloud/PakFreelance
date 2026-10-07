/* =====================================================================
   PakFreelance — demo freelance marketplace (vanilla JS, no build step)
   ALL data below is fictional SAMPLE/DEMO data for illustration only.
   User actions (jobs, proposals, messages, orders, disputes, payouts)
   persist in localStorage under 'pakfreelance_v1'.
   ===================================================================== */

'use strict';

/* ---------------- Helpers ---------------- */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const uid = (p) => (p || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtPKR = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK');
const FEE_RATE = 0.05; // PakFreelance fee: 5% (vs competitors' ~20%)
const feeOf = (amt) => Math.round(Number(amt || 0) * FEE_RATE);
const daysAgo = (d) => d <= 0 ? 'Today' : d === 1 ? 'Yesterday' : d + ' days ago';
const fmtDate = (iso) => { try { return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return iso; } };
const todayISO = () => new Date().toISOString().slice(0, 10);

let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------------- Static reference data ---------------- */
const CATEGORIES = ['Web Development', 'Graphic Design', 'Video Editing', 'Content Writing', 'SEO', 'Digital Marketing', 'AI Services', 'UI/UX Design', 'Virtual Assistance', 'Translation'];
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot'];
// Demo portfolio image helper (picsum seeded — reliable placeholder imagery)
const pf = (id, n) => Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/pf-${id}-${i + 1}/600/400`);

/* ---------------- Demo freelancers (12) ---------------- */
const FREELANCERS = [
  { id: 'f1', name: 'Ahmed Raza', title: 'Full-Stack Web Developer', city: 'Karachi', cat: 'Web Development',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    bio: 'Full-stack developer with 6 years of experience building fast, responsive websites and web apps for startups and enterprises across Pakistan, the UK and the Gulf. I focus on clean code, SEO-friendly builds and on-time delivery.',
    photo: 'https://i.pravatar.cc/150?img=12', rateType: 'hr', rate: 2500, startingPrice: 15000,
    rating: 4.9, reviewsCount: 132, expYears: 6, projects: 87, languages: ['English', 'Urdu'],
    availability: 'available', verified: { id: true, phone: true, skill: false }, views: 2314, featured: true,
    portfolio: pf('f1', 4),
    services: [
      { name: 'Landing page', price: 15000, desc: 'Modern single-page site, mobile responsive, delivered in 5 days.' },
      { name: 'Business website', price: 35000, desc: 'Up to 8 pages with contact forms, maps and basic SEO.' },
      { name: 'Custom web application', price: 80000, desc: 'React + Node.js app with database and admin panel.' }
    ],
    reviews: [
      { client: 'Sarah Mitchell', rating: 5, text: 'Ahmed rebuilt our company site in two weeks. Communication was excellent and the code quality is top notch.', date: 'Sep 2026' },
      { client: 'Danish Enterprises', rating: 5, text: 'Delivered ahead of schedule. The admin panel is exactly what we needed.', date: 'Aug 2026' },
      { client: 'Omar Farooq', rating: 5, text: 'Third project together. Reliable, skilled and honest about timelines.', date: 'Jul 2026' },
      { client: 'TechStart UK', rating: 4, text: 'Great work overall. Minor revisions were handled quickly.', date: 'Jun 2026' },
      { client: 'Hina Aslam', rating: 5, text: 'My online store looks amazing and sales have already improved.', date: 'May 2026' }
    ] },
  { id: 'f2', name: 'Fatima Khan', title: 'Brand Identity & Logo Designer', city: 'Lahore', cat: 'Graphic Design',
    skills: ['Logo Design', 'Branding', 'Illustrator', 'Typography'],
    bio: 'Brand designer crafting memorable visual identities for startups and established businesses. From logo concepts to complete brand guidelines, I blend Pakistani aesthetics with modern design trends.',
    photo: 'https://i.pravatar.cc/150?img=47', rateType: 'project', rate: 0, startingPrice: 8000,
    rating: 5.0, reviewsCount: 98, expYears: 5, projects: 120, languages: ['English', 'Urdu'],
    availability: 'available', verified: { id: true, phone: true, skill: true }, views: 1876, featured: true,
    portfolio: pf('f2', 4),
    services: [
      { name: 'Logo design', price: 8000, desc: '3 concepts, 2 revision rounds, full vector files.' },
      { name: 'Brand identity kit', price: 22000, desc: 'Logo, color palette, typography and usage guide.' },
      { name: 'Social media kit', price: 12000, desc: 'Profile, covers and 10 post templates.' }
    ],
    reviews: [
      { client: 'Chai Khana Co.', rating: 5, text: 'Fatima gave our startup a brand we are proud of. The logo perfectly captures our story.', date: 'Sep 2026' },
      { client: 'Bilal Ahmed', rating: 5, text: 'Creative, professional and fast. Highly recommended.', date: 'Aug 2026' },
      { client: 'Nadia Sheikh', rating: 5, text: 'The brand guidelines document was incredibly thorough.', date: 'Jul 2026' },
      { client: 'StartupHub', rating: 5, text: 'Fourth designer we tried — finally, someone who gets it.', date: 'Jun 2026' }
    ] },
  { id: 'f3', name: 'Bilal Hussain', title: 'Video Editor & Motion Designer', city: 'Islamabad', cat: 'Video Editing',
    skills: ['Premiere Pro', 'After Effects', 'Color Grading', 'Sound Design'],
    bio: 'Video editor specializing in commercials, wedding films and YouTube content. 4 years of turning raw footage into stories people remember, with quick turnaround and broadcast-quality output.',
    photo: 'https://i.pravatar.cc/150?img=59', rateType: 'hr', rate: 3000, startingPrice: 12000,
    rating: 4.8, reviewsCount: 76, expYears: 4, projects: 64, languages: ['English', 'Urdu'],
    availability: 'limited', verified: { id: true, phone: true, skill: false }, views: 1204, featured: true,
    portfolio: pf('f3', 3),
    services: [
      { name: 'YouTube video edit', price: 12000, desc: 'Up to 10 minutes, captions, thumbnail included.' },
      { name: 'Wedding highlight reel', price: 35000, desc: '5-minute cinematic highlight with licensed music.' },
      { name: 'Commercial / ad edit', price: 25000, desc: '30–60 second ad with motion graphics.' }
    ],
    reviews: [
      { client: 'Events PK', rating: 5, text: 'The wedding reel made the couple cry — in a good way. Superb editing.', date: 'Sep 2026' },
      { client: 'VlogDaily', rating: 5, text: 'Edits 3 videos a week for my channel. Consistent quality.', date: 'Aug 2026' },
      { client: 'AdWorks', rating: 4, text: 'Good creative instincts. Delivery took a day longer than planned.', date: 'Jul 2026' },
      { client: 'Sana J.', rating: 5, text: 'Color grading transformed our dull footage completely.', date: 'Jun 2026' }
    ] },
  { id: 'f4', name: 'Ayesha Malik', title: 'SEO Content Writer', city: 'Rawalpindi', cat: 'Content Writing',
    skills: ['SEO Writing', 'Blog Posts', 'Copywriting', 'Research'],
    bio: 'Content writer with 5 years of experience producing ranking blog posts, website copy and product descriptions. 210+ projects for clients in Pakistan, the US and Australia. Research-driven, plagiarism-free, always on deadline.',
    photo: 'https://i.pravatar.cc/150?img=32', rateType: 'hr', rate: 1500, startingPrice: 5000,
    rating: 4.9, reviewsCount: 143, expYears: 5, projects: 210, languages: ['English', 'Urdu'],
    availability: 'available', verified: { id: true, phone: true, skill: true }, views: 2087, featured: true,
    portfolio: pf('f4', 3),
    services: [
      { name: 'Blog article (1,500 words)', price: 5000, desc: 'SEO-optimized, researched, with meta description.' },
      { name: 'Website copy (5 pages)', price: 18000, desc: 'Homepage, about, services and contact copy.' },
      { name: 'Product descriptions (20)', price: 8000, desc: 'Compelling, keyword-rich descriptions.' }
    ],
    reviews: [
      { client: 'BlogHub', rating: 5, text: 'Ayesha writes 8 articles a month for us. Traffic is up 60%.', date: 'Sep 2026' },
      { client: 'Mark Thompson', rating: 5, text: 'Native-level English. She understands SEO better than most marketers.', date: 'Aug 2026' },
      { client: 'ShopNow', rating: 5, text: 'Product descriptions that actually convert. Worth every rupee.', date: 'Jul 2026' },
      { client: 'EduSite', rating: 4, text: 'Strong research. Needed minor tone tweaks for our audience.', date: 'Jun 2026' },
      { client: 'TravelPK', rating: 5, text: 'Her travel pieces feel personal and rank well on Google.', date: 'May 2026' }
    ] },
  { id: 'f5', name: 'Usman Tariq', title: 'SEO Specialist', city: 'Faisalabad', cat: 'SEO',
    skills: ['Technical SEO', 'Link Building', 'Keyword Research', 'Google Analytics'],
    bio: 'SEO specialist helping businesses climb Google rankings with white-hat techniques. Technical audits, content strategy and authority building — no shortcuts, just sustainable growth.',
    photo: 'https://i.pravatar.cc/150?img=68', rateType: 'project', rate: 0, startingPrice: 18000,
    rating: 4.8, reviewsCount: 67, expYears: 6, projects: 92, languages: ['English', 'Urdu', 'Punjabi'],
    availability: 'available', verified: { id: true, phone: false, skill: false }, views: 1102, featured: false,
    portfolio: pf('f5', 3),
    services: [
      { name: 'SEO audit', price: 18000, desc: 'Full technical + content audit with action plan.' },
      { name: 'Monthly SEO retainer', price: 45000, desc: 'Ongoing optimization, reporting and link building.' }
    ],
    reviews: [
      { client: 'FashionHub', rating: 5, text: 'Organic traffic doubled in 4 months. Transparent reporting throughout.', date: 'Aug 2026' },
      { client: 'Kamran S.', rating: 4, text: 'Solid technical work. Link building took longer than expected.', date: 'Jul 2026' },
      { client: 'MediCare PK', rating: 5, text: 'We now rank #1 for our main keywords in Lahore.', date: 'Jun 2026' }
    ] },
  { id: 'f6', name: 'Sana Iqbal', title: 'Social Media Marketing Expert', city: 'Multan', cat: 'Digital Marketing',
    skills: ['Facebook Ads', 'Instagram Marketing', 'Content Strategy', 'Analytics'],
    bio: 'Digital marketer managing ad budgets of up to Rs 2M/month. I build campaigns that convert — from audience research and creative direction to scaling winning ads.',
    photo: 'https://i.pravatar.cc/150?img=44', rateType: 'hr', rate: 2200, startingPrice: 10000,
    rating: 4.9, reviewsCount: 84, expYears: 4, projects: 73, languages: ['English', 'Urdu'],
    availability: 'limited', verified: { id: true, phone: true, skill: false }, views: 1345, featured: false,
    portfolio: pf('f6', 3),
    services: [
      { name: 'Ad campaign setup', price: 10000, desc: 'One platform, full funnel setup with tracking.' },
      { name: 'Monthly ad management', price: 35000, desc: 'Ongoing optimization and weekly reports.' }
    ],
    reviews: [
      { client: 'BeautyBox', rating: 5, text: 'ROAS of 4.2x in the first month. Sana knows her craft.', date: 'Sep 2026' },
      { client: 'FoodieHub', rating: 5, text: 'Our Instagram grew from 2k to 25k followers.', date: 'Aug 2026' },
      { client: 'Asif R.', rating: 4, text: 'Good strategist. Wish reporting was more frequent.', date: 'Jul 2026' }
    ] },
  { id: 'f7', name: 'Hamza Sheikh', title: 'AI Solutions Developer', city: 'Karachi', cat: 'AI Services',
    skills: ['Python', 'NLP', 'Chatbots', 'OpenAI API'],
    bio: 'AI developer building practical solutions: bilingual chatbots, document automation and LLM integrations. I turn cutting-edge AI into tools that save businesses hours every week.',
    photo: 'https://i.pravatar.cc/150?img=15', rateType: 'hr', rate: 5000, startingPrice: 25000,
    rating: 5.0, reviewsCount: 51, expYears: 3, projects: 38, languages: ['English', 'Urdu'],
    availability: 'available', verified: { id: true, phone: true, skill: true }, views: 1620, featured: false,
    portfolio: pf('f7', 4),
    services: [
      { name: 'AI chatbot (Urdu/English)', price: 25000, desc: 'Website chatbot trained on your business data.' },
      { name: 'Document automation', price: 40000, desc: 'AI pipeline to process invoices, forms or reports.' }
    ],
    reviews: [
      { client: 'Banking Client · Karachi', rating: 5, text: 'The Urdu chatbot handles 70% of routine queries now.', date: 'Sep 2026' },
      { client: 'LogiChain', rating: 5, text: 'Hamza explained everything clearly — rare for AI work.', date: 'Aug 2026' },
      { client: 'EduTech', rating: 5, text: 'Delivered a working prototype in 10 days.', date: 'Jul 2026' }
    ] },
  { id: 'f8', name: 'Mahnoor Asif', title: 'UI/UX Designer', city: 'Lahore', cat: 'UI/UX Design',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    bio: 'Product designer focused on intuitive, beautiful interfaces. From user research and wireframes to polished Figma design systems, I design apps people love to use.',
    photo: 'https://i.pravatar.cc/150?img=26', rateType: 'project', rate: 0, startingPrice: 20000,
    rating: 4.9, reviewsCount: 89, expYears: 5, projects: 96, languages: ['English', 'Urdu'],
    availability: 'available', verified: { id: true, phone: true, skill: false }, views: 1588, featured: false,
    portfolio: pf('f8', 4),
    services: [
      { name: 'Mobile app UI (10 screens)', price: 20000, desc: 'High-fidelity Figma designs, 2 revisions.' },
      { name: 'UX audit + redesign', price: 35000, desc: 'Heuristic review and improved flows.' }
    ],
    reviews: [
      { client: 'FinPay', rating: 5, text: 'Our app store rating went from 3.1 to 4.6 after her redesign.', date: 'Sep 2026' },
      { client: 'HealthApp', rating: 5, text: 'Thoughtful research, beautiful execution.', date: 'Aug 2026' },
      { client: 'Tariq M.', rating: 4, text: 'Great designs; onboarding flow needed one extra iteration.', date: 'Jul 2026' }
    ] },
  { id: 'f9', name: 'Danish Ali', title: 'Virtual Assistant', city: 'Peshawar', cat: 'Virtual Assistance',
    skills: ['Admin Support', 'Data Entry', 'Email Management', 'Scheduling'],
    bio: 'Dependable virtual assistant for busy founders. Inbox management, scheduling, data entry, research and customer support — handled quietly and reliably so you can focus on growth.',
    photo: 'https://i.pravatar.cc/150?img=53', rateType: 'hr', rate: 1500, startingPrice: 6000,
    rating: 4.7, reviewsCount: 58, expYears: 3, projects: 45, languages: ['English', 'Urdu', 'Pashto'],
    availability: 'available', verified: { id: true, phone: true, skill: false }, views: 743, featured: false,
    portfolio: pf('f9', 3),
    services: [
      { name: 'VA starter pack (20 hrs)', price: 6000, desc: 'Admin, email and scheduling support.' },
      { name: 'Monthly VA retainer', price: 22000, desc: '80 hours/month dedicated assistance.' }
    ],
    reviews: [
      { client: 'RemoteCEO', rating: 5, text: 'Danish runs my calendar and inbox flawlessly.', date: 'Aug 2026' },
      { client: 'PropertyPK', rating: 4, text: 'Reliable and honest with hours. Good value.', date: 'Jul 2026' }
    ] },
  { id: 'f10', name: 'Iqra Naveed', title: 'English–Urdu Translator', city: 'Quetta', cat: 'Translation',
    skills: ['Urdu Translation', 'Arabic Translation', 'Proofreading', 'Localization'],
    bio: 'Professional translator (English ↔ Urdu, Arabic → Urdu) with 4 years of experience across legal, medical and marketing content. Accurate, culturally aware and always proofread twice.',
    photo: 'https://i.pravatar.cc/150?img=38', rateType: 'hr', rate: 1800, startingPrice: 4000,
    rating: 4.8, reviewsCount: 71, expYears: 4, projects: 130, languages: ['English', 'Urdu', 'Arabic'],
    availability: 'limited', verified: { id: true, phone: false, skill: true }, views: 689, featured: false,
    portfolio: pf('f10', 3),
    services: [
      { name: 'Document translation (per 1,000 words)', price: 4000, desc: 'Certified-quality translation with proofreading.' },
      { name: 'Website localization', price: 15000, desc: 'Full site translation adapted for local audiences.' }
    ],
    reviews: [
      { client: 'LegalAid', rating: 5, text: 'Precise legal translations. We trust her with sensitive documents.', date: 'Sep 2026' },
      { client: 'NGO Balochistan', rating: 5, text: 'Fast, accurate and culturally sensitive.', date: 'Aug 2026' }
    ] },
  { id: 'f11', name: 'Faisal Mahmood', title: 'WordPress & Frontend Developer', city: 'Hyderabad', cat: 'Web Development',
    skills: ['WordPress', 'HTML', 'CSS', 'WooCommerce'],
    bio: 'WordPress developer building affordable, professional websites for small businesses. Themes, plugins, WooCommerce stores and speed optimization — done right the first time.',
    photo: 'https://i.pravatar.cc/150?img=61', rateType: 'hr', rate: 2000, startingPrice: 12000,
    rating: 4.6, reviewsCount: 44, expYears: 2, projects: 31, languages: ['English', 'Urdu', 'Sindhi'],
    availability: 'available', verified: { id: true, phone: true, skill: false }, views: 512, featured: false,
    portfolio: pf('f11', 3),
    services: [
      { name: 'WordPress business site', price: 12000, desc: 'Up to 6 pages, contact form, speed optimized.' },
      { name: 'WooCommerce store', price: 28000, desc: 'Full online store with payments and shipping.' }
    ],
    reviews: [
      { client: 'BakeryHouse', rating: 5, text: 'Our online ordering site paid for itself in a month.', date: 'Aug 2026' },
      { client: 'SalonGlow', rating: 4, text: 'Good work for the price. Communication could be faster.', date: 'Jul 2026' }
    ] },
  { id: 'f12', name: 'Hira Shah', title: 'Social Media Graphic Designer', city: 'Sialkot', cat: 'Graphic Design',
    skills: ['Canva', 'Photoshop', 'Social Media Design', 'Thumbnails'],
    bio: 'Designer creating scroll-stopping social media graphics, thumbnails and ad creatives. Quick turnaround, unlimited-stock aesthetic sense, and designs that match your brand voice.',
    photo: 'https://i.pravatar.cc/150?img=20', rateType: 'project', rate: 0, startingPrice: 7000,
    rating: 4.8, reviewsCount: 63, expYears: 3, projects: 78, languages: ['English', 'Urdu'],
    availability: 'busy', verified: { id: true, phone: true, skill: false }, views: 934, featured: false,
    portfolio: pf('f12', 3),
    services: [
      { name: 'Social media pack (15 posts)', price: 7000, desc: 'Branded templates for Instagram/Facebook.' },
      { name: 'YouTube thumbnails (10)', price: 5000, desc: 'High-CTR thumbnail designs.' }
    ],
    reviews: [
      { client: 'FitLife', rating: 5, text: 'Our engagement doubled with her designs.', date: 'Sep 2026' },
      { client: 'GadgetZone', rating: 4, text: 'Creative and quick. Slightly busy schedule.', date: 'Aug 2026' }
    ] }
];
const freelancerById = (id) => FREELANCERS.find((f) => f.id === id);

/* ---------------- Demo jobs (8) ---------------- */
const JOBS = [
  { id: 'j1', title: 'Build a responsive e-commerce website', cat: 'Web Development',
    desc: 'We need a full e-commerce website for our clothing brand: product catalog, cart, checkout, and an admin panel. Prefer React + Node.js or WordPress/WooCommerce. Design references will be provided.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'], budgetType: 'fixed', budget: 85000,
    deadline: '2026-11-15', type: 'remote', client: { name: 'Imran Sheikh (you)', city: 'Lahore', country: 'Pakistan', verified: true },
    postedDaysAgo: 1, proposalsCount: 2, mine: true,
    milestones: [{ title: 'Homepage + product pages', amount: 30000 }, { title: 'Cart, checkout & admin panel', amount: 35000 }, { title: 'Testing & launch', amount: 20000 }] },
  { id: 'j2', title: 'Logo and brand identity for a chai startup', cat: 'Graphic Design',
    desc: 'New chai brand launching in Karachi needs a warm, memorable logo plus basic brand guidelines (colors, typography). Target audience is young professionals.',
    skills: ['Logo Design', 'Branding', 'Illustrator'], budgetType: 'fixed', budget: 15000,
    deadline: '2026-10-20', type: 'remote', client: { name: 'Chai Khana Co.', city: 'Karachi', country: 'Pakistan', verified: true },
    postedDaysAgo: 2, proposalsCount: 5, mine: false },
  { id: 'j3', title: 'Edit a 5-minute wedding highlight reel', cat: 'Video Editing',
    desc: '4 hours of wedding footage needs to become a 5-minute cinematic highlight. Licensed music, color grading and clean audio mixing required.',
    skills: ['Premiere Pro', 'Color Grading', 'Sound Design'], budgetType: 'fixed', budget: 20000,
    deadline: '2026-10-25', type: 'remote', client: { name: 'Events PK', city: 'Islamabad', country: 'Pakistan', verified: true },
    postedDaysAgo: 3, proposalsCount: 4, mine: false },
  { id: 'j4', title: 'SEO audit and 3-month growth plan', cat: 'SEO',
    desc: 'Our fashion e-commerce site gets little organic traffic. Need a full technical + content SEO audit and a practical 3-month plan our team can follow.',
    skills: ['Technical SEO', 'Keyword Research', 'Google Analytics'], budgetType: 'fixed', budget: 30000,
    deadline: '2026-10-30', type: 'remote', client: { name: 'Imran Sheikh (you)', city: 'Lahore', country: 'Pakistan', verified: true },
    postedDaysAgo: 4, proposalsCount: 2, mine: true },
  { id: 'j5', title: '10 blog articles on Pakistani travel destinations', cat: 'Content Writing',
    desc: 'Travel blog needs 10 well-researched, SEO-friendly articles (1,200+ words each) on northern Pakistan destinations. Must include original angles, not rewritten listicles.',
    skills: ['SEO Writing', 'Blog Posts', 'Research'], budgetType: 'fixed', budget: 25000,
    deadline: '2026-11-10', type: 'remote', client: { name: 'Wanderlust Media', city: 'Dubai', country: 'UAE', verified: true },
    postedDaysAgo: 5, proposalsCount: 9, mine: false },
  { id: 'j6', title: 'Facebook & Instagram ad campaign for skincare brand', cat: 'Digital Marketing',
    desc: 'Launch campaign for a new skincare line: audience research, 3 ad creatives direction, campaign setup and 2 weeks of optimization. Monthly ad budget Rs 300k.',
    skills: ['Facebook Ads', 'Instagram Marketing', 'Analytics'], budgetType: 'fixed', budget: 40000,
    deadline: '2026-10-18', type: 'remote', client: { name: 'GlowLab', city: 'London', country: 'UK', verified: true },
    postedDaysAgo: 6, proposalsCount: 7, mine: false },
  { id: 'j7', title: 'AI chatbot for customer support (Urdu/English)', cat: 'AI Services',
    desc: 'Bilingual chatbot for our telecom support site. Must answer FAQs in Urdu and English, escalate to humans when unsure, and integrate with our existing helpdesk.',
    skills: ['Python', 'NLP', 'Chatbots'], budgetType: 'fixed', budget: 60000,
    deadline: '2026-11-30', type: 'remote', client: { name: 'ConnectTel', city: 'Karachi', country: 'Pakistan', verified: true },
    postedDaysAgo: 7, proposalsCount: 3, mine: false },
  { id: 'j8', title: 'Mobile app UI for a fintech wallet', cat: 'UI/UX Design',
    desc: 'Design 15 high-fidelity screens for a mobile wallet app (onboarding, dashboard, transfers, bill payments). Figma delivery with a mini design system. Onsite collaboration in Karachi preferred.',
    skills: ['Figma', 'Prototyping', 'Design Systems'], budgetType: 'fixed', budget: 55000,
    deadline: '2026-11-20', type: 'onsite', client: { name: 'FinPay', city: 'Karachi', country: 'Pakistan', verified: true },
    postedDaysAgo: 8, proposalsCount: 6, mine: false }
];
const jobById = (id) => JOBS.find((j) => j.id === id) || state.myJobs.find((j) => j.id === id);
const allJobs = () => [...state.myJobs, ...JOBS];

/* ---------------- Seed proposals (demo) ---------------- */
const SEED_PROPOSALS = [
  { id: 'sp1', jobId: 'j1', freelancerId: 'f11', cover: 'I have built 12 WooCommerce stores for clothing brands. I can deliver your e-commerce site with product catalog, cart, checkout and admin panel in 3 weeks, with training videos for your team.', bid: 78000, days: 21, status: 'pending', date: '2026-09-29' },
  { id: 'sp2', jobId: 'j1', freelancerId: 'f8', cover: 'As a UI/UX designer who also builds frontends, I will make your store beautiful AND fast. Includes a full Figma prototype before development starts.', bid: 90000, days: 28, status: 'pending', date: '2026-09-30' },
  { id: 'sp3', jobId: 'j4', freelancerId: 'f5', cover: 'Fashion e-commerce SEO is my specialty. My audit covers 120+ technical checkpoints plus a content plan targeting buyer keywords. Expect the full report in 10 days.', bid: 28000, days: 10, status: 'pending', date: '2026-09-28' },
  { id: 'sp4', jobId: 'j4', freelancerId: 'f6', cover: 'I combine SEO with content strategy so rankings actually turn into sales. Includes competitor gap analysis and a 3-month editorial calendar.', bid: 32000, days: 12, status: 'pending', date: '2026-09-29' }
];

/* ---------------- Seed conversations (demo) ---------------- */
const SEED_CONVS = [
  { id: 'c1', withId: 'f2', withName: 'Fatima Khan', withPhoto: 'https://i.pravatar.cc/150?img=47', role: 'freelancer',
    messages: [
      { from: 'them', text: 'Assalam-o-Alaikum! Thanks for your interest in the logo project.', time: 'Yesterday, 4:12 PM' },
      { from: 'me', text: 'Walaikum Assalam! I love your portfolio. Can you share initial concepts by Friday?', time: 'Yesterday, 4:40 PM' },
      { from: 'them', text: 'Absolutely — I will send 3 concepts by Friday evening.', time: 'Yesterday, 5:02 PM' }
    ], unread: 0 },
  { id: 'c2', withId: 'cl1', withName: 'David O\u2019Brien', withPhoto: 'https://i.pravatar.cc/150?img=8', role: 'client',
    messages: [
      { from: 'them', text: 'Hi Ahmed, the homepage mockup looks great. One small change: can the hero banner be full-width?', time: 'Today, 10:15 AM' },
      { from: 'me', text: 'Hi David! Sure — I will update it and share a preview by tonight.', time: 'Today, 10:32 AM' }
    ], unread: 1 },
  { id: 'c3', withId: 'f4', withName: 'Ayesha Malik', withPhoto: 'https://i.pravatar.cc/150?img=32', role: 'freelancer',
    messages: [
      { from: 'them', text: 'Hello! I saw your job post for travel articles. I have written extensively on northern Pakistan.', time: '2 days ago' }
    ], unread: 1 }
];

/* ---------------- Done-For-You agency services (fulfilled by the PakFreelance in-house team) ---------------- */
const TEAM_WHATSAPP = '923456121725'; // +92 345 6121725 — service requests & support
const TEAM_EMAIL = 'YOUR_EMAIL_HERE'; // <-- TODO: set the team's email address
const AGENCY_SERVICES = [
  { id: 'web', emoji: '🌐', title: 'Business Website',
    desc: 'A fast, mobile-friendly website for your business — designed, built and launched by our team.',
    packages: [
      { name: 'Starter', price: 25000, days: 7, features: ['Up to 5 pages', 'Mobile responsive', 'Contact form + WhatsApp button', 'Basic SEO setup'] },
      { name: 'Business', price: 45000, days: 14, features: ['Up to 12 pages', 'Blog / news section', 'Google Maps + Analytics', 'Speed optimization'] },
      { name: 'Premium', price: 80000, days: 21, features: ['Up to 25 pages', 'Online store / booking', 'Custom design system', '1 month free support'] }
    ] },
  { id: 'logo', emoji: '🎨', title: 'Logo & Brand Kit',
    desc: 'A professional logo and complete brand identity your customers will remember.',
    packages: [
      { name: 'Starter', price: 8000, days: 4, features: ['2 logo concepts', '2 revision rounds', 'PNG + JPG files'] },
      { name: 'Business', price: 15000, days: 7, features: ['4 logo concepts', 'Unlimited revisions', 'Vector + print files', 'Color palette'] },
      { name: 'Premium', price: 28000, days: 10, features: ['6 logo concepts', 'Full brand guide', 'Business card + letterhead', 'Social media kit'] }
    ] },
  { id: 'content', emoji: '✍️', title: 'Content Writing',
    desc: 'SEO-friendly articles and website copy written in clear, natural English (or Urdu).',
    packages: [
      { name: 'Starter', price: 3000, days: 3, features: ['1 article up to 800 words', 'SEO keywords included', '1 revision round'] },
      { name: 'Business', price: 12000, days: 7, features: ['5 articles up to 1000 words', 'Meta titles + descriptions', 'Plagiarism-free guarantee'] },
      { name: 'Premium', price: 25000, days: 14, features: ['12 articles up to 1200 words', 'Content calendar', 'Images + formatting', 'Priority support'] }
    ] },
  { id: 'video', emoji: '🎬', title: 'Video Editing',
    desc: 'Polished videos for YouTube, TikTok, Instagram and ads — edited to keep viewers watching.',
    packages: [
      { name: 'Starter', price: 5000, days: 3, features: ['1 video up to 2 min', 'Captions / subtitles', 'Music + transitions'] },
      { name: 'Business', price: 18000, days: 7, features: ['4 videos up to 5 min', 'Thumbnail designs', 'Color grading', '2 revision rounds'] },
      { name: 'Premium', price: 40000, days: 14, features: ['10 videos up to 10 min', 'Motion graphics intro', 'Full YouTube optimization', 'Dedicated editor'] }
    ] },
  { id: 'social', emoji: '📣', title: 'Social Media Management',
    desc: 'We run your Facebook, Instagram and TikTok — posts, reels and replies, every week.',
    packages: [
      { name: 'Starter', price: 15000, days: 30, features: ['12 posts / month', 'Caption writing', 'Basic design'] },
      { name: 'Business', price: 30000, days: 30, features: ['20 posts + 4 reels / month', 'Comment replies', 'Monthly growth report'] },
      { name: 'Premium', price: 55000, days: 30, features: ['30 posts + 8 reels / month', 'Ad campaign management', 'Dedicated manager', 'Weekly reports'] }
    ] },
  { id: 'seo', emoji: '🔍', title: 'SEO Starter Pack',
    desc: 'Get found on Google — technical fixes, keywords and content that rank.',
    packages: [
      { name: 'Starter', price: 12000, days: 7, features: ['Full SEO audit', '20 keywords researched', 'Fix list for your site'] },
      { name: 'Business', price: 28000, days: 21, features: ['Everything in Starter', '10 pages optimized', 'Google Business profile', 'Backlink starter (10 links)'] },
      { name: 'Premium', price: 50000, days: 30, features: ['Everything in Business', '20 pages optimized', 'Monthly content plan', 'Rank tracking dashboard'] }
    ] },
  { id: 'servers', emoji: '🖥️', title: 'Server Setup & Management',
    desc: 'Your website or app live on a fast, secure server — we set it up, deploy your project and look after it.',
    packages: [
      { name: 'Starter', price: 15000, days: 3, features: ['VPS server setup', 'Domain + free SSL certificate', 'Basic security hardening', '1 website deployed'] },
      { name: 'Business', price: 35000, days: 7, features: ['Cloud VPS on any provider', 'Deployment pipeline', 'Daily automatic backups', 'Uptime monitoring', '1 month free management'] },
      { name: 'Premium', price: 70000, days: 14, features: ['Multi-server setup', 'Load balancing', 'Advanced firewall protection', 'Performance tuning', '3 months managed support'] }
    ] },
  { id: 'apps', emoji: '📱', title: 'Mobile App Development',
    desc: 'A real Android & iPhone app for your business — designed, built and published on the app stores by our team.',
    packages: [
      { name: 'Starter', price: 80000, days: 30, features: ['Android app, up to 5 screens', 'Clean modern design', 'Play Store publishing'] },
      { name: 'Business', price: 150000, days: 45, features: ['Android + iOS from one codebase', 'Up to 12 screens', 'Push notifications', 'Backend + admin panel'] },
      { name: 'Premium', price: 300000, days: 75, features: ['Everything in Business', 'Payments integration', 'Maps, chat or booking features', '3 months free support'] }
    ] },
  { id: 'software', emoji: '💻', title: 'Custom Software Development',
    desc: 'Billing systems, dashboards, school or shop management — software built exactly the way your business works.',
    packages: [
      { name: 'Starter', price: 60000, days: 21, features: ['Single-purpose business tool', 'Simple database', '1 user role', 'Training video included'] },
      { name: 'Business', price: 120000, days: 40, features: ['Multi-user system', 'Reports + printable invoices', 'User roles & permissions', 'Data backup setup'] },
      { name: 'Premium', price: 250000, days: 60, features: ['Full management system (CRM / ERP-lite)', 'Third-party integrations', 'Cloud hosting setup', '3 months free support'] }
    ] },
  { id: 'aibot', emoji: '🤖', title: 'AI Chatbot & Automation',
    desc: 'A smart chatbot that answers your customers on WhatsApp and your website — day and night, even while you sleep.',
    packages: [
      { name: 'Starter', price: 20000, days: 7, features: ['WhatsApp chatbot', 'Answers FAQs automatically', 'Handover to a human agent'] },
      { name: 'Business', price: 45000, days: 14, features: ['AI-powered smart replies', 'Website + WhatsApp', 'Lead capture to Google Sheet', '2 revision rounds'] },
      { name: 'Premium', price: 90000, days: 21, features: ['Multi-channel bot', 'CRM integration', 'Workflow automation', 'Monthly performance report'] }
    ] }
];

/* ---------------- Seed orders (demo) ---------------- */
const SEED_ORDERS = [
  { id: 'o1', jobTitle: 'Company website for Al-Noor Traders', freelancerId: 'f1', freelancerName: 'Ahmed Raza',
    clientName: 'David O\u2019Brien (UK)', amount: 45000, deadline: '2026-10-20', status: 'in_progress',
    escrow: true, notes: '5-page company site with product catalog.', created: '2026-09-22', mineAs: 'freelancer',
    milestones: [
      { id: 'm1', title: 'Design mockups', amount: 15000, status: 'released' },
      { id: 'm2', title: 'Development', amount: 20000, status: 'pending' },
      { id: 'm3', title: 'Testing & launch', amount: 10000, status: 'pending' }
    ] },
  { id: 'o2', jobTitle: 'Landing page for TechStart', freelancerId: 'f1', freelancerName: 'Ahmed Raza',
    clientName: 'TechStart UK', amount: 18000, deadline: '2026-09-15', status: 'completed',
    escrow: true, notes: 'Single-page marketing site.', created: '2026-09-01', mineAs: 'freelancer',
    milestones: [{ id: 'm4', title: 'Full delivery', amount: 18000, status: 'released' }] },
  { id: 'o3', jobTitle: 'Logo design for chai startup', freelancerId: 'f2', freelancerName: 'Fatima Khan',
    clientName: 'Imran Sheikh (you)', amount: 12000, deadline: '2026-10-12', status: 'in_progress',
    escrow: true, notes: 'Logo + mini brand guide.', created: '2026-09-25', mineAs: 'client',
    milestones: [
      { id: 'm5', title: 'Logo concepts', amount: 6000, status: 'delivered' },
      { id: 'm6', title: 'Final files + brand guide', amount: 6000, status: 'pending' }
    ] }
];

/* ---------------- Seed disputes (demo) ---------------- */
const SEED_DISPUTES = [
  { id: 'd1', orderId: 'o2', orderTitle: 'Landing page for TechStart',
    reason: 'Revision turnaround', details: 'Client requested extra revisions beyond scope; resolved with one additional paid revision round.',
    status: 'resolved', date: '2026-09-12',
    timeline: [
      { stage: 'Opened', note: 'Dispute opened by freelancer', date: '2026-09-10', done: true },
      { stage: 'Under review', note: 'PakFreelance team reviewed messages and scope', date: '2026-09-11', done: true },
      { stage: 'Resolved', note: 'Resolved: one additional paid revision round', date: '2026-09-12', done: true }
    ] }
];

/* ---------------- Skill-test quiz bank (demo — 5 questions per category) ---------------- */
const QUIZ = {
  'Web Development': [
    { q: 'Which HTML tag is used for the largest heading?', o: ['<h1>', '<h6>', '<head>', '<header>'], a: 0 },
    { q: 'What does CSS "box-sizing: border-box" do?', o: ['Includes padding and border in the element\u2019s total width', 'Removes all margins', 'Centers the element', 'Makes text bold'], a: 0 },
    { q: 'Which method adds an element to the end of a JavaScript array?', o: ['push()', 'pop()', 'shift()', 'append()'], a: 0 },
    { q: 'In React, component state is used for…', o: ['Data that changes over time and triggers re-renders', 'Permanent database storage', 'CSS styling', 'Routing between pages'], a: 0 },
    { q: 'Which HTTP status code means "Not Found"?', o: ['200', '301', '404', '500'], a: 2 }
  ],
  'Graphic Design': [
    { q: 'The CMYK color model is primarily used for…', o: ['Web graphics', 'Print', 'Social media', 'Video'], a: 1 },
    { q: 'Which file format supports transparency?', o: ['JPEG', 'PNG', 'TIFF', 'BMP'], a: 1 },
    { q: 'In typography, "kerning" refers to…', o: ['Space between lines', 'Space between characters', 'Font weight', 'Line height'], a: 1 },
    { q: 'A vector graphic is…', o: ['Resolution-independent and scalable', 'Always photographic', 'Limited to 256 colors', 'Only for print'], a: 0 },
    { q: 'Complementary colors are…', o: ['Next to each other on the wheel', 'Opposite each other on the color wheel', 'Different shades of one hue', 'Black and white only'], a: 1 }
  ],
  'Video Editing': [
    { q: 'A frame rate of 24fps is commonly used for…', o: ['A cinematic look', 'Slow motion', 'Live streaming', 'Gaming videos'], a: 0 },
    { q: 'In editing, a "J-cut" is when…', o: ['Audio of the next scene starts before its video', 'The video freezes', 'Two clips cross-dissolve', 'The timeline is trimmed'], a: 0 },
    { q: 'Which is a high-quality intermediate codec for editing?', o: ['H.264', 'ProRes', 'MP3', 'JPEG'], a: 1 },
    { q: 'Color grading primarily affects…', o: ['Mood and tone of the footage', 'File size', 'Audio levels', 'Frame rate'], a: 0 },
    { q: 'Shooting at 60fps allows smooth slow motion at…', o: ['24fps', '120fps', '15fps', '240fps'], a: 0 }
  ],
  'Content Writing': [
    { q: 'In writing and marketing, SEO stands for…', o: ['Search Engine Optimization', 'Social Engagement Online', 'Site Entry Order', 'Standard Editorial Outline'], a: 0 },
    { q: 'A meta description should ideally be…', o: ['Under ~160 characters', 'At least 500 characters', 'Exactly 10 words', 'Hidden from readers'], a: 0 },
    { q: '"Show, don\u2019t tell" in writing means…', o: ['Use vivid specifics instead of vague claims', 'Add more adjectives', 'Write longer sentences', 'Avoid dialogue'], a: 0 },
    { q: 'Which improves article readability most?', o: ['Long unbroken paragraphs', 'Short paragraphs and subheadings', 'Tiny font size', 'No images'], a: 1 },
    { q: 'Plagiarism is…', o: ['Reusing your own draft', 'Copying others\u2019 work without credit', 'Citing sources', 'Paraphrasing with attribution'], a: 1 }
  ],
  'SEO': [
    { q: 'A backlink is…', o: ['A link from another site to yours', 'A link to your homepage menu', 'A broken link', 'A paid advertisement'], a: 0 },
    { q: 'Which most directly affects search rankings?', o: ['Font choice', 'Quality, relevant content', 'Number of images', 'Background color'], a: 1 },
    { q: '"SERP" stands for…', o: ['Search Engine Results Page', 'Site Engagement Ranking Point', 'Standard Entry Referral Page', 'Search Error Report Panel'], a: 0 },
    { q: 'A canonical tag is used to…', o: ['Avoid duplicate-content issues', 'Speed up images', 'Track visitors', 'Encrypt the page'], a: 0 },
    { q: 'Page speed affects…', o: ['Rankings and user experience', 'Only desktop users', 'Image colors', 'Domain registration'], a: 0 }
  ],
  'Digital Marketing': [
    { q: 'CTR stands for…', o: ['Click-Through Rate', 'Cost To Revenue', 'Creative Testing Rule', 'Customer Target Reach'], a: 0 },
    { q: 'A lookalike audience is…', o: ['People similar to your existing customers', 'Your competitors\u2019 followers', 'Random users', 'Only past buyers'], a: 0 },
    { q: 'Which metric measures cost efficiency per new customer?', o: ['CPA', 'CTR', 'CPM', 'Reach'], a: 0 },
    { q: 'A/B testing compares…', o: ['Two variants to see which performs better', 'Two budgets', 'Two platforms', 'Two agencies'], a: 0 },
    { q: 'The funnel stage right after awareness is…', o: ['Consideration', 'Purchase', 'Loyalty', 'Advocacy'], a: 0 }
  ],
  'AI Services': [
    { q: '"NLP" stands for…', o: ['Natural Language Processing', 'Neural Link Protocol', 'New Learning Paradigm', 'Network Latency Performance'], a: 0 },
    { q: 'In AI, a "prompt" is…', o: ['An input instruction given to an AI model', 'A billing notice', 'A software update', 'A type of database'], a: 0 },
    { q: 'Fine-tuning a model means…', o: ['Training it further on specific data', 'Making it smaller', 'Deleting it', 'Changing its color theme'], a: 0 },
    { q: 'Embeddings are commonly used for…', o: ['Semantic search', 'Video rendering', 'Password storage', 'File compression'], a: 0 },
    { q: '"Hallucination" in AI refers to…', o: ['Confident but false outputs', 'Slow responses', 'High costs', 'Crashing apps'], a: 0 }
  ],
  'UI/UX Design': [
    { q: 'UX design primarily focuses on…', o: ['How the product feels and works for users', 'Logo colors', 'Server speed', 'Marketing copy'], a: 0 },
    { q: 'A wireframe is…', o: ['A low-fidelity layout blueprint', 'A final polished design', 'A color palette', 'A user persona'], a: 0 },
    { q: 'Fitts\u2019s Law relates to…', o: ['Target size and distance for easy interaction', 'Font pairing rules', 'Grid column counts', 'Image compression'], a: 0 },
    { q: 'Which improves form usability?', o: ['Many fields on one screen', 'Clear labels and inline validation', 'Placeholder-only labels', 'No error messages'], a: 1 },
    { q: 'A design system is…', o: ['Reusable components and guidelines', 'A single poster', 'A mood board', 'A font license'], a: 0 }
  ],
  'Virtual Assistance': [
    { q: 'A virtual assistant\u2019s most important skill is…', o: ['Communication and reliability', 'Graphic design', 'Video editing', 'Coding'], a: 0 },
    { q: 'Which tool is commonly used for scheduling?', o: ['Calendly', 'Photoshop', 'Premiere Pro', 'AutoCAD'], a: 0 },
    { q: '"Inbox zero" means…', o: ['Keeping email organized and handled', 'Deleting all emails', 'Zero new contacts', 'No spam filter'], a: 0 },
    { q: 'An SOP is a…', o: ['Standard Operating Procedure', 'Software Operation Plan', 'Sales Order Process', 'Service Online Portal'], a: 0 },
    { q: 'Time tracking helps a VA…', o: ['Report hours transparently', 'Work slower', 'Avoid clients', 'Skip meetings'], a: 0 }
  ],
  'Translation': [
    { q: '"Localization" goes beyond translation by…', o: ['Adapting content culturally for the audience', 'Using bigger fonts', 'Adding images', 'Shortening text'], a: 0 },
    { q: 'A translation glossary ensures…', o: ['Consistent terminology', 'Faster typing', 'Lower costs only', 'Shorter deadlines'], a: 0 },
    { q: '"Transcreation" is…', o: ['Creative adaptation preserving intent and emotion', 'Word-for-word translation', 'Machine translation', 'Copy-pasting'], a: 0 },
    { q: 'The biggest risk of machine-translating legal text is…', o: ['Inaccuracy with serious consequences', 'File size', 'Font issues', 'Slow delivery'], a: 0 },
    { q: 'Back-translation is used to…', o: ['Verify translation accuracy', 'Translate twice as fast', 'Change languages', 'Add footnotes'], a: 0 }
  ]
};

/* ---------------- i18n: English / Urdu (header + homepage chrome) ---------------- */
const I18N = {
  en: {
    nav_home: 'Home', nav_freelancers: 'Find Freelancers', nav_jobs: 'Find Jobs', nav_agency: '🚀 Done For You', nav_messages: 'Messages',
    nav_dash: 'Dashboards \u25BE', nav_dash_f: 'Freelancer Dashboard', nav_dash_c: 'Client Dashboard', nav_post: 'Post a Job',
    hero_kicker: 'Pakistan\u2019s trusted freelance marketplace',
    hero_h1: 'Hire skilled freelancers. Find meaningful work.',
    hero_sub: 'Thousands of vetted Pakistani professionals \u2014 developers, designers, writers and marketers \u2014 ready for local and international clients.',
    hero_search_ph: 'Try \u2018web developer\u2019, \u2018logo design\u2019, \u2018video editing\u2019\u2026',
    hero_search_btn: 'Search', stat_f: 'Freelancers', stat_j: 'Open jobs', stat_c: 'Cities',
    sec_services: 'Popular services', sec_services_sub: 'What clients are hiring for right now',
    sec_skills: 'Top skills', sec_skills_sub: 'Jump straight into a skill',
    sec_featured: 'Featured freelancers', sec_featured_sub: 'Hand-picked, highly rated professionals',
    view_all: 'View all \u2192', sec_jobs: 'Latest jobs', sec_jobs_sub: 'Fresh opportunities from clients',
    browse_jobs: 'Browse all jobs \u2192', sec_how: 'How it works',
    how_client_h: 'For clients',
    how_client_1: '<strong>Post your job</strong> \u2014 describe what you need, set your budget in PKR.',
    how_client_2: '<strong>Compare proposals</strong> \u2014 review profiles, ratings and past work.',
    how_client_3: '<strong>Pay securely</strong> \u2014 funds are held in escrow and released only when you approve the work.',
    how_client_btn: 'Post a Job \u2014 it\u2019s free',
    how_free_h: 'For freelancers',
    how_free_1: '<strong>Build your profile</strong> \u2014 showcase skills, portfolio and experience.',
    how_free_2: '<strong>Send proposals</strong> \u2014 apply to jobs that match your expertise.',
    how_free_3: '<strong>Get paid</strong> \u2014 withdraw earnings via JazzCash, Easypaisa or bank transfer.',
    how_free_btn: 'Explore Freelancers',
    trust1_h: 'Verified professionals', trust1_s: 'ID & skill-checked profiles',
    trust2_h: 'Secure escrow payments', trust2_s: 'Only 5% fee \u2014 funds released on approval',
    trust3_h: 'Local support', trust3_s: 'Help in English & Urdu',
    footer_tag: 'Connecting Pakistan\u2019s talent with the world.',
    footer_market: 'Marketplace', footer_account: 'Account'
  },
  ur: {
    nav_home: '\u06C1\u0648\u0645', nav_freelancers: '\u0641\u0631\u06CC \u0644\u0627\u0646\u0633\u0631\u0632 \u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA', nav_jobs: '\u0645\u0644\u0627\u0632\u0645\u062A\u06CC\u06BA \u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA', nav_agency: '🚀 \u06C1\u0645 \u0633\u06D2 \u06A9\u0631\u0648\u0627\u0626\u06CC\u06BA', nav_messages: '\u067E\u06CC\u063A\u0627\u0645\u0627\u062A',
    nav_dash: '\u0688\u06CC\u0634 \u0628\u0648\u0631\u0688\u0632 \u25BE', nav_dash_f: '\u0641\u0631\u06CC \u0644\u0627\u0646\u0633\u0631 \u0688\u06CC\u0634 \u0628\u0648\u0631\u0688', nav_dash_c: '\u06A9\u0644\u0627\u0626\u0646\u0679 \u0688\u06CC\u0634 \u0628\u0648\u0631\u0688', nav_post: '\u0645\u0644\u0627\u0632\u0645\u062A \u067E\u0648\u0633\u0679 \u06A9\u0631\u06CC\u06BA',
    hero_kicker: '\u067E\u0627\u06A9\u0633\u062A\u0627\u0646 \u06A9\u0627 \u0642\u0627\u0628\u0644\u0650 \u0627\u0639\u062A\u0645\u0627\u062F \u0641\u0631\u06CC \u0644\u0627\u0646\u0633 \u0645\u0627\u0631\u06A9\u06CC\u0679 \u067E\u0644\u06CC\u0633',
    hero_h1: '\u0645\u0627\u06C1\u0631 \u0641\u0631\u06CC \u0644\u0627\u0646\u0633\u0631\u0632 \u06A9\u06CC \u062E\u062F\u0645\u0627\u062A \u062D\u0627\u0635\u0644 \u06A9\u0631\u06CC\u06BA\u06D4 \u0628\u0627\u0645\u0639\u0646\u06CC \u06A9\u0627\u0645 \u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA\u06D4',
    hero_sub: '\u06C1\u0632\u0627\u0631\u0648\u06BA \u062C\u0627\u0646\u0686\u06D2 \u067E\u0631\u06A9\u06BE\u06D2 \u067E\u0627\u06A9\u0633\u062A\u0627\u0646\u06CC \u0645\u0627\u06C1\u0631\u06CC\u0646 \u2014 \u0688\u06CC\u0648\u0644\u067E\u0631\u0632\u060C \u0688\u06CC\u0632\u0627\u0626\u0646\u0631\u0632\u060C \u0645\u0635\u0646\u0641\u06CC\u0646 \u0627\u0648\u0631 \u0645\u0627\u0631\u06A9\u06CC\u0679\u0631\u0632 \u2014 \u0645\u0642\u0627\u0645\u06CC \u0627\u0648\u0631 \u0628\u06CC\u0646 \u0627\u0644\u0627\u0642\u0648\u0627\u0645\u06CC \u06A9\u0644\u0627\u0626\u0646\u0679\u0633 \u06A9\u06D2 \u0644\u06CC\u06D2 \u062A\u06CC\u0627\u0631\u06D4',
    hero_search_ph: '\u0645\u062B\u0644\u0627\u064B \u0648\u06CC\u0628 \u0688\u06CC\u0648\u0644\u067E\u0631\u060C \u0644\u0648\u06AF\u0648 \u0688\u06CC\u0632\u0627\u0626\u0646\u2026',
    hero_search_btn: '\u062A\u0644\u0627\u0634 \u06A9\u0631\u06CC\u06BA', stat_f: '\u0641\u0631\u06CC \u0644\u0627\u0646\u0633\u0631\u0632', stat_j: '\u062F\u0633\u062A\u06CC\u0627\u0628 \u0645\u0644\u0627\u0632\u0645\u062A\u06CC\u06BA', stat_c: '\u0634\u06C1\u0631',
    sec_services: '\u0645\u0642\u0628\u0648\u0644 \u062E\u062F\u0645\u0627\u062A', sec_services_sub: '\u06A9\u0644\u0627\u0626\u0646\u0679\u0633 \u0627\u0633 \u0648\u0642\u062A \u06A9\u0646 \u062E\u062F\u0645\u0627\u062A \u06A9\u06CC \u062A\u0644\u0627\u0634 \u0645\u06CC\u06BA \u06C1\u06CC\u06BA',
    sec_skills: '\u0646\u0645\u0627\u06CC\u0627\u06BA \u0645\u06C1\u0627\u0631\u062A\u06CC\u06BA', sec_skills_sub: '\u0628\u0631\u0627\u06C1\u0650 \u0631\u0627\u0633\u062A \u0645\u06C1\u0627\u0631\u062A \u0645\u0646\u062A\u062E\u0628 \u06A9\u0631\u06CC\u06BA',
    sec_featured: '\u0646\u0645\u0627\u06CC\u0627\u06BA \u0641\u0631\u06CC \u0644\u0627\u0646\u0633\u0631\u0632', sec_featured_sub: '\u0645\u0646\u062A\u062E\u0628 \u06A9\u0631\u062F\u06C1 \u0627\u0639\u0644\u0670 \u062F\u0631\u062C\u06D2 \u06A9\u06D2 \u0645\u0627\u06C1\u0631\u06CC\u0646',
    view_all: '\u0633\u0628 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA \u2192', sec_jobs: '\u062A\u0627\u0632\u06C1 \u062A\u0631\u06CC\u0646 \u0645\u0644\u0627\u0632\u0645\u062A\u06CC\u06BA', sec_jobs_sub: '\u06A9\u0644\u0627\u0626\u0646\u0679\u0633 \u06A9\u06CC \u0646\u0626\u06CC \u067E\u06CC\u0634\u06A9\u0634\u06CC\u06BA',
    browse_jobs: '\u062A\u0645\u0627\u0645 \u0645\u0644\u0627\u0632\u0645\u062A\u06CC\u06BA \u062F\u06CC\u06A9\u06BE\u06CC\u06BA \u2192', sec_how: '\u06CC\u06C1 \u06A9\u06CC\u0633\u06D2 \u06A9\u0627\u0645 \u06A9\u0631\u062A\u0627 \u06C1\u06D2',
    how_client_h: '\u06A9\u0644\u0627\u0626\u0646\u0679\u0633 \u06A9\u06D2 \u0644\u06CC\u06D2',
    how_client_1: '<strong>\u0645\u0644\u0627\u0632\u0645\u062A \u067E\u0648\u0633\u0679 \u06A9\u0631\u06CC\u06BA</strong> \u2014 \u0627\u067E\u0646\u06CC \u0636\u0631\u0648\u0631\u062A \u0628\u06CC\u0627\u0646 \u06A9\u0631\u06CC\u06BA \u0627\u0648\u0631 PKR \u0645\u06CC\u06BA \u0628\u062C\u0679 \u0637\u06D2 \u06A9\u0631\u06CC\u06BA\u06D4',
    how_client_2: '<strong>\u067E\u06CC\u0634\u06A9\u0634\u0648\u06BA \u06A9\u0627 \u0645\u0648\u0627\u0632\u0646\u06C1 \u06A9\u0631\u06CC\u06BA</strong> \u2014 \u067E\u0631\u0648\u0641\u0627\u0626\u0644\u0632\u060C \u062F\u0631\u062C\u06C1 \u0628\u0646\u062F\u06CC \u0627\u0648\u0631 \u0633\u0627\u0628\u0642\u06C1 \u06A9\u0627\u0645 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA\u06D4',
    how_client_3: '<strong>\u0645\u062D\u0641\u0648\u0638 \u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC \u06A9\u0631\u06CC\u06BA</strong> \u2014 \u0631\u0642\u0645 \u0627\u06CC\u0633\u06A9\u0631\u0648 \u0645\u06CC\u06BA \u0631\u06C1\u062A\u06CC \u06C1\u06D2 \u0627\u0648\u0631 \u0622\u067E \u06A9\u06CC \u0645\u0646\u0638\u0648\u0631\u06CC \u067E\u0631 \u062C\u0627\u0631\u06CC \u06C1\u0648\u062A\u06CC \u06C1\u06D2\u06D4',
    how_client_btn: '\u0645\u0644\u0627\u0632\u0645\u062A \u067E\u0648\u0633\u0679 \u06A9\u0631\u06CC\u06BA \u2014 \u0628\u0627\u0644\u06A9\u0644 \u0645\u0641\u062A',
    how_free_h: '\u0641\u0631\u06CC \u0644\u0627\u0646\u0633\u0631\u0632 \u06A9\u06D2 \u0644\u06CC\u06D2',
    how_free_1: '<strong>\u067E\u0631\u0648\u0641\u0627\u0626\u0644 \u0628\u0646\u0627\u0626\u06CC\u06BA</strong> \u2014 \u0627\u067E\u0646\u06CC \u0645\u06C1\u0627\u0631\u062A\u06CC\u06BA\u060C \u067E\u0648\u0631\u0679 \u0641\u0648\u0644\u06CC\u0648 \u0627\u0648\u0631 \u062A\u062C\u0631\u0628\u06C1 \u062F\u06A9\u06BE\u0627\u0626\u06CC\u06BA\u06D4',
    how_free_2: '<strong>\u067E\u06CC\u0634\u06A9\u0634\u06CC\u06BA \u0628\u06BE\u06CC\u062C\u06CC\u06BA</strong> \u2014 \u0627\u067E\u0646\u06CC \u0645\u06C1\u0627\u0631\u062A \u06A9\u06D2 \u0645\u0637\u0627\u0628\u0642 \u0645\u0644\u0627\u0632\u0645\u062A\u0648\u06BA \u067E\u0631 \u062F\u0631\u062E\u0648\u0627\u0633\u062A \u062F\u06CC\u06BA\u06D4',
    how_free_3: '<strong>\u0645\u0639\u0627\u0648\u0636\u06C1 \u062D\u0627\u0635\u0644 \u06A9\u0631\u06CC\u06BA</strong> \u2014 \u062C\u0627\u0632 \u06A9\u06CC\u0634\u060C \u0627\u06CC\u0632\u06CC \u067E\u06CC\u0633\u06C1 \u06CC\u0627 \u0628\u06CC\u0646\u06A9 \u0679\u0631\u0627\u0646\u0633\u0641\u0631 \u0633\u06D2 \u0631\u0642\u0645 \u0646\u06A9\u0627\u0644\u06CC\u06BA\u06D4',
    how_free_btn: '\u0641\u0631\u06CC \u0644\u0627\u0646\u0633\u0631\u0632 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA',
    trust1_h: '\u062A\u0635\u062F\u06CC\u0642 \u0634\u062F\u06C1 \u0645\u0627\u06C1\u0631\u06CC\u0646', trust1_s: '\u0634\u0646\u0627\u062E\u062A \u0627\u0648\u0631 \u0645\u06C1\u0627\u0631\u062A \u06A9\u06CC \u062C\u0627\u0646\u0686 \u0634\u062F\u06C1 \u067E\u0631\u0648\u0641\u0627\u0626\u0644\u0632',
    trust2_h: '\u0645\u062D\u0641\u0648\u0638 \u0627\u06CC\u0633\u06A9\u0631\u0648 \u0627\u062F\u0627\u0626\u06CC\u06AF\u06CC\u0627\u06BA', trust2_s: '\u0635\u0631\u0641 5 \u0641\u06CC\u0635\u062F \u0641\u06CC\u0633 \u2014 \u0645\u0646\u0638\u0648\u0631\u06CC \u067E\u0631 \u0631\u0642\u0645 \u062C\u0627\u0631\u06CC',
    trust3_h: '\u0645\u0642\u0627\u0645\u06CC \u0645\u0639\u0627\u0648\u0646\u062A', trust3_s: '\u0627\u0646\u06AF\u0631\u06CC\u0632\u06CC \u0627\u0648\u0631 \u0627\u0631\u062F\u0648 \u0645\u06CC\u06BA \u0645\u062F\u062F',
    footer_tag: '\u067E\u0627\u06A9\u0633\u062A\u0627\u0646 \u06A9\u06D2 \u0679\u06CC\u0644\u0646\u0679 \u06A9\u0648 \u062F\u0646\u06CC\u0627 \u0633\u06D2 \u062C\u0648\u0691\u0646\u0627\u06D4',
    footer_market: '\u0645\u0627\u0631\u06A9\u06CC\u0679 \u067E\u0644\u06CC\u0633', footer_account: '\u0627\u06A9\u0627\u0624\u0646\u0679'
  }
};
function applyI18n() {
  const lang = state.lang || 'en';
  const dict = I18N[lang];
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!dict[key]) return;
    if (key === 'nav_messages' && el.childNodes.length > 1) {
      // preserve the unread badge span inside the Messages nav link
      el.childNodes[0].textContent = dict[key] + ' ';
    } else {
      el.innerHTML = dict[key];
    }
  });
  $$('[data-i18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key]) el.placeholder = dict[key];
  });
  $('langToggle').textContent = lang === 'en' ? '\u0627\u0631\u062F\u0648' : 'EN';
}

/* ---------------- Persistent state ---------------- */
const LS_KEY = 'pakfreelance_v1';
function defaultState() {
  return {
    lang: 'en',
    myJobs: [],            // user-posted jobs
    myProposals: [],       // proposals sent by demo freelancer
    proposalCounts: {},    // extra proposal counts per job id
    savedJobs: ['j5'],     // demo: one saved job
    orders: [],            // user-created orders (merged with SEED_ORDERS)
    orderSeq: 100,
    disputes: [],          // user-opened disputes (merged with SEED_DISPUTES)
    convs: JSON.parse(JSON.stringify(SEED_CONVS)),
    activeConv: null,
    availability: true,
    skillTests: {},        // { category: score }
    payouts: [            // demo payout method (masked)
      { id: 'pm0', type: 'Easypaisa', name: 'Ahmed Raza', number: '0345128899', demo: true }
    ],
    profileViews: 0
  };
}
let state;
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    state = raw ? Object.assign(defaultState(), JSON.parse(raw)) : defaultState();
  } catch (e) { state = defaultState(); }
}
function saveState() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* storage full/blocked */ }
}
const allOrders = () => [...state.orders, ...SEED_ORDERS];
const allDisputes = () => [...state.disputes, ...SEED_DISPUTES];
const orderById = (id) => allOrders().find((o) => o.id === id);
const disputeById = (id) => allDisputes().find((d) => d.id === id);
const maskNumber = (num) => {
  const d = String(num).replace(/\D/g, '');
  return d.length > 4 ? '\u2022\u2022\u2022\u2022 ' + d.slice(-4) : '\u2022\u2022\u2022\u2022';
};

/* ---------------- Router ---------------- */
const VIEWS = ['home', 'freelancers', 'profile', 'jobs', 'post-job', 'dash-f', 'dash-c', 'messages', 'order', 'quiz', 'dispute', 'agency'];
let currentProfileId = null, currentOrderId = null, currentDisputeId = null;

const VIEW_TITLES = {
  home: "PakFreelance — Hire Freelancers in Pakistan | Web, Design, Writing, Marketing",
  freelancers: "Find Freelancers in Pakistan — Web, Design, Writing & More | PakFreelance",
  profile: "Freelancer Profile | PakFreelance",
  jobs: "Freelance Jobs in Pakistan — Online Earning | PakFreelance",
  "post-job": "Post a Job Free — Hire Pakistani Freelancers | PakFreelance",
  "dash-f": "Freelancer Dashboard | PakFreelance",
  "dash-c": "Client Dashboard | PakFreelance",
  messages: "Messages | PakFreelance",
  order: "Order Tracking | PakFreelance",
  quiz: "Skill Test Quiz | PakFreelance",
  dispute: "Dispute Center | PakFreelance",
  agency: "Done For You — In-House Services by PakFreelance Team"
};

function showView(name, param) {
  if (!VIEWS.includes(name)) name = 'home';
  document.title = VIEW_TITLES[name] || VIEW_TITLES.home;
  $$('.view').forEach((v) => v.classList.remove('active'));
  const el = $('view-' + name);
  if (el) el.classList.add('active');
  $$('#mainNav .nav-link[data-view], #mainNav .dropdown-item[data-view]').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('data-view') === name);
  });
  $('mainNav').classList.remove('open');
  $('navToggle').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'home') renderHome();
  else if (name === 'freelancers') renderFreelancers();
  else if (name === 'profile') { currentProfileId = param || currentProfileId || 'f1'; renderProfile(currentProfileId); }
  else if (name === 'jobs') renderJobs();
  else if (name === 'post-job') initPostJob();
  else if (name === 'dash-f') renderDashF();
  else if (name === 'dash-c') renderDashC();
  else if (name === 'messages') renderMessages();
  else if (name === 'order') { currentOrderId = param || currentOrderId; renderOrder(currentOrderId); }
  else if (name === 'quiz') initQuiz();
  else if (name === 'dispute') { currentDisputeId = param || currentDisputeId; renderDispute(currentDisputeId); }
  else if (name === 'agency') renderAgency();
}

function bindNav() {
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-view]');
    if (t) { e.preventDefault(); showView(t.getAttribute('data-view')); return; }
    const card = e.target.closest('[data-profile]');
    if (card) { showView('profile', card.getAttribute('data-profile')); return; }
    const ord = e.target.closest('[data-order]');
    if (ord) { showView('order', ord.getAttribute('data-order')); return; }
    const dsp = e.target.closest('[data-dispute]');
    if (dsp) { showView('dispute', dsp.getAttribute('data-dispute')); return; }
  });
  $('navToggle').addEventListener('click', () => {
    const nav = $('mainNav');
    const open = nav.classList.toggle('open');
    $('navToggle').setAttribute('aria-expanded', String(open));
  });
  const dashToggle = $('dashToggle'), dashMenu = $('dashMenu');
  dashToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const hidden = dashMenu.hidden;
    dashMenu.hidden = !hidden;
    dashToggle.setAttribute('aria-expanded', String(!hidden));
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) { dashMenu.hidden = true; dashToggle.setAttribute('aria-expanded', 'false'); }
  });
  $('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'ur' : 'en';
    saveState();
    applyI18n();
    toast(state.lang === 'ur' ? '\u0627\u0631\u062F\u0648 \u0645\u0646\u062A\u062E\u0628 \u06A9\u06CC \u06AF\u0626\u06CC' : 'English selected');
  });
}

/* ---------------- Shared card builders ---------------- */
function availLabel(a) { return a === 'available' ? 'Available' : a === 'limited' ? 'Limited availability' : 'Busy'; }

function freelancerCard(f) {
  const price = f.rateType === 'hr' ? `${fmtPKR(f.rate)}<small>/hr</small>` : `From ${fmtPKR(f.startingPrice)}`;
  return `
  <article class="f-card" data-profile="${f.id}" tabindex="0" role="link" aria-label="View profile of ${esc(f.name)}">
    <div class="f-card-top">
      <img class="avatar" src="${f.photo}" alt="Photo of ${esc(f.name)}" loading="lazy" />
      <div>
        <div class="f-name">${esc(f.name)} ${f.verified.id ? '<span class="verified" title="ID verified">✔</span>' : ''}</div>
        <div class="f-title">${esc(f.title)}</div>
        <div class="f-loc">📍 ${esc(f.city)}, Pakistan</div>
      </div>
    </div>
    <div class="rating">★ ${f.rating.toFixed(1)} <span class="count">(${f.reviewsCount} reviews)</span></div>
    <div class="skill-tags">${f.skills.slice(0, 4).map((s) => `<span class="skill-tag">${esc(s)}</span>`).join('')}</div>
    <div class="f-card-foot">
      <span class="price">${price}</span>
      <span class="avail-dot ${f.availability}">${availLabel(f.availability)}</span>
    </div>
  </article>`;
}

/* AI match score: skills overlap + category + budget fit + availability */
function matchScore(job) {
  const me = freelancerById('f1');
  const jSkills = (job.skills || []).map((s) => s.toLowerCase());
  const mySkills = me.skills.map((s) => s.toLowerCase());
  const overlap = jSkills.length ? jSkills.filter((s) => mySkills.some((m) => m.includes(s) || s.includes(m))).length / jSkills.length : 0.4;
  const catMatch = job.cat === me.cat ? 1 : 0.35;
  const budgetFit = job.budget >= 10000 && job.budget <= 120000 ? 1 : 0.6;
  const avail = state.availability ? 1 : 0.5;
  const score = Math.round(50 * overlap + 20 * catMatch + 20 * budgetFit + 10 * avail);
  return {
    score: Math.min(98, Math.max(32, score)),
    parts: [
      ['Skills overlap', Math.round(50 * overlap) + '/50'],
      ['Category fit', Math.round(20 * catMatch) + '/20'],
      ['Budget fit', Math.round(20 * budgetFit) + '/20'],
      ['Availability', Math.round(10 * avail) + '/10']
    ]
  };
}
function matchBadge(job) {
  const m = matchScore(job);
  return `
  <span class="match-wrap" tabindex="0">
    <span class="match-badge">✨ Match: ${m.score}%</span>
    <span class="match-tip"><strong>Why this matches you</strong>
      ${m.parts.map((p) => `<div><span>${p[0]}</span><span>${p[1]}</span></div>`).join('')}
    </span>
  </span>`;
}

function jobCard(job) {
  const saved = state.savedJobs.includes(job.id);
  const count = job.proposalsCount + (state.proposalCounts[job.id] || 0);
  return `
  <article class="job-card">
    <div class="job-card-top">
      <div>
        <span class="cat-pill">${esc(job.cat)}</span>
        ${job.mine ? '<span class="cat-pill" style="background:#fdf0d3;color:#8a5a13;">Your posting</span>' : ''}
        <h3 data-joblink="${job.id}">${esc(job.title)}</h3>
      </div>
      ${matchBadge(job)}
    </div>
    <div class="job-meta">
      <span class="budget">${fmtPKR(job.budget)}${job.budgetType === 'hourly' ? '/hr' : ''}</span>
      <span>📍 ${job.type === 'remote' ? 'Remote' : 'Onsite · ' + esc(job.client.city)}</span>
      <span>🕒 ${daysAgo(job.postedDaysAgo)}</span>
      <span>📩 ${count} proposals</span>
      <span>👤 ${esc(job.client.name)} ${job.client.verified ? '<span class="verified">✔</span>' : ''}</span>
    </div>
    <p class="job-desc">${esc(job.desc)}</p>
    <div class="skill-tags">${(job.skills || []).map((s) => `<span class="skill-tag">${esc(s)}</span>`).join('')}</div>
    <div class="job-card-foot">
      <button class="btn btn-accent btn-sm" data-propose="${job.id}">Submit proposal</button>
      <button class="save-btn ${saved ? 'saved' : ''}" data-save="${job.id}">${saved ? '★ Saved' : '☆ Save'}</button>
    </div>
  </article>`;
}

/* ---------------- HOME ---------------- */
function renderHome() {
  $('statFreelancers').textContent = FREELANCERS.length;
  $('statJobs').textContent = allJobs().length;
  $('statCities').textContent = CITIES.length;
  const citySel = $('heroCity');
  if (!citySel.options.length || citySel.options.length === 1) {
    CITIES.forEach((c) => { const o = document.createElement('option'); o.value = c; o.textContent = c; citySel.appendChild(o); });
  }
  // Popular services: one top service per first 6 categories
  const svc = [];
  FREELANCERS.slice(0, 8).forEach((f) => { if (svc.length < 6 && f.services[0]) svc.push({ f, s: f.services[0] }); });
  $('servicesGrid').innerHTML = svc.map(({ f, s }) => `
    <article class="f-card" data-profile="${f.id}">
      <div class="f-card-top">
        <img class="avatar" src="${f.photo}" alt="" loading="lazy" />
        <div><div class="f-name">${esc(s.name)}</div><div class="f-title">${esc(f.cat)} · ${esc(f.name)}</div></div>
      </div>
      <div class="f-card-foot"><span class="price">From ${fmtPKR(s.price)}</span><span class="rating">★ ${f.rating.toFixed(1)}</span></div>
    </article>`).join('');
  // Top skills chips
  const skills = [...new Set(FREELANCERS.flatMap((f) => f.skills))].slice(0, 14);
  $('skillsChips').innerHTML = skills.map((s) => `<button class="chip" data-skill="${esc(s)}">${esc(s)}</button>`).join('');
  $$('#skillsChips .chip').forEach((c) => c.addEventListener('click', () => {
    $('fSearch').value = c.getAttribute('data-skill');
    showView('freelancers');
  }));
  // Featured freelancers
  $('featuredRow').innerHTML = FREELANCERS.filter((f) => f.featured).map(freelancerCard).join('');
  // Latest jobs (4 most recent)
  const latest = [...allJobs()].sort((a, b) => a.postedDaysAgo - b.postedDaysAgo).slice(0, 4);
  $('latestJobs').innerHTML = latest.map(jobCard).join('');
  bindJobCardActions($('latestJobs'));
}

function bindJobCardActions(root) {
  root.querySelectorAll('[data-propose]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); openProposalModal(b.getAttribute('data-propose')); }));
  root.querySelectorAll('[data-save]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    const id = b.getAttribute('data-save');
    const i = state.savedJobs.indexOf(id);
    if (i >= 0) { state.savedJobs.splice(i, 1); toast('Removed from saved jobs'); }
    else { state.savedJobs.push(id); toast('Job saved'); }
    saveState();
    if ($('view-jobs').classList.contains('active')) renderJobs();
    else if ($('view-home').classList.contains('active')) renderHome();
    else if ($('view-dash-f').classList.contains('active')) renderDashF();
  }));
  root.querySelectorAll('[data-joblink]').forEach((h) => h.addEventListener('click', () => openProposalModal(h.getAttribute('data-joblink'))));
  root.querySelectorAll('[data-profile]').forEach((c) => {
    c.addEventListener('click', () => showView('profile', c.getAttribute('data-profile')));
  });
  root.querySelectorAll('[data-profile]').forEach((c) => {
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter') showView('profile', c.getAttribute('data-profile')); });
  });
}

/* ---------------- BROWSE FREELANCERS ---------------- */
function initFreelancerFilters() {
  const cat = $('fCat'), city = $('fCity');
  if (cat.options.length <= 1) CATEGORIES.forEach((c) => { const o = document.createElement('option'); o.textContent = c; cat.appendChild(o); });
  if (city.options.length <= 1) CITIES.forEach((c) => { const o = document.createElement('option'); o.value = c; o.textContent = c; city.appendChild(o); });
}
function renderFreelancers() {
  initFreelancerFilters();
  const q = $('fSearch').value.trim().toLowerCase();
  const cat = $('fCat').value, city = $('fCity').value, price = $('fPrice').value;
  const minR = parseFloat($('fRating').value || '0'), avail = $('fAvail').value, lang = $('fLang').value;
  let list = FREELANCERS.filter((f) => {
    if (q && !(f.name + ' ' + f.title + ' ' + f.skills.join(' ')).toLowerCase().includes(q)) return false;
    if (cat && f.cat !== cat) return false;
    if (city && f.city !== city) return false;
    if (price) { const [lo, hi] = price.split('-').map(Number); const p = f.rateType === 'hr' ? f.rate : f.startingPrice; if (p < lo || p > hi) return false; }
    if (minR && f.rating < minR) return false;
    if (avail && f.availability !== avail) return false;
    if (lang && !f.languages.includes(lang)) return false;
    return true;
  });
  $('fCount').textContent = list.length + ' freelancer' + (list.length === 1 ? '' : 's') + ' found';
  $('freelancersGrid').innerHTML = list.length ? list.map(freelancerCard).join('') : '<p class="empty">No freelancers match your filters. Try clearing them.</p>';
}

/* ---------------- FREELANCER PROFILE ---------------- */
function verifyBadges(f) {
  const v = f.verified;
  const item = (ok, label) => `<span class="v-badge ${ok ? '' : 'missing'}">${ok ? '✔' : '○'} ${label}</span>`;
  return `<div class="skill-tags">${item(v.id, 'ID verified')}${item(v.phone, 'Phone verified')}${item(v.skill, 'Skill test passed')}</div>`;
}

function renderProfile(id) {
  const f = freelancerById(id);
  if (!f) { $('profileWrap').innerHTML = '<p class="empty">Freelancer not found.</p>'; return; }
  if (id === 'f1') { state.profileViews++; saveState(); }
  const price = f.rateType === 'hr' ? `${fmtPKR(f.rate)}<small>/hour</small>` : `Starting at ${fmtPKR(f.startingPrice)}`;
  $('profileWrap').innerHTML = `
    <div class="profile-hero">
      <div class="profile-id">
        <img class="avatar lg" src="${f.photo}" alt="Photo of ${esc(f.name)}" />
        <div>
          <h1 style="margin-bottom:0.15rem;">${esc(f.name)} ${f.verified.id ? '<span class="verified" title="ID verified">✔</span>' : ''}</h1>
          <p class="f-title" style="font-size:1.02rem;">${esc(f.title)}</p>
          <p class="f-loc">📍 ${esc(f.city)}, Pakistan</p>
          <div class="rating">★ ${f.rating.toFixed(1)} <span class="count">(${f.reviewsCount} reviews · ${f.projects} projects completed)</span></div>
          <div style="margin-top:0.5rem;">${verifyBadges(f)}</div>
        </div>
      </div>
      <div class="profile-cta">
        <span class="price">${price}</span>
        <span class="avail-dot ${f.availability}">${availLabel(f.availability)}</span>
        <button class="btn btn-accent" id="pfHire">Hire ${esc(f.name.split(' ')[0])}</button>
        <button class="btn btn-outline" id="pfMsg">Message</button>
      </div>
    </div>

    <div class="profile-facts">
      <div class="fact"><span>Experience</span><strong>${f.expYears} years</strong></div>
      <div class="fact"><span>Projects</span><strong>${f.projects} completed</strong></div>
      <div class="fact"><span>Languages</span><strong>${f.languages.join(', ')}</strong></div>
      <div class="fact"><span>Response</span><strong>~2 hours</strong></div>
    </div>

    <div class="panel">
      <h2>About</h2>
      <p>${esc(f.bio)}</p>
      <h3 style="margin-top:1rem;">Skills</h3>
      <div class="skill-tags">${f.skills.map((s) => `<span class="skill-tag">${esc(s)}</span>`).join('')}</div>
    </div>

    <div class="panel">
      <h2>Services &amp; pricing</h2>
      ${f.services.map((s, i) => `
        <div class="service-row">
          <div><strong>${esc(s.name)}</strong><br /><span class="muted" style="font-size:0.9rem;">${esc(s.desc)}</span></div>
          <div style="text-align:right;"><div class="price">${fmtPKR(s.price)}</div>
          <button class="btn btn-primary btn-sm" data-hire-svc="${i}">Hire</button></div>
        </div>`).join('')}
      <p class="hint">PakFreelance fee is only 5% — funds are held in escrow until you approve the work.</p>
    </div>

    <div class="panel">
      <h2>Portfolio</h2>
      <div class="portfolio-grid">${f.portfolio.map((src, i) => `<img src="${src}" alt="Portfolio sample ${i + 1} by ${esc(f.name)}" loading="lazy" />`).join('')}</div>
    </div>

    <div class="panel">
      <h2>Reviews (${f.reviews.length})</h2>
      ${f.reviews.map((r) => `
        <div class="review">
          <div class="review-head"><strong>${esc(r.client)}</strong><span class="rating">★ ${r.rating}</span><span class="review-date">${esc(r.date)}</span></div>
          <p>${esc(r.text)}</p>
        </div>`).join('')}
    </div>`;

  $('pfHire').addEventListener('click', () => openHireModal(f.id));
  $$('#profileWrap [data-hire-svc]').forEach((b) => b.addEventListener('click', () => openHireModal(f.id, parseInt(b.getAttribute('data-hire-svc'), 10))));
  $('pfMsg').addEventListener('click', () => {
    let conv = state.convs.find((c) => c.withId === f.id);
    if (!conv) {
      conv = { id: uid('c'), withId: f.id, withName: f.name, withPhoto: f.photo, role: 'freelancer', messages: [], unread: 0 };
      state.convs.unshift(conv); saveState();
    }
    state.activeConv = conv.id; saveState();
    showView('messages');
  });
}

/* ---------------- BROWSE JOBS ---------------- */
function initJobFilters() {
  const cat = $('jCat');
  if (cat.options.length <= 1) CATEGORIES.forEach((c) => { const o = document.createElement('option'); o.textContent = c; cat.appendChild(o); });
}
function renderJobs() {
  initJobFilters();
  const q = $('jSearch').value.trim().toLowerCase();
  const cat = $('jCat').value, budget = $('jBudget').value, type = $('jType').value;
  const savedOnly = $('jSavedOnly').checked;
  let list = allJobs().filter((j) => {
    if (q && !(j.title + ' ' + j.desc).toLowerCase().includes(q)) return false;
    if (cat && j.cat !== cat) return false;
    if (budget) { const [lo, hi] = budget.split('-').map(Number); if (j.budget < lo || j.budget > hi) return false; }
    if (type && j.type !== type) return false;
    if (savedOnly && !state.savedJobs.includes(j.id)) return false;
    return true;
  });
  list.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  $('jCount').textContent = list.length + ' job' + (list.length === 1 ? '' : 's') + ' found';
  $('jobsList').innerHTML = list.length ? list.map(jobCard).join('') : '<p class="empty">No jobs match your filters.</p>';
  bindJobCardActions($('jobsList'));
}

/* ---------------- POST A JOB ---------------- */
let pjMsCount = 0;
function initPostJob() {
  const cat = $('pjCat');
  if (!cat.options.length) CATEGORIES.forEach((c) => { const o = document.createElement('option'); o.textContent = c; cat.appendChild(o); });
  if (!$('pjMilestones').children.length) { addMilestoneRow(); addMilestoneRow(); }
  updatePjFee();
}
function addMilestoneRow() {
  if (pjMsCount >= 4) { toast('Maximum 4 milestones'); return; }
  pjMsCount++;
  const div = document.createElement('div');
  div.className = 'ms-row';
  div.innerHTML = `
    <input type="text" placeholder="Milestone ${pjMsCount} title (e.g. Design phase)" class="ms-title" maxlength="60" />
    <input type="number" min="500" placeholder="Rs amount" class="ms-amt" />
    <button type="button" class="ms-remove" aria-label="Remove milestone">✕</button>`;
  div.querySelector('.ms-remove').addEventListener('click', () => { div.remove(); pjMsCount--; });
  $('pjMilestones').appendChild(div);
}
function updatePjFee() {
  const b = parseFloat($('pjBudget').value || '0');
  $('pjFeeBase').textContent = b ? fmtPKR(b) : '–';
  $('pjFeeAmt').textContent = b ? fmtPKR(feeOf(b)) : '–';
  $('pjFeeNet').textContent = b ? fmtPKR(b - feeOf(b)) : '–';
}
function submitPostJob(e) {
  e.preventDefault();
  const milestones = $$('#pjMilestones .ms-row').map((row) => ({
    title: row.querySelector('.ms-title').value.trim(),
    amount: parseFloat(row.querySelector('.ms-amt').value || '0')
  })).filter((m) => m.title && m.amount > 0);
  if (milestones.length === 1) { toast('Add at least 2 milestones, or leave them empty'); return; }
  const budget = parseFloat($('pjBudget').value);
  const msTotal = milestones.reduce((s, m) => s + m.amount, 0);
  if (milestones.length && Math.abs(msTotal - budget) > 1) { toast('Milestone amounts must add up to the budget'); return; }
  const skills = $('pjSkills').value.split(',').map((s) => s.trim()).filter(Boolean);
  const job = {
    id: uid('j'), title: $('pjTitle').value.trim(), cat: $('pjCat').value,
    desc: $('pjDesc').value.trim(), skills,
    budgetType: $('pjBudgetType').value, budget,
    deadline: $('pjDeadline').value, type: $('pjType').value,
    client: { name: 'Imran Sheikh (you)', city: 'Lahore', country: 'Pakistan', verified: true },
    postedDaysAgo: 0, proposalsCount: 0, mine: true,
    milestones: milestones.length ? milestones : undefined
  };
  state.myJobs.unshift(job);
  saveState();
  $('pjForm').reset();
  $('pjMilestones').innerHTML = ''; pjMsCount = 0;
  initPostJob();
  toast('Job posted successfully!');
  showView('dash-c');
}

/* ---------------- PROPOSALS ---------------- */
let proposalJobId = null;
function openProposalModal(jobId) {
  const job = jobById(jobId);
  if (!job) return;
  proposalJobId = jobId;
  $('propJobTitle').textContent = 'Submit proposal';
  $('propJobMeta').textContent = `${job.title} · ${fmtPKR(job.budget)}${job.budgetType === 'hourly' ? '/hr' : ''} · ${job.client.name}`;
  $('propCover').value = ''; $('propBid').value = ''; $('propDays').value = '';
  $('modalBackdrop').hidden = false;
}
function submitProposal() {
  const cover = $('propCover').value.trim();
  const bid = parseFloat($('propBid').value);
  const days = parseInt($('propDays').value, 10);
  if (!cover || !(bid > 0) || !(days > 0)) { toast('Please fill cover letter, bid and delivery time'); return; }
  const job = jobById(proposalJobId);
  state.myProposals.unshift({ id: uid('p'), jobId: proposalJobId, jobTitle: job.title, cover, bid, days, status: 'pending', date: todayISO() });
  state.proposalCounts[proposalJobId] = (state.proposalCounts[proposalJobId] || 0) + 1;
  saveState();
  $('modalBackdrop').hidden = true;
  toast('Proposal sent!');
  if ($('view-jobs').classList.contains('active')) renderJobs();
}

function acceptProposal(propId) {
  const p = SEED_PROPOSALS.find((x) => x.id === propId);
  if (!p) return;
  const job = jobById(p.jobId);
  const f = freelancerById(p.freelancerId);
  p.status = 'accepted';
  SEED_PROPOSALS.filter((x) => x.jobId === p.jobId && x.id !== propId).forEach((x) => { x.status = 'declined'; });
  const milestones = (job.milestones && job.milestones.length)
    ? job.milestones.map((m) => ({ id: uid('m'), title: m.title, amount: m.amount, status: 'pending' }))
    : [{ id: uid('m'), title: 'Full delivery', amount: p.bid, status: 'pending' }];
  const order = {
    id: 'o' + (++state.orderSeq), jobTitle: job.title, freelancerId: f.id, freelancerName: f.name,
    clientName: 'Imran Sheikh (you)', amount: p.bid, deadline: job.deadline, status: 'in_progress',
    escrow: true, notes: 'Order created from accepted proposal.', created: todayISO(), mineAs: 'client',
    milestones
  };
  state.orders.unshift(order);
  saveState();
  toast(`Proposal accepted — order ${order.id} created, funds held in escrow`);
  renderDashC();
}
function declineProposal(propId) {
  const p = SEED_PROPOSALS.find((x) => x.id === propId);
  if (p) { p.status = 'declined'; toast('Proposal declined'); renderDashC(); }
}

/* ---------------- HIRE (direct order from profile) ---------------- */
let hireFreelancerId = null, hireSvcIdx = 0;
function openHireModal(fid, svcIdx) {
  const f = freelancerById(fid);
  if (!f) return;
  hireFreelancerId = fid;
  hireSvcIdx = svcIdx || 0;
  $('hireFreelancerName').textContent = `${f.name} · ${f.title} · ${f.city}`;
  const sel = $('hireService');
  sel.innerHTML = f.services.map((s, i) => `<option value="${i}">${esc(s.name)} — ${fmtPKR(s.price)}</option>`).join('');
  sel.value = String(hireSvcIdx);
  $('hireAmount').value = f.services[hireSvcIdx].price;
  $('hireDeadline').value = '';
  $('hireNotes').value = '';
  updateHireFee();
  $('hireBackdrop').hidden = false;
}
function updateHireFee() {
  const amt = parseFloat($('hireAmount').value || '0');
  $('hireSubtotal').textContent = fmtPKR(amt);
  $('hireFee').textContent = fmtPKR(feeOf(amt));
  $('hireTotal').textContent = fmtPKR(amt + feeOf(amt));
}
function submitHire() {
  const f = freelancerById(hireFreelancerId);
  const amt = parseFloat($('hireAmount').value);
  const deadline = $('hireDeadline').value;
  if (!(amt > 0) || !deadline) { toast('Enter amount and deadline'); return; }
  const svc = f.services[parseInt($('hireService').value, 10)];
  const order = {
    id: 'o' + (++state.orderSeq), jobTitle: svc.name, freelancerId: f.id, freelancerName: f.name,
    clientName: 'Imran Sheikh (you)', amount: amt, deadline, status: 'placed',
    escrow: true, notes: $('hireNotes').value.trim(), created: todayISO(), mineAs: 'client',
    milestones: [{ id: uid('m'), title: svc.name, amount: amt, status: 'pending' }]
  };
  state.orders.unshift(order);
  saveState();
  $('hireBackdrop').hidden = true;
  toast(`Order placed — ${fmtPKR(amt + feeOf(amt))} held in escrow`);
  showView('order', order.id);
}

/* ---------------- FREELANCER DASHBOARD ---------------- */
const ME = () => freelancerById('f1');

function orderMini(o, view) {
  return `
  <div class="mini-row" data-order="${o.id}" style="cursor:pointer;">
    <div class="grow"><strong>${esc(o.jobTitle)}</strong><br />
      <span class="muted" style="font-size:0.85rem;">${esc(view === 'f' ? o.clientName : o.freelancerName)} · ${fmtPKR(o.amount)} · due ${fmtDate(o.deadline)}</span></div>
    <span class="status-pill status-${o.status}">${o.status.replace('_', ' ')}</span>
  </div>`;
}

function renderDashF() {
  const me = ME();
  $('dfName').textContent = me.name;
  const myOrders = allOrders().filter((o) => o.mineAs === 'freelancer');
  const active = myOrders.filter((o) => ['placed', 'in_progress', 'delivered'].includes(o.status));
  const earnings = myOrders.filter((o) => o.status === 'completed').reduce((s, o) => s + o.amount, 0)
    + myOrders.flatMap((o) => o.milestones || []).filter((m) => m.status === 'released').reduce((s, m) => s + m.amount, 0);
  $('dfEarnings').textContent = fmtPKR(earnings);
  $('dfOrders').textContent = active.length;
  $('dfProposals').textContent = state.myProposals.length;
  $('dfViews').textContent = (me.views + state.profileViews).toLocaleString('en-PK');

  // Availability toggle
  const tgl = $('availToggle');
  tgl.classList.toggle('on', state.availability);
  tgl.setAttribute('aria-checked', String(state.availability));
  $('availLabel').textContent = state.availability ? 'Available' : 'Unavailable';
  me.availability = state.availability ? 'available' : 'busy';

  // Verification checklist
  const v = me.verified;
  const row = (ok, label, sub) => `
    <div class="verify-row">
      <span class="v-badge ${ok ? '' : 'missing'}">${ok ? '✔' : '○'}</span>
      <div class="grow"><strong>${label}</strong><small>${sub}</small></div>
    </div>`;
  $('dfVerifyList').innerHTML =
    row(v.id, 'ID verified', 'Government ID checked') +
    row(v.phone, 'Phone verified', v.phone ? 'SMS verification complete' : 'Verify your mobile number') +
    row(v.skill, 'Skill test passed', v.skill ? `Passed (${state.skillTests[me.cat] || ''}%)` : 'Take the 5-question test below');
  $('dfQuizBtn').textContent = v.skill ? 'Retake skill test' : 'Take skill test';

  // Payout methods
  $('dfPayouts').innerHTML = state.payouts.length ? state.payouts.map(payoutItem).join('') : '<p class="empty">No payout method added yet.</p>';
  bindPayoutRemove($('dfPayouts'));

  // Proposals sent
  $('dfProposalsList').innerHTML = state.myProposals.length ? state.myProposals.map((p) => `
    <div class="mini-row"><div class="grow"><strong>${esc(p.jobTitle)}</strong><br />
      <span class="muted" style="font-size:0.85rem;">Bid ${fmtPKR(p.bid)} · ${p.days} days · ${esc(p.date)}</span></div>
      <span class="status-pill status-${p.status}">${p.status}</span></div>`).join('')
    : '<p class="empty">You have not sent any proposals yet. <button class="link-btn" data-view="jobs">Browse jobs</button></p>';

  // Active orders
  $('dfOrdersList').innerHTML = active.length ? active.map((o) => orderMini(o, 'f')).join('') : '<p class="empty">No active orders.</p>';

  // Saved jobs
  const saved = allJobs().filter((j) => state.savedJobs.includes(j.id));
  $('dfSavedList').innerHTML = saved.length ? saved.map((j) => `
    <div class="mini-row"><div class="grow"><strong>${esc(j.title)}</strong><br />
      <span class="muted" style="font-size:0.85rem;">${fmtPKR(j.budget)} · ${esc(j.cat)}</span></div>
      <button class="btn btn-accent btn-sm" data-propose="${j.id}">Propose</button></div>`).join('')
    : '<p class="empty">No saved jobs yet.</p>';
  $('dfSavedList').querySelectorAll('[data-propose]').forEach((b) => b.addEventListener('click', () => openProposalModal(b.getAttribute('data-propose'))));

  // Disputes
  const myD = allDisputes().filter((d) => { const o = orderById(d.orderId); return o && o.mineAs === 'freelancer'; });
  $('dfDisputesList').innerHTML = myD.length ? myD.map(disputeMini).join('') : '<p class="empty">No disputes. Open one from any active order if needed.</p>';
}

function disputeMini(d) {
  return `
  <div class="mini-row dispute-card" data-dispute="${d.id}" style="cursor:pointer;border-radius:8px;padding-left:0.7rem;">
    <div class="grow"><strong>${esc(d.reason)}</strong><br />
      <span class="muted" style="font-size:0.85rem;">${esc(d.orderTitle)} · ${esc(d.date)}</span></div>
    <span class="status-pill status-${d.status === 'resolved' ? 'completed' : d.status === 'under_review' ? 'delivered' : 'pending'}">${d.status.replace('_', ' ')}</span>
  </div>`;
}

/* ---------------- CLIENT DASHBOARD ---------------- */
function renderDashC() {
  const myJobs = allJobs().filter((j) => j.mine);
  const myOrders = allOrders().filter((o) => o.mineAs === 'client');
  const active = myOrders.filter((o) => ['requested', 'placed', 'in_progress', 'delivered'].includes(o.status));
  const received = SEED_PROPOSALS.filter((p) => myJobs.some((j) => j.id === p.jobId));
  $('dcJobs').textContent = myJobs.length;
  $('dcProposals').textContent = received.length;
  $('dcOrders').textContent = active.length;
  $('dcSpent').textContent = fmtPKR(myOrders.reduce((s, o) => s + o.amount + feeOf(o.amount), 0));

  $('dcJobsList').innerHTML = myJobs.length ? myJobs.map((j) => {
    const count = j.proposalsCount + (state.proposalCounts[j.id] || 0);
    return `
    <div class="mini-row"><div class="grow"><strong>${esc(j.title)}</strong><br />
      <span class="muted" style="font-size:0.85rem;">${esc(j.cat)} · ${fmtPKR(j.budget)} · ${count} proposals</span></div>
      <span class="status-pill status-active">${count} proposals</span></div>`;
  }).join('') : '<p class="empty">No jobs posted yet.</p>';

  $('dcOrdersList').innerHTML = active.length ? active.map((o) => orderMini(o, 'c')).join('') : '<p class="empty">No active orders.</p>';

  $('dcPayouts').innerHTML = state.payouts.length ? state.payouts.map(payoutItem).join('') : '<p class="empty">No payment method added yet.</p>';
  bindPayoutRemove($('dcPayouts'));

  $('dcProposalsList').innerHTML = received.length ? received.map((p) => {
    const f = freelancerById(p.freelancerId);
    return `
    <article class="job-card" style="box-shadow:none;">
      <div class="job-card-top">
        <div class="f-card-top">
          <img class="avatar" src="${f.photo}" alt="" loading="lazy" />
          <div><div class="f-name">${esc(f.name)}</div>
          <div class="f-title">${esc(f.title)} · ★ ${f.rating.toFixed(1)}</div></div>
        </div>
        <span class="status-pill status-${p.status}">${p.status}</span>
      </div>
      <p style="font-size:0.93rem;margin:0.6rem 0;"><strong>For:</strong> ${esc(jobById(p.jobId).title)}</p>
      <p style="font-size:0.93rem;">${esc(p.cover)}</p>
      <div class="job-meta"><span class="budget">Bid: ${fmtPKR(p.bid)}</span><span>Delivery: ${p.days} days</span><span>${esc(p.date)}</span></div>
      ${p.status === 'pending' ? `
      <div class="job-card-foot">
        <button class="btn btn-accent btn-sm" data-accept="${p.id}">Accept &amp; create order</button>
        <button class="btn btn-outline btn-sm" data-decline="${p.id}">Decline</button>
      </div>` : ''}
    </article>`;
  }).join('') : '<p class="empty">No proposals received yet.</p>';
  $('dcProposalsList').querySelectorAll('[data-accept]').forEach((b) => b.addEventListener('click', () => acceptProposal(b.getAttribute('data-accept'))));
  $('dcProposalsList').querySelectorAll('[data-decline]').forEach((b) => b.addEventListener('click', () => declineProposal(b.getAttribute('data-decline'))));

  const myD = allDisputes().filter((d) => { const o = orderById(d.orderId); return o && o.mineAs === 'client'; });
  $('dcDisputesList').innerHTML = myD.length ? myD.map(disputeMini).join('') : '<p class="empty">No disputes.</p>';
}

/* ---------------- Payout methods ---------------- */
function payoutItem(p) {
  const cls = p.type === 'JazzCash' ? 'jazzcash' : p.type === 'Easypaisa' ? 'easypaisa' : 'bank';
  const initial = p.type === 'Bank transfer' ? '🏦' : p.type.charAt(0);
  return `
  <div class="payout-item">
    <span class="payout-icon ${cls}">${initial}</span>
    <div class="grow"><strong>${esc(p.type)}</strong>
      <small>${esc(p.name)} · ${maskNumber(p.number)}</small></div>
    <button class="payout-remove" data-po-remove="${p.id}">Remove</button>
  </div>`;
}
function bindPayoutRemove(root) {
  root.querySelectorAll('[data-po-remove]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    state.payouts = state.payouts.filter((p) => p.id !== b.getAttribute('data-po-remove'));
    saveState(); renderDashF(); renderDashC();
    toast('Payout method removed');
  }));
}
let payoutTarget = 'df';
function openPayoutModal() { $('poType').value = 'JazzCash'; $('poName').value = ''; $('poNumber').value = ''; $('payoutBackdrop').hidden = false; }
function submitPayout() {
  const name = $('poName').value.trim(), number = $('poNumber').value.trim();
  if (!name || !number) { toast('Enter account title and number'); return; }
  state.payouts.push({ id: uid('pm'), type: $('poType').value, name, number });
  saveState();
  $('payoutBackdrop').hidden = true;
  toast('Payout method added');
  renderDashF(); renderDashC();
}

/* ---------------- MESSAGES ---------------- */
const REPLY_POOL = [
  'Thanks for reaching out! I will get back to you with details shortly.',
  'Got it \u2014 I can start this week. What is your deadline?',
  'Sure, let me review and confirm the timeline by tomorrow.'
];
function updateMsgBadge() {
  const unread = state.convs.reduce((s, c) => s + (c.unread || 0), 0);
  const b = $('navMsgBadge');
  b.hidden = unread === 0;
  b.textContent = unread;
}
function renderMessages() {
  updateMsgBadge();
  const list = $('convList');
  list.innerHTML = state.convs.length ? state.convs.map((c) => {
    const last = c.messages[c.messages.length - 1];
    return `
    <div class="conv-item ${c.id === state.activeConv ? 'active' : ''}" data-conv="${c.id}" role="button" tabindex="0">
      <img src="${c.withPhoto}" alt="" loading="lazy" />
      <div><div class="c-name">${esc(c.withName)}${c.unread ? ` <span class="nav-badge">${c.unread}</span>` : ''}</div>
      <div class="c-prev">${last ? esc(last.text) : 'No messages yet'}</div></div>
    </div>`;
  }).join('') : '<p class="empty" style="padding:1rem;">No conversations yet.</p>';
  list.querySelectorAll('[data-conv]').forEach((el) => {
    const open = () => {
      state.activeConv = el.getAttribute('data-conv');
      const c = state.convs.find((x) => x.id === state.activeConv);
      if (c) c.unread = 0;
      saveState();
      renderMessages();
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
  });
  renderChat();
}
function renderChat() {
  const c = state.convs.find((x) => x.id === state.activeConv);
  if (!c) {
    $('chatHeader').innerHTML = '<span class="muted">Select a conversation</span>';
    $('chatMessages').innerHTML = '';
    $('chatInput').disabled = true; $('chatSend').disabled = true;
    return;
  }
  $('chatHeader').textContent = c.withName;
  $('chatMessages').innerHTML = c.messages.length ? c.messages.map((m) => `
    <div class="msg ${m.from === 'me' ? 'me' : 'them'}">${esc(m.text)}<span class="t">${esc(m.time)}</span></div>`).join('')
    : '<p class="empty">Say hello to start the conversation.</p>';
  $('chatMessages').scrollTop = $('chatMessages').scrollHeight;
  $('chatInput').disabled = false; $('chatSend').disabled = false;
}
function sendChat(e) {
  e.preventDefault();
  const c = state.convs.find((x) => x.id === state.activeConv);
  const text = $('chatInput').value.trim();
  if (!c || !text) return;
  c.messages.push({ from: 'me', text, time: 'Just now' });
  $('chatInput').value = '';
  saveState(); renderChat(); renderMessages();
  // Demo simulated reply
  const convId = c.id;
  setTimeout(() => {
    const conv = state.convs.find((x) => x.id === convId);
    if (!conv) return;
    conv.messages.push({ from: 'them', text: REPLY_POOL[Math.floor(Math.random() * REPLY_POOL.length)], time: 'Just now' });
    if (state.activeConv !== convId) conv.unread = (conv.unread || 0) + 1;
    saveState();
    if ($('view-messages').classList.contains('active')) { renderChat(); renderMessages(); }
    updateMsgBadge();
  }, 1500);
}

/* ---------------- ORDER TRACKING ---------------- */
function milestoneStatusPill(s) {
  const map = { pending: 'status-pending', delivered: 'status-delivered', released: 'status-completed' };
  return `<span class="status-pill ${map[s] || 'status-pending'}">${s}</span>`;
}
function renderOrder(id) {
  const o = orderById(id);
  if (!o) { $('orderWrap').innerHTML = '<p class="empty">Order not found.</p>'; return; }
  const f = freelancerById(o.freelancerId);
  const fee = feeOf(o.amount), total = o.amount + fee;
  const steps = ['Order placed', 'Funds held in escrow', 'In progress', 'Delivered', 'Completed'];
  const stepIdx = { requested: 0, placed: 1, in_progress: 2, delivered: 3, completed: 4 }[o.status];
  const timeline = steps.map((s, i) => {
    const cls = i < stepIdx ? 'done' : i === stepIdx ? 'current' : '';
    return `<li class="${cls}"><span class="dot"></span><strong>${s}</strong><small>${i === 1 ? 'Released only when you approve the work' : i === 0 ? o.created : ''}</small></li>`;
  }).join('');

  const isClient = o.mineAs === 'client';
  const milestones = (o.milestones || []).map((m) => {
    let actions = '';
    if (m.status === 'pending' && !isClient && ['placed', 'in_progress'].includes(o.status))
      actions = `<button class="btn btn-primary btn-sm" data-ms-deliver="${m.id}">Mark delivered</button>`;
    if (m.status === 'delivered' && isClient)
      actions = `<button class="btn btn-accent btn-sm" data-ms-release="${m.id}">Release ${fmtPKR(m.amount)}</button>
                 <button class="btn btn-outline btn-sm" data-ms-revision="${m.id}">Request revision</button>`;
    return `
    <div class="milestone">
      <div class="milestone-top"><strong>${esc(m.title)}</strong>
        <span>${fmtPKR(m.amount)} ${milestoneStatusPill(m.status)}</span></div>
      ${actions ? `<div class="milestone-actions">${actions}</div>` : ''}
    </div>`;
  }).join('');

  let orderActions = '';
  if (o.status === 'placed' && !isClient) orderActions = `<button class="btn btn-primary" id="ordStart">Start work</button>`;
  if (o.status === 'in_progress' && !isClient && !(o.milestones || []).length) orderActions = `<button class="btn btn-primary" id="ordDeliver">Mark as delivered</button>`;
  if (o.status === 'delivered' && isClient) orderActions = `
    <button class="btn btn-accent" id="ordComplete">Approve &amp; complete</button>
    <button class="btn btn-outline" id="ordRevision">Request revision</button>`;

  const existingDispute = allDisputes().find((d) => d.orderId === o.id && d.status !== 'resolved');

  $('orderWrap').innerHTML = `
    <div class="panel">
      <div class="row-between">
        <h1 style="font-size:1.4rem;">${esc(o.jobTitle)}</h1>
        <span class="status-pill status-${o.status}">${o.status.replace('_', ' ')}</span>
      </div>
      <p class="muted">Order ${esc(o.id)} · ${isClient ? 'Freelancer: ' + esc(o.freelancerName) : 'Client: ' + esc(o.clientName)}</p>
      ${o.escrow ? '<p><span class="escrow-badge">🔒 Held in escrow</span></p>' : ''}
      ${f && !isClient ? '' : ''}
      <div class="order-meta">
        <div class="fact"><span>Amount</span><strong>${fmtPKR(o.amount)}</strong></div>
        <div class="fact"><span>PakFreelance fee (5%)</span><strong>${fmtPKR(fee)}</strong></div>
        <div class="fact"><span>Total</span><strong>${fmtPKR(total)}</strong></div>
        <div class="fact"><span>Deadline</span><strong>${fmtDate(o.deadline)}</strong></div>
      </div>
      ${o.notes ? `<p><strong>Notes:</strong> ${esc(o.notes)}</p>` : ''}
      <h2>Order timeline</h2>
      <ul class="timeline">${timeline}</ul>
      <h2>Milestones</h2>
      ${milestones || '<p class="empty">No milestones.</p>'}
      ${orderActions ? `<div style="margin:1rem 0;display:flex;gap:0.6rem;flex-wrap:wrap;">${orderActions}</div>` : ''}
      <div style="display:flex;gap:0.6rem;flex-wrap:wrap;margin-top:1rem;">
        ${existingDispute
          ? `<button class="btn btn-outline btn-sm" data-dispute="${existingDispute.id}">View dispute (${existingDispute.status.replace('_', ' ')})</button>`
          : ['placed', 'in_progress', 'delivered'].includes(o.status) ? `<button class="btn btn-outline btn-sm" id="ordDispute">Open dispute</button>` : ''}
        <button class="btn btn-outline btn-sm" data-view="messages">Message ${isClient ? 'freelancer' : 'client'}</button>
      </div>
    </div>`;

  const persistOrder = () => { saveState(); renderOrder(o.id); renderDashF(); renderDashC(); };
  const findOrder = () => allOrders().find((x) => x.id === o.id);
  const mutate = (fn) => {
    // user orders live in state.orders; seed orders are mutated in-memory for the session
    const target = state.orders.find((x) => x.id === o.id) || SEED_ORDERS.find((x) => x.id === o.id);
    if (target) fn(target);
    persistOrder();
  };

  const b = (id) => $(id);
  if (b('ordStart')) b('ordStart').addEventListener('click', () => mutate((t) => { t.status = 'in_progress'; toast('Work started'); }));
  if (b('ordDeliver')) b('ordDeliver').addEventListener('click', () => mutate((t) => { t.status = 'delivered'; toast('Marked as delivered — client can now approve'); }));
  if (b('ordComplete')) b('ordComplete').addEventListener('click', () => mutate((t) => {
    t.status = 'completed';
    (t.milestones || []).forEach((m) => { if (m.status !== 'released') m.status = 'released'; });
    toast('Order completed — funds released');
  }));
  if (b('ordRevision')) b('ordRevision').addEventListener('click', () => mutate((t) => { t.status = 'in_progress'; toast('Revision requested'); }));
  if (b('ordDispute')) b('ordDispute').addEventListener('click', () => openDisputeModal(o.id));

  $$('#orderWrap [data-ms-deliver]').forEach((btn) => btn.addEventListener('click', () => mutate((t) => {
    const m = t.milestones.find((x) => x.id === btn.getAttribute('data-ms-deliver'));
    if (m) { m.status = 'delivered'; toast('Milestone delivered — awaiting client release'); }
  })));
  $$('#orderWrap [data-ms-release]').forEach((btn) => btn.addEventListener('click', () => mutate((t) => {
    const m = t.milestones.find((x) => x.id === btn.getAttribute('data-ms-release'));
    if (m) { m.status = 'released'; toast(`${fmtPKR(m.amount)} released to freelancer`); }
    if (t.milestones.every((x) => x.status === 'released')) t.status = 'completed';
  })));
  $$('#orderWrap [data-ms-revision]').forEach((btn) => btn.addEventListener('click', () => mutate((t) => {
    const m = t.milestones.find((x) => x.id === btn.getAttribute('data-ms-revision'));
    if (m) { m.status = 'pending'; toast('Revision requested on milestone'); }
  })));
}

/* ---------------- DONE FOR YOU (AGENCY) ---------------- */
const agencySel = {}; // serviceId -> package index (default 1 = middle)
let agencyReqSvc = null, agencyReqOrderId = null;

function agencyPkg(s, i) { return s.packages[agencySel[s.id] != null ? agencySel[s.id] : 1]; }

function renderAgency() {
  const w = $('agencyWrap');
  w.innerHTML = `
    <div class="agency-hero">
      <p class="hero-kicker">PakFreelance in-house team</p>
      <h1>🚀 Done For You</h1>
      <p class="agency-sub">Don't want to search, compare and manage freelancers? Hand the work directly to our own team — fixed PKR prices, guaranteed delivery dates, and direct WhatsApp support from start to finish.</p>
      <div class="agency-steps">
        <div><span class="step-n">1</span><div><strong>Pick a service</strong><br /><small>Choose a package that fits your budget</small></div></div>
        <div><span class="step-n">2</span><div><strong>Send your requirements</strong><br /><small>We confirm everything on WhatsApp</small></div></div>
        <div><span class="step-n">3</span><div><strong>Get it delivered</strong><br /><small>Pay via JazzCash, Easypaisa or bank</small></div></div>
      </div>
    </div>
    <div class="agency-grid">
      ${AGENCY_SERVICES.map((s) => `
      <article class="agency-card" data-ag-card="${s.id}">
        <div class="agency-card-head"><span class="agency-emoji">${s.emoji}</span>
          <div><h3>${esc(s.title)}</h3><p class="muted">${esc(s.desc)}</p></div></div>
        <div class="pkg-pills">
          ${s.packages.map((p, i) => `<button class="pkg-pill${(agencySel[s.id] != null ? agencySel[s.id] : 1) === i ? ' active' : ''}" data-ag-svc="${s.id}" data-ag-pkg="${i}">${esc(p.name)}</button>`).join('')}
        </div>
        <ul class="pkg-features" data-ag-features="${s.id}">
          ${agencyPkg(s).features.map((f) => `<li>✓ ${esc(f)}</li>`).join('')}
        </ul>
        <div class="agency-card-foot">
          <div><div class="agency-price">${fmtPKR(agencyPkg(s).price)}</div>
          <small class="muted">Delivery in ${agencyPkg(s).days} days</small></div>
          <button class="btn btn-accent" data-ag-request="${s.id}">Request This Service</button>
        </div>
      </article>`).join('')}
    </div>
    <div class="panel agency-team">
      <h2>🏢 Meet the team behind the work</h2>
      <p>PakFreelance is run by a small in-house team of developers, designers, writers and server engineers in Pakistan. When you request a Done-For-You service — from a logo to a mobile app or a fully managed server — your work is done by us directly, not subcontracted to strangers. That means one point of contact, clear timelines, and accountability on WhatsApp from the first message to final delivery.</p>
      <div class="agency-contact">
        <a class="btn btn-accent" href="https://wa.me/${TEAM_WHATSAPP}" target="_blank" rel="noopener">💬 WhatsApp: 0345 6121725</a>
        ${TEAM_EMAIL && !TEAM_EMAIL.includes('YOUR_EMAIL') ? `<a class="btn btn-outline" href="mailto:${TEAM_EMAIL}">📧 ${esc(TEAM_EMAIL)}</a>` : ''}
      </div>
      <p class="muted">Prefer the marketplace? <a href="#" data-view="freelancers">Browse independent freelancers</a> or <a href="#" data-view="post-job">post your job</a> — the 5% platform fee still applies there and keeps the marketplace running.</p>
    </div>`;

  w.querySelectorAll('[data-ag-svc]').forEach((b) => b.addEventListener('click', () => {
    const svcId = b.getAttribute('data-ag-svc');
    agencySel[svcId] = Number(b.getAttribute('data-ag-pkg'));
    renderAgency();
  }));
  w.querySelectorAll('[data-ag-request]').forEach((b) => b.addEventListener('click', () => openAgencyRequest(b.getAttribute('data-ag-request'))));
}

function openAgencyRequest(serviceId) {
  const s = AGENCY_SERVICES.find((x) => x.id === serviceId);
  if (!s) return;
  agencyReqSvc = serviceId;
  $('agServiceName').textContent = `${s.emoji} ${s.title} — delivered by the PakFreelance in-house team`;
  const sel = $('agPackage');
  sel.innerHTML = s.packages.map((p, i) => `<option value="${i}"${i === (agencySel[serviceId] != null ? agencySel[serviceId] : 1) ? ' selected' : ''}>${esc(p.name)} — ${fmtPKR(p.price)}</option>`).join('');
  const syncPkg = () => {
    const p = s.packages[Number(sel.value)];
    $('agPrice').textContent = fmtPKR(p.price);
    $('agDays').textContent = `${p.days} days`;
  };
  sel.onchange = syncPkg; syncPkg();
  $('agNotes').value = ''; $('agName').value = ''; $('agPhone').value = '';
  $('agFormFields').hidden = false; $('agSuccess').hidden = true;
  $('agEmailLink').style.display = (TEAM_EMAIL && !TEAM_EMAIL.includes('YOUR_EMAIL')) ? '' : 'none';
  $('agencyBackdrop').hidden = false;
}

function submitAgencyRequest() {
  const s = AGENCY_SERVICES.find((x) => x.id === agencyReqSvc);
  if (!s) return;
  const pkg = s.packages[Number($('agPackage').value)];
  const notes = $('agNotes').value.trim();
  const name = $('agName').value.trim();
  const phone = $('agPhone').value.trim();
  if (!notes) { toast('Please describe what you need'); return; }
  if (!name) { toast('Please enter your name'); return; }
  if (!phone) { toast('Please enter your WhatsApp number'); return; }
  const order = {
    id: uid('a'), jobTitle: `${s.title} — ${pkg.name} package`,
    freelancerId: 'team', freelancerName: 'PakFreelance Team 🏢',
    clientName: `${name} (you)`, amount: pkg.price,
    deadline: new Date(Date.now() + pkg.days * 864e5).toISOString().slice(0, 10),
    status: 'requested', escrow: false,
    notes: `Requirements: ${notes}\nContact: ${name} — ${phone}`,
    created: todayISO(), mineAs: 'client', agency: true, milestones: []
  };
  state.orders.unshift(order);
  saveState();
  agencyReqOrderId = order.id;
  const msg = encodeURIComponent(
    `Assalam-o-Alaikum! I want the *${s.title}* service (${pkg.name} package — Rs ${pkg.price.toLocaleString('en-PK')}).\n\n` +
    `My requirements: ${notes}\n\nName: ${name}\nMy WhatsApp: ${phone}\n\nRequest ID: ${order.id}`);
  $('agWaLink').href = `https://wa.me/${TEAM_WHATSAPP}?text=${msg}`;
  const emailBody = encodeURIComponent(
    `Assalam-o-Alaikum,\n\nI would like to request the ${s.title} service (${pkg.name} package — Rs ${pkg.price.toLocaleString('en-PK')}).\n\n` +
    `My requirements:\n${notes}\n\nName: ${name}\nMy WhatsApp: ${phone}\n\nRequest ID: ${order.id}`);
  $('agEmailLink').href = `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(`Service request: ${s.title} (${pkg.name}) — ${order.id}`)}&body=${emailBody}`;
  $('agFormFields').hidden = true; $('agSuccess').hidden = false;
  toast('Request sent — confirm it on WhatsApp');
}

function bindAgencyModal() {
  $('agCancel').addEventListener('click', () => { $('agencyBackdrop').hidden = true; });
  $('agencyBackdrop').addEventListener('click', (e) => { if (e.target === $('agencyBackdrop')) $('agencyBackdrop').hidden = true; });
  $('agSubmit').addEventListener('click', submitAgencyRequest);
  $('agTrack').addEventListener('click', () => {
    $('agencyBackdrop').hidden = true;
    if (agencyReqOrderId) showView('order', agencyReqOrderId);
  });
}

/* ---------------- DISPUTES ---------------- */
let disputeOrderId = null;
function openDisputeModal(orderId) {
  const o = orderById(orderId);
  if (!o) return;
  disputeOrderId = orderId;
  $('dspOrderTitle').textContent = `Order ${o.id} · ${o.jobTitle} · ${fmtPKR(o.amount)}`;
  $('dspDetails').value = '';
  $('disputeBackdrop').hidden = false;
}
function submitDispute() {
  const details = $('dspDetails').value.trim();
  if (!details) { toast('Please describe the issue'); return; }
  const o = orderById(disputeOrderId);
  const d = {
    id: uid('d'), orderId: o.id, orderTitle: o.jobTitle,
    reason: $('dspReason').value, details,
    status: 'opened', date: todayISO(),
    timeline: [{ stage: 'Opened', note: 'Dispute opened — funds remain frozen in escrow', date: todayISO(), done: true }]
  };
  state.disputes.unshift(d);
  saveState();
  $('disputeBackdrop').hidden = true;
  toast('Dispute opened — our team will review it');
  showView('dispute', d.id);
}
function renderDispute(id) {
  const d = disputeById(id);
  if (!d) { $('disputeWrap').innerHTML = '<p class="empty">Dispute not found.</p>'; return; }
  const stages = ['Opened', 'Under review', 'Resolved'];
  const idx = d.status === 'opened' ? 0 : d.status === 'under_review' ? 1 : 2;
  const tl = stages.map((s, i) => {
    const ev = d.timeline.find((t) => t.stage === s);
    const cls = i < idx ? 'done' : i === idx ? 'current' : '';
    return `<li class="${cls}"><span class="dot"></span><strong>${s}</strong><small>${ev ? esc(ev.note) + ' · ' + esc(ev.date) : ''}</small></li>`;
  }).join('');
  $('disputeWrap').innerHTML = `
    <div class="panel">
      <div class="row-between">
        <h1 style="font-size:1.4rem;">Dispute: ${esc(d.reason)}</h1>
        <span class="status-pill status-${d.status === 'resolved' ? 'completed' : d.status === 'under_review' ? 'delivered' : 'pending'}">${d.status.replace('_', ' ')}</span>
      </div>
      <p class="muted">Ticket ${esc(d.id)} · Order ${esc(d.orderId)} · ${esc(d.orderTitle)} · opened ${esc(d.date)}</p>
      <p>${esc(d.details)}</p>
      <h2>Status timeline</h2>
      <ul class="d-timeline">${tl}</ul>
      <button class="btn btn-outline btn-sm" data-order="${d.orderId}">Back to order</button>
    </div>`;
}

/* ---------------- SKILL TEST QUIZ ---------------- */
let quizState = null;
function initQuiz() {
  const cat = $('quizCat');
  if (!cat.options.length) CATEGORIES.forEach((c) => { const o = document.createElement('option'); o.textContent = c; cat.appendChild(o); });
  cat.value = ME().cat;
  $('quizSetup').hidden = false;
  $('quizPlay').hidden = true;
  $('quizResult').hidden = true;
  quizState = null;
}
function startQuiz() {
  const cat = $('quizCat').value;
  quizState = { cat, idx: 0, correct: 0, answers: [] };
  $('quizSetup').hidden = true;
  $('quizResult').hidden = true;
  $('quizPlay').hidden = false;
  renderQuizQ();
}
function renderQuizQ() {
  const qs = QUIZ[quizState.cat];
  const q = qs[quizState.idx];
  $('quizProgress').textContent = `Question ${quizState.idx + 1} of ${qs.length} · ${quizState.cat}`;
  $('quizQ').textContent = q.q;
  $('quizOpts').innerHTML = q.o.map((opt, i) => `<button class="quiz-opt" data-opt="${i}">${esc(opt)}</button>`).join('');
  $('quizOpts').querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => answerQuiz(parseInt(b.getAttribute('data-opt'), 10))));
}
function answerQuiz(choice) {
  const qs = QUIZ[quizState.cat];
  const q = qs[quizState.idx];
  const ok = choice === q.a;
  if (ok) quizState.correct++;
  $('quizOpts').querySelectorAll('[data-opt]').forEach((b) => {
    b.disabled = true;
    const i = parseInt(b.getAttribute('data-opt'), 10);
    if (i === q.a) b.classList.add('correct');
    else if (i === choice) b.classList.add('wrong');
  });
  setTimeout(() => {
    quizState.idx++;
    if (quizState.idx < qs.length) renderQuizQ();
    else finishQuiz();
  }, 900);
}
function finishQuiz() {
  const total = QUIZ[quizState.cat].length;
  const pct = Math.round((quizState.correct / total) * 100);
  const pass = pct >= 60;
  if (pass) {
    ME().verified.skill = true;
    state.skillTests[quizState.cat] = pct;
    saveState();
  }
  $('quizPlay').hidden = true;
  const r = $('quizResult');
  r.hidden = false;
  r.innerHTML = `
    <div style="text-align:center;padding:1rem 0;">
      <div class="quiz-score">${pct}%</div>
      <p class="${pass ? 'quiz-pass' : 'quiz-fail'}">${pass ? 'Congratulations — you passed!' : 'Not quite — 60% is needed to pass.'}</p>
      <p class="muted">You answered ${quizState.correct} of ${total} correctly in ${esc(quizState.cat)}.</p>
      ${pass ? '<p>🏅 The <strong>Skill test passed</strong> badge now shows on your profile.</p>' : ''}
      <div style="display:flex;gap:0.6rem;justify-content:center;margin-top:1rem;">
        <button class="btn btn-outline" id="quizRetry">Try again</button>
        <button class="btn btn-primary" data-view="dash-f">Back to dashboard</button>
      </div>
    </div>`;
  $('quizRetry').addEventListener('click', initQuiz);
}

/* ---------------- Global bindings + init ---------------- */
function bindGlobal() {
  bindNav();
  $('heroSearchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    $('fSearch').value = $('heroSearch').value;
    const city = $('heroCity').value;
    $('fCity').value = city;
    showView('freelancers');
  });
  ['fSearch', 'fCat', 'fCity', 'fPrice', 'fRating', 'fAvail', 'fLang'].forEach((id) => {
    $(id).addEventListener('input', renderFreelancers);
    $(id).addEventListener('change', renderFreelancers);
  });
  $('fClear').addEventListener('click', () => {
    ['fSearch', 'fCat', 'fCity', 'fPrice', 'fRating', 'fAvail', 'fLang'].forEach((id) => { $(id).value = ''; });
    renderFreelancers();
  });
  ['jSearch', 'jCat', 'jBudget', 'jType'].forEach((id) => {
    $(id).addEventListener('input', renderJobs);
    $(id).addEventListener('change', renderJobs);
  });
  $('jSavedOnly').addEventListener('change', renderJobs);
  $('jClear').addEventListener('click', () => {
    ['jSearch', 'jCat', 'jBudget', 'jType'].forEach((id) => { $(id).value = ''; });
    $('jSavedOnly').checked = false;
    renderJobs();
  });

  // Post job
  $('pjForm').addEventListener('submit', submitPostJob);
  $('pjAddMs').addEventListener('click', addMilestoneRow);
  $('pjBudget').addEventListener('input', updatePjFee);

  // Proposal modal
  $('propCancel').addEventListener('click', () => { $('modalBackdrop').hidden = true; });
  $('propSubmit').addEventListener('click', submitProposal);
  $('modalBackdrop').addEventListener('click', (e) => { if (e.target === $('modalBackdrop')) $('modalBackdrop').hidden = true; });

  // Hire modal
  $('hireService').addEventListener('change', (e) => { $('hireAmount').value = freelancerById(hireFreelancerId).services[parseInt(e.target.value, 10)].price; updateHireFee(); });
  $('hireAmount').addEventListener('input', updateHireFee);
  $('hireCancel').addEventListener('click', () => { $('hireBackdrop').hidden = true; });
  $('hireSubmit').addEventListener('click', submitHire);
  $('hireBackdrop').addEventListener('click', (e) => { if (e.target === $('hireBackdrop')) $('hireBackdrop').hidden = true; });

  // Payout modal
  $('dfAddPayout').addEventListener('click', openPayoutModal);
  $('dcAddPayout').addEventListener('click', openPayoutModal);
  $('poCancel').addEventListener('click', () => { $('payoutBackdrop').hidden = true; });
  $('poSubmit').addEventListener('click', submitPayout);
  $('payoutBackdrop').addEventListener('click', (e) => { if (e.target === $('payoutBackdrop')) $('payoutBackdrop').hidden = true; });

  // Dispute modal
  $('dspCancel').addEventListener('click', () => { $('disputeBackdrop').hidden = true; });
  $('dspSubmit').addEventListener('click', submitDispute);
  $('disputeBackdrop').addEventListener('click', (e) => { if (e.target === $('disputeBackdrop')) $('disputeBackdrop').hidden = true; });

  // Agency (Done For You) modal
  bindAgencyModal();

  // Dashboards
  $('availToggle').addEventListener('click', () => {
    state.availability = !state.availability;
    saveState();
    renderDashF();
    toast(state.availability ? 'You are now marked Available' : 'You are now marked Unavailable');
  });
  $('dfQuizBtn').addEventListener('click', () => showView('quiz'));

  // Messages
  $('chatForm').addEventListener('submit', sendChat);

  // Quiz
  $('quizStart').addEventListener('click', startQuiz);

  // Keyboard: Enter on cards
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const card = e.target.closest && e.target.closest('.f-card[data-profile]');
      if (card && e.target === card) showView('profile', card.getAttribute('data-profile'));
    }
  });
}

function init() {
  loadState();
  bindGlobal();
  applyI18n();
  updateMsgBadge();
  // Footer contact email (hidden until a real address is set)
  const fe = $('footerEmail');
  if (fe) {
    if (TEAM_EMAIL && !TEAM_EMAIL.includes('YOUR_EMAIL')) {
      fe.href = 'mailto:' + TEAM_EMAIL;
      fe.textContent = '📧 ' + TEAM_EMAIL;
    } else { fe.style.display = 'none'; }
  }
  renderHome();
}
document.addEventListener('DOMContentLoaded', init);
