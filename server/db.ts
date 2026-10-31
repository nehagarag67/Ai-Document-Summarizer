import fs from 'fs';
import path from 'path';

export interface UserStats {
  docsProcessed: number;
  wordsAnalyzed: number;
  summariesGenerated: number;
  timeSavedMinutes: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  plan: 'free' | 'pro';
  createdAt: string;
  stats: UserStats;
}

export interface KeyPointsData {
  takeaways: string[];
  entities: { term: string; definition: string; category: string }[];
  metrics: { metric: string; context: string }[];
  actionItems: { task: string; owner?: string; priority: 'high' | 'medium' | 'low' }[];
  flashcards: { question: string; answer: string }[];
  sentiment: 'positive' | 'neutral' | 'critical' | 'analytical' | 'inspirational';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Technical';
}

export interface DocumentSummary {
  format: string; // 'executive' | 'bullets' | 'tldr' | 'deep_dive' | 'action_items' | 'study_guide'
  length: string; // 'concise' | 'balanced' | 'comprehensive'
  tone: string;   // 'professional' | 'casual' | 'academic' | 'creative'
  language: string;
  content: string;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  citations?: string[];
}

export interface DocItem {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md';
  fileSize: number;
  wordCount: number;
  readingTimeMinutes: number;
  rawText: string;
  createdAt: string;
  lastAccessedAt: string;
  currentSummaryFormat?: string;
  summaries: Record<string, DocumentSummary>;
  keyPoints?: KeyPointsData;
  chatMessages: ChatMessage[];
  tags?: string[];
  isFavorite?: boolean;
}

