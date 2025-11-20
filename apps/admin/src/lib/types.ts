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

