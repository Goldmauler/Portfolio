// Single source of truth for all portfolio content.
// Sections, the terminal and the robot all read from here.
// Sources: latest resume (public/resume.pdf) + github.com/Goldmauler.

export const profile = {
  name: 'Vimal Harihar',
  fullName: 'Vimalharihar S K',
  firstName: 'VIMAL',
  lastName: 'HARIHAR',
  handle: 'goldmauler',
  location: 'Coimbatore, India',
  email: 'vimal007.x@gmail.com',
  phone: '+91-9489874744',
  resume: '/resume.pdf',
  photo: '/vimal.jpg',
  mission: 'Build. Break. Learn. Ship. Repeat.',
  roles: [
    'Software Engineer',
    'AI & ML Engineer',
    'Multi-Agent Systems Builder',
    'Edge AI & TinyML Tinkerer',
    'Full Stack Developer',
    '35+ Hackathons // 4× Finalist',
  ],
  tagline:
    'I build AI that ships — multi-agent pipelines in the cloud, RAG over production logs, and models small enough to run on a microcontroller.',
  summary:
    'Software Engineer and B.Tech CSE student at Amrita working across AI/ML, edge AI, RAG and distributed systems. Most recently a Software & AI Intern at Innoboon building RAG + Deep-Agent tooling for production incident investigation; before that, led a 20-developer team shipping the Tensor AI Club platform to 1,200+ users.',
  education: {
    degree: 'B.Tech Computer Science & Engineering',
    short: "B.Tech CSE '27",
    school: 'Amrita Vishwa Vidyapeetham, Coimbatore',
    period: 'Aug 2023 — May 2027',
    cgpa: '7.65 / 10.0',
    coursework: [
      'Data Structures & Algorithms',
      'Database Systems',
      'Distributed Systems',
      'Operating Systems',
      'Software Engineering',
      'Computer Networks',
    ],
  },
  interests: ['AI / ML', 'Edge AI & TinyML', 'RAG & Agents', 'Distributed Systems', 'Full Stack'],
};

export const socials = [
  { label: 'GitHub', handle: '@Goldmauler', href: 'https://github.com/Goldmauler' },
  { label: 'LinkedIn', handle: 'vimal-harihar-s-k', href: 'https://www.linkedin.com/in/vimal-harihar-s-k-27979a255/' },
  { label: 'Email', handle: profile.email, href: `mailto:${profile.email}` },
];

// neofetch-style card next to the ASCII hologram (mirrors the GitHub profile README).
export const neofetch = [
  [
    ['OS', 'Windows 11, Linux, Android'],
    ['Host', 'Amrita Vishwa Vidyapeetham'],
    ['Kernel', "B.Tech CSE '27 | SWE Intern @ Innoboon '26"],
    ['Uptime', '35+ hackathons · 4 papers'],
    ['IDE', 'VS Code, IntelliJ IDEA'],
  ],
  [
    ['Languages.Prog', 'C, C++, Java, Python, JS, TypeScript'],
    ['Languages.Data', 'SQL, HTML, CSS, JSON, YAML'],
    ['Languages.Real', 'English, Tamil, Hindi'],
  ],
  [
    ['ML.Frameworks', 'TensorFlow, PyTorch, TFLite Micro'],
    ['ML.GenAI', 'LangChain, LangGraph, RAG, Bedrock'],
    ['Systems', 'Distributed, Docker, AWS, Redis, WS'],
  ],
  [
    ['Hobbies.Software', 'Multi-Agent AI, Edge ML, RAG'],
    ['Hobbies.Hardware', 'Arduino / TinyML, Signal Proc'],
  ],
];

export const stats = [
  { value: 35, suffix: '+', label: 'hackathons competed', note: 'finalist at CAT · AWS · SIH' },
  { value: 1200, suffix: '+', label: 'users on the platform I led', note: 'Tensor AI Club' },
  { value: 20, suffix: '', label: 'developers led', note: 'Web Development Lead' },
  { value: 4, suffix: '', label: 'research publications', note: 'IEEE · peer-reviewed' },
];