interface DatabaseSchema {
  users: Record<string, User>;
  documents: Record<string, DocItem>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Sample documents to initialize
const SAMPLE_DOCUMENTS: Omit<DocItem, 'userId'>[] = [
  {
    id: 'sample-ai-trends-2026',
    title: 'Future of Multimodal AI Agents (2026 Industry Report)',
    fileName: 'multimodal-ai-agents-2026.pdf',
    fileType: 'pdf',
    fileSize: 42800,
    wordCount: 1420,
    readingTimeMinutes: 6,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastAccessedAt: new Date().toISOString(),
    isFavorite: true,
    tags: ['AI', 'Tech Trends', 'Research'],
    currentSummaryFormat: 'executive',
    rawText: `EXECUTIVE SUMMARY: NEXT-GENERATION AUTONOMOUS MULTIMODAL AGENTS (2026)

1. Abstract & Industry Landscape
The transition from passive large language models to autonomous, multi-modal cognitive agents marks the most significant paradigm shift in enterprise computing since cloud migration. By Q3 2026, enterprise adoption of agentic architectures has grown 340% year-over-year. Agents no longer merely produce text answers; they observe graphical user interfaces, manipulate structured databases, synthesize live multi-source signals, and execute multi-step workflows across distributed cloud clusters.

2. Architecture Breakdown
State-of-the-art agent architectures consist of four primary pillars:
A. Perception & Grounding: Real-time visual grounding, audio stream comprehension, and structured schema mapping.
B. Latent Chain-of-Thought Reasoning: Dynamic thinking budgets allocate higher reasoning tokens to high-entropy edge cases while maintaining sub-100ms response times for transactional tasks.
C. Tool Orchestration & API Mesh: Bi-directional Remote Procedure Calls (RPCs) and automated error correction with zero human intervention in 94.2% of standard operational runs.
D. Episodic & Semantic Long-term Memory: Hierarchical vector caching paired with relational state graphs reducing hallucinations by 78% relative to 2024 baselines.

3. Quantifiable Business Impact
In an extensive benchmark study of 120 Fortune 500 enterprises:
- Developer velocity and software testing throughput increased by 4.2x.
- Customer support ticket resolution times dropped from 22 minutes to 1.4 minutes on first contact.
- Cross-enterprise knowledge discovery efficiency improved by 89%, directly recovering an estimated 11.4 work hours per employee monthly.
- Infrastructure efficiency: Hybrid local-cloud speculative decoding cut inference compute expenses by 43%.

4. Strategic Risks & Governance
Despite breakthroughs, enterprises encounter three acute friction points:
1. Nondeterministic Drift: Small perturbations in peripheral APIs occasionally degrade agent task compliance.
2. Authorization & Least-Privilege Enclaves: Ensuring autonomous agents cannot execute non-reversible financial or infrastructure alterations without human-in-the-loop attestation.
3. Model Poisoning & Prompt Injection Resilience: 12% of surveyed organizations experienced adversarial prompt vectors attempting to bypass strict business policies.

5. Conclusion and 2027 Projections
Organizations that establish unified semantic data layers and safe agent sandboxes will outperform peers in customer retention and capital efficiency. Recommendation: Implement verifiable zero-trust agent registries and continuous evaluation harnesses immediately.`,
    summaries: {
      executive: {
        format: 'executive',
        length: 'balanced',
        tone: 'professional',
        language: 'English',
        content: `### Executive Brief: Multimodal Autonomous Agents (2026)

**Core Finding:**
Enterprise computing has pivoted decisively from passive LLMs to multimodal autonomous agents, demonstrating **340% year-over-year adoption** in 2026. These systems orchestrate end-to-end operational workflows, visual understanding, and multi-API execution without human friction.

**Key Quantitative Highlights:**
* **4.2x Acceleration** in enterprise software development and testing cycles.
* **93% Reduction in Resolution Time:** Customer support issues solved in 1.4 minutes versus 22 minutes previously.
* **43% Lower Compute Cost:** Speculative decoding and hybrid edge-cloud routing mitigate running costs.
* **11.4 Hours Saved** per employee each month through automated semantic knowledge retrieval.

**Strategic Actionables for Leadership:**
1. **Implement Zero-Trust Sandboxing:** Enforce least-privilege token permissions to prevent unauthorized agent operations.
2. **Build Continuous Eval Suites:** Mitigate nondeterministic prompt drift through regression telemetry.
3. **Consolidate Semantic Data Meshes:** High-performing agents require clean, structured schema access.`,
        generatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    },
    keyPoints: {
      takeaways: [
        '340% Year-over-year enterprise adoption of autonomous agentic architectures.',
        'Architecture is structured around four pillars: Multimodal Perception, Latent Reasoning, Tool Orchestration, and Hierarchical Memory.',
        'Hallucinations reduced by 78% compared to 2024 baselines using relational state graphs.',
        'Developer velocity elevated by 4.2x across Fortune 500 benchmarks.',
        'Key risks include non-reversible actions and prompt injection resilience.'
      ],
      entities: [
        { term: 'Agentic Architecture', definition: 'Systems capable of perception, planning, tool usage, and self-correction to fulfill complex goals.', category: 'Concept' },
        { term: 'Speculative Decoding', definition: 'Inference optimization technique combining small draft models with large verifiers.', category: 'Technology' },
        { term: 'Hierarchical Memory', definition: 'Tiered caching combining ephemeral vector recall and permanent relational state.', category: 'Architecture' }
      ],
      metrics: [
        { metric: '+340%', context: 'YoY enterprise adoption rate of autonomous agent workflows in 2026.' },
        { metric: '4.2x', context: 'Increase in developer and QA throughput.' },
        { metric: '1.4 min', context: 'Average support ticket resolution time (down from 22 min).' },
        { metric: '-43%', context: 'Reduction in inference compute expenses via hybrid model routing.' }
      ],
      actionItems: [
        { task: 'Deploy verifiable zero-trust agent registries across engineering teams', owner: 'Infra Sec', priority: 'high' },
        { task: 'Benchmark internal support workflows for agent-assisted triage', owner: 'Customer Ops', priority: 'medium' },
        { task: 'Audit API endpoints for non-reversible authorization risks', owner: 'Platform Lead', priority: 'high' }
      ],
      flashcards: [
        { question: 'What are the four pillars of modern 2026 multimodal agents?', answer: '1. Perception & Grounding, 2. Latent Chain-of-Thought Reasoning, 3. Tool Orchestration & API Mesh, 4. Episodic & Semantic Long-term Memory.' },
        { question: 'By what percentage did hybrid speculative decoding reduce compute expenses?', answer: 'It reduced compute costs by 43%.' },
        { question: 'What is the top operational risk cited for autonomous agents?', answer: 'Nondeterministic drift and unauthorized execution of non-reversible actions without least-privilege guards.' }
      ],
      sentiment: 'analytical',
      difficulty: 'Advanced'
    },
    chatMessages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What were the main productivity gains observed in the Fortune 500 study?',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'msg-2',
        role: 'model',
        content: 'According to Section 3 of the report ("Quantifiable Business Impact"), the key productivity gains from 120 Fortune 500 companies were:\n\n1. **Developer Velocity:** Software testing throughput increased by **4.2x**.\n2. **Support Resolution:** Ticket resolution times plummeted from 22 minutes down to **1.4 minutes** on first contact.\n3. **Knowledge Discovery:** An **89% boost in efficiency**, saving approximately **11.4 work hours per employee monthly**.\n4. **Inference Compute Costs:** Reduced by **43%** through hybrid local-cloud speculative decoding.',
        timestamp: new Date(Date.now() - 3600000 * 5 + 2000).toISOString(),
        citations: ['Section 3: Quantifiable Business Impact']
      }
    ]
  },
  {
    id: 'sample-remote-work-handbook',
    title: 'Global Remote Work & Async Collaboration Guide',
    fileName: 'async-workplace-guide-2026.docx',
    fileType: 'docx',
    fileSize: 28400,
    wordCount: 980,
    readingTimeMinutes: 4,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    lastAccessedAt: new Date(Date.now() - 86400000).toISOString(),
    isFavorite: false,
    tags: ['Culture', 'Operations', 'Handbook'],
    currentSummaryFormat: 'bullets',
    rawText: `MODERN DISTRIBUTED WORKPLACE OPERATIONAL HANDBOOK

1. Core Philosophy: Asynchronous By Default
In a high-performing global organization spanning 14 time zones, synchronous meetings are treated as an expensive exception rather than the default operating mode. Every decision, specification, and project update must exist in writing before verbal discussions occur.

2. The 3-Hour Overlap Rule
Every distributed team member is requested to maintain at least 3 contiguous hours of workday overlap with their primary squad for collaborative code review, urgent unblocking, and pair programming. Outside of this window, focus blocks must be respected without interruption.

3. Documentation Standards
- RFC (Request For Comments): Required for any technical or structural change impacting more than one team member. Must have 48-hour open feedback window.
- Weekly Digest: Every project lead posts a Friday snapshot containing: Shipments, Blockers, and Next Week Priorities.
- Video Memos: Screen recordings are restricted to under 3 minutes for quick feature walkthroughs.

4. Performance & Well-being Guardrails
- Output over presence: We measure deliverables, customer happiness, and test coverage—never keyboard activity or presence badges.
- Mandatory Disconnection: 25 business days of annual paid leave, with automated Slack notification suppression during off-hours.`,
    summaries: {
      bullets: {
        format: 'bullets',
        length: 'concise',
        tone: 'professional',
        language: 'English',
        content: `* **Async First:** Synchronous calls are reserved for high-stakes unblocking; all decisions must be documented in writing first.
* **3-Hour Overlap:** Squads maintain a 3-hour daily synchronicity window while leaving the remaining hours free for uninterrupted deep work.
* **RFC Decision Protocol:** Proposals require a 48-hour written feedback cycle prior to execution.
* **Output-Driven Evaluation:** Performance is determined by shipped deliverables and metrics rather than hours logged.
* **Healthy Boundaries:** Mandatory 25 days paid vacation and automated notification silencing.`,
        generatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    },
    keyPoints: {
      takeaways: [
        'Writing is the primary communication medium; meetings are an expensive exception.',
        'Teams adhere to the 3-hour overlap rule for fast collaborative iterations.',
        'RFCs require a strict 48-hour commentary period before commitment.',
        'Strict output-focused metrics replace clock-in surveillance.'
      ],
      entities: [
        { term: 'RFC Protocol', definition: 'Request For Comments process allowing decentralized peer review.', category: 'Process' },
        { term: 'Async-First', definition: 'Work style that decouples communication from immediate time constraints.', category: 'Methodology' }
      ],
      metrics: [
        { metric: '3 Hours', context: 'Minimum contiguous workday overlap required between squad members.' },
        { metric: '48 Hours', context: 'Standard open comment review window for any technical RFC.' },
        { metric: '3 Minutes', context: 'Maximum recommended duration for asynchronous video walkthroughs.' }
      ],
      actionItems: [
        { task: 'Set up template for Friday Weekly Digest across squad leads', owner: 'Operations', priority: 'medium' },
        { task: 'Configure automated notification silencing for out-of-office team members', owner: 'IT Ops', priority: 'low' }
      ],
      flashcards: [
        { question: 'What is the required window for RFC review?', answer: '48 hours before decisions are finalized.' },
        { question: 'How is performance evaluated in this async framework?', answer: 'Based purely on shipped deliverables, code quality, and outcomes—never on hours or online status.' }
      ],
      sentiment: 'positive',
      difficulty: 'Beginner'
    },
    chatMessages: []
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDir();
    this.data = this.load();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading db.json, creating new database', err);
    }

    // Default seeded state
    const defaultUser: User = {
      id: 'usr_default',
      email: 'alex.chen@innovate.ai',
      name: 'Alex Chen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      plan: 'pro',
      createdAt: new Date().toISOString(),
      stats: {
        docsProcessed: 8,
        wordsAnalyzed: 14850,
        summariesGenerated: 14,
        timeSavedMinutes: 195
      }
    };

    const initialDocs: Record<string, DocItem> = {};
    for (const doc of SAMPLE_DOCUMENTS) {
      initialDocs[doc.id] = {
        ...doc,
        userId: defaultUser.id
      };
    }

    const initialData: DatabaseSchema = {
      users: {
        [defaultUser.id]: defaultUser
      },
      documents: initialDocs
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      this.ensureDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json', err);
    }
  }

