'use client';

import React, { useRef, useState } from 'react';
import { useStore } from '@/store';
import { categories } from '@/data/places';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const FilterBar: React.FC = () => {
  const { selectedCategoryId, setSelectedCategoryId, searchQuery, setSearchQuery } = useStore();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasDragged(false);
    if (scrollContainerRef.current) {
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    if (scrollContainerRef.current) {
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) setHasDragged(true);
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleCategoryClick = (id: string, e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setSelectedCategoryId(id);
  };

  return (
    <div className="absolute top-6 left-6 right-6 md:right-auto md:w-[340px] z-20 flex flex-col gap-4 pointer-events-none">
      <div className="liquid-glass rounded-[2rem] p-5 pointer-events-auto" suppressHydrationWarning>
        
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-theme-accent rounded-[14px] flex items-center justify-center text-theme-accent-text shadow-lg relative overflow-hidden ring-2 ring-theme-border">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-theme-text-main leading-tight drop-shadow-sm tracking-tight">Hulhumalé Map</h1>
            <p className="text-[11px] text-theme-text-muted font-bold uppercase tracking-widest mt-0.5">Local Guide</p>
          </div>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-element border border-theme-border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:bg-theme-surface-focus focus:border-theme-border-focus focus:ring-2 focus:ring-theme-ring shadow-inner text-theme-text-main placeholder-theme-placeholder transition-all font-medium"
            suppressHydrationWarning
          />
          <Search size={18} className="absolute left-4 top-3.5 text-theme-text-muted pointer-events-none" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-xs font-bold text-theme-text-muted hover:text-theme-text-main transition-colors"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      <div className="w-full liquid-glass rounded-full p-2 pointer-events-auto overflow-hidden shadow-lg border border-theme-glass-border" suppressHydrationWarning>
        <div 
          ref={scrollContainerRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={cn(
            "overflow-x-auto scrollbar-hide flex gap-2 w-full",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
        >
          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;
            return (
              <button
                key={category.id}
                onClick={(e) => handleCategoryClick(category.id, e)}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-105",
                  isSelected 
                    ? "bg-theme-accent text-theme-accent-text shadow-md border border-transparent" 
                    : "text-theme-text-main hover:bg-theme-element border border-transparent"
                )}
                suppressHydrationWarning
              >
                {category.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
