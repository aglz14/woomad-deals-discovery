
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export const SearchBar = ({ onSearch, placeholder, initialValue = '', className }: SearchBarProps) => {
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
    <form onSubmit={handleSubmit} className={`relative w-full group ${className || ''}`}>
      <div className="relative transform transition-transform duration-300 group-hover:scale-[1.02]">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder || "Buscar promociones y tiendas"}
          className="w-full pl-10 pr-4 h-10 text-base bg-white border-gray-200 hover:border-purple-200 focus:border-purple-300 text-gray-900 rounded-md shadow-sm placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-300 group-hover:text-purple-500" />
      </div>
    </form>
  );
};
