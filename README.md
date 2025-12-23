# TravelMind AI 🌍✈️

An intelligent travel planning platform powered by AI, helping users create personalized itineraries, explore destinations virtually, and make informed travel decisions.

## Features

- **AI-Powered Trip Planning**: Generate customized travel itineraries using Groq AI
- **Virtual Tours**: Explore destinations with AI-generated video content
- **Safety Insights**: Get real-time safety information for your destinations
- **Budget Analysis**: Smart budget planning and expense tracking
- **User Authentication**: Secure login with Supabase Auth

## Tech Stack

### Frontend
- React 19 with Vite
- React Router for navigation
- Supabase for authentication
- Recharts for data visualization
- Lucide React for icons

### Backend
- FastAPI (Python)
- Supabase for authentication
- Groq AI (Llama 3.3 70B) for content generation
- YouTube Data API for video content
- SQLAlchemy with SQLite

## Deployment

This project is deployed on Vercel with the following structure:
- **Frontend**: Static React app
- **Backend**: Serverless FastAPI functions
- **Database**: Supabase

### Environment Variables

#### Backend
- `GROQ_API_KEY`: Groq API key for AI features
- `YOUTUBE_API_KEY`: YouTube Data API v3 key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SECRET_KEY`: JWT secret for authentication
- `FRONTEND_URL`: Frontend deployment URL

#### Frontend
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_API_URL`: Backend API URL

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account
- API keys (Groq, YouTube)

### Setup

1. Clone the repository
```bash
git clone https://github.com/Rohithk05/TravelMind-AI-.git
cd TravelMind-AI-
```

2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_key
YOUTUBE_API_KEY=your_youtube_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SECRET_KEY=your_secret_key
```

Run backend:
```bash
uvicorn app.main:app --reload --port 8000
```

3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_API_URL=http://localhost:8000
```

Run frontend:
```bash
npm run dev
```

## Project Structure

```
TravelMind-AI/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── auth/          # Authentication
│   │   ├── services/      # AI and external services
│   │   └── main.py        # FastAPI app
│   ├── requirements.txt
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── config.js      # API configuration
│   ├── package.json
│   └── vercel.json
└── README.md
```

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
