"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/");
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    router.push("/");
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="記事を検索..."
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#289B8F] focus:border-transparent"
            style={{ fontFamily: "Noto Sans JP, sans-serif" }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#289B8F] focus:border-transparent"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="cursor-pointer mt-3 w-full bg-[#289B8F] text-white py-2 px-4 rounded-lg hover:bg-[#214a4a] focus:bg-[#214a4a] transition-colors duration-200"
          style={{ fontFamily: "Noto Sans JP, sans-serif" }}
        >
          検索
        </button>
      </form>
    </div>
  );
}