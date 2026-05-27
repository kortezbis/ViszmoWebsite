import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pingIndexNow } from './scripts/indexnow-helper.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

// Define metadata for all sitemap routes
const routes = {
  '/': {
    title: "Viszmo | The #1 AI Study Tool with Screen Overlay",
    description: "Viszmo is the ultimate AI study tool with screen overlay and live lecture transcription. Get real-time help with any subject, from any website or video.",
    keywords: "AI study tool, screen overlay, live transcription, AI tutor, study sidekick, flashcards, lecture notes"
  },
  '/features': {
    title: "Viszmo Features | Screen Overlay, AI Tutor & Live Transcription",
    description: "Discover Viszmo's game-changing features: the transparent study overlay, dynamic lecture listener, and automatic flashcard/quiz creator.",
    keywords: "study overlay, AI lecture notes, flashcard generator, quiz creator, AI study tool features"
  },
  '/pricing': {
    title: "Viszmo Pricing | Free Homework Help & Premium Pro Study Plans",
    description: "Explore Viszmo pricing plans. Start for free with daily AI homework assistance or upgrade to Pro for unlimited screen analysis and audio podcasts.",
    keywords: "Viszmo pricing, cheap AI study helper, study sidekick pro cost, academic plans"
  },
  '/how-it-works': {
    title: "How It Works | Viszmo AI Study Sidekick & Screen Overlay",
    description: "Learn how to use Viszmo to study faster. Download the desktop overlay, record your lectures, and build dynamic study dashboards instantly.",
    keywords: "how to study with AI, learn screen overlay, study dashboard guide, study guide generator"
  },
  '/study-overlay': {
    title: "Viszmo Screen Overlay | Study Seamlessly Without Switching Tabs",
    description: "The ultimate transparent screen overlay for students. Viszmo reads equations, PDFs, and videos to explain homework on the fly without tab-switching.",
    keywords: "study overlay, screen sidekick, homework screen assistant, focus study overlay, math solver"
  },
  '/study-while-watching-videos': {
    title: "Study While Watching Videos | Viszmo Interactive AI Video Helper",
    description: "Learn from any lecture, YouTube video, or online course in real-time. Viszmo transcribes audio and answers questions without pausing playback.",
    keywords: "study youtube videos, online video AI notes, watch lectures with AI, study helper overlay"
  },
  '/real-time-ai-tutor': {
    title: "Real-Time AI Tutor | Personal Academic Assistant & Explainer",
    description: "Get immediate help with complex subjects. Viszmo functions as a 24/7 AI tutor on your desktop, breaking down difficult topics in simple terms.",
    keywords: "24/7 AI tutor, academic explainer, science math tutor, college tutor online"
  },
  '/study-app-for-elementary-students': {
    title: "AI Study App for Elementary School Students | Safe & Simple",
    description: "Empower younger learners with a safe, simple, and visual AI study sidekick. Viszmo helps with reading comprehension, elementary math, and spelling.",
    keywords: "elementary school study app, child safe AI tutor, visual homework help"
  },
  '/study-app-for-middle-and-high-school-students': {
    title: "AI Study App for Middle & High School Students | Ace Your Exams",
    description: "Build perfect study habits for AP exams, SAT, ACT, and high school subjects. Viszmo generates flashcards and matching games from notes instantly.",
    keywords: "high school study app, AP exam prep, SAT prep AI, study guide creator"
  },
  '/study-app-for-college-students': {
    title: "AI Study App for College & University | Handle Heavy Coursework",
    description: "Manage large volumes of lecture recordings and reading materials with ease. Viszmo transcribes university lectures and auto-generates study packs.",
    keywords: "college study assistant, university lecture scanner, study overlay college, study habits"
  },
  '/viszmo-vs-quizlet': {
    title: "Viszmo vs Quizlet | Why Students Switch to AI Overlay",
    description: "Compare Quizlet and Viszmo. See why students are switching from traditional flashcards to our real-time AI study sidekick with screen overlay.",
    keywords: "Quizlet alternatives, best flashcard app, AI study tool vs Quizlet, visual study app"
  },
  '/viszmo-vs-knowt': {
    title: "Viszmo vs Knowt | The Ultimate AI Study Comparison",
    description: "Compare Knowt and Viszmo. Find out which platform has the better study helper, automated flashcards, and live overlay interface for students.",
    keywords: "Knowt alternatives, Viszmo vs Knowt, best study dashboard, automatic flashcards"
  },
  '/viszmo-vs-gizmo': {
    title: "Viszmo vs Gizmo | Choosing the Best AI Sidekick",
    description: "Compare Gizmo and Viszmo side-by-side. Learn about the key differences in study modes, live lecture capture, and screen reading technology.",
    keywords: "Gizmo alternative, study companion comparison, live screen reader"
  },
  '/viszmo-vs-anki': {
    title: "Viszmo vs Anki | AI Screen Reader vs Spaced Repetition",
    description: "Anki is great for custom cards, but Viszmo requires zero setup. Compare Anki's learning curve with Viszmo's live AI overlay sidekick.",
    keywords: "Anki alternative, spaced repetition comparison, no-setup flashcards"
  },
  '/contact': {
    title: "Contact Viszmo | Customer Support & Feedback",
    description: "Have questions or need assistance? Reach out to the Viszmo support team. We're here to help you get the most out of your AI study sidekick.",
    keywords: "contact Viszmo, student support help, study overlay customer service"
  },
  '/help': {
    title: "Help Center | Viszmo Troubleshooting & Documentation",
    description: "Search the Viszmo Help Center for guides, desktop app installation tutorials, account setup troubleshooting, and feature walkthroughs.",
    keywords: "help desk, Viszmo FAQ, install desktop app, screen overlay setup guide"
  },
  '/ai-homework-helper': {
    title: "AI Homework Helper — Get Instant Answers While You Study | Viszmo",
    description: "Viszmo is the AI homework helper that lives on your screen. Get instant answers for any subject — from high school through college.",
    keywords: "AI homework helper, live homework assistance, step by step homework, multi-subject AI helper"
  },
  '/ai-math-solver': {
    title: "AI Math Solver — Solve Any Math Problem Instantly | Viszmo",
    description: "Viszmo solves any math problem live on your screen. Step by step answers for algebra, geometry, calculus and more — for high school and college students.",
    keywords: "AI math solver, graph solver, geometry proof helper, step by step calculus solver"
  },
  '/ai-study-assistant': {
    title: "AI Study Assistant — Your Smart Study Partner | Viszmo",
    description: "Viszmo is the AI study assistant that works live on your screen. Ask questions, get explanations, and study smarter — built for high school and college students.",
    keywords: "AI study assistant, spaced repetition study, personal study companion, digital textbook helper"
  }
};

