import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCase, reportSighting } from '../services/api';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import { Eye, User, MapPin, Clock, ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Globe } from 'lucide-react';

export default function ReportSighting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    reporter_name: '',
    report: '',
    location: '',
    time: '',
    date: new Date().toISOString().split('T')[0],
    additional_info: '',
  });

  useEffect(() => {
    if (id) {
      getCase(id)
        .then((res) => setCaseData(res.data))
        .catch((err) => console.error('Failed to load case for sighting:', err));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.report.trim()) {
      setError('Please write what you observed in the description field.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await reportSighting(id, formData);
      setSubmittedResult(res.data);
    } catch (err) {
      console.error('Failed to submit sighting:', err);
      setError(err.response?.data?.error || 'Failed to submit sighting report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Case
        </button>
        <span className="text-xs font-mono uppercase tracking-wider text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded border border-orange-900">
          Public Sighting Report
        </span>
      </div>

      {caseData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider">
              Missing Subject
            </span>
            <h2 className="text-lg font-bold text-white">{caseData.full_name}</h2>
            <p className="text-xs text-slate-400">
              Last seen: {caseData.last_known_location} • Wearing: {caseData.clothing || 'Unspecified'}
            </p>
          </div>
          <Link
            to={`/cases/${id}`}
            className="text-xs font-semibold text-red-400 hover:text-red-300 underline"
          >
            View Dashboard
          </Link>
        </div>
      )}

      <SafetyDisclaimer compact />

      {error && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Modal / Result after submission */}
      {submittedResult ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-white">Sighting Recorded & Processed</h3>
              <p className="text-xs text-slate-400">
                Thank you. Your report has been analyzed by Gemini AI and queued for human rescue coordinator review.
              </p>
            </div>
          </div>

          {submittedResult.ai_analysis && (
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-750 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-white">AI Analysis & Structured Breakdown</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
                  Priority: {submittedResult.ai_analysis.relevance_level}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  <strong>Extracted Summary:</strong> {submittedResult.ai_analysis.extracted_data?.summary}
                </p>
                <p className="text-slate-400">
                  <strong>Assessment:</strong> {submittedResult.ai_analysis.relevance_reasoning}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setSubmittedResult(null);
                setFormData({
                  reporter_name: '',
                  report: '',
                  location: '',
                  time: '',
                  date: new Date().toISOString().split('T')[0],
                  additional_info: '',
                });
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
            >
              Submit Another Sighting
            </button>
            <Link
              to={`/cases/${id}`}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md transition"
            >
              Return to Case Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Witness Observation Form
              </h3>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Supports English, Hindi, Tamil, etc.</span>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              What did you observe? (Write naturally in your preferred language) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="report"
              required
              rows="4"
              placeholder="e.g. I saw someone matching the general description near the railway station around 6:20 PM. They were wearing a blue shirt and carrying a black backpack..."
              value={formData.report}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <span className="text-[11px] text-slate-500">
              Our Gemini AI automatically detects the language and extracts key times, places, clothing, and objects.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Location / Landmark (Optional)
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Railway Station / Market Road"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Approximate Time (Optional)
              </label>
              <input
                type="text"
                name="time"
                placeholder="e.g. 6:20 PM"
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Your Name / Alias (Optional)
              </label>
              <input
                type="text"
                name="reporter_name"
                placeholder="Anonymous Witness"
                value={formData.reporter_name}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Date of Sighting
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition shadow-lg shadow-red-600/30 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Analyzing & Submitting...' : 'Submit Sighting Report'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
