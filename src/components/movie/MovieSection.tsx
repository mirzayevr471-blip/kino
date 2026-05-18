import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

interface Movie {
  id: string;
  title: string;
  thumbnail: string;
  genre: string[];
  rating: number;
  year: number;
}

interface SectionProps {
  title: string;
  movies: Movie[];
  viewAllPath?: string;
}

export const MovieSection = ({ title, movies, viewAllPath }: SectionProps) => {
  return (
    <section className="space-y-4 py-8">
      <div className="flex items-center justify-between px-4 container mx-auto">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
          {title}
        </h2>
        {viewAllPath && (
          <Link 
            to={viewAllPath}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group"
          >
            HAMMASI
            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 px-4 container mx-auto pb-4">
          {movies.map((movie) => (
            <div key={movie.id} className="w-[180px] md:w-[240px] shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="bg-zinc-900/50" />
      </ScrollArea>
    </section>
  );
};
