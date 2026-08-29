import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCases } from '../services/api';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import { 
  ShieldCheck, 
  MapPin, 
  Eye, 
  FileText, 
  Users, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

export default function LandingPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCases()
      .then((res) => setCases(res.data))
      .catch((err) => console.error('Failed to fetch cases:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 border-b border-slate-800 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>AI-Powered Community Rescue Coordination</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Turning scattered sightings into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-300">
                coordinated action.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              When a person goes missing, information is scattered across languages, locations, and messengers. 
              RescueLink uses Google Gemini to structure witness accounts, map sighting timelines, and assist human search teams with prioritized briefings.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                to="/create-case"
                className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                Report Missing Person
              </Link>
              <Link
                to="/cases/RL-DEMO/report"
                className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-orange-400" />
                Report a Sighting
              </Link>
              <Link
                to="/cases/RL-DEMO"
                className="px-5 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-sm transition flex items-center gap-2"
              >
                <span>View Demo Case (Arun Kumar)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle grid backdrop pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
      </section>

      {/* Safety Notice Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SafetyDisclaimer />
      </div>

      {/* Key Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How RescueLink Coordinates Rapid Search
          </h2>
          <p className="text-sm text-slate-400">
            A structured workflow ensuring AI empowers human emergency response without making unverified identity claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Multilingual Sighting Intake</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Witnesses write natural descriptions in English, Hindi, Tamil, and more. Gemini extracts structured clues (time, location, clothing, objects) without altering original witness testimony.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. AI Relevance & Prioritization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini assesses lead relevance against the missing subject's physical traits and timeline, surfacing high-priority leads for human operators.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Operational Rescue Briefings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Search coordinators generate synthesized briefings on command, highlighting movement progressions, data gaps, and recommended search perimeters.
            </p>
          </div>
        </div>
      </section>

      {/* Active Cases Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Missing Cases</h2>
            <p className="text-xs text-slate-400">Current open coordination profiles</p>
          </div>
          <Link
            to="/create-case"
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <span>Add New Case</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading active cases...</div>
        ) : cases.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-sm">
            No active cases found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900">
                      {c.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900">
                      {c.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{c.full_name}</h3>
                    <p className="text-xs text-slate-400">
                      Age: {c.age || 'Unknown'} {c.gender ? `• ${c.gender}` : ''}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{c.last_known_location || 'Location unspecified'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{c.last_known_time || 'Time unspecified'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    to={`/cases/${c.id}`}
                    className="w-full text-center py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg transition"
                  >
                    Open Dashboard
                  </Link>
                  <Link
                    to={`/cases/${c.id}/report`}
                    className="w-full text-center py-2 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Log Sighting
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