  // User operations
  getUser(userId: string): User | undefined {
    return this.data.users[userId];
  }

  findOrCreateUser(email: string, name?: string): User {
    const existing = Object.values(this.data.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return existing;

    const id = 'usr_' + Math.random().toString(36).substring(2, 10);
    const newUser: User = {
      id,
      email,
      name: name || email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(email)}`,
      plan: 'pro',
      createdAt: new Date().toISOString(),
      stats: {
        docsProcessed: 0,
        wordsAnalyzed: 0,
        summariesGenerated: 0,
        timeSavedMinutes: 0
      }
    };
    this.data.users[id] = newUser;
    this.saveData(this.data);
    return newUser;
  }

  updateUserStats(userId: string, delta: Partial<UserStats>) {
    const user = this.data.users[userId];
    if (user) {
      user.stats.docsProcessed += delta.docsProcessed || 0;
      user.stats.wordsAnalyzed += delta.wordsAnalyzed || 0;
      user.stats.summariesGenerated += delta.summariesGenerated || 0;
      user.stats.timeSavedMinutes += delta.timeSavedMinutes || 0;
      this.saveData(this.data);
    }
  }

  // Document operations
  getDocuments(userId: string): DocItem[] {
    return Object.values(this.data.documents)
      .filter((d) => d.userId === userId || d.userId === 'usr_default')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getDocument(docId: string): DocItem | undefined {
    return this.data.documents[docId];
  }

  addDocument(doc: DocItem): DocItem {
    this.data.documents[doc.id] = doc;
    this.updateUserStats(doc.userId, {
      docsProcessed: 1,
      wordsAnalyzed: doc.wordCount,
      timeSavedMinutes: Math.round(doc.wordCount / 100)
    });
    this.saveData(this.data);
    return doc;
  }

  updateDocument(docId: string, updates: Partial<DocItem>): DocItem | undefined {
    const existing = this.data.documents[docId];
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, lastAccessedAt: new Date().toISOString() };
    this.data.documents[docId] = updated;
    this.saveData(this.data);
    return updated;
  }

  deleteDocument(docId: string): boolean {
    if (this.data.documents[docId]) {
      delete this.data.documents[docId];
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  addChatMessage(docId: string, message: ChatMessage): DocItem | undefined {
    const doc = this.data.documents[docId];
    if (!doc) return undefined;
    doc.chatMessages.push(message);
    this.saveData(this.data);
    return doc;
  }

  saveSummary(docId: string, summary: DocumentSummary): DocItem | undefined {
    const doc = this.data.documents[docId];
    if (!doc) return undefined;
    if (!doc.summaries) doc.summaries = {};
    doc.summaries[summary.format] = summary;
    doc.currentSummaryFormat = summary.format;
    this.updateUserStats(doc.userId, { summariesGenerated: 1 });
    this.saveData(this.data);
    return doc;
  }
}

export const db = new Database();
