export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  token?: string;
  profileImage?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  joinCode?: string;
  createdAt: Date;
  ownerId: string;
  owner?: User;
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  quizId: string;
  answers?: Answer[];
}

export interface Answer {
  id: string;
  text: string;
  questionId: string;
  isCorrect: boolean;
}

export interface Option {
  text: string;
  isCorrect: boolean;
  id?: string;
}

export interface LeaderboardEntry {
  userName: string;
  score: number;
  date: string; // or Date if you're storing actual Date objects
}