export type Category = 'فیلم' | 'زنجیرە' | 'ئەنیمی' | 'دۆکیومێنتاری';

export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  year: number;
  rating: number;
  duration: string;
  genres: string[];
  backdropUrl: string;
  posterUrl: string;
  category: Category;
  isTrending?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}
