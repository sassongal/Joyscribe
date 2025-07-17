
import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import { Analysis, AnalysisPersona, Sentiment } from '../types';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

// Load environment variables from .env.local in the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const port = 3001;

if (!process.env.API_KEY) {
    console.error("FATAL ERROR: API_KEY environment variable is not set.");
    throw new Error("FATAL ERROR: API_KEY environment variable is not set.");
}
if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.error("FATAL ERROR: RECAPTCHA_SECRET_KEY environment variable is not set.");
    throw new Error("FATAL ERROR: RECAPTCHA_SECRET_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.use(cors());
// Increased limit to handle larger transcripts in JSON body
app.use(express.json({ limit: '10mb' }) as RequestHandler);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

// --- Helper Functions (moved from frontend) ---

const getSystemInstruction = (persona: AnalysisPersona, customEntitiesList: string): string => {
    let baseInstruction = `You are an expert analyst for "Joycribe", specializing in processing Hebrew call transcripts. Your task is to provide a comprehensive analysis based on the user's selected persona. Respond ONLY with a valid JSON object that adheres to the provided schema. The entire response must be in JSON format.

First, perform speaker diarization on the transcript. Rewrite the entire transcript, prefixing each line or segment with a speaker label like 'דובר 1:', 'דובר 2:', or, if identifiable, a role like 'נציג:', 'לקוח:'. The result should be in the 'diarizedTranscript' field.

Then, based on the original transcript, perform the full analysis as requested by the persona. The analysis should be insightful and detailed.`;

    const personaInstructions = {
        [AnalysisPersona.Sales]: `As a world-class Sales Coach, trained in methodologies like SPIN Selling and The Challenger Sale, your task is to evaluate the provided sales call transcript. Do not just summarize; provide a prescriptive analysis to help the salesperson improve.
        1.  **Overall Rating:** Give an honest performance rating from 1 (poor) to 10 (excellent).
        2.  **Justification:** Briefly explain your rating.
        3.  **Strengths:** Identify 2-3 things the salesperson did well (e.g., building rapport, effective questioning).
        4.  **Areas for Improvement:** Provide 2-3 specific, actionable pieces of advice for improvement.
        5.  **Talk-to-Listen Ratio:** Estimate the ratio (e.g., "60/40", "70/30").
        6.  **Objection Handling:** Analyze how objections were handled. For each key objection, state the objection and suggest a better response.
        Your analysis must be sharp, insightful, and designed to foster real improvement. Populate the 'salesCoachingInsights' object.`,
        [AnalysisPersona.Support]: "As a Technical Support Supervisor, you need to diagnose the call for quality and efficiency. Identify the core problem, the steps taken to solve it, any specific technical terms or error codes mentioned, and whether escalation was needed. Populate the 'supportInsights' object. Your summary should be a concise debrief for management.",
        [AnalysisPersona.CustomerService]: "As a Customer Service Quality Manager, evaluate the interaction's quality. Focus on the customer's query, the agent's tone and effectiveness, problem resolution, and any required follow-up actions. The summary should assess the overall service experience.",
        [AnalysisPersona.Personal]: "Analyze this personal conversation. Identify the relationship between speakers if possible, the main themes, the overall mood, and any decisions made. The summary should be informal and capture the essence of the chat.",
        [AnalysisPersona.General]: "Provide a balanced, general-purpose analysis of the conversation. Summarize the key points, identify the main topics and speakers' intents, and provide a neutral overview of the interaction."
    }

    baseInstruction += `\n\n**Persona: ${persona}**\n${personaInstructions[persona]}`;

    if (customEntitiesList) {
        baseInstruction += `\n\nIn addition, specifically identify and extract occurrences of the following custom entities: ${customEntitiesList}. List each entity and any text from the transcript that matches it. If no occurrences of an entity are found, return an empty array for its occurrences.`
    }

    baseInstruction += "\n\nFinally, based on the entire analysis, provide a list of 3-5 'suggestedTags' that accurately categorize this call."

    return baseInstruction;
};

const getResponseSchema = (persona: AnalysisPersona) => {
    const salesCoachingSchema = {
        type: Type.OBJECT,
        description: "Detailed coaching insights for a sales call.",
        properties: {
            overallRating: { type: Type.INTEGER, description: "Overall performance rating from 1 to 10." },
            ratingJustification: { type: Type.STRING, description: "A brief justification for the rating." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific things the salesperson did well." },
            improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable advice for improvement." },
            talkToListenRatio: { type: Type.STRING, description: "Estimated talk-to-listen ratio, e.g., '60/40'." },
            objectionHandling: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        objection: { type: Type.STRING, description: "The objection raised by the customer." },
                        suggestedResponse: { type: Type.STRING, description: "A better way to handle the objection." }
                    },
                    required: ["objection", "suggestedResponse"]
                },
                description: "Analysis of how objections were handled."
            },
        },
        required: ['overallRating', 'ratingJustification', 'strengths', 'improvementAreas', 'talkToListenRatio', 'objectionHandling']
    };

    const supportInsightsSchema = {
        type: Type.OBJECT,
        description: "Detailed insights for a technical support call.",
        properties: {
            problemDescription: { type: Type.STRING, description: "A clear description of the technical issue reported by the customer." },
            solutionSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The troubleshooting or solution steps taken." },
            technicalTerms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific technical terms, model numbers, or error codes mentioned." },
            escalationNeeded: { type: Type.STRING, description: "Was escalation required? ('Yes', 'No', or 'Maybe')." },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable next steps for the support agent or customer." },
        },
        required: ['problemDescription', 'solutionSteps', 'technicalTerms', 'escalationNeeded', 'nextSteps']
    };

    const baseSchema: any = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: 'A concise summary of the call in Hebrew, tailored to the persona.' },
            diarizedTranscript: { type: Type.STRING, description: 'The full transcript with speaker labels (e.g., "Speaker 1:").' },
            sentiment: { type: Type.STRING, description: 'The overall sentiment.', enum: Object.values(Sentiment) },
            keywords: { type: Type.ARRAY, description: '5-7 important keywords in Hebrew.', items: { type: Type.STRING } },
            topics: { type: Type.ARRAY, description: '3-5 main topics in Hebrew.', items: { type: Type.STRING } },
            customEntities: {
                type: Type.ARRAY,
                description: 'Custom entities found based on user input.',
                items: {
                    type: Type.OBJECT,
                    properties: {
                        entity: { type: Type.STRING },
                        occurrences: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['entity', 'occurrences'],
                }
            },
            suggestedTags: { type: Type.ARRAY, description: 'A list of 3-5 suggested tags for categorization.', items: { type: Type.STRING } },
        },
        required: ['summary', 'diarizedTranscript', 'sentiment', 'keywords', 'topics', 'customEntities', 'suggestedTags'],
    };

    if (persona === AnalysisPersona.Sales) {
        baseSchema.properties['salesCoachingInsights'] = salesCoachingSchema;
        baseSchema.required.push('salesCoachingInsights');
    } else if (persona === AnalysisPersona.Support) {
        baseSchema.properties['supportInsights'] = supportInsightsSchema;
        baseSchema.required.push('supportInsights');
    }

    return baseSchema;
}

