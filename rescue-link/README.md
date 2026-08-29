# RescueLink
AI-Powered Missing Person Rescue Coordinator

## Problem
When a person goes missing, information can become scattered across family members, volunteers, and witnesses. Sightings may contain different locations, times, descriptions, and languages. This makes it difficult to organize information quickly.

## Solution
RescueLink is a coordination and information-support platform that helps organize missing-person cases, structure sighting reports using AI, visualize sightings on a map and timeline, prioritize reports for HUMAN REVIEW, and generate concise rescue briefings.

## Architecture & Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Leaflet
- **Backend:** Python, Flask, SQLite
- **AI:** Google Gemini API

## Safety Considerations
- **No Identity Confirmation:** RescueLink does not claim to identify or confirm a missing person.
- **AI Limitations:** The AI does not make decisions about a person's identity. It only extracts, summarizes, organizes, and prioritizes reports for human review.
- **Emergency Disclaimer:** This application does not replace police, emergency responders, or trained professionals. Do not encourage users to confront suspicious people. For urgent situations, contact appropriate authorities.

## Setup Instructions
1. Install Node.js (required for frontend) and Python 3 (required for backend).
2. Clone or download this repository.
3. Configure Environment Variables: Create a `.env` file in the root directory and add `GEMINI_API_KEY=your_key_here`.
4. Install Backend Dependencies: `cd backend` and `pip install -r requirements.txt`.
5. Install Frontend Dependencies: `cd frontend` and `npm install`.

## Running the Application
1. Start Backend: `cd backend` and `python app.py` (Runs on http://localhost:5000)
2. Start Frontend: `cd frontend` and `npm run dev` (Runs on http://localhost:5173)

## Demo Data
To view a demo case, simply navigate to the application. A fictional demo case will be pre-populated on startup to showcase features.
