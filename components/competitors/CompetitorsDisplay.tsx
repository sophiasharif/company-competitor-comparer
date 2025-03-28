// components/CompetitorsDisplay.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Competitor {
  title: string;
  url: string;
  summary: string;
}

interface CompetitorDisplayProps {
  competitors: Competitor[];
  onCompetitorClick: (url: string) => void;
  selectedCompetitorUrl: string | null;
  isLoading: boolean;
}

// Function to extract the main part of the domain
const extractDomain = (url: string) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url;
  }
};

export default function CompetitorsDisplay({ competitors, onCompetitorClick, selectedCompetitorUrl, isLoading }: CompetitorDisplayProps) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY_COUNT = 4;

  if (!competitors?.length) return null;

  const visibleCompetitors = showAll 
    ? competitors 
    : competitors.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMore = competitors.length > INITIAL_DISPLAY_COUNT;

  return (
    <div>
      <h2 className="text-2xl font-normal pb-4">
        {selectedCompetitorUrl ? "Select a competitor to compare" : "Similar Companies"}
        {selectedCompetitorUrl && (
          <span className="ml-2 text-sm text-gray-500 font-normal">
            (currently comparing with {extractDomain(selectedCompetitorUrl)})
          </span>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
        {visibleCompetitors.map((competitor) => (
          <div
            key={competitor.url}
            className={`bg-white p-6 border rounded-lg hover:ring-brand-default hover:ring-1 transition-all duration-200 ${
              selectedCompetitorUrl === competitor.url ? 'ring-2 ring-brand-default bg-brand-default/5' : ''
            }`}
          >
            <button
              onClick={() => onCompetitorClick(competitor.url)}
              className="block group w-full text-left"
              disabled={isLoading}
            >
              <h3 className={`text-lg font-medium ${selectedCompetitorUrl === competitor.url ? 'text-brand-default' : 'text-brand-default group-hover:text-brand-default/80'} transition-colors mb-2 flex items-center`}>
                {competitor.title || extractDomain(competitor.url)}
                {isLoading && selectedCompetitorUrl === competitor.url && (
                  <span className="ml-2 inline-block animate-spin h-4 w-4 border-2 border-brand-default border-t-transparent rounded-full"></span>
                )}
                {selectedCompetitorUrl === competitor.url && !isLoading && (
                  <span className="ml-2 text-xs bg-brand-default text-white px-2 py-0.5 rounded">Selected</span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {competitor.summary}
              </p>
            </button>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-start mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <span>{showAll ? 'Show Less' : 'Show More'}</span>
            {showAll ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}