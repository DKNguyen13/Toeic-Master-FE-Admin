export interface Lesson {
  _id: string;
  title: string;
  type: "reading" | "vocabulary";
  accessLevel: "free" | "basic" | "advanced" | "premium";
  views: number;
  favoriteCount: number;
  isFavorite: boolean;
  createdAt: string;
}