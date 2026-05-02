"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import DataTable from "@/components/DataTable";

export default function AdminSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (query: string, type?: string) => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    try {
      const searchType = type === "student_id" ? "id" : "name";
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  const columns = [
    { key: "student_id", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "department_name", label: "Department" },
    { key: "year", label: "Year" },
    { key: "status", label: "Status" },
  ];

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      handleSearch(query, "name");
    }
  }, [handleSearch, searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Students</h1>
        <p className="text-sm text-gray-500 mt-1">Find students by name or student ID</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {loading && <p className="text-gray-500 text-center">Searching...</p>}

      {!loading && searched && results.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          No students found matching your search criteria.
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <DataTable
            columns={columns}
            data={results}
            onRowClick={(row) => router.push(`/admin/students/${row.id}`)}
          />
        </div>
      )}
    </div>
  );
}
