// CompanyResearchHome.tsx

"use client";
import { useState, FormEvent } from "react";
import CompetitorsDisplay from "./competitors/CompetitorsDisplay";
import NewsDisplay from "./news/NewsDisplay";
import CompanySummary from "./companycontent/CompanySummar";
import FundingDisplay from "./companycontent/FundingDisplay";
import ProfileDisplay from "./twitter/TwitterProfileDisplay";
import RecentTweetsDisplay from "./twitter/RecentTweetsDisplay";
import YoutubeVideosDisplay from "./youtube/YoutubeVideosDisplay";
import RedditDisplay from "./reddit/RedditDisplay";
import FinancialReportDisplay from './financial/FinancialReportDisplay';
import TikTokDisplay from './tiktok/TikTokDisplay';
import CrunchbaseDisplay from './crunchbase/CrunchbaseDisplay';
import PitchBookDisplay from './pitchbook/PitchBookDisplay';
import TracxnDisplay from "./tracxn/TracxnDisplay";
import FoundersDisplay from "./founders/FoundersDisplay";
import {
  YouTubeSkeleton,
  TikTokSkeleton,
  RedditSkeleton,
  TwitterSkeleton,
  CompetitorsSkeleton,
  NewsSkeleton,
  FoundersSkeleton,
  FinancialSkeleton,
  FundingSkeleton,
  CompanySummarySkeleton,
} from "./skeletons/ResearchSkeletons";
import CompanyMindMap from './mindmap/CompanyMindMap';

interface Video {
  id: string;
  url: string;
  title: string;
  author: string;
  [key: string]: any;
}

interface RedditPost {
  url: string;
  title: string;
  [key: string]: any;
}

interface Tweet {
  id: string;
  url: string;
  title: string;
  author: string;
  [key: string]: any;
}

interface Competitor {
  title: string;
  url: string;
  summary: string;
  [key: string]: any;
}

interface NewsItem {
  url: string;
  title: string;
  image: string;
  [key: string]: any;
}

interface Founder {
  url: string;
  title: string;
  [key: string]: any;
}

// Add new interface for company map data
interface CompanyMapData {
  companyName: string;
  rootNode: {
    title: string;
    children: Array<{
      title: string;
      description: string;
      children: Array<{
        title: string;
        description: string;
      }>;
    }>;
  };
}

