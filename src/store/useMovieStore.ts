import { create } from 'zustand';

interface Movie {
  id: string;
  title: string;
  thumbnail: string;
  banner: string;
  genre: string[];
  rating: number;
  description: string;
  year: number;
  duration: string;
  videoUrl: string;
  category: 'movie' | 'series' | 'anime';
}

interface MovieState {
  movies: Movie[];
  trending: Movie[];
  watchlist: string[];
  recentlyWatched: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addToWatchlist: (movieId: string) => void;
  removeFromWatchlist: (movieId: string) => void;
  setMovies: (movies: Movie[]) => void;
}

export const useMovieStore = create<MovieState>((set) => ({
  movies: [],
  trending: [],
  watchlist: [],
  recentlyWatched: [],
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  addToWatchlist: (movieId) => set((state) => ({ 
    watchlist: state.watchlist.includes(movieId) ? state.watchlist : [...state.watchlist, movieId] 
  })),
  removeFromWatchlist: (movieId) => set((state) => ({ 
    watchlist: state.watchlist.filter(id => id !== movieId) 
  })),
  setMovies: (movies) => set({ 
    movies, 
    trending: movies.slice(0, 5) // Mock trending for now
  }),
}));
