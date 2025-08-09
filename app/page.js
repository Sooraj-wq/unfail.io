// File: app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { User, Newspaper, Lightbulb, Youtube, Search } from 'lucide-react';

const initialSarcasticQuotes = [
  "The first step to failure is trying.",
  "It could be worse. You could also be on fire.",
  "Embrace the glorious mess that you are. And we do mean mess.",
  "If at first you don't succeed, maybe skydiving isn't for you.",
  "The difference between genius and stupidity is that genius has its limits.",
  "The light at the end of the tunnel has been turned off due to budget cuts.",
  "If you think nobody cares if you’re alive, try missing a couple of payments.",
  "Don't give up on your dreams. Keep sleeping.",
  "An expert is a person who has made all the mistakes which can be made in a very narrow field.",
  "If at first you don't succeed, destroy all evidence that you tried.",
  "The road to success is dotted with many tempting parking spaces.",
  "I'm not saying it was your fault, I'm just saying I'm blaming you."
];

// A small component for the background doodles
// A playful + HUD-like doodle background
const DoodleBackground = () => (
  <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
    {/* Existing doodles */}
    <svg className="absolute top-20 left-10 sm:left-40 w-48 h-24 text-gray-200 opacity-50" viewBox="0 0 120 70">
      <path d="M 50 100 C 20 100, 20 70, 50 70 C 50 50, 80 50, 80 70 C 110 70, 110 100, 80 100 Z" fill="none" stroke="currentColor" strokeWidth="2" transform="scale(1, 0.6)" />
    </svg>

    {/* HUD-style circles */}
    <svg className="absolute top-10 right-16 w-32 h-32 text-purple-200 opacity-30" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
    </svg>

    {/* Radar sweep arc */}
    <svg className="absolute bottom-10 left-8 w-48 h-48 text-green-300 opacity-20" viewBox="0 0 200 200">
      <path d="M100 100 L180 100 A80 80 0 0 0 100 20 Z" fill="currentColor" />
    </svg>

    {/* Grid lines */}
    <svg className="absolute bottom-0 right-0 w-64 h-64 text-gray-300 opacity-10" viewBox="0 0 100 100">
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="currentColor" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="currentColor" strokeWidth="0.5" />
      ))}
    </svg>

    {/* Fake debug text */}
    <div className="absolute top-5 left-1/2 text-[10px] font-mono text-gray-400 opacity-40 tracking-wider">
      SYS_LOG: 42% optimism buffer... recalculating.
    </div>
    <div className="absolute bottom-5 left-5 text-[10px] font-mono text-gray-400 opacity-40 tracking-wider">
      STATUS: UNFAIL PROTOCOL ACTIVE
    </div>
  </div>
);



