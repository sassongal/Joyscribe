import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { ChildProcess, spawn } from 'child_process';
import Store from 'electron-store';
import fs from 'fs/promises';
import fsc from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import axios from 'axios';
import FormData from 'form-data';
import { Analysis, AnalysisPersona, HistoryEntry, Sentiment } from '../react-app/src/types';
import process from 'process';

let pyProc: ChildProcess | null = null;
const PY_PORT = 5001;
const store = new Store();
const HISTORY_FILE_NAME = 'history.json';

function getHistoryFilePath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, HISTORY_FILE_NAME);
}

async function initializeHistoryFile() {
  const historyPath = getHistoryFilePath();
  try {
    await fs.access(historyPath);
  } catch {
    await fs.writeFile(historyPath, JSON.stringify([]));
  }
}

const createPyProc = () => {
    const script = app.isPackaged 
        ? path.join((process as any).resourcesPath, 'python-backend/server.py')
        : path.join(__dirname, '..', '..', 'python-backend/server.py');
    
    let device = 'cpu';
    const hardwareAccel = store.get('hardware-acceleration');
    if (hardwareAccel) {
        if (process.platform === 'darwin') { // macOS
            device = 'mps';
        } else if (process.platform === 'win32' || process.platform === 'linux') { // Windows or Linux
            // A more robust check for an NVIDIA GPU would be ideal here, but for now we assume
            // the user knows what they're doing when they enable the setting.
            device = 'cuda';
        }
    }

    const pythonExecutables = ['python3', 'python'];
    let spawned = false;

    for (const executable of pythonExecutables) {
        try {
            console.log(`Attempting to spawn python server with: ${executable} ${script} --device ${device}`);
            pyProc = spawn(executable, [script, '--device', device]);
            
            pyProc.on('error', (err) => {
                console.error(`Failed to start subprocess with ${executable}. Error: ${err.message}`);
            });

            pyProc.stdout?.on('data', (data) => {
                console.log(`Python stdout: ${data.toString().trim()}`);
            });

            pyProc.stderr?.on('data', (data) => {
                console.error(`Python stderr: ${data.toString().trim()}`);
            });

            pyProc.on('close', (code) => {
                console.log(`Python process exited with code ${code}`);
                pyProc = null;
            });
            
            spawned = true;
            console.log(`Successfully spawned Python process with '${executable}'.`);
            break;
        } catch (e) {
            console.error(`Error spawning with ${executable}: `, e);
        }
    }

    if (!spawned) {
        dialog.showErrorBox(
            'Python Error',
            'Could not launch the transcription service. Please ensure Python is installed and accessible in your system\'s PATH.'
        );
    }
};

const exitPyProc = () => {
    if (pyProc) {
        console.log('Killing python process...');
        pyProc.kill();
        pyProc = null;
    }
};

app.on('will-quit', exitPyProc);

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: "Joyscribe",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '..', 'react-app', 'index.html'));
  } else {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  initializeHistoryFile();
  createPyProc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


// --- IPC Handlers ---

// Settings
ipcMain.handle('get-api-key', () => store.get('gemini-api-key'));
ipcMain.handle('set-api-key', (_, key: string) => store.set('gemini-api-key', key));
ipcMain.handle('get-hardware-accel-setting', () => store.get('hardware-acceleration', false));
ipcMain.handle('set-hardware-accel-setting', (_, isEnabled: boolean) => {
    store.set('hardware-acceleration', isEnabled);
    // Restart python process with new setting
    exitPyProc();
    createPyProc();
});


// Transcription
ipcMain.handle('transcribe-file', async (_, filePath: string) => {
  if (!pyProc) {
    throw new Error('Python transcription server is not running.');
  }
  try {
    const form = new FormData();
    form.append('file', fsc.createReadStream(filePath), path.basename(filePath));

    const response = await axios.post(`http://127.0.0.1:${PY_PORT}/transcribe`, form, {
      headers: { ...form.getHeaders() },
      timeout: 300000 // 5 minute timeout for long files
    });

    return response.data.transcript;
  } catch (error: any) {
    console.error('Error calling transcription server:', error.message);
    throw new Error(`Failed to transcribe: ${error.message}. Is the Python server running correctly?`);
  }
});

// History
ipcMain.handle('get-history', async () => {
  const historyPath = getHistoryFilePath();
  const data = await fs.readFile(historyPath, 'utf-8');
  return JSON.parse(data);
});

ipcMain.handle('save-history-entry', async (_, newEntry: HistoryEntry) => {
  const historyPath = getHistoryFilePath();
  const data = await fs.readFile(historyPath, 'utf-8');
  const history = JSON.parse(data);
  history.unshift(newEntry);
  await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  return history;
});

ipcMain.handle('update-history-entry', async (_, updatedEntry: Partial<HistoryEntry> & { id: number }) => {
  const historyPath = getHistoryFilePath();
  const data = await fs.readFile(historyPath, 'utf-8');
  const history: HistoryEntry[] = JSON.parse(data);
  const entryIndex = history.findIndex(e => e.id === updatedEntry.id);
  if (entryIndex !== -1) {
    history[entryIndex] = { ...history[entryIndex], ...updatedEntry };
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  }
  return history;
});

ipcMain.handle('delete-history-entry', async (_, id: number) => {
    const historyPath = getHistoryFilePath();
    const data = await fs.readFile(historyPath, 'utf-8');
    let history: HistoryEntry[] = JSON.parse(data);
    history = history.filter(entry => entry.id !== id);
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
    return history;
});

// Analysis
ipcMain.handle('analyze-transcript', async (_, { transcript, persona, customEntitiesList, apiKey }) => {
    if (!apiKey) {
      throw new Error("Gemini API key is missing. Please set it in the application settings.");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: transcript }] },
            config: {
                systemInstruction: getSystemInstruction(persona, customEntitiesList),
                responseMimeType: 'application/json',
                responseSchema: getResponseSchema(persona),
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as Analysis;

    } catch (error: any) {
        console.error('Error analyzing transcript with Gemini API:', error);
        throw new Error(`Failed to analyze transcript: ${error.message}`);
    }
});


// --- Gemini Logic ---
// Note: This logic is duplicated from the old web backend but now runs securely in the main process.
const getSystemInstruction = (persona: AnalysisPersona, customEntitiesList: string): string => {
    let baseInstruction = `You are an expert analyst for "Joyscribe", specializing in processing Hebrew call transcripts. Your task is to provide a comprehensive analysis based on the user's selected persona. Respond ONLY with a valid JSON object that adheres to the provided schema. The entire response must be in JSON format.

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