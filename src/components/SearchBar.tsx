"use client";

import { useState, useEffect, useRef } from "react";

type SearchType = "name" | "student_id";

interface SearchBarProps {
  onSearch: (term: string, type: SearchType) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search students..." }: SearchBarProps) {
  const [term, setTerm] = useState("");
  const [type, setType] = useState<SearchType>("name");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(term, type);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term, type, onSearch]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {term && (
          <button
            onClick={() => setTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex rounded-lg border border-input overflow-hidden">
        <button
          onClick={() => setType("name")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            type === "name" ? "bg-primary text-primary-foreground" : "bg-white text-secondary-600 hover:bg-secondary-50"
          }`}
        >
          By Name
        </button>
        <button
          onClick={() => setType("student_id")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-l border-input ${
            type === "student_id" ? "bg-primary text-primary-foreground" : "bg-white text-secondary-600 hover:bg-secondary-50"
          }`}
        >
          By Student ID
        </button>
      </div>
    </div>
  );
}
