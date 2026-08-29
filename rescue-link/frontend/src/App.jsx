import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CreateCase from './pages/CreateCase';
import CaseDashboard from './pages/CaseDashboard';
import ReportSighting from './pages/ReportSighting';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create-case" element={<CreateCase />} />
            <Route path="/cases/:id" element={<CaseDashboard />} />
            <Route path="/cases/:id/report" element={<ReportSighting />} />
            <Route path="/volunteers" element={<VolunteerDashboard />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>RescueLink — AI-Powered Community Rescue Coordination Platform</span>
            <span className="text-[11px] text-slate-600">Built for RescueHacks Hackathon</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
