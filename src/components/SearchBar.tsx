
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