async function prerender() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`Build template not found at ${TEMPLATE_PATH}. Did you run "npm run build" first?`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  console.log('Starting static pre-rendering for SEO routes...');

  Object.entries(routes).forEach(([route, meta]) => {
    let html = template;
    const fullUrl = `https://www.viszmo.com${route === '/' ? '' : route}`;

    // 1. Replace Title
    const titleRegex = /<title>.*?<\/title>/i;
    html = html.replace(titleRegex, `<title>${meta.title}</title>`);

    // 2. Replace Description
    const descRegex = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;
    html = html.replace(descRegex, `<meta name="description" content="${meta.description}" />`);

    // 3. Replace Keywords
    const keyRegex = /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i;
    html = html.replace(keyRegex, `<meta name="keywords" content="${meta.keywords}" />`);

    // 4. Open Graph Replacements
    const ogUrlRegex = /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i;
    html = html.replace(ogUrlRegex, `<meta property="og:url" content="${fullUrl}" />`);

    const ogTitleRegex = /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i;
    html = html.replace(ogTitleRegex, `<meta property="og:title" content="${meta.title}" />`);

    const ogDescRegex = /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i;
    html = html.replace(ogDescRegex, `<meta property="og:description" content="${meta.description}" />`);

    // 5. Twitter Replacements
    const twitterUrlRegex = /<meta\s+property="twitter:url"\s+content="[^"]*"\s*\/?>/i;
    html = html.replace(twitterUrlRegex, `<meta property="twitter:url" content="${fullUrl}" />`);

    const twitterTitleRegex = /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/?>/i;
    html = html.replace(twitterTitleRegex, `<meta property="twitter:title" content="${meta.title}" />`);

    const twitterDescRegex = /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/?>/i;
    html = html.replace(twitterDescRegex, `<meta property="twitter:description" content="${meta.description}" />`);

    // 6. Ensure canonical link matches
    const headEndIndex = html.indexOf('</head>');
    if (headEndIndex !== -1) {
      const canonicalTag = `  <link rel="canonical" href="${fullUrl}" />\n`;
      html = html.slice(0, headEndIndex) + canonicalTag + html.slice(headEndIndex);
    }

    // 7. Inject H1 inside the root div for non-JS crawlers (like Bing Site Scan)
    const rootRegex = /<div id="root"[^>]*>/i;
    html = html.replace(rootRegex, `$&<h1 style="position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0;">${meta.title}</h1>`);

    if (route === '/') {
      // For home page, write directly to index.html in dist
      fs.writeFileSync(TEMPLATE_PATH, html, 'utf-8');
      console.log(`Pre-rendered: / -> dist/index.html`);
    } else {
      // For sub-routes, create a directory and write index.html inside it
      const targetDir = path.join(DIST_DIR, route.slice(1));
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
      console.log(`Pre-rendered: ${route} -> dist/${route.slice(1)}/index.html`);
    }
  });

  console.log('Static pre-rendering successfully completed!');

  // Submit pre-rendered URLs to IndexNow
  try {
    const preRenderedUrls = Object.keys(routes).map(route => {
      return `https://www.viszmo.com${route === '/' ? '' : route}`;
    });
    await pingIndexNow(preRenderedUrls);
  } catch (error) {
    console.error('[IndexNow] Error pinging IndexNow after pre-rendering:', error);
  }
}

prerender();
