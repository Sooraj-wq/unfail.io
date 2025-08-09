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

      Example Response Format:
      {
        "solution": "Feeling like a failed engineer is common because the field is incredibly demanding. However, your analytical skills are highly transferable. Consider roles in technical writing, where you document complex systems, or product management, where your engineering background helps you guide development teams effectively.",
        "keyword": "technology",
        "motivationalQuote": "Don't worry, they call it 'rapid unscheduled disassembly,' not 'failure.' It sounds much more professional.",
        "relatedPersonality": {
          "name": "James Dyson",
          "story": "Before creating his revolutionary vacuum cleaner, James Dyson went through 5,126 failed prototypes. He saw each 'failure' not as a setback, but as a learning step that brought him closer to the final, successful design."
        }
      }
    `;

    // 3. Call the Gemini API
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // 4. Parse the structured JSON response from Gemini
    let geminiData;
    try {
      // The model sometimes wraps the JSON in markdown backticks, so we clean it.
      const cleanedText = responseText.replace(/^```json\n|```$/g, '').trim();
      geminiData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON response:", responseText);
      // If parsing fails, return an error
      throw new Error("The AI failed to provide a structured response. Please try again.");
    }

    const { keyword } = geminiData;

    let articles = [];
    if (keyword) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 28); 
      const formattedDate = fromDate.toISOString().split('T')[0]; // YYYY-MM-DD

      const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&from=${formattedDate}&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;
      
      try {
        const newsResponse = await fetch(newsApiUrl);
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          articles = newsData.articles || [];
        }
      } catch (newsError) {
        console.error("News API fetch failed:", newsError);
        articles = [];
      }
    }

    const finalResponse = { ...geminiData, articles };
    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
