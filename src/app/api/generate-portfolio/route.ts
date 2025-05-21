import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai'; // OpenAI import removed
import pdf from 'pdf-parse';
import { Buffer } from 'buffer';

// Placeholder for Google Generative AI import - you'll need to install the SDK
// Example: import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize OpenAI client - REMOVED
// IMPORTANT: Set your OpenAI API key in an environment variable named OPENAI_API_KEY
// Create a .env.local file in the root of your project and add:
// OPENAI_API_KEY=your_actual_api_key

// const openai = new OpenAI({ // OpenAI client removed
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Initialize Google Generative AI Client
// IMPORTANT: Set your Google API key in an environment variable (e.g., GEMINI_API_KEY)
// Create a .env.local file in the root of your project and add:
// GEMINI_API_KEY=your_actual_google_api_key

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || ""); // Placeholder
// const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Placeholder for "2.5 flash" - use correct model name

async function extractTextFromPdf(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    const buffer = Buffer.from(fileBuffer);
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF.');
  }
}

export async function POST(request: NextRequest) {
  // Check for Google API Key
  if (!process.env.GEMINI_API_KEY) { // Updated to check for GEMINI_API_KEY
    return NextResponse.json({ error: 'Google API key not configured. Please set GEMINI_API_KEY environment variable.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const customInstructions = formData.get('customInstructions') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file type. Only PDF is allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: 'File is too large. Maximum size is 10MB.' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const resumeText = await extractTextFromPdf(fileBuffer);

    if (!resumeText.trim()) {
        return NextResponse.json({ error: 'Could not extract text from the PDF. The PDF might be empty or image-based.' }, { status: 400 });
    }

    let prompt = `
      You are an expert web developer specializing in creating modern, single-page portfolio websites.
      A user has uploaded their resume text. Your task is to generate the complete HTML, CSS, and JavaScript code 
      for a visually appealing and responsive static portfolio website based on this resume.

      Resume Text:
      """
      ${resumeText}
      """
    `;

    if (customInstructions) {
      prompt += `
      Custom Instructions from User:
      """
      ${customInstructions}
      """
      `;
    }

    prompt += `
      Requirements:
      1.  HTML: Create a semantic HTML structure. Include sections for:
          *   Header (Name, Title)
          *   Contact Information (Email, Phone, LinkedIn, GitHub - if available in resume)
          *   Summary/About Me
          *   Experience (Job title, Company, Period, Description for each role)
          *   Education (Degree, Institution, Period for each)
          *   Skills (List of skills)
          *   Projects (if any indication in resume, otherwise omit or add a placeholder)
      2.  CSS: Provide a modern tailwindCSS look. Make the website modern with rounded corners and modern typography such as Lato/sans-serif fonts. Implement subtle animations for transitions
          and interactions, and ensure responsive design for mobile and desktop devices.
      3.  JavaScript: Add any subtle JavaScript for interactivity if you think it enhances the portfolio (e.g., smooth scrolling, simple animations). 
          If no JS is needed, provide an empty string or a simple console log. All JS should be self-contained in <script> tags or returned as a separate JS string.

      Output Format:
      Return the generated code as a JSON object with three keys: "html", "css", and "js".
      The "html" key should contain the full HTML document string.
      The "css" key should contain the CSS code string.
      The "js" key should contain the JavaScript code string.

      Example of expected JSON output structure:
      {
        "html": "<!DOCTYPE html>...</html>",
        "css": "body { ... }",
        "js": "console.log(\'loaded\');"
      }

      Ensure the generated HTML can use the CSS and JS directly if they are placed in files named style.css and script.js respectively, or if the CSS is in a <style> tag and JS in a <script> tag within the HTML.
      Focus on creating a high-quality, modern, and professional-looking portfolio. Make reasonable assumptions if some details are not explicitly in the resume text but are common for portfolios (e.g., placeholder text for missing sections).
      Do not include any explanations or conversational text outside the JSON object.
      The HTML should be a complete document including <!DOCTYPE html>, <html>, <head> (with a <title>), a link to the generated style.css file and <body>.
      The CSS should be complete and ready to use.
      The JS should be complete and ready to use.
    `;

    // --- OpenAI API Call (Commented out) ---
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4o", 
    //   messages: [
    //     { role: "system", content: "You are an AI assistant that generates portfolio website code." },
    //     { role: "user", content: prompt }
    //   ],
    //   // response_format: { type: "json_object" }, 
    // });
    // let generatedCodeString = completion.choices[0]?.message?.content;

    // --- Placeholder for Google Gemini API Call ---
    // You'll need to adapt this based on the Google Generative AI SDK
    // For example:
    const genAI = new (require('@google/generative-ai').GoogleGenerativeAI)(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-05-20", // Ensure this is the correct model name for "2.5 flash"
      // generationConfig: { responseMimeType: "application/json" } // If supported, to enforce JSON output
    });
    
    // Optional: Configure safety settings if needed
    // const safetySettings = [
    //   { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    //   { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    //   { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    //   { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    // ];

    const result = await model.generateContent(prompt /*, { safetySettings } */); // Pass safetySettings if configured
    const response = await result.response;
    let generatedCodeString = response.text();
    // --- End of Placeholder for Google Gemini API Call ---

    if (!generatedCodeString) {
      throw new Error('Gemini API did not return content.');
    }

    // Attempt to parse the string as JSON
    // The model might sometimes return plain text with JSON inside, or just the JSON string.
    // Robust parsing might be needed here.
    let generatedCode;
    try {
        // Find the start and end of THE JSON block if it's embedded
        const jsonStart = generatedCodeString.indexOf('{');
        const jsonEnd = generatedCodeString.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            generatedCodeString = generatedCodeString.substring(jsonStart, jsonEnd + 1);
        }
        generatedCode = JSON.parse(generatedCodeString);
    } catch (parseError) {
        console.error("Failed to parse LLM response as JSON:", parseError);
        console.error("LLM Response String:", generatedCodeString);
        throw new Error('Failed to parse the generated code from AI. The AI might not have returned valid JSON as instructed.');
    }

    if (typeof generatedCode.html !== 'string' || 
        typeof generatedCode.css !== 'string' || 
        typeof generatedCode.js !== 'string' || 
        !generatedCode.html) { // Check if html is non-empty and all keys are strings
        console.error("Generated JSON is missing html, css, or js keys, or html is empty. Received:", generatedCode);
        throw new Error('AI response is missing expected html, css, or js keys, or html is empty.');
    }

    return NextResponse.json(generatedCode);

  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred processing your resume.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
