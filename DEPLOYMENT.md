# TravelMind AI Deployment Guide

This guide provides step-by-step instructions for deploying TravelMind AI to production using Supabase for authentication and Vercel for hosting.

## Prerequisites

1.  **Supabase Account**: Create a project at [supabase.com](https://supabase.com).
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Vercel CLI**: Install via npm: `npm i -g vercel`.
4.  **API Keys**:
    - Google Gemini API Key
    - Groq API Key
    - YouTube Data API v3 Key

---

## 1. Supabase Setup

1.  Go to **Authentication > Providers** and ensure **Email** is enabled.
2.  (Optional) Disable **Confirm Email** for instant testing, or keep it enabled for security.
3.  Go to **Project Settings > API** to find your:
    - `Project URL`
    - `anon` Public Key

---

## 2. Backend Deployment (Vercel)

1.  Open a terminal in the `backend` directory.
2.  Run `vercel login` and authenticate.
3.  Run `vercel` (initial setup):
    - Set up and deploy: **Yes**
    - Project name: `travelmind-ai-backend`
    - Directory: `./` (current)
4.  Run `vercel env add` for each of the following:
    - `GEMINI_API_KEY`: your-gemini-key
    - `GROQ_API_KEY`: your-groq-key
    - `YOUTUBE_API_KEY`: your-youtube-key
    - `SUPABASE_URL`: your-supabase-url
    - `SUPABASE_ANON_KEY`: your-supabase-anon-key
    - `SECRET_KEY`: any-random-32-char-string
5.  Run `vercel --prod` to deploy to production.
6.  **Copy the assigned Production URL** (e.g., `travelmind-ai-backend.vercel.app`).

---

## 3. Frontend Deployment (Vercel)

1.  Open a terminal in the `frontend` directory.
2.  Run `vercel env add`:
    - `VITE_SUPABASE_URL`: your-supabase-url
    - `VITE_SUPABASE_ANON_KEY`: your-supabase-anon-key
    - `VITE_API_URL`: **YOUR_BACKEND_PRODUCTION_URL** (from Step 2)
3.  Run `vercel --prod` to deploy.
4.  **Copy the Assigned Frontend URL**.

---

## 4. Final Configuration

1.  **Supabase Redirects**: 
    - Go to **Authentication > URL Configuration**.
    - Add your **Frontend Production URL** to the **Redirect URLs**.
2.  **Backend CORS**:
    - In Vercel Backend settings, add an Environment Variable `FRONTEND_URL` with your **Frontend Production URL**.
    - Re-deploy backend: `vercel --prod` (or it will pick up the change automatically if using GitHub integration).

---

## Verification

1.  Visit your deployed frontend URL.
2.  Create a new account (Register).
3.  Login and verify you can generate a trip.
4.  Check the "Global Sentiment" and "Budget" tabs to verify AI API calls.
