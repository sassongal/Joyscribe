# Joyscribe Desktop

Joyscribe is a local-first desktop application that allows you to transcribe local audio/video files for free and then analyze the transcript using the Google Gemini API.

## Features

- **Local Transcription:** Uses the powerful `ivrit-ai` model to transcribe audio directly on your machine. Your files never leave your computer for transcription.
- **Advanced Analysis:** Leverages the Google Gemini API for in-depth analysis of your transcripts with various personas (Sales Coach, Support Supervisor, etc.).
- **Local-First Data:** All your analysis history, notes, and tags are stored in a single JSON file on your computer. Nothing is stored in the cloud.
- **Secure:** Your Gemini API key is stored securely in the app's local configuration.

## Prerequisites

- **Python:** You must have Python installed on your system and available in your system's PATH. You can download it from [python.org](https://www.python.org/).
- **Internet Connection:** An internet connection is required for two things:
    1.  The very first time you run a transcription, the app will download the `ivrit-ai` model (this is a one-time download).
    2.  When you run an analysis, the app needs to connect to the Google Gemini API.

## Development Setup

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Install Python dependencies:**
    ```bash
    cd python-backend
    pip install -r requirements.txt
    cd ..
    ```
4.  **Run the application in development mode:**
    This command will start the React UI (Vite), the Electron main process, and the Python server concurrently.
    ```bash
    npm run dev
    ```

## Building the Application

To build a distributable package (`.dmg`, `.exe`, etc.) for your operating system:

1.  **Run the package script:**
    ```bash
    npm run package
    ```
2.  The output will be located in the `dist` directory.
