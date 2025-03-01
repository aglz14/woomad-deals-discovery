
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";

interface SearchResult {
  id: string;
  name: string;
  type: 'mall' | 'store';
  address?: string;
  category?: string;
}

export const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    onSearch(query);

    // Search malls
    const { data: malls, error: mallsError } = await supabase
      .from('shopping_malls')
      .select('id, name, address')
      .ilike('name', `%${query}%`)
      .limit(5);

    // Search stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, category')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (mallsError || storesError) {
      console.error('Search error:', mallsError || storesError);
      return;
    }

    const results: SearchResult[] = [
      ...(malls?.map(mall => ({ ...mall, type: 'mall' as const })) || []),
      ...(stores?.map(store => ({ ...store, type: 'store' as const })) || [])
    ];

    setSearchResults(results);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder={t("searchPlaceholder")}
        className="pl-12 pr-4 h-14 text-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-colors border-2 border-purple-100 focus-visible:border-purple-300 rounded-xl shadow-lg"
        onClick={() => setOpen(true)}
      />
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-sm">
        Press '/' to search
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput 
            placeholder="Search malls and stores..." 
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {searchResults.length > 0 && (
              <>
                <CommandGroup heading="Shopping Malls">
                  {searchResults
                    .filter((result) => result.type === 'mall')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => {
                          window.location.href = `/mall/${result.id}`;
                        }}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        <div>
                          <div>{result.name}</div>
                          {result.address && (
                            <div className="text-sm text-gray-600">{result.address}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Stores">
                  {searchResults
                    .filter((result) => result.type === 'store')
                    .map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => {
                          window.location.href = `/store/${result.id}`;
                        }}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        <div>
                          <div>{result.name}</div>
                          {result.category && (
                            <div className="text-sm text-gray-600">{result.category}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};
import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  onSearch: (term: string) => void;
  hasLocation?: boolean;
  className?: string;
  placeholder?: string;
}

export const SearchBar = ({ 
  onSearch, 
  hasLocation = false, 
  className = "", 
  placeholder 
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative w-full max-w-2xl mx-auto animate-fade-up ${className}`}
    >
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        {hasLocation && (
          <div className="absolute right-16 flex items-center pointer-events-none">
            <MapPin className="h-4 w-4 text-blue-500" />
          </div>
        )}
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder || t("searchPlaceholder")}
          className="block w-full pl-10 pr-14 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-14 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        <button
          type="submit"
          className="absolute right-2 flex items-center justify-center p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};
