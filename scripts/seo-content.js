/** Static SEO copy injected into pre-rendered HTML for crawlers. */

export const SITE_ORIGIN = 'https://www.viszmo.com';
export const SITEMAP_LASTMOD = '2026-05-21';

const coreLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/ai-math-solver', label: 'AI Math Solver' },
  { href: '/ai-homework-helper', label: 'AI Homework Helper' },
  { href: '/contact', label: 'Contact' },
];

/** @type {Record<string, { title: string; description: string; keywords: string; h1: string; paragraphs: string[]; sections?: { h2: string; paragraphs: string[] }[]; links?: { href: string; label: string }[]; jsonLdType?: string; sitemapPriority?: string; sitemapChangefreq?: string }>} */
export const seoRoutes = {
  '/': {
    title: 'Viszmo | The #1 AI Study & Homework Sidekick',
    description:
      'Viszmo is the #1 AI study & homework sidekick with screen overlay and live lecture transcription. Get real-time help with any subject, from any website or video.',
    keywords:
      'AI study sidekick, homework sidekick, screen overlay, live transcription, AI tutor, study helper, flashcards, lecture notes',
    h1: 'The AI study sidekick that works on your screen',
    paragraphs: [
      'Viszmo helps students study faster with a transparent screen overlay, live lecture transcription, and AI-generated flashcards, study guides, and practice tests.',
      'Ask questions about what is on your screen, record lectures, and turn notes into study materials without switching tabs.',
    ],
    sections: [
      {
        h2: 'Study overlay, lecture capture, and AI chat',
        paragraphs: [
          'Use Viszmo on desktop, web, and iOS to get real-time homework help, transcribe lectures, and build personalized study dashboards.',
        ],
      },
    ],
    links: coreLinks,
    jsonLdType: 'WebSite',
  },
  '/features': {
    title: 'Viszmo Features | Screen Overlay, AI Tutor & Live Transcription',
    description:
      "Discover Viszmo's game-changing features: the transparent study overlay, dynamic lecture listener, and automatic flashcard/quiz creator.",
    keywords: 'study overlay, AI lecture notes, flashcard generator, quiz creator, AI study tool features',
    h1: 'Viszmo features for smarter studying',
    paragraphs: [
      'Viszmo combines a screen overlay, AI tutor, lecture transcription, flashcard generation, study guides, podcasts, and practice tests in one platform.',
    ],
    sections: [
      { h2: 'Screen overlay', paragraphs: ['Get help with equations, PDFs, and videos visible on your screen without leaving your workflow.'] },
      { h2: 'Lecture transcription', paragraphs: ['Record or import lectures and turn them into summaries, flashcards, and chat-ready study context.'] },
    ],
    links: coreLinks,
  },
  '/pricing': {
    title: 'Viszmo Pricing | Free Homework Help & Premium Pro Study Plans',
    description:
      'Explore Viszmo pricing plans. Start for free with daily AI homework assistance or upgrade to Pro for unlimited screen analysis and audio podcasts.',
    keywords: 'Viszmo pricing, cheap AI study helper, study sidekick pro cost, academic plans',
    h1: 'Simple pricing for students',
    paragraphs: [
      'Start free with daily AI study assistance. Upgrade to Viszmo Pro for unlimited screen analysis, advanced study tools, and premium AI features.',
    ],
    links: coreLinks,
  },
  '/how-it-works': {
    title: 'How It Works | Viszmo AI Study Sidekick & Screen Overlay',
    description:
      'Learn how to use Viszmo to study faster. Download the desktop overlay, record your lectures, and build dynamic study dashboards instantly.',
    keywords: 'how to study with AI, learn screen overlay, study dashboard guide, study guide generator',
    h1: 'How Viszmo works',
    paragraphs: [
      'Sign up, install Viszmo on desktop or iOS, capture lectures or analyze your screen, then generate flashcards, guides, and quizzes from your material.',
    ],
    links: coreLinks,
  },
  '/study-overlay': {
    title: 'Viszmo Screen Overlay | Study Seamlessly Without Switching Tabs',
    description:
      'The ultimate transparent screen overlay for students. Viszmo reads equations, PDFs, and videos to explain homework on the fly without tab-switching.',
    keywords: 'study overlay, screen sidekick, homework screen assistant, focus study overlay, math solver',
    h1: 'Study with a transparent screen overlay',
    paragraphs: [
      'Viszmo sits on top of your screen to read homework problems, PDFs, slides, and videos, then explains concepts in real time while you stay focused.',
    ],
    links: [
      { href: '/ai-homework-helper', label: 'AI Homework Helper' },
      { href: '/ai-math-solver', label: 'AI Math Solver' },
      ...coreLinks,
    ],
  },
  '/study-while-watching-videos': {
    title: 'Study While Watching Videos | Viszmo Interactive AI Video Helper',
    description:
      'Learn from any lecture, YouTube video, or online course in real-time. Viszmo transcribes audio and answers questions without pausing playback.',
    keywords: 'study youtube videos, online video AI notes, watch lectures with AI, study helper overlay',
    h1: 'Study while watching videos',
    paragraphs: [
      'Transcribe lectures and online videos, ask questions in real time, and convert video content into flashcards and study guides with Viszmo.',
    ],
    links: coreLinks,
  },
  '/real-time-ai-tutor': {
    title: 'Real-Time AI Tutor | Personal Academic Assistant & Explainer',
    description:
      'Get immediate help with complex subjects. Viszmo functions as a 24/7 AI tutor on your desktop, breaking down difficult topics in simple terms.',
    keywords: '24/7 AI tutor, academic explainer, science math tutor, college tutor online',
    h1: 'Real-time AI tutoring on demand',
    paragraphs: [
      'Get step-by-step explanations for math, science, history, and more. Viszmo works as a 24/7 tutor on desktop, web, and mobile.',
    ],
    links: coreLinks,
  },
  '/study-app-for-elementary-students': {
    title: 'AI Study App for Elementary School Students | Safe & Simple',
    description:
      'Empower younger learners with a safe, simple, and visual AI study sidekick. Viszmo helps with reading comprehension, elementary math, and spelling.',
    keywords: 'elementary school study app, child safe AI tutor, visual homework help',
    h1: 'AI study app for elementary students',
    paragraphs: [
      'Viszmo offers a simple, visual AI study experience for reading, spelling, and elementary math with parent-friendly privacy controls.',
    ],
    links: [
      { href: '/study-app-for-middle-and-high-school-students', label: 'Middle & High School' },
      { href: '/study-app-for-college-students', label: 'College Students' },
      ...coreLinks,
    ],
  },
  '/study-app-for-middle-and-high-school-students': {
    title: 'AI Study App for Middle & High School Students | Ace Your Exams',
    description:
      'Build perfect study habits for AP exams, SAT, ACT, and high school subjects. Viszmo generates flashcards and matching games from notes instantly.',
    keywords: 'high school study app, AP exam prep, SAT prep AI, study guide creator',
    h1: 'AI study app for middle and high school',
    paragraphs: [
      'Prepare for AP, SAT, ACT, and daily coursework with flashcards, practice tests, lecture notes, and an AI tutor built for secondary students.',
    ],
    links: [
      { href: '/study-app-for-elementary-students', label: 'Elementary Students' },
      { href: '/study-app-for-college-students', label: 'College Students' },
      ...coreLinks,
    ],
  },
  '/study-app-for-college-students': {
    title: 'AI Study App for College & University | Handle Heavy Coursework',
    description:
      'Manage large volumes of lecture recordings and reading materials with ease. Viszmo transcribes university lectures and auto-generates study packs.',
    keywords: 'college study assistant, university lecture scanner, study overlay college, study habits',
    h1: 'AI study app for college students',
    paragraphs: [
      'Transcribe long lectures, organize workspaces, and generate study guides, flashcards, and podcasts from dense university coursework.',
    ],
    links: [
      { href: '/study-app-for-middle-and-high-school-students', label: 'Middle & High School' },
      { href: '/real-time-ai-tutor', label: 'Real-Time AI Tutor' },
      ...coreLinks,
    ],
  },
  '/viszmo-vs-quizlet': {
    title: 'Viszmo vs Quizlet | Why Students Switch to AI Overlay',
    description:
      'Compare Quizlet and Viszmo. See why students are switching from traditional flashcards to our real-time AI study sidekick with screen overlay.',
    keywords: 'Quizlet alternatives, best flashcard app, AI study tool vs Quizlet, visual study app',
    h1: 'Viszmo vs Quizlet',
    paragraphs: [
      'Quizlet is built around manual flashcard decks. Viszmo adds a live screen overlay, lecture transcription, and automatic study material generation from your actual coursework.',
    ],
    sections: [
      {
        h2: 'When Viszmo is the better fit',
        paragraphs: [
          'Choose Viszmo if you want real-time homework help on screen, automatic flashcards from lectures, and an AI tutor tied to your study library.',
        ],
      },
    ],
    links: [
      { href: '/viszmo-vs-knowt', label: 'Viszmo vs Knowt' },
      { href: '/viszmo-vs-anki', label: 'Viszmo vs Anki' },
      ...coreLinks,
    ],
  },
  '/viszmo-vs-knowt': {
    title: 'Viszmo vs Knowt | The Ultimate AI Study Comparison',
    description:
      'Compare Knowt and Viszmo. Find out which platform has the better study helper, automated flashcards, and live overlay interface for students.',
    keywords: 'Knowt alternatives, Viszmo vs Knowt, best study dashboard, automatic flashcards',
    h1: 'Viszmo vs Knowt',
    paragraphs: [
      'Both tools help students study with AI, but Viszmo adds a desktop screen overlay and live lecture workflow for homework and video-based learning.',
    ],
    links: [
      { href: '/viszmo-vs-quizlet', label: 'Viszmo vs Quizlet' },
      { href: '/viszmo-vs-gizmo', label: 'Viszmo vs Gizmo' },
      ...coreLinks,
    ],
  },
  '/viszmo-vs-gizmo': {
    title: 'Viszmo vs Gizmo | Choosing the Best AI Sidekick',
    description:
      'Compare Gizmo and Viszmo side-by-side. Learn about the key differences in study modes, live lecture capture, and screen reading technology.',
    keywords: 'Gizmo alternative, study companion comparison, live screen reader',
    h1: 'Viszmo vs Gizmo',
    paragraphs: [
      'Compare study companions by how they handle screen reading, lecture capture, flashcard creation, and real-time tutoring across desktop and mobile.',
    ],
    links: [
      { href: '/viszmo-vs-knowt', label: 'Viszmo vs Knowt' },
      { href: '/viszmo-vs-anki', label: 'Viszmo vs Anki' },
      ...coreLinks,
    ],
  },
  '/viszmo-vs-anki': {
    title: 'Viszmo vs Anki | AI Screen Reader vs Spaced Repetition',
    description:
      "Anki is great for custom cards, but Viszmo requires zero setup. Compare Anki's learning curve with Viszmo's live AI overlay sidekick.",
    keywords: 'Anki alternative, spaced repetition comparison, no-setup flashcards',
    h1: 'Viszmo vs Anki',
    paragraphs: [
      'Anki excels at spaced repetition for power users who build decks manually. Viszmo auto-generates study materials and helps with live homework through a screen overlay.',
    ],
    links: [
      { href: '/viszmo-vs-quizlet', label: 'Viszmo vs Quizlet' },
      { href: '/features', label: 'Viszmo Features' },
      ...coreLinks,
    ],
  },
  '/contact': {
    title: 'Contact Viszmo | Customer Support & Feedback',
    description:
      "Have questions or need assistance? Reach out to the Viszmo support team. We're here to help you get the most out of your AI study sidekick.",
    keywords: 'contact Viszmo, student support help, study overlay customer service',
    h1: 'Contact Viszmo support',
    paragraphs: [
      'Reach the Viszmo team for product questions, account help, billing guidance, and feedback about the AI study platform.',
    ],
    links: [
      { href: '/help', label: 'Help Center' },
      ...coreLinks,
    ],
  },
  '/help': {
    title: 'Help Center | Viszmo Troubleshooting & Documentation',
    description:
      'Search the Viszmo Help Center for guides, desktop app installation tutorials, account setup troubleshooting, and feature walkthroughs.',
    keywords: 'help desk, Viszmo FAQ, install desktop app, screen overlay setup guide',
    h1: 'Viszmo Help Center',
    paragraphs: [
      'Find setup guides for the desktop overlay, iOS app, account troubleshooting, lecture transcription, and study dashboard features.',
    ],
    links: [
      { href: '/contact', label: 'Contact Support' },
      { href: '/how-it-works', label: 'How It Works' },
      ...coreLinks,
    ],
  },
  '/ai-homework-helper': {
    title: 'AI Homework Helper — Get Instant Answers While You Study | Viszmo',
    description:
      'Viszmo is the AI homework helper that lives on your screen. Get instant answers for any subject — from high school through college.',
    keywords: 'AI homework helper, live homework assistance, step by step homework, multi-subject AI helper',
    h1: 'AI homework helper on your screen',
    paragraphs: [
      'Get step-by-step homework help for math, science, writing, and more while Viszmo reads the problem directly from your screen or notes.',
    ],
    links: [
      { href: '/ai-math-solver', label: 'AI Math Solver' },
      { href: '/ai-study-assistant', label: 'AI Study Assistant' },
      ...coreLinks,
    ],
  },
  '/ai-math-solver': {
    title: 'AI Math Solver — Solve Any Math Problem Instantly | Viszmo',
    description:
      'Viszmo solves any math problem live on your screen. Step by step answers for algebra, geometry, calculus and more — for high school and college students.',
    keywords: 'AI math solver, graph solver, geometry proof helper, step by step calculus solver',
    h1: 'AI math solver with step-by-step answers',
    paragraphs: [
      'Solve algebra, geometry, trigonometry, and calculus problems with explanations shown live on your screen using Viszmo.',
    ],
    links: [
      { href: '/ai-homework-helper', label: 'AI Homework Helper' },
      { href: '/study-overlay', label: 'Screen Overlay' },
      ...coreLinks,
    ],
  },
  '/ai-study-assistant': {
    title: 'AI Study Assistant — Your Smart Study Partner | Viszmo',
    description:
      'Viszmo is the AI study assistant that works live on your screen. Ask questions, get explanations, and study smarter — built for high school and college students.',
    keywords: 'AI study assistant, spaced repetition study, personal study companion, digital textbook helper',
    h1: 'Your AI study assistant',
    paragraphs: [
      'Ask questions, summarize lectures, generate flashcards, and stay organized with an AI study assistant that works across desktop, web, and iOS.',
    ],
    links: [
      { href: '/ai-homework-helper', label: 'AI Homework Helper' },
      { href: '/real-time-ai-tutor', label: 'Real-Time AI Tutor' },
      ...coreLinks,
    ],
  },
  '/terms': {
    title: 'Terms of Service | Viszmo',
    description:
      "Read Viszmo's Terms of Service to understand your rights and responsibilities when using our AI study tools and platform.",
    keywords: 'Viszmo terms of service, user agreement, AI study app terms',
    h1: 'Terms of Service',
    paragraphs: [
      'By using Viszmo, you agree to these terms covering eligibility, accounts, subscriptions, acceptable use, and AI-generated content disclaimers.',
    ],
    sections: [
      {
        h2: 'Eligibility and accounts',
        paragraphs: ['Viszmo is for users aged 13 and older. You are responsible for keeping your account information accurate and secure.'],
      },
      {
        h2: 'Subscriptions and academic use',
        paragraphs: [
          'Viszmo Pro subscriptions are managed through the Apple App Store. You are responsible for using Viszmo in compliance with your school academic integrity policies.',
        ],
      },
    ],
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/contact', label: 'Contact' },
    ],
    sitemapPriority: '0.3',
    sitemapChangefreq: 'yearly',
  },
  '/privacy': {
    title: 'Privacy Policy | Viszmo',
    description: 'Learn how Viszmo collects, uses, and protects your personal information and data privacy.',
    keywords: 'Viszmo privacy policy, data protection, student privacy, COPPA',
    h1: 'Privacy Policy',
    paragraphs: [
      'Viszmo explains what information we collect, how screen analysis data is handled, and how we protect student privacy across web, desktop, and mobile.',
    ],
    sections: [
      {
        h2: 'Information we collect',
        paragraphs: ['We collect account details, study preferences, subscription status, and technical identifiers needed to operate the service securely.'],
      },
      {
        h2: 'Screen data handling',
        paragraphs: [
          'Screen captures used for analysis are processed securely and discarded after processing unless you explicitly save content to your library.',
        ],
      },
    ],
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/contact', label: 'Contact' },
    ],
    sitemapPriority: '0.3',
    sitemapChangefreq: 'yearly',
  },
};
