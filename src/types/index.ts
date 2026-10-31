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

export interface EntityItem {
  term: string;
  definition: string;
  category: string;
}

export interface MetricItem {
  metric: string;
  context: string;
}

export interface ActionItem {
  task: string;
  owner?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface KeyPointsData {
  takeaways: string[];
  entities: EntityItem[];
  metrics: MetricItem[];
  actionItems: ActionItem[];
  flashcards: Flashcard[];
  sentiment: 'positive' | 'neutral' | 'critical' | 'analytical' | 'inspirational';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Technical';
}

export interface DocumentSummary {
  format: string;
  length: string;
  tone: string;
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

export type SummaryFormatType =
  | 'executive'
  | 'bullets'
  | 'tldr'
  | 'deep_dive'
  | 'action_items'
  | 'study_guide';

export type SummaryLengthType = 'concise' | 'balanced' | 'comprehensive';
export type SummaryToneType = 'professional' | 'casual' | 'academic' | 'creative';
