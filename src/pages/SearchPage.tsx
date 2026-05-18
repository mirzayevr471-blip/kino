import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, SlidersHorizontal } from 'lucide-react';
import { MovieCard } from '../components/movie/MovieCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const MOCK_RESULTS = [
    { id: '1', title: 'Interstellar', thumbnail: 'https://picsum.photos/seed/inter/400/600', genre: ['Sci-Fi'], rating: 8.7, year: 2014 },
    { id: '2', title: 'Inception', thumbnail: 'https://picsum.photos/seed/inc/400/600', genre: ['Action'], rating: 8.8, year: 2010 },
  ];

  return (
    <div className="pt-24 min-h-screen px-4 container mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex-1 max-w-2xl relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input 
            value={query}
            onChange={(e) => setSearchParams({ q: e.target.value })}
            placeholder="Filmlar, seriallar, animelar..." 
            className="pl-12 h-14 bg-zinc-900 border-zinc-800 text-lg rounded-2xl focus:border-red-600 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-14 border-zinc-800 gap-2 rounded-2xl px-6">
            <SlidersHorizontal className="w-5 h-5" />
            Filtrlar
          </Button>
          <Button className="h-14 bg-red-600 hover:bg-red-700 rounded-2xl px-8">
            Qidirish
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-medium text-zinc-400">
          Qidiruv natijalari: <span className="text-white font-bold">"{query}"</span>
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {MOCK_RESULTS.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
          {query === '' && [1,2,3,4,5,6].map(i => (
             <div key={i} className="aspect-[2/3] bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
};