// --- API Endpoints ---

app.post('/api/transcribe', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const file = req.file;
        const base64Audio = file.buffer.toString('base64');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: file.mimetype,
                            data: base64Audio,
                        },
                    },
                    {
                        text: 'Please transcribe this audio file. The primary language spoken is Hebrew.'
                    }
                ],
            },
        });

        return res.status(200).json({ transcript: response.text });

    } catch (error) {
        console.error('Error transcribing media with Gemini API:', error);
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        return res.status(500).json({ error: `Failed to transcribe audio: ${message}` });
    }
});

app.post('/api/analyze', async (req: Request, res: Response) => {
    const { transcript, persona, customEntitiesList, recaptchaToken } = req.body;

    // 1. Verify reCAPTCHA token
    if (!recaptchaToken) {
        return res.status(400).json({ error: 'reCAPTCHA token is missing.' });
    }
    try {
        const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
        const params = new URLSearchParams();
        params.append('secret', process.env.RECAPTCHA_SECRET_KEY!);
        params.append('response', recaptchaToken);

        const recaptchaResponse = await axios.post(verificationUrl, params);
        
        if (!recaptchaResponse.data.success) {
            console.warn('reCAPTCHA verification failed:', recaptchaResponse.data['error-codes']);
            return res.status(400).json({ error: 'reCAPTCHA verification failed. Please try again.' });
        }
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return res.status(500).json({ error: 'Server error during reCAPTCHA verification.' });
    }

    // 2. Proceed with analysis logic
    if (!transcript || !persona) {
        return res.status(400).json({ error: 'Missing transcript or persona' });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [{ text: transcript }]
            },
            config: {
                systemInstruction: getSystemInstruction(persona, customEntitiesList),
                responseMimeType: 'application/json',
                responseSchema: getResponseSchema(persona),
            },
        });

        const jsonText = response.text;
        const parsedJson = JSON.parse(jsonText);

        if (typeof parsedJson.summary === 'string' && Object.values(Sentiment).includes(parsedJson.sentiment)) {
            return res.status(200).json(parsedJson);
        } else {
            console.error('Received malformed JSON data from API:', parsedJson);
            throw new Error('Received malformed JSON data from API.');
        }

    } catch (error) {
        console.error('Error analyzing transcript with Gemini API:', error);
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        return res.status(500).json({ error: `Failed to analyze transcript: ${message}` });
    }
});


app.listen(port, () => {
    console.log(`Joycribe backend server listening at http://localhost:${port}`);
});