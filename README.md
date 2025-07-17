---
title: Joyscribe Application
sdk: static
app_file: index.html
---

# Joyscribe Transcription

This document provides instructions for setting up and running the Joyscribe application.

Joyscribe is a web application built with React. It uses the Google Gemini API to upload, transcribe, and analyze audio and video calls, with results displayed in a comprehensive dashboard. This version of the application runs entirely in the browser and does not require a separate backend server. All processing, including audio/video transcription and analysis, is performed client-side using the Gemini API.

## Setup

### Environment Variables
The application requires a Google Gemini API key to function.

You must configure the `API_KEY` as an environment variable in the execution context where the application is served. The application will automatically use `process.env.API_KEY`.

**Example:**  
If you are using a simple static server or a platform like Netlify or Vercel, you will need to set the environment variable in their respective dashboards.

## Running the Application

Since the application is fully client-side, you only need to serve the `index.html` file and its associated assets (like `index.tsx`).

You can use any simple static file server. For example, using Python's built-in server:

```bash
# From the project's root directory
python3 -m http.server
