import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../services/api';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import { AlertCircle, User, MapPin, Calendar, Clock, Shirt, FileText, ArrowLeft } from 'lucide-react';

export default function CreateCase() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    physical_description: '',
    clothing: '',
    last_known_location: '',
    last_known_date: new Date().toISOString().split('T')[0],
    last_known_time: '',
    additional_info: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setError('Please provide the full name of the missing person.');
      return;
    }
    if (!formData.last_known_location.trim()) {
      setError('Please provide the last known location.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await createCase({
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null,
      });

      if (res.data?.id) {
        navigate(`/cases/${res.data.id}`);
      }
    } catch (err) {
      console.error('Failed to create case:', err);
      setError(err.response?.data?.error || 'Failed to submit case. Please verify connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-xs font-mono uppercase tracking-wider text-red-400 bg-red-950/60 px-2.5 py-1 rounded border border-red-900">
          Case Registration Intake
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Register Missing Person Case
        </h1>
        <p className="text-sm text-slate-400">
          Create a centralized case file to organize community sightings, visualize search timelines, and coordinate rescue response.
        </p>
      </div>

      <SafetyDisclaimer compact />

      {error && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Basic Identification */}
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <User className="w-4 h-4 text-red-500" />
            1. Personal Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                placeholder="e.g. Arun Kumar"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Age
              </label>
              <input
                type="number"
                name="age"
                min="0"
                max="120"
                placeholder="e.g. 21"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Non-Binary</option>
                <option value="Unknown">Prefer not to say</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Physical Description & Distinct Features
              </label>
              <input
                type="text"
                name="physical_description"
                placeholder="e.g. 5ft 9in, slim build, dark hair, mole on right cheek"
                value={formData.physical_description}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Clothing & Last Seen Details */}
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Shirt className="w-4 h-4 text-orange-400" />
            2. Clothing & Appearance
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Clothing Worn When Last Seen
            </label>
            <input
              type="text"
              name="clothing"
              placeholder="e.g. Blue button-down shirt, dark denim trousers, white sneakers"
              value={formData.clothing}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Last Known Coordinates */}
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            3. Last Confirmed Location & Time
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Last Known Location / Landmark <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_known_location"
                required
                placeholder="e.g. Central Bus Station, Platform 3"
                value={formData.last_known_location}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Last Seen Date
              </label>
              <input
                type="date"
                name="last_known_date"
                value={formData.last_known_date}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Last Seen Time
              </label>
              <input
                type="text"
                name="last_known_time"
                placeholder="e.g. 5:10 PM"
                value={formData.last_known_time}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Context */}
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            4. Additional Case Context
          </h2>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Medical conditions, familiar areas, or essential notes
            </label>
            <textarea
              name="additional_info"
              rows="3"
              placeholder="e.g. Speaks Tamil and English. May be disoriented. Carried a small backpack."
              value={formData.additional_info}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Submit */}
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
            {submitting ? 'Generating Case ID...' : 'Create Case File'}
          </button>
        </div>
      </form>
    </div>
  );
}