export default function HomePage() {
  const [isInitialState, setIsInitialState] = useState(true);
  const [randomQuote, setRandomQuote] = useState('');
  const [startAnimation, setStartAnimation] = useState(false); // State to control animation timing

  const [userInput, setUserInput] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRandomQuote(initialSarcasticQuotes[Math.floor(Math.random() * initialSarcasticQuotes.length)]);
    
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 100); 

    return () => clearTimeout(timer); 
  }, []);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userInput) return;

    if (isInitialState) {
      setIsInitialState(false);
    }

    setIsLoading(true);
    setError(null);
    setApiResponse(null);

    try {
      const response = await fetch('/api/get-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sketchyBorderStyle = {
    border: '2px solid #1f2937',
    borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px',
    boxShadow: 'rgba(0, 0, 0, 0.1) 4px 4px 0 0',
  };

  return (
    <div className="relative flex flex-col min-h-screen p-4 md:p-6 bg-[#FDFCF8] text-gray-800 overflow-hidden">
      <DoodleBackground />
      <header className="w-full max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800">
            Unfail.io
        </h1>
      </header>

      <main className={`flex-grow flex flex-col w-full max-w-3xl mx-auto overflow-y-auto pt-4 transition-all duration-700 ease-in-out ${isInitialState ? 'justify-center' : 'justify-start'}`}>
{isInitialState && (
  <div className={`text-center space-y-8 ${startAnimation ? 'animate-fade-in-up' : 'opacity-0'}`}>
    <p className="text-gray-600 text-3xl italic animate-fade-in-up">
      "{randomQuote}"
    </p>
    <form
      onSubmit={handleSubmit}
      className="w-full relative mt-4 animate-slide-down"
    >
      <input
        type="text"
        value={userInput}
        onChange={handleInputChange}
        placeholder="Tell me what went sideways..."
        className="w-full bg-white rounded-full py-4 pl-6 pr-14 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-700 ease-in-out"
        style={{ ...sketchyBorderStyle, border: '3px solid #1f2937' }}
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-purple-600 rounded-full transition-colors"
      >
        <Search className="w-6 h-6" />
      </button>
    </form>
  </div>
)}



        {!isInitialState && (
            <div className="w-full space-y-8 animate-fade-in">
                {isLoading && <div className="text-center text-gray-600 text-xl">Doodling up some ideas...</div>}
                {error && <div className="text-center text-red-600">{error}</div>}
                {apiResponse && (
                    <>
                        <p className="text-center text-xl text-gray-700">"{apiResponse.motivationalQuote}"</p>
                        
                        <div className="flex flex-col space-y-8">
                            <div className="p-6 rounded-lg" style={{...sketchyBorderStyle, backgroundColor: '#E0F2FE'}}>
                                <h3 className="font-bold text-2xl mb-3 flex items-center"><Lightbulb className="w-6 h-6 mr-2"/> Your Suggested Path</h3>
                                <p className="text-gray-700 text-lg whitespace-pre-wrap">{apiResponse.solution}</p>
                            </div>

                            <div className="p-6 rounded-lg" style={{...sketchyBorderStyle, backgroundColor: '#FEE2E2'}}>
                                <h3 className="font-bold text-2xl mb-3 flex items-center"><Newspaper className="w-6 h-6 mr-2"/> Latest Opportunities</h3>
                                <ul className="space-y-3">
                                  {apiResponse.articles && apiResponse.articles.length > 0 ? (
                                    apiResponse.articles.map((article, i) => (
                                      <li key={i}>
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-bold text-lg text-gray-800 hover:text-red-700">
                                          {article.title}
                                        </a>
                                      </li>
                                    ))
                                  ) : (
                                    <p className="text-gray-600">No recent news found for this topic.</p>
                                  )}
                                </ul>
                            </div>
                            
                            <div className="p-6 rounded-lg" style={{...sketchyBorderStyle, backgroundColor: '#D1FAE5'}}>
                                <h3 className="font-bold text-2xl mb-3 flex items-center"><Youtube className="w-6 h-6 mr-2"/> Video Guides</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {apiResponse.youtubeVideos && apiResponse.youtubeVideos.length > 0 ? (
                                    apiResponse.youtubeVideos.map((video) => (
                                      <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="group">
                                        <img src={video.thumbnail} alt={video.title} className="w-full mb-2" style={{...sketchyBorderStyle, border: '2px solid #064E3B'}}/>
                                        <p className="text-md font-bold text-gray-800 group-hover:text-green-800 line-clamp-2">{video.title}</p>
                                      </a>
                                    ))
                                  ) : (
                                    <p className="text-gray-600 sm:col-span-3">No relevant videos found.</p>
                                  )}
                                </div>
                            </div>

                            <div className="p-6 rounded-lg" style={{...sketchyBorderStyle, backgroundColor: '#FEF3C7'}}>
                                <h3 className="font-bold text-2xl mb-3 flex items-center"><User className="w-6 h-6 mr-2"/> You're in Good Company</h3>
                                <h4 className="font-bold text-2xl text-gray-800">{apiResponse.relatedPersonality?.name}</h4>
                                <p className="text-gray-700 mt-2 text-lg">{apiResponse.relatedPersonality?.story}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}
      </main>

      {!isInitialState && (
        <footer className="w-full max-w-3xl mx-auto flex flex-col pt-4 pb-2 animate-fade-in">
          <form onSubmit={handleSubmit} className="w-full relative">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Tell me what went sideways..."
              className="w-full bg-white rounded-full py-4 pl-6 pr-14 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              style={{...sketchyBorderStyle, border: '3px solid #1f2937'}}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-purple-600 rounded-full transition-colors">
              <Search className="w-6 h-6" />
            </button>
          </form>
           <p className="text-sm text-center text-gray-500 mt-3">By Unfail.io. Results may vary. Or they may not.</p>
        </footer>
      )}
    </div>
  );
}
