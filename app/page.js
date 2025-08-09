// File: app/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { User, Music, Newspaper, Lightbulb } from 'lucide-react';

const initialSarcasticQuotes = [
  "The first step to failure is trying.",
  "It could be worse. You could also be on fire.",
  "Embrace the glorious mess that you are. And we do mean mess.",
  "If at first you don't succeed, maybe skydiving isn't for you.",
  "The difference between genius and stupidity is that genius has its limits."
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
    <div className="flex flex-col min-h-screen p-4 md:p-6">
      <header className="w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-black via-purple-500 to-black text-transparent bg-clip-text">
            Unfail.io
        </h1>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center w-full max-w-5xl mx-auto overflow-y-auto pt-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 1: The Solution */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-yellow-500"/> Your Suggested Path</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{apiResponse.solution}</p>
                            </div>
                            {/* Card 2: Related Personality */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 flex items-center"><User className="w-5 h-5 mr-2 text-green-500"/> You're in Good Company</h3>
                                <h4 className="font-semibold text-lg">{apiResponse.relatedPersonality?.name}</h4>
                                <p className="text-gray-500 mt-2">{apiResponse.relatedPersonality?.story}</p>
                            </div>
                            {/* Card 3: Soundtrack */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 flex items-center"><Music className="w-5 h-5 mr-2 text-pink-500"/> Your Bounce-Back Soundtrack</h3>
                                <ul className="space-y-2">
                                    {apiResponse.songSuggestions?.map((song, i) => <li key={i}>{song.title} - <span className="text-gray-500">{song.artist}</span></li>)}
                                </ul>
                            </div>
                            {/* Card 4: News */}
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-lg mb-3 flex items-center"><Newspaper className="w-5 h-5 mr-2 text-cyan-500"/> Latest Opportunities</h3>
                                <ul className="space-y-2">
                                    {apiResponse.articles?.map((article, i) => <li key={i}><a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">{article.title}</a></li>)}
                                </ul>
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