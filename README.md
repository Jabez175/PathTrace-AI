# PathTrace AI

**[🌐 View Live Application](https://pathtrack-de484.web.app/)**

**PathTrace AI** is an intelligent, AI-powered career navigation engine designed to help students, job seekers, and career changers build concrete, personalized roadmaps to their dream roles. 

By analyzing user resumes and comparing them to target job profiles using Google's Gemini AI, PathTrace replaces generic career advice with an interactive, milestone-driven pathway. It assesses your current readiness, highlights specific skill gaps, and breaks down your career journey into actionable, trackable steps.

## Features

- **Resume Analysis**: Integrates a PDF parser with the Gemini API to analyze user resumes, assess their skills, and provide a holistic readiness score.
- **Interactive Career Roadmap**: Uses a dynamic stepper UI (`HorizonStepper`) to guide users across multi-stage career progression paths.
- **Actionable Feedback**: Leverages generative AI (Gemini) to evaluate the candidate's current alignment with their target role and suggest specific steps for improvement.
- **Cloud Hosted**: Seamlessly deployed on Firebase Hosting for fast and reliable access.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, CSS
- **AI Integration**: Google Gemini API
- **Hosting / Deployment**: Firebase Hosting

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16+)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- A Firebase project set up for hosting

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jabez175/PathTrace-AI.git
   cd PathTrace-AI/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `frontend` directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application should now be running on `http://localhost:5173`.

### Deployment

This app is configured to be deployed on Firebase Hosting.

1. Ensure you have the Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize (if not already done):
   ```bash
   firebase login
   firebase init hosting
   ```
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## License
MIT License
