"use client";
import StudygroupSidebar from "./StudygroupSidebar";
import Feed from "./feed";
import { useState } from "react";
import type { StudyGroup } from "./feed";
import { Button } from "@/components/ui/button";

export default function HomeClientContent() {
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<StudyGroup[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGroupSelect = (group: StudyGroup) => {
    setSelectedGroup(group);
  };

  const handleSearch = async () => {
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ query: searchTerm }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      setSearchResults(data || []);
      setHasSearched(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };


  return (
    <div className="flex-1 pt-4 px-4">
      <div className="flex flex-col max-w-[1400px] mx-auto">
        {/* Search bar */}
        <div className="w-full md:w-[60%] lg:w-[50%] p-4 mb-8 md:mb-16 mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 py-6 px-4 h-12 rounded-md border-2 border-black dark:border-white outline-none"
            />
            <Button
              type="button"
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <img src="/search.svg" alt="Search" className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Feed or Search Results */}
        <div className="flex flex-col lg:flex-row gap-4 border-2 border-border rounded-xl mb-8 md:mb-16">
          <div className="flex-1 p-4 border-r border-border overflow-y-auto h-[60vh] lg:h-[75vh]">
            {hasSearched ? (
              searchResults.length > 0 ? (
                searchResults.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 mb-4 bg-card rounded-md cursor-pointer hover:bg-muted"
                    onClick={() => handleGroupSelect(group)}
                  >
                    <h2 className="font-semibold text-lg">
                      {group.groupName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Subject: {group.subject}
                    </p>
                  </div>
                ))
              ) : (
                <p>No results found.</p>
              )
            ) : (
              <Feed onGroupSelect={handleGroupSelect} />
            )}
          </div>

          {/* Sidebar */}
          <div className="flex-1 p-4 overflow-y-auto h-[60vh] lg:h-[75vh]">
            <StudygroupSidebar selectedGroup={selectedGroup} />
          </div>
        </div>
      </div>
    </div>
  );
}

