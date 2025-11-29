export type BookListItem = {
  id: number;
  name: string;
  author: string | null;
  category: string | null;
  source: string | null;
  latestChapter: string | null;
  status: number | null;
  createdAt: Date;
  chapterCount: number;
};

export type ChapterListItem = {
  id: number;
  title: string;
  sortOrder: number | null;
  fileSize: string | null;
  fileType: string | null;
  createdAt: Date;
};

export type BookSummary = {
  summary: string | null;
  totalChapters: number | null;
};

export type PlotStage = {
  id: number;
  stageNumber: number;
  stageName: string;
  startEpisode: number;
  endEpisode: number;
  summary: string | null;
  protagonistUpgrade: string | null;
  stageGoal: string | null;
  conflict: string | null;
};

export type PhasedSummary = {
  id: number;
  startSort: number;
  endSort: number;
  summary: string | null;
};

export type ScriptEpisode = {
  id: number;
  episode: number;
  title: string | null;
  duration: number;
  keyPlot: string | null;
  range: string | null;
};

export type DashboardStats = {
  books: number;
  chapters: number;
  contents: number;
  scripts: number;
  summaries: number;
};

export type ChapterContent = {
  id: number;
  bookId: number;
  title: string;
  sortOrder: number | null;
  content: string;
  summary: string | null;
  fileSize: string | null;
  fileType: string | null;
  createdAt: Date;
};

export type ChapterNeighbor = {
  id: number;
  title: string;
};

export type ChapterNavigation = {
  prev: ChapterNeighbor | null;
  next: ChapterNeighbor | null;
};

export type RecentChapter = {
  id: number;
  bookId: number;
  bookName: string | null;
  chapterTitle: string | null;
  createdAt: Date;
};


export type Album = {
  id: number;
  resource_url: string;
  album_number: string | null;
  resource_title_raw: string;
  title: string;
  model: string | null;
  studio_id: number | null;
  source_page_url: string | null;
  page_number: number | null;
  item_order: number | null;
  status: number | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  studio_name?: string | null;
  model_name?: string | null;
};

export type AlbumModel = {
  id: number;
  name: string;
  studio_id: number | null;
  profile_page_url: string | null;
  created_at: Date;
  updated_at: Date;
};

export type AlbumStudio = {
  studio_id: number;
  studio_name: string;
  studio_url?: string;
  studio_intro?: string;
  studio_cover_url?: string;
  created_at?: Date;
  updated_at?: Date;
};

export type AlbumStats = {
  albums: number;
  models: number;
  studios: number;
};

// User types for authentication
export type User = {
  id: number;
  username: string;
  email: string | null;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
};

export type SessionUser = {
  id: number;
  username: string;
  email: string | null;
  role: 'admin' | 'user';
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  email?: string;
  password: string;
  role?: 'admin' | 'user';
};

// Webhook and Settings types
export type WebhookConfig = {
  id: string;
  title: string;
  url: string;
  apiKey?: string;
  description?: string;
};

export type Settings = {
  webhooks: WebhookConfig[];
  albumStoragePath: string;
};
