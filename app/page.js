// File: app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { User, Newspaper, Lightbulb, Youtube } from 'lucide-react';

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

export default function HomePage() {
  const [isInitialState, setIsInitialState] = useState(true);
  const [randomQuote, setRandomQuote] = useState('');

  const [userInput, setUserInput] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRandomQuote(initialSarcasticQuotes[Math.floor(Math.random() * initialSarcasticQuotes.length)]);
  }, []);

  const handleInputChange = (e) => {
    if (isInitialState) {
      setIsInitialState(false);
    }
    setUserInput(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userInput) return;

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

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6 bg-gray-50 text-gray-800">
      <header className="w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-black via-purple-500 to-black text-transparent bg-clip-text">
            Unfail.io
        </h1>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center w-full max-w-3xl mx-auto overflow-y-auto pt-4">
        {isInitialState && (
            <div className="text-center text-gray-500 animate-fade-in">
                {randomQuote}
            </div>
        )}

        {!isInitialState && (
            <div className="w-full space-y-8 animate-fade-in">
                {isLoading && <div className="text-center text-gray-600">Thinking of something half-decent for you...</div>}
                {error && <div className="text-center text-red-600">{error}</div>}
                {apiResponse && (
                    <>
                        <p className="text-center text-lg text-gray-600 italic">"{apiResponse.motivationalQuote}"</p>
                        
                        <div className="flex flex-col space-y-6">
                            {/* Card 1: The Solution */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-yellow-500"/> Your Suggested Path</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{apiResponse.solution}</p>
                            </div>

                            {/* Card 2: News */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 flex items-center"><Newspaper className="w-5 h-5 mr-2 text-cyan-500"/> Latest Opportunities</h3>
                                <ul className="space-y-3">
                                  {apiResponse.articles && apiResponse.articles.length > 0 ? (
                                    apiResponse.articles.map((article, i) => (
                                      <li key={i}>
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                                          {article.title}
                                        </a>
                                        <p className="text-sm text-gray-500">{new URL(article.url).hostname}</p>
                                      </li>
                                    ))
                                  ) : (
                                    <p className="text-gray-500">No recent news found for this topic.</p>
                                  )}
                                </ul>
                            </div>
                            
                            {/* NEW Card 3: YouTube Videos */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 flex items-center"><Youtube className="w-5 h-5 mr-2 text-red-600"/> Video Guides</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {apiResponse.youtubeVideos && apiResponse.youtubeVideos.length > 0 ? (
                                    apiResponse.youtubeVideos.map((video) => (
                                      <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="group">
                                        <img src={video.thumbnail} alt={video.title} className="rounded-lg w-full mb-2 group-hover:opacity-80 transition-opacity" />
                                        <p className="text-sm font-medium text-gray-700 group-hover:text-purple-600 line-clamp-2">{video.title}</p>
                                      </a>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 sm:col-span-3">No relevant videos found.</p>
                                  )}
                                </div>
                            </div>

                            {/* Card 4: Related Personality */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 flex items-center"><User className="w-5 h-5 mr-2 text-green-500"/> You're in Good Company</h3>
                                <h4 className="font-semibold text-lg">{apiResponse.relatedPersonality?.name}</h4>
                                <p className="text-gray-500 mt-2">{apiResponse.relatedPersonality?.story}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}
      </main>

      <footer className={`w-full max-w-3xl mx-auto flex flex-col pt-4 pb-2 transition-all duration-700 ease-in-out ${isInitialState ? 'justify-center flex-grow' : 'justify-end flex-shrink-0'}`}>
        <form onSubmit={handleSubmit} className="w-full relative">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Tell me what went sideways..."
            className="w-full bg-white border border-gray-300 rounded-full py-3 px-6 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </form>
         <p className="text-xs text-center text-gray-500 mt-2">By Unfail.io. Results may vary. Or they may not.</p>
      </footer>
    </div>
  );
}