export default function CompanyResearcher() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCompetitorUrl, setSelectedCompetitorUrl] = useState<string | null>(null);
  const [isCompetitorLoading, setIsCompetitorLoading] = useState(false);
  const [companyUrl, setCompanyUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Original company data states
  const [competitors, setCompetitors] = useState<Competitor[] | null>(null);
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [companySummary, setCompanySummary] = useState<any>(null);
  const [twitterProfileText, setTwitterProfileText] = useState<any>(null);
  const [recentTweets, setRecentTweets] = useState<Tweet[] | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<Video[] | null>(null);
  const [redditPosts, setRedditPosts] = useState<RedditPost[] | null>(null);
  const [fundingData, setFundingData] = useState<any>(null);
  const [financialReport, setFinancialReport] = useState<any>(null);
  const [tiktokData, setTiktokData] = useState<any>(null);
  const [crunchbaseData, setCrunchbaseData] = useState<any>(null);
  const [pitchbookData, setPitchbookData] = useState<any>(null);
  const [tracxnData, setTracxnData] = useState<any>(null);
  const [founders, setFounders] = useState<Founder[] | null>(null);
  const [companyMap, setCompanyMap] = useState<CompanyMapData | null>(null);
  
  // Competitor data states
  const [competitorNews, setCompetitorNews] = useState<NewsItem[] | null>(null);
  const [competitorSummary, setCompetitorSummary] = useState<any>(null);
  const [competitorTwitterProfileText, setCompetitorTwitterProfileText] = useState<any>(null);
  const [competitorRecentTweets, setCompetitorRecentTweets] = useState<Tweet[] | null>(null);
  const [competitorYoutubeVideos, setCompetitorYoutubeVideos] = useState<Video[] | null>(null);
  const [competitorRedditPosts, setCompetitorRedditPosts] = useState<RedditPost[] | null>(null);
  const [competitorFundingData, setCompetitorFundingData] = useState<any>(null);
  const [competitorFinancialReport, setCompetitorFinancialReport] = useState<any>(null);
  const [competitorTiktokData, setCompetitorTiktokData] = useState<any>(null);
  const [competitorCrunchbaseData, setCompetitorCrunchbaseData] = useState<any>(null);
  const [competitorPitchbookData, setCompetitorPitchbookData] = useState<any>(null);
  const [competitorTracxnData, setCompetitorTracxnData] = useState<any>(null);
  const [competitorFounders, setCompetitorFounders] = useState<Founder[] | null>(null);
  const [competitorMap, setCompetitorMap] = useState<CompanyMapData | null>(null);

  // Function to check if a string is a valid URL
  const isValidUrl = (url: string): boolean => {
    try {
      // Remove any whitespace
      url = url.trim();
      
      // Check if it's just a single word without dots
      if (!url.includes('.')) {
        return false;
      }

      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const urlObj = new URL(url);
      // Check if hostname has at least one dot and no spaces
      return urlObj.hostname.includes('.') && !urlObj.hostname.includes(' ');
    } catch {
      return false;
    }
  };

  // Function to validate and extract domain name from URL
  const extractDomain = (url: string): string | null => {
    try {
      if (!isValidUrl(url)) {
        return null;
      }

      let cleanUrl = url.trim().toLowerCase();
      
      // Add protocol if missing
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      // Parse URL
      const parsedUrl = new URL(cleanUrl);
      
      // Get domain without www.
      const domain = parsedUrl.hostname.replace(/^www\./, '');
      
      // Additional validation: domain should have at least one dot and no spaces
      if (!domain.includes('.') || domain.includes(' ')) {
        return null;
      }

      return domain;
    } catch (error) {
      return null;
    }
  };

  // Function to scrape main page
  const scrapeMainPage = async (url: string) => {
    try {
      const response = await fetch('/api/scrapewebsiteurl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch main website data');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error scraping main page:', error);
      throw error;
    }
  };

  // Function to fetch company details (summary and map)
  const fetchCompanyDetails = async (mainPageData: any, url: string) => {
    try {
      // First fetch subpages
      const subpagesResponse = await fetch('/api/scrapewebsitesubpages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!subpagesResponse.ok) {
        throw new Error('Failed to fetch subpages data');
      }

      const subpagesData = await subpagesResponse.json();

      // Then use both main page and subpages data
      await Promise.all([
        fetchCompanySummary(subpagesData.results, mainPageData, url),
        fetchCompanyMap(mainPageData, url)
      ]);
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  };

  // Update fetchCompetitors to only use main page data
  const fetchCompetitors = async (summary: string, url: string) => {
    try {
      const response = await fetch('/api/findcompetitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          websiteurl: url, 
          summaryText: summary 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch competitors');
      }

      const data = await response.json();
      return data.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        summary: result.summary,
      }));
    } catch (error) {
      console.error('Error fetching competitors:', error);
      throw error;
    }
  };

  // New function to fetch news
  const fetchNews = async (url: string) => {
    try {
      const response = await fetch('/api/findnews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('News research failed');
      }

      const data = await response.json();
      return data.results.filter((item: any) => item.title).slice(0, 6);
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  };

  // Separate function for fetching company summary
  const fetchCompanySummary = async (subpages: any, mainpage: any, websiteurl: string) => {
    try {
      const response = await fetch('/api/companysummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subpages,
          mainpage,
          websiteurl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company summary');
      }

      const data = await response.json();
      setCompanySummary(data.result);
    } catch (error) {
      console.error('Error fetching company summary:', error);
      setErrors(prev => ({ ...prev, summary: error instanceof Error ? error.message : 'An error occurred with company summary' }));
    }
  };

  // New function for fetching company map
  const fetchCompanyMap = async (mainpage: any, websiteurl: string) => {
    try {
      const response = await fetch('/api/companymap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainpage,
          websiteurl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company map');
      }

      const data = await response.json();
      setCompanyMap(data.result);
    } catch (error) {
      console.error('Error fetching company map:', error);
      setErrors(prev => ({ ...prev, map: error instanceof Error ? error.message : 'An error occurred with company map' }));
    }
  };

  // Recent tweets fetch function
  const fetchRecentTweets = async (username: string) => {
    try {
      const response = await fetch('/api/scraperecenttweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent tweets');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching recent tweets:', error);
      throw error;
    }
  };

  // Twitter profile fetch function
  const fetchTwitterProfile = async (url: string) => {
    try {
      const response = await fetch('/api/scrapetwitterprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Twitter profile');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        // Fetch tweets separately without waiting
        if (result.author) {
          fetchRecentTweets(result.author)
            .then(tweets => setRecentTweets(tweets))
            .catch(error => console.error('Error fetching recent tweets:', error));
        }
        return {
          text: result.text,
          username: result.author
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching Twitter profile:', error);
      throw error;
    }
  };
  // Youtube videos fetch function
  const fetchYoutubeVideos = async (url: string) => {
    try {
      const response = await fetch('/api/fetchyoutubevideos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube videos');
      }
  
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  };

  // Reddit posts fetch function
  const fetchRedditPosts = async (url: string) => {
    try {
      const response = await fetch('/api/scrapereddit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Reddit posts');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      throw error;
    }
  };

  // Funding API fetch function
  const fetchFunding = async (url: string) => {
    try {
      const response = await fetch('/api/fetchfunding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch funding data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching funding data:', error);
      throw error;
    }
  };

  // Financial report fetch function
  const fetchFinancialReport = async (url: string) => {
    try {
      const response = await fetch('/api/fetchfinancialreport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch financial report');
      }

      const data = await response.json();
      return data.results || null;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      throw error;
    }
  };

  // TikTok fetch function
  const fetchTikTokProfile = async (url: string) => {
    try {
      const response = await fetch('/api/fetchtiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch TikTok profile');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching TikTok profile:', error);
      throw error;
    }
  };

  // Crunchbase fetch function
  const fetchCrunchbase = async (url: string) => {
    try {
      const response = await fetch('/api/fetchcrunchbase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Crunchbase data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching Crunchbase data:', error);
      throw error;
    }
  };

  // PitchBook fetch function
  const fetchPitchbook = async (url: string) => {
    try {
      const response = await fetch('/api/fetchpitchbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PitchBook data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching PitchBook data:', error);
      throw error;
    }
  };

  // Tracxn fetch function
  const fetchTracxn = async (url: string) => {
    try {
      const response = await fetch('/api/fetchtracxn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Tracxn data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching Tracxn data:', error);
      throw error;
    }
  };

  // Founders fetch function
  const fetchFounders = async (url: string) => {
    try {
      const response = await fetch('/api/fetchfounders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch founders');
      }

      const data = await response.json();
      // Filter out company and post URLs, only keep individual profiles
      return data.results.filter((result: any) => 
        !result.url.includes('/company/') && 
        !result.url.includes('/post/') &&
        result.url.includes('/in/')
      );
    } catch (error) {
      console.error('Error fetching founders:', error);
      throw error;
    }
  };

  // Add helper function to parse company size
  const parseCompanySize = (size: string): number => {
    if (!size) return 0;
    // Extract first number from string (e.g. "1,001-5,000" -> 1001)
    const match = size.match(/(\d+(?:,\d+)*)/);
    if (!match) return 0;
    return parseInt(match[1].replace(/,/g, ''));
  };

  // Main Research Function
  const handleResearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!companyUrl) {
      setErrors({ form: "Please enter a company URL" });
      return;
    }

    const domainName = extractDomain(companyUrl);
    
    if (!domainName) {
      setErrors({ form: "Please enter a valid company URL ('example.com')" });
      return;
    }

    setIsGenerating(true);
    setErrors({});

    // Reset all states to null
    setCompetitors(null);
    setNews(null);
    setCompanySummary(null);
    setTwitterProfileText(null);
    setRecentTweets(null);
    setYoutubeVideos(null);
    setRedditPosts(null);
    setFundingData(null);
    setFinancialReport(null);
    setTiktokData(null);
    setCrunchbaseData(null);
    setPitchbookData(null);
    setTracxnData(null);
    setFounders(null);
    setCompanyMap(null);

    try {
      // Run all API calls in parallel
      const promises = [
        // Main page scraping and dependent calls
        (async () => {
          const mainPageData = await scrapeMainPage(domainName);
          if (mainPageData && mainPageData[0]?.summary) {
            await Promise.all([
              fetchCompanyDetails(mainPageData, domainName)
                .catch((error) => setErrors(prev => ({ ...prev, companyDetails: error instanceof Error ? error.message : 'An error occurred with company details' }))),
              fetchCompetitors(mainPageData[0].summary, domainName)
                .then((data) => setCompetitors(data))
                .catch((error) => setErrors(prev => ({ ...prev, competitors: error instanceof Error ? error.message : 'An error occurred with competitors' })))
            ]);
          }
        })().catch((error) => setErrors(prev => ({ ...prev, websiteData: error instanceof Error ? error.message : 'An error occurred with website data' }))),

        // Independent API calls that don't need main page data
        fetchNews(domainName)
          .then((data) => setNews(data))
          .catch((error) => setErrors(prev => ({ ...prev, news: error instanceof Error ? error.message : 'An error occurred with news' }))),

        fetchTwitterProfile(domainName)
          .then((data) => setTwitterProfileText(data))
          .catch((error) => setErrors(prev => ({ ...prev, twitter: error instanceof Error ? error.message : 'An error occurred with Twitter profile' }))),

        fetchYoutubeVideos(domainName)
          .then((data) => setYoutubeVideos(data))
          .catch((error) => setErrors(prev => ({ ...prev, youtube: error instanceof Error ? error.message : 'An error occurred with YouTube videos' }))),

        fetchRedditPosts(domainName)
          .then((data) => setRedditPosts(data))
          .catch((error) => setErrors(prev => ({ ...prev, reddit: error instanceof Error ? error.message : 'An error occurred with Reddit posts' }))),

        fetchFunding(domainName)
          .then((data) => setFundingData(data))
          .catch((error) => setErrors(prev => ({ ...prev, funding: error instanceof Error ? error.message : 'An error occurred with funding data' }))),

        fetchFinancialReport(domainName)
          .then((data) => setFinancialReport(data))
          .catch((error) => setErrors(prev => ({ ...prev, financial: error instanceof Error ? error.message : 'An error occurred with financial report' }))),

        fetchTikTokProfile(domainName)
          .then((data) => setTiktokData(data))
          .catch((error) => setErrors(prev => ({ ...prev, tiktok: error instanceof Error ? error.message : 'An error occurred with TikTok profile' }))),

        fetchCrunchbase(domainName)
          .then((data) => setCrunchbaseData(data))
          .catch((error) => setErrors(prev => ({ ...prev, crunchbase: error instanceof Error ? error.message : 'An error occurred with Crunchbase data' }))),

        fetchPitchbook(domainName)
          .then((data) => setPitchbookData(data))
          .catch((error) => setErrors(prev => ({ ...prev, pitchbook: error instanceof Error ? error.message : 'An error occurred with PitchBook data' }))),

        fetchTracxn(domainName)
          .then((data) => setTracxnData(data))
          .catch((error) => setErrors(prev => ({ ...prev, tracxn: error instanceof Error ? error.message : 'An error occurred with Tracxn data' }))),

        fetchFounders(domainName)
          .then((data) => setFounders(data))
          .catch((error) => setErrors(prev => ({ ...prev, founders: error instanceof Error ? error.message : 'An error occurred with founders' })))
      ];

      await Promise.allSettled(promises);
    } finally {
      setIsGenerating(false);
    }
  };

  // New function to handle competitor selection and research
  const handleCompetitorSelect = async (url: string) => {
    if (url === selectedCompetitorUrl) {
      // Deselect competitor if clicked again
      setSelectedCompetitorUrl(null);
      // Reset all competitor states
      resetCompetitorData();
      return;
    }

    setSelectedCompetitorUrl(url);
    setIsCompetitorLoading(true);
    setErrors(prev => ({ ...prev, competitor: '' }));

    // Reset all competitor states
    resetCompetitorData();

    const domainName = extractDomain(url);
    
    if (!domainName) {
      setErrors(prev => ({ ...prev, competitor: "Invalid competitor URL" }));
      setIsCompetitorLoading(false);
      return;
    }

    try {
      // Run all API calls in parallel for the competitor
      const promises = [
        // Main page scraping and dependent calls
        (async () => {
          const mainPageData = await scrapeMainPage(domainName);
          if (mainPageData && mainPageData[0]?.summary) {
            await Promise.all([
              (async () => {
                try {
                  const subpagesResponse = await fetch('/api/scrapewebsitesubpages', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ websiteurl: domainName }),
                  });

                  if (!subpagesResponse.ok) {
                    throw new Error('Failed to fetch subpages data');
                  }

                  const subpagesData = await subpagesResponse.json();

                  // Fetch company summary for competitor
                  const response = await fetch('/api/companysummary', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      subpages: subpagesData.results,
                      mainpage: mainPageData,
                      websiteurl: domainName
                    }),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to fetch company summary');
                  }

                  const data = await response.json();
                  setCompetitorSummary(data.result);

                  // Fetch company map for competitor
                  const mapResponse = await fetch('/api/companymap', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      mainpage: mainPageData,
                      websiteurl: domainName
                    }),
                  });

                  if (!mapResponse.ok) {
                    throw new Error('Failed to fetch company map');
                  }

                  const mapData = await mapResponse.json();
                  setCompetitorMap(mapData.result);
                } catch (error) {
                  console.error('Error fetching competitor details:', error);
                  setErrors(prev => ({ ...prev, competitorDetails: error instanceof Error ? error.message : 'An error occurred with competitor details' }));
                }
              })()
            ]);
          }
        })().catch((error) => setErrors(prev => ({ ...prev, competitorWebsiteData: error instanceof Error ? error.message : 'An error occurred with competitor website data' }))),

        // Independent API calls that don't need main page data

        fetchNews(domainName)
          .then((data) => setCompetitorNews(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorNews: error instanceof Error ? error.message : 'An error occurred with competitor news' }))),

        fetchTwitterProfile(domainName)
          .then((data) => setCompetitorTwitterProfileText(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorTwitter: error instanceof Error ? error.message : 'An error occurred with competitor Twitter profile' }))),

        fetchYoutubeVideos(domainName)
          .then((data) => setCompetitorYoutubeVideos(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorYoutube: error instanceof Error ? error.message : 'An error occurred with competitor YouTube videos' }))),

        fetchRedditPosts(domainName)
          .then((data) => setCompetitorRedditPosts(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorReddit: error instanceof Error ? error.message : 'An error occurred with competitor Reddit posts' }))),

        fetchFunding(domainName)
          .then((data) => setCompetitorFundingData(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorFunding: error instanceof Error ? error.message : 'An error occurred with competitor funding data' }))),

        fetchFinancialReport(domainName)
          .then((data) => setCompetitorFinancialReport(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorFinancial: error instanceof Error ? error.message : 'An error occurred with competitor financial report' }))),

        fetchTikTokProfile(domainName)
          .then((data) => setCompetitorTiktokData(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorTiktok: error instanceof Error ? error.message : 'An error occurred with competitor TikTok profile' }))),


        fetchCrunchbase(domainName)
          .then((data) => setCompetitorCrunchbaseData(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorCrunchbase: error instanceof Error ? error.message : 'An error occurred with competitor Crunchbase data' }))),

        fetchPitchbook(domainName)
          .then((data) => setCompetitorPitchbookData(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorPitchbook: error instanceof Error ? error.message : 'An error occurred with competitor PitchBook data' }))),

        fetchTracxn(domainName)
          .then((data) => setCompetitorTracxnData(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorTracxn: error instanceof Error ? error.message : 'An error occurred with competitor Tracxn data' }))),

        fetchFounders(domainName)
          .then((data) => setCompetitorFounders(data))
          .catch((error) => setErrors(prev => ({ ...prev, competitorFounders: error instanceof Error ? error.message : 'An error occurred with competitor founders' })))
      ];

      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Error researching competitor:", error);
      setErrors(prev => ({ ...prev, competitor: error instanceof Error ? error.message : 'An error occurred with competitor research' }));
    } finally {
      setIsCompetitorLoading(false);
    }
  };

  // Helper function to reset competitor data
  const resetCompetitorData = () => {
    setCompetitorNews(null);
    setCompetitorSummary(null);
    setCompetitorTwitterProfileText(null);
    setCompetitorRecentTweets(null);
    setCompetitorYoutubeVideos(null);
    setCompetitorRedditPosts(null);
    setCompetitorFundingData(null);
    setCompetitorFinancialReport(null);
    setCompetitorTiktokData(null);
    setCompetitorCrunchbaseData(null);
    setCompetitorPitchbookData(null);
    setCompetitorTracxnData(null);
    setCompetitorFounders(null);
    setCompetitorMap(null);
  };

  return (
    <div className="w-full max-w-7xl p-6 z-10 mb-20 mt-6">
      <h1 className="md:text-6xl text-4xl pb-5 font-medium opacity-0 animate-fade-up [animation-delay:200ms]">
        <span className="text-brand-default"> Compare </span>
        Competitors
      </h1>

      <p className="text-black mb-12 opacity-0 animate-fade-up [animation-delay:400ms]">
      Enter a company name to see how it stacks up. Instantly compare performance, reach, and strategy against top competitors.
      </p>

      <form onSubmit={handleResearch} className="space-y-6 mb-20">
        <input
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
          placeholder="Enter Company URL (e.g., example.com)"
          className="w-full bg-white p-3 border box-border outline-none rounded-sm ring-2 ring-brand-default resize-none opacity-0 animate-fade-up [animation-delay:600ms]"
        />
        <button
          type="submit"
          className={`w-full text-white font-semibold px-2 py-2 rounded-sm transition-opacity opacity-0 animate-fade-up [animation-delay:800ms] min-h-[50px] ${
            isGenerating ? 'bg-gray-400' : 'bg-brand-default ring-2 ring-brand-default'
          } transition-colors`}
          disabled={isGenerating}
        >
          {isGenerating ? 'Researching...' : 'Research Now'}
        </button>

        <div className="flex items-center justify-end gap-2 sm:gap-3 pt-4 opacity-0 animate-fade-up [animation-delay:1000ms]">
          <span className="text-gray-800">Powered by</span>
          <a 
            href="https://exa.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img src="/exa_logo.png" alt="Exa Logo" className="h-6 sm:h-7 object-contain" />
          </a>
        </div>
      </form>

      <div className="space-y-12">
        {/* Competitors Section */}
        <div className="space-y-16">
          {isGenerating && competitors === null ? (
            <CompetitorsSkeleton />
          ) : competitors && competitors.length > 0 && (
            <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
              <CompetitorsDisplay 
                competitors={competitors} 
                onCompetitorClick={handleCompetitorSelect} 
                selectedCompetitorUrl={selectedCompetitorUrl}
                isLoading={isCompetitorLoading}
              />
            </div>
          )}
        </div>
        
        {/* Main content area - Use grid layout when a competitor is selected */}
        {selectedCompetitorUrl && (
          <div className="mt-2 mb-6">
            <div className="flex items-center justify-center">
              <h2 className="text-2xl text-gray-700 font-medium">Comparing companies</h2>
            </div>
            <div className="flex items-center justify-center mt-1">
              <span className="text-gray-500">{extractDomain(companyUrl)}</span>
              <span className="mx-2 text-gray-400">vs</span>
              <span className="text-brand-default">{extractDomain(selectedCompetitorUrl)}</span>
            </div>
            <button 
              onClick={() => setSelectedCompetitorUrl(null)}
              className="mt-4 mx-auto flex items-center gap-1 text-gray-600 hover:text-brand-default text-sm transition-colors px-4 py-2 border border-gray-200 rounded-lg shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Back to {extractDomain(companyUrl)}</span>
            </button>
          </div>
        )}

        {!selectedCompetitorUrl ? (
          // Original non-comparison layout
          <div className="space-y-16">
            {/* Original Company Overview Section */}
            {(companySummary || founders || financialReport || 
            fundingData || crunchbaseData || pitchbookData || tracxnData) && (
              <div>
                <div className="flex items-center">
                  <h2 className="text-4xl font-medium">Company Overview</h2>
                </div>

                <div className="space-y-8 mt-6">
                  {isGenerating && founders === null ? (
                    <FoundersSkeleton />
                  ) : founders && founders.length > 0 && (
                    <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                      <FoundersDisplay founders={founders} />
                    </div>
                  )}

                  <div className="space-y-6">
                    {isGenerating && fundingData === null ? (
                      <FundingSkeleton />
                    ) : fundingData && (
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <FundingDisplay fundingData={fundingData} />
                      </div>
                    )}

                    {isGenerating && crunchbaseData === null ? (
                      <FundingSkeleton />
                    ) : crunchbaseData && (
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <CrunchbaseDisplay data={crunchbaseData} />
                      </div>
                    )}

                    {isGenerating && pitchbookData === null ? (
                      <FundingSkeleton />
                    ) : pitchbookData && (
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <PitchBookDisplay data={pitchbookData} />
                      </div>
                    )}

                    {isGenerating && tracxnData === null ? (
                      <FundingSkeleton />
                    ) : tracxnData && (
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <TracxnDisplay data={tracxnData} />
                      </div>
                    )}
                  </div>

                  {isGenerating && news === null ? (
                    <NewsSkeleton />
                  ) : news && news.length > 0 && (
                    <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                      <NewsDisplay news={news} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Original Company Socials Section */}
            {(twitterProfileText || youtubeVideos || tiktokData || 
            redditPosts) && (
              <div>
                <div className="flex items-center">
                  <h2 className="text-4xl font-medium">Company Socials</h2>
                </div>

                <div className="space-y-8 mt-6">
                  {isGenerating && twitterProfileText === null ? (
                    <TwitterSkeleton />
                  ) : twitterProfileText && (
                    <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                      <ProfileDisplay rawText={twitterProfileText.text} username={twitterProfileText.username} />
                      {recentTweets && <RecentTweetsDisplay tweets={recentTweets} />}
                    </div>
                  )}

                  {isGenerating && youtubeVideos === null ? (
                    <YouTubeSkeleton />
                  ) : youtubeVideos && youtubeVideos.length > 0 && (
                    <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                      <YoutubeVideosDisplay videos={youtubeVideos} />
                    </div>
                  )}

                  {isGenerating && redditPosts === null ? (
                    <RedditSkeleton />
                  ) : redditPosts && redditPosts.length > 0 && (
                    <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                      <RedditDisplay posts={redditPosts} />
                    </div>
                  )}

                  {isGenerating && tiktokData === null ? (
                    <TikTokSkeleton />
                  ) : tiktokData && (
                    <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                      <TikTokDisplay data={tiktokData} />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Summary and Mind Map Section - Only for main company, not in the comparison view */}
            {(isGenerating || companySummary) && (
              <div className="space-y-8">
                <div className="flex items-center">
                  <h2 className="text-3xl font-medium mt-6">Summary and Mind Map</h2>
                </div>

                {isGenerating && companySummary === null ? (
                  <CompanySummarySkeleton />
                ) : companySummary && (
                  <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                    <CompanySummary summary={companySummary} />
                  </div>
                )}

                {isGenerating && companyMap === null ? (
                  <div className="hidden sm:block animate-pulse">
                    <div className="h-64 bg-secondary-darkest rounded-lg flex items-center justify-center">
                      <p className="text-gray-400 text-md">Loading...</p>
                    </div>
                  </div>
                ) : companyMap && (
                  <div className="hidden sm:block opacity-0 animate-fade-up [animation-delay:200ms]">
                    <CompanyMindMap data={companyMap} />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Comparison side-by-side layout
          <div className="space-y-16">

                        {/* Summary Section */}
                        {(companySummary || competitorSummary) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Company Comparison</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {companySummary ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <CompanySummary summary={companySummary} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No summary data found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorSummary === null ? (
                    <CompanySummarySkeleton />
                  ) : competitorSummary ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <CompanySummary summary={competitorSummary} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No summary data found</div>
                  )}
                </div>
              </div>
            )}

            {/* Mind Map Section */}
            {(companyMap || competitorMap) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Company Mind Map</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {companyMap ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <CompanyMindMap data={companyMap} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No mind map data found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorMap == null ? (
                    <div className="hidden sm:block animate-pulse">
                      <div className="h-64 bg-secondary-darkest rounded-lg flex items-center justify-center">
                        <p className="text-gray-400 text-md">Loading...</p>
                      </div>
                    </div>
                  ) : competitorMap ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <CompanyMindMap data={competitorMap} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No mind map data found</div>
                  )}
                </div>
              </div>
            )}

            {/* Founders Section */}
            {(founders || competitorFounders) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Founders</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {founders && founders.length > 0 ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <FoundersDisplay founders={founders} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No founders data found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorFounders == null ? (
                    <FoundersSkeleton />
                  ) : competitorFounders && competitorFounders.length > 0 ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <FoundersDisplay founders={competitorFounders} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No founders data found</div>
                  )}
                </div>
              </div>
            )}

            {/* Funding Section */}
            {(fundingData && !fundingData.summary.startsWith("NO") || competitorFundingData && !competitorFundingData.summary.startsWith("NO")) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Funding</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {fundingData && !fundingData.summary.startsWith("NO") ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <FundingDisplay fundingData={fundingData} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No funding data found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorFundingData == null ? (
                    <FundingSkeleton />
                  ) : competitorFundingData && !competitorFundingData.summary.startsWith("NO") ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <FundingDisplay fundingData={competitorFundingData} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No funding data found</div>
                  )}
                </div>
              </div>
            )}

            {/* Financial Reports Section */}
            {(financialReport && financialReport.length > 0 || competitorFinancialReport && competitorFinancialReport.length > 0) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Financial Reports</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {financialReport && financialReport.length > 0 ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <FinancialReportDisplay report={financialReport} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No financial report data found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorFinancialReport == null ? (
                    <FinancialSkeleton />
                  ) : competitorFinancialReport && competitorFinancialReport.length > 0 ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <FinancialReportDisplay report={competitorFinancialReport} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No financial report data found</div>
                  )}
                </div>
              </div>
            )}

            {/* Crunchbase Section */}
            {(crunchbaseData || competitorCrunchbaseData) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Crunchbase</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {crunchbaseData ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <CrunchbaseDisplay data={crunchbaseData} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No Crunchbase data found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorCrunchbaseData == null ? (
                    <FundingSkeleton />
                  ) : competitorCrunchbaseData ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <CrunchbaseDisplay data={competitorCrunchbaseData} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No Crunchbase data found</div>
                  )}
                </div>
              </div>
            )}

            {/* PitchBook Section */}
            {(pitchbookData || competitorPitchbookData) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">PitchBook</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {pitchbookData ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <PitchBookDisplay data={pitchbookData} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No PitchBook data found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorPitchbookData == null ? (
                    <FundingSkeleton />
                  ) : competitorPitchbookData ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <PitchBookDisplay data={competitorPitchbookData} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No PitchBook data found</div>
                  )}
                </div>
              </div>
            )}

            {/* Tracxn Section */}
            {(tracxnData || competitorTracxnData) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Tracxn</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {tracxnData ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <TracxnDisplay data={tracxnData} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No Tracxn data found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorTracxnData == null ? (
                    <FundingSkeleton />
                  ) : competitorTracxnData ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <TracxnDisplay data={competitorTracxnData} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No Tracxn data found</div>
                  )}
                </div>
              </div>
            )}

            {/* News Section */}
            {((news && news.length > 0) || (competitorNews && competitorNews.length > 0)) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Latest News</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {news && news.length > 0 ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <NewsDisplay news={news} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No news found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorNews == null ? (
                    <NewsSkeleton />
                  ) : competitorNews && competitorNews.length > 0 ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                        <NewsDisplay news={competitorNews} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No news found</div>
                  )}
                </div>
              </div>
            )}

            {/* Social Presence Section */}
            {((twitterProfileText || (youtubeVideos && youtubeVideos.length > 0) || (redditPosts && redditPosts.length > 0) || tiktokData) || 
              (competitorTwitterProfileText || (competitorYoutubeVideos && competitorYoutubeVideos.length > 0) || 
               (competitorRedditPosts && competitorRedditPosts.length > 0) || competitorTiktokData)) && (
              <div>
                <div className="flex justify-center mb-6">
                  <h2 className="text-3xl font-medium border-b-2 border-brand-default pb-2">Social Presence</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Your Company */}
                  {(twitterProfileText || (youtubeVideos && youtubeVideos.length > 0) || (redditPosts && redditPosts.length > 0) || tiktokData) ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(companyUrl)}</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          Your company
                        </span>
                      </div>
                      <div className="space-y-8">
                        {twitterProfileText && (
                          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                            <ProfileDisplay rawText={twitterProfileText.text} username={twitterProfileText.username} />
                            {recentTweets && <RecentTweetsDisplay tweets={recentTweets} />}
                          </div>
                        )}
                        
                        {youtubeVideos && youtubeVideos.length > 0 && (
                          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                            <YoutubeVideosDisplay videos={youtubeVideos} />
                          </div>
                        )}

                        {redditPosts && redditPosts.length > 0 && (
                          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                            <RedditDisplay posts={redditPosts} />
                          </div>
                        )}

                        {tiktokData && (
                          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                            <TikTokDisplay data={tiktokData} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No social media presence found</div>
                  )}
                  
                  {/* Competitor */}
                  {isCompetitorLoading && competitorTwitterProfileText == null ? (
                    <div className="space-y-8">
                      <TwitterSkeleton />
                      <YouTubeSkeleton />
                      <RedditSkeleton />
                      <TikTokSkeleton />
                    </div>
                  ) : (competitorTwitterProfileText || (competitorYoutubeVideos && competitorYoutubeVideos.length > 0) || 
                      (competitorRedditPosts && competitorRedditPosts.length > 0) || competitorTiktokData) ? (
                    <div className="border border-gray-200 bg-white p-4 rounded-lg">
                      <div className="mb-2 flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-800">{extractDomain(selectedCompetitorUrl)}</span>
                        <span className="ml-2 text-xs bg-brand-default/10 text-brand-default px-2 py-1 rounded-full">
                          Competitor
                        </span>
                      </div>
                      <div className="space-y-8">
                        {competitorTwitterProfileText && (
                          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                            <ProfileDisplay 
                              rawText={competitorTwitterProfileText.text} 
                              username={competitorTwitterProfileText.username} 
                            />
                            {competitorRecentTweets && 
                              <RecentTweetsDisplay tweets={competitorRecentTweets} />
                            }
                          </div>
                        )}
                        
                        {competitorYoutubeVideos && competitorYoutubeVideos.length > 0 && (
                          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                            <YoutubeVideosDisplay videos={competitorYoutubeVideos} />
                          </div>
                        )}

                        {competitorRedditPosts && competitorRedditPosts.length > 0 && (
                          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                            <RedditDisplay posts={competitorRedditPosts} />
                          </div>
                        )}

                        {competitorTiktokData && (
                          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                            <TikTokDisplay data={competitorTiktokData} />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">No social media presence found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>  
  );
}