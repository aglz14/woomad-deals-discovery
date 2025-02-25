
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const SearchBar = ({ onSearch, placeholder, initialValue = '' }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const { t } = useTranslation();

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Real-time search
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <div className="relative transform transition-transform duration-300 group-hover:scale-[1.02]">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder || t('searchPlaceholder')}
          className="w-full pl-12 pr-4 h-12 text-base bg-white/95 border-2 border-white/20 focus:border-white/40 text-gray-800 rounded-full shadow-lg placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-hover:text-purple-500" />
      </div>
    </form>
  );
};
