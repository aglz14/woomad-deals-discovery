
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder = "Search by store, mall, or location..." }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 text-base bg-white/95 border-2 border-white/20 focus:border-white/40 text-gray-800 rounded-full shadow-lg placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/20"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
    </form>
  );
};