export const skillCategories = [
  {
    id: 'lang',
    title: 'Languages',
    file: 'languages.ko',
    skills: [
      { name: 'Python', level: 95 },
      { name: 'JavaScript/TypeScript', level: 90 },
      { name: 'C/C++', level: 85 },
      { name: 'SQL', level: 85 },
      { name: 'Java', level: 82 },
    ],
  },
  {
    id: 'ai',
    title: 'AI & ML',
    file: 'ai_ml.ko',
    skills: [
      { name: 'LangChain & LangGraph', level: 88 },
      { name: 'RAG & Deep Agents', level: 88 },
      { name: 'TensorFlow / TFLite Micro', level: 86 },
      { name: 'PyTorch', level: 84 },
      { name: 'Computer Vision (YOLO, SAM)', level: 82 },
    ],
  },
  {
    id: 'web',
    title: 'Web & Systems',
    file: 'web_systems.ko',
    skills: [
      { name: 'React & Next.js', level: 90 },
      { name: 'Node.js & FastAPI', level: 88 },
      { name: 'WebSockets & WebRTC', level: 85 },
      { name: 'REST & Microservices', level: 85 },
      { name: 'Distributed Systems', level: 80 },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud & Data',
    file: 'cloud_data.ko',
    skills: [
      { name: 'Git & CI/CD', level: 90 },
      { name: 'AWS (Lambda, DynamoDB, S3, Bedrock)', level: 86 },
      { name: 'PostgreSQL / MySQL / MongoDB', level: 85 },
      { name: 'Docker & Kubernetes', level: 80 },
      { name: 'Redis · Azure', level: 74 },
    ],
  },
];

// Extra keywords that only appear in the ticker.
export const extraTech = [
  'LangGraph', 'BM25', 'Embeddings', 'YOLOv8', 'SAM3', 'Gemini', 'Bedrock', 'Meshy.ai', 'Firebase', 'Supabase',
  'Three.js', 'Streamlit', 'ESP32', 'Arduino', 'BLE GATT', 'Socket.io', 'Yjs', 'Kubernetes', 'Pandas', 'Solidity',
];

export const experience = [
  {
    hash: 'a71c0de',
    head: true,
    role: 'Software & AI Intern',
    org: 'Innoboon',
    period: 'Apr 2026 — Jun 2026',
    points: [
      'Developed an AI-driven JIRA ↔ GCP incident-correlation system using RAG and Deep Agents to surface the GCP audit logs relevant to each JIRA ticket during production investigations.',
      'Built a multi-stage retrieval pipeline — metadata filters, keyword matching, BM25 and embeddings — that ranks logs and hands contextual evidence to AI root-cause analysis.',
      'Shipped full-stack internal tools (web front-ends + REST back-ends) that automate business processes, through Agile sprints with design and code reviews.',
    ],
    tags: ['rag', 'deep-agents', 'bm25', 'gcp'],
  },
  {
    hash: 'f3a9c12',
    role: 'Web Development Lead',
    org: 'Tensor AI Club · Amrita',
    period: 'Mar 2024 — Jan 2026',
    link: 'https://tensor-web-tau.vercel.app/',
    points: [
      'Led 20 developers building the official Tensor AI Club platform for 1,200+ active users, owning UI/UX, architecture and delivery with React/Next.js.',
      'Enforced code reviews and coding standards, mentoring developers on clean code and problem decomposition.',
    ],
    tags: ['leadership', 'next.js', 'mentoring'],
  },
  {
    hash: '41d6e8a',
    role: 'Web Developer',
    org: 'HIVETZ Nutri Pvt. Ltd.',
    period: '2024 — 2025',
    points: [
      'Developed and deployed a responsive company website with Next.js and custom-domain integration — production-ready within one month.',
    ],
    tags: ['next.js', 'deployment', 'client'],
  },
];

export const achievements = [
  { title: 'Winner', event: 'Infineon PSoC 6 Hackathon', year: '2025', tier: 'gold' },
  { title: 'Finalist', event: 'Caterpillar Tech Challenge', year: '2026', tier: 'gold' },
  { title: 'Finalist', event: 'AWS AI for Bharat Hackathon', year: '2026', tier: 'gold' },
  { title: 'Finalist', event: 'Smart India Hackathon (SIH)', year: '2025', tier: 'gold' },
  { title: 'Finalist', event: 'Technova Hackathon · CIT', year: '2026', tier: 'silver' },
  { title: 'Rota-Tech-X', event: 'Rotaract hackathon · built UrbanPulse', year: '', tier: 'silver' },
  { title: 'AI for One Day', event: 'NIT Trichy', year: '', tier: 'silver' },
  { title: 'Top 50 / 500+', event: 'IIT Delhi Hackathon', year: '2025', tier: 'silver' },
  { title: 'Top 50 / 650', event: 'NIIT Ideathon', year: '', tier: 'bronze' },
];

// Always question 1. Getting it right unlocks the Time Stone saga.
export const quizOpener = {
  q: 'Who is Vimal’s favourite Marvel character?',
  options: ['Doctor Strange', 'Iron Man', 'Spider-Man', 'Thor'],
  fact: 'Doctor Strange — Sorcerer Supreme, keeper of the Time Stone. It stays locked… for now.',
  special: 'timestone',
};

// "How well do you know Vimal?" — the first option is always the right one;
// the game shuffles them. `where` points at the section that has the answer.
export const quizQuestions = [
  {
    q: 'Which hackathon did Vimal win?',
    options: ['Infineon PSoC 6 Hackathon', 'Smart India Hackathon', 'IIT Delhi Hackathon', 'NIIT Ideathon'],
    fact: 'Winner — Infineon PSoC 6 Hackathon (2025). SIH: finalist. IIT Delhi & NIIT: top 50.',
    where: 'experience',
  },
  {
    q: 'Phanovex made the finals of which challenge?',
    options: ['Caterpillar Tech Challenge 2026', 'NASA Space Apps', 'Google Solution Challenge', 'Microsoft Imagine Cup'],
    fact: 'Phanovex — predictive carry-back intelligence for CAT mining haul trucks — was a Caterpillar Tech Challenge 2026 finalist.',
    where: 'projects',
  },
  {
    q: 'What does Phanovex detect?',
    options: ['Material stuck in mining-truck beds', 'Potholes on city roads', 'Irregular heartbeats', 'Leaked PII in documents'],
    fact: 'Carry-back, via SAM3 segmentation fused with load and moisture sensors. (Potholes = UrbanPulse, heartbeats = CardioSync, PII = LexRedact.)',
    where: 'projects',
  },
  {
    q: 'Lazarus — an AWS AI for Bharat finalist — does what?',
    options: [
      'Resurrects legacy GitHub repos and deploys them live',
      'Generates 3D assets from text',
      'Translates sign language to text',
      'Predicts stock prices',
    ],
    fact: 'A multi-agent pipeline on AWS that migrates a dead repo and puts it on a live URL in under 5 minutes.',
    where: 'projects',
  },
  {
    q: 'CardioSync classifies arrhythmias on an Arduino with what accuracy?',
    options: ['95.37%', '89.20%', '98.84%', '99.90%'],
    fact: '95.37% on MIT-BIH, quantized with TFLite Micro to fit in 256KB of RAM. (98.84% is his EfficientNet paper.)',
    where: 'projects',
  },
  {
    q: 'Where was Vimal a Software & AI Intern in 2026?',
    options: ['Innoboon', 'Caterpillar', 'Infineon', 'Google'],
    fact: 'Innoboon, Apr – Jun 2026 — RAG + Deep Agents for production incident investigation.',
    where: 'experience',
  },
  {
    q: 'What did he build at Innoboon?',
    options: [
      'RAG + Deep Agents linking JIRA tickets to GCP logs',
      'A food-delivery app',
      'A crypto trading bot',
      'A mobile game engine',
    ],
    fact: 'Metadata filters, BM25 and embeddings rank the GCP audit logs relevant to each JIRA ticket for AI root-cause analysis.',
    where: 'experience',
  },
  {
    q: 'How many developers did he lead as Web Development Lead at Tensor AI Club?',
    options: ['20', '5', '50', '100'],
    fact: '20 developers, shipping a platform used by 1,200+ people.',
    where: 'experience',
  },
  {
    q: 'Where does Vimal study?',
    options: ['Amrita Vishwa Vidyapeetham, Coimbatore', 'IIT Madras', 'NIT Trichy', 'VIT Vellore'],
    fact: "B.Tech CSE at Amrita, Coimbatore — class of 2027.",
    where: 'about',
  },
  {
    q: 'His peer-reviewed EfficientNet research hit 98.84% accuracy on…',
    options: ['Brain-tumour MRI scans', 'Satellite images', 'Handwritten digits', 'Traffic signs'],
    fact: '4-class MRI brain-tumour classification with EfficientNet-B1.',
    where: 'skills',
  },
  {
    q: 'REZO, his published VS Code extension, lets you…',
    options: ['Chat with your team inside your code files', 'Auto-format Python', 'Deploy to AWS in one click', 'Pair-program with an AI'],
    fact: 'Select text → Ctrl+Shift+S sends it to your room. Zero runtime dependencies.',
    where: 'projects',
  },
  {
    q: 'Roughly how many hackathons has Vimal competed in?',
    options: ['35+', '5', '12', '100+'],
    fact: '35+ — and the trophy case will tell you most of the losses became lessons.',
    where: 'experience',
  },
  {
    q: 'Lekhaflow keeps concurrent edits conflict-free using…',
    options: ['Yjs CRDTs', 'Database row locks', 'Git merges', 'Last-write-wins'],
    fact: 'CRDTs over binary WebSockets: sub-100ms cursors at 60 FPS.',
    where: 'projects',
  },
  {
    q: 'UrbanPulse spots civic issues using…',
    options: ['YOLOv8 + SAM segmentation', 'GPT prompts only', 'LiDAR scans', 'Manual reports'],
    fact: 'YOLOv8 across 13 civic-issue classes, with SAM masks to estimate severity.',
    where: 'projects',
  },
  {
    q: 'What is the name of the robot at the top of this site?',
    options: ['VH-01', 'R2-D2', 'JARVIS', 'WALL-E'],
    fact: 'VH-01. Click it a few times — it has opinions.',
    where: 'top',
  },
  {
    q: "What is Vimal's GitHub handle?",
    options: ['Goldmauler', 'vimal-dev', 'harihar404', 'codevimal'],
    fact: 'github.com/Goldmauler — 20+ public repos.',
    where: 'about',
  },
  {
    q: 'Finish his motto: Build. Break. Learn. Ship. ___',
    options: ['Repeat.', 'Sleep.', 'Profit.', 'Deploy.'],
    fact: 'Build. Break. Learn. Ship. Repeat.',
    where: 'about',
  },
  {
    q: "AVAV's self-correcting 3D pipeline is orchestrated with…",
    options: ['LangGraph', 'Kubernetes', 'Apache Airflow', 'Excel macros'],
    fact: 'A LangGraph StateGraph runs Generate → Audit → Correct, up to three cycles.',
    where: 'projects',
  },
  {
    q: 'Which of his papers is IEEE-published?',
    options: [
      'AI’s Influence on Gender Representation',
      'Personalized Nutrition for Alzheimer’s',
      'A Survey of Blockchain Voting',
      'Quantum Routing for 6G',
    ],
    fact: '“AI’s Influence on Gender Representation and Societal Norms in Emerging Technologies” — IEEE.',
    where: 'skills',
  },
];

// Carried by the rockets orbiting the trophy case — one per shot-down rocket.
export const lossQuotes = [
  'Every trophy in this case was built on a hackathon I lost first.',
  '35+ hackathons. Most of them losses. All of them lessons.',
  'A loss is just a stack trace — read it, fix it, ship again.',
  'Rejected submissions are free code reviews from reality.',
  'The demo that crashed taught me more than the one that won.',
  'You don’t level up on wins. You level up on what broke.',
  'Losing at 3 AM is how you learn to win at 9 AM.',
  'Win or learn. There is no third option.',
  '“Not selected” is just the spec for what to build next.',
  'Losses compile into experience. Trophies are only the build output.',
];

export const certifications = [
  { name: 'Azure Architecture & Cloud Infrastructure', org: 'Microsoft Learn · AZ-305 & AZ-900 paths' },
  { name: 'Deep Agents · LangGraph', org: 'LangChain Academy' },
  { name: 'Introduction to Large Language Models', org: 'Google' },
];

export const publications = [
  {
    title: 'AI’s Influence on Gender Representation and Societal Norms in Emerging Technologies',
    venue: 'IEEE',
    status: 'IEEE Published',
    type: 'Research Paper',
    date: '',
    note: 'How AI systems shape gender representation and social norms as emerging technologies scale.',
  },
  {
    title: 'SecureAI-Cyber: An AI-Powered Cybersecurity Solution for Scalable Threat Management',
    venue: '',
    status: 'Published',
    type: 'Research Paper',
    date: '2026',
    note: 'AI-driven threat detection and response designed to scale with the volume of modern attacks.',
  },
  {
    title: 'Gradient-Based EfficientNet for Medical Image Classification',
    venue: '',
    status: 'Peer-Reviewed',
    type: 'Research Paper',
    date: '2025',
    metric: '98.84%',
    note: '4-class MRI brain-tumor classification with EfficientNet-B1 — a compound-scaling study across B0/B1/B2.',
  },
  {
    title: 'Personalized Nutrition for Alzheimer’s',
    venue: '',
    status: 'Accepted',
    type: 'Book Chapter',
    date: 'Apr 2025',
    note: 'Book chapter on tailoring nutrition strategies for Alzheimer’s care.',
  },
];

export const projects = [
  {
    id: 'phanovex',
    code: 'PHX',
    title: 'Phanovex',
    subtitle: 'Predictive Carry-Back Intelligence for Mining Trucks',
    year: '2026',
    badge: 'Caterpillar Tech Challenge · Finalist',
    metric: { value: '3-way', label: 'vision · load · environment fusion' },
    description:
      'A predictive intelligence system for CAT mining haul trucks that detects residual carry-back material in the truck bed and flags the risk before the next load.',
    points: [
      'Integrated the SAM3 (Segment Anything) vision model to segment residual material from bed imagery and estimate buildup.',
      'Multi-sensor fusion layer combining vision, load and environmental inputs, with a biomimetic model of how material adheres and detaches.',
      'Built a 3D model and simulation of the truck bed (Three.js + Streamlit, ESP32 live mode) to validate the detection approach.',
    ],
    tech: ['Python', 'SAM3', 'Computer Vision', 'Sensor Fusion', 'ESP32', 'Three.js'],
    link: 'https://github.com/Goldmauler/Caterpillar_Simulation',
    deck: { pdf: '/decks/phanovex.pdf', dir: '/decks/phanovex', slides: 24, title: 'Caterpillar Tech Challenge 2026 · final deck' },
    visual: 'truck',
  },
  {
    id: 'lazarus',
    code: 'LZR',
    title: 'Lazarus',
    subtitle: 'Cloud-Native Multi-Agent Platform on AWS',
    year: '2026',
    badge: 'AWS AI for Bharat · Finalist',
    metric: { value: '<5 min', label: 'legacy repo → live URL' },
    description:
      'A multi-agent pipeline on AWS that autonomously analyzes, migrates and deploys legacy repositories — each agent owns one stage, with state persisted between stages.',
    points: [
      'Serverless compute on Lambda, state in DynamoDB, artifacts in S3, with Docker-containerized build agents.',
      'Resilient REST APIs with retry logic and failure recovery; a self-healing loop reads runtime errors, patches and redeploys.',
    ],
    tech: ['Python', 'FastAPI', 'AWS Lambda', 'DynamoDB', 'S3', 'Bedrock', 'Docker'],
    link: 'https://github.com/ArunN2005/lazarus-hackathon',
    deck: { pdf: '/decks/lazarus.pdf', dir: '/decks/lazarus', slides: 10, title: 'AWS AI for Bharat · idea submission deck' },
    visual: 'agents',
  },
  {
    id: 'avav',
    code: 'AVV',
    title: 'AVAV',
    subtitle: 'Autonomous Visual Asset Validator',
    year: '2026',
    badge: 'Agentic AI · LangGraph',
    metric: { value: '0', label: 'humans after the first prompt' },
    description:
      'A self-correcting multi-agent 3D QA pipeline: Generate → Audit → Correct, up to three cycles, producing production-ready assets with a full audit trail.',
    points: [
      'LangGraph StateGraph orchestrator with a CostGuard agent that halts runs before they exceed budget.',
      'Meshy.ai text-to-3D generation, Gemini Vision auditing, and a MemoryAgent that recalls the historically best fix.',
      'React Flow dashboard with a live 3D viewer, streamed from a FastAPI + WebSocket backend.',
    ],
    tech: ['LangGraph', 'Gemini Vision', 'Meshy.ai', 'FastAPI', 'React', 'WebSockets'],
    link: 'https://github.com/Goldmauler/Agentic-AI-for-Autonomous-Enterprise-Workflows',
    visual: 'loop3d',
  },
  {
    id: 'lekhaflow',
    code: 'LKF',
    title: 'Lekhaflow',
    subtitle: 'Real-Time Collaborative Canvas',
    year: '2025',
    badge: 'CRDT · Multiplayer',
    metric: { value: '<100ms', label: 'cursor latency @ 60 FPS' },
    description:
      'An infinite shared canvas with conflict-free multi-user editing, binary WebSocket presence and a Follow-the-Leader presentation mode.',
    points: [
      'Binary WebSocket serialization for low-latency state sync; layered canvas rendering holds 60 FPS.',
      'CRDT-based conflict-free sync keeps replicas convergent under network delay and reconnection — no central locking.',
    ],
    tech: ['React', 'TypeScript', 'Node.js', 'WebSockets', 'WebRTC', 'Yjs'],
    link: 'https://github.com/anusanth26/LekhaFlow',
    live: 'https://lekhaflow.rishiikesh.me/',
    visual: 'cursors',
  },
  {
    id: 'kvstore',
    code: 'DKV',
    title: 'Distributed KV Store',
    subtitle: 'Fault-Tolerant Key-Value Store, From Scratch',
    year: '2025',
    badge: 'Systems · Distributed',
    metric: { value: '0', label: 'data loss under node failure' },
    description:
      'A fault-tolerant distributed key-value store built from first principles — partitioning, consensus and replication with the data structures underneath.',
    points: [
      'Consistent hashing, leader election and replication across nodes.',
      'Hinted handoff and failure-recovery logic for high availability, reasoning through consistency trade-offs.',
    ],
    tech: ['Python', 'Distributed Systems', 'Consistent Hashing', 'Replication'],
    link: 'https://github.com/Goldmauler',
    visual: 'ring',
  },
  {
    id: 'cardiosync',
    code: 'CRD',
    title: 'CardioSync',
    subtitle: 'IoT Cardiac Monitoring on the Edge',
    year: '2025',
    badge: 'TinyML · On-device',
    metric: { value: '95.37%', label: 'arrhythmia accuracy, 256KB RAM' },
    description:
      'A 1D-CNN trained on MIT-BIH and quantized with TensorFlow Lite Micro to run real-time 5-class arrhythmia detection on an Arduino Nano 33 BLE — no cloud.',
    points: [
      'Custom C++ signal pipeline (median → moving average → baseline correction) on 128 SPS ECG data.',
      'Streams classified ECG, HR and HRV over BLE GATT to a Flutter dashboard.',
    ],
    tech: ['C++', 'TFLite Micro', 'Python', 'Flutter', 'BLE GATT'],
    link: 'https://github.com/adii11001/Arrhythmia-detection-model',
    visual: 'ecg',
  },
  {
    id: 'urbanpulse',
    code: 'UPL',
    title: 'UrbanPulse',
    subtitle: 'YOLOv8 Civic-Issue Detection with SAM',
    year: '2025',
    badge: 'Rota-Tech-X',
    metric: { value: '13', label: 'civic-issue classes detected' },
    description:
      'The auto-classification engine of a live citizen-complaint portal: potholes, sewage, garbage, road damage and more, validated by confidence.',
    points: [
      'Trained YOLOv8 on a custom-annotated dataset (Roboflow) across 13 civic-issue categories.',
      'SAM segmentation fallback produces pixel masks to estimate issue area and severity.',
    ],
    tech: ['Python', 'YOLOv8', 'SAM', 'Roboflow', 'React'],
    link: 'https://github.com/ArunN2005/UrbanPulse-Rota-Tech-X',
    deck: { pdf: '/decks/urbanpulse.pdf', dir: '/decks/urbanpulse', slides: 8, title: 'UrbanPulse · pitch deck' },
    visual: 'detect',
  },
  {
    id: 'rezo',
    code: 'RZO',
    title: 'REZO',
    subtitle: 'Team Messaging Inside VS Code',
    year: '2026',
    badge: 'Open Source · VS Code Marketplace',
    metric: { value: '0', label: 'runtime dependencies' },
    description:
      'A published VS Code extension: send and receive team messages inside your files with two shortcuts — no sidebar, no panels.',
    points: [
      'Select text → Ctrl+Shift+S sends it to the room; Ctrl+Shift+V inserts history as comments.',
      'Room codes, expiry and a local cache over the Firebase Realtime Database REST API.',
    ],
    tech: ['TypeScript', 'VS Code API', 'Firebase'],
    link: 'https://github.com/Goldmauler/Ghost_Chat',
    visual: 'editor',
  },
  {
    id: 'lexredact',
    code: 'LXR',
    title: 'LexRedact',
    subtitle: 'Document Intelligence & PII Redaction Review',
    year: '2026',
    badge: 'Sprintfour Hackathon',
    metric: { value: '76', label: 'PII spans in the stress test' },
    description:
      'A full-stack tool for when a PII redaction model gets it wrong — catching missed names and numbers and un-hiding harmless boilerplate.',
    points: [
      'Gemini-powered PII detection across PDF, DOCX and JSON with a confidence-based human review queue.',
      'Entity grouping for batch correction, risk scoring, and scope switching (medical, legal, finance) mid-review.',
    ],
    tech: ['Next.js', 'TypeScript', 'Gemini', 'pdf-parse', 'mammoth'],
    link: 'https://github.com/Goldmauler/Sprint4Hack_Vimal',
    live: 'https://sprint4hack-vimal.onrender.com',
    visual: 'redact',
  },
];

// Smaller builds listed on the "more" card at the end of the missions track.
export const alsoShipped = [
  { name: 'MediLink', note: 'React · Node · MySQL · Solidity', href: 'https://github.com/KodeWithKeshav/MediLink' },
  { name: 'CivicStack', note: 'IIT Delhi hackathon', href: 'https://github.com/Goldmauler/IIT-Delhi' },
  { name: 'Telesto', note: '3D geological grids', href: 'https://telesto-proj.vercel.app' },
  { name: 'Tensor Web', note: 'club platform · 1,200+ users', href: 'https://tensor-web-tau.vercel.app/' },
  { name: 'HIVETZ Nutri', note: 'client website', href: 'https://github.com/Goldmauler/hivetz-nutri' },
];

export const sections = [
  { id: 'about', label: 'whoami', index: '01' },
  { id: 'skills', label: 'research', index: '02' },
  { id: 'desktop', label: 'vh.os', index: '03', target: '#desk' },
  { id: 'projects', label: 'missions', index: '04' },
  { id: 'experience', label: 'logs', index: '05' },
  { id: 'contact', label: 'connect', index: '06' },
];

// Old multi-page routes still deep-link into the single-page layout.
export const legacyRoutes = {
  '/about': 'about',
  '/skills': 'skills',
  '/experience': 'experience',
  '/projects': 'projects',
  '/contact': 'contact',
};

// Decorative [B.64] block. Click it on the page to decode.
export const secretMessage =
  'If you decoded this, you are exactly the kind of person Vimal wants to build with. Say hi: vimal007.x@gmail.com // hint: try the Konami code.';
