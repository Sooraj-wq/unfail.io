// File: app/api/get-solution/route.js

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google AI client with your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

export async function POST(req) {
  try {
    // 1. Get user input from the request body
    const { userInput } = await req.json();

    if (!userInput) {
      return NextResponse.json({ error: 'User input is required' }, { status: 400 });
    }

    // 2. Craft the detailed prompt for the Gemini API
    const prompt = `
      You are an empathetic but witty life coach for a web app named "unfail.io".
      A user is feeling like a failure. Your task is to provide a multi-faceted, encouraging response.
      The user's situation is: "${userInput}"

      Please provide your complete response in a single, valid JSON object. The object MUST contain the following keys: "solution", "keyword", "motivationalQuote", and "relatedPersonality".

      - "solution": (string) A constructive, actionable, and encouraging alternative path or solution for the user.
      - "keyword": (string) The single most relevant keyword from your solution (e.g., "programming", "marketing", "entrepreneurship"). This will be used to fetch news.
      - "motivationalQuote": (string) A sarcastically motivational or witty quote related to the user's situation.
      - "relatedPersonality": (JSON object) An object with "name" and "story".
          - "name": (string) The name of a real, famous person who faced a similar type of struggle.
          - "story": (string) A brief, inspiring 2-3 sentence story of how they overcame that specific failure to achieve greatness.
    `;

    // 3. Call the Gemini API
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 4. Parse the structured JSON response from Gemini
    let geminiData;
    try {
      const cleanedText = responseText.replace(/^```json\n|```$/g, '').trim();
      geminiData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON response:", responseText);
      throw new Error("The AI failed to provide a structured response. Please try again.");
    }

    const { keyword } = geminiData;
    let articles = [];
    let youtubeVideos = [];

    if (keyword) {
      // 5. Call the News API with the extracted keyword
      try {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 28);
        const formattedDate = fromDate.toISOString().split('T')[0];
        const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&from=${formattedDate}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;
        const newsResponse = await fetch(newsApiUrl);
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          articles = newsData.articles || [];
        }
      } catch (newsError) {
        console.error("News API fetch failed:", newsError);
        articles = [];
      }

      // 6. NEW: Call the YouTube API with the same keyword
      try {
        const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=3&relevanceLanguage=en&key=${process.env.YOUTUBE_API_KEY}`;
        const youtubeResponse = await fetch(youtubeApiUrl);
        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          // Map the response to a cleaner format
          youtubeVideos = youtubeData.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url,
          }));
        }
      } catch (youtubeError) {
        console.error("YouTube API fetch failed:", youtubeError);
        youtubeVideos = [];
      }
    }

    // 7. Combine all data and send the final response
    const finalResponse = { ...geminiData, articles, youtubeVideos };
    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
