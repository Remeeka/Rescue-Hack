import React, { useEffect, useState } from 'react';
import { getCases, getTasks, getVolunteers, registerVolunteer, updateTask } from '../services/api';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import { Users, ListChecks, CheckCircle2, Clock, MapPin, UserCheck, Plus, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VolunteerDashboard() {
  const [cases, setCases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [volName, setVolName] = useState('');
  const [volContact, setVolContact] = useState('');
  const [volAvailability, setVolAvailability] = useState('Immediate / On-call');
  const [selectedVolunteer, setSelectedVolunteer] = useState('');

  const loadData = () => {
    Promise.all([getCases(), getTasks(), getVolunteers()])
      .then(([casesRes, tasksRes, volRes]) => {
        setCases(casesRes.data);
        setTasks(tasksRes.data);
        setVolunteers(volRes.data);
        if (volRes.data.length > 0 && !selectedVolunteer) {
          setSelectedVolunteer(volRes.data[0].id.toString());
        }
      })
      .catch((err) => console.error('Failed to load volunteer data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterVolunteer = async (e) => {
    e.preventDefault();
    if (!volName.trim()) return;
    try {
      const res = await registerVolunteer({
        name: volName,
        contact_info: volContact,
        availability: volAvailability,
      });
      setVolName('');
      setVolContact('');
      loadData();
      if (res.data?.id) {
        setSelectedVolunteer(res.data.id.toString());
      }
    } catch (err) {
      console.error('Failed to register volunteer:', err);
    }
  };

  const handleAssignTask = async (taskId) => {
    if (!selectedVolunteer) return;
    try {
      await updateTask(taskId, {
        assigned_to: parseInt(selectedVolunteer, 10),
        status: 'IN_PROGRESS',
      });
      loadData();
    } catch (err) {
      console.error('Failed to assign task:', err);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateTask(taskId, { status: 'COMPLETED' });
      loadData();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-800">
            <span>Community Search Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Volunteer & Search Task Coordination
          </h1>
          <p className="text-xs text-slate-400">
            Coordinate grassroots search volunteers, claim search zones, and report field activity.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 block">Registered Volunteers</span>
            <span className="text-lg font-black text-emerald-400">{volunteers.length}</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 block">Active Search Tasks</span>
            <span className="text-lg font-black text-white">{tasks.length}</span>
          </div>
        </div>
      </div>

      <SafetyDisclaimer />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Volunteer Registration & Selection Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Volunteer Registration
            </h2>

            <form onSubmit={handleRegisterVolunteer} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Volunteer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Contact Info (Phone / Email)</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={volContact}
                  onChange={(e) => setVolContact(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Availability</label>
                <select
                  value={volAvailability}
                  onChange={(e) => setVolAvailability(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Immediate / On-call">Immediate / On-call</option>
                  <option value="Evenings Only">Evenings Only</option>
                  <option value="Weekends Only">Weekends Only</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-sm"
              >
                Join Volunteer Corps
              </button>
            </form>
          </div>

          {/* Active Volunteer Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Operating As Volunteer:
            </h3>
            {volunteers.length === 0 ? (
              <p className="text-xs text-slate-500">No volunteers registered yet.</p>
            ) : (
              <select
                value={selectedVolunteer}
                onChange={(e) => setSelectedVolunteer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                {volunteers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.availability})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Search Tasks & Sector Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-400" />
                Active Field Tasks & Search Zones
              </h2>
              <span className="text-xs text-slate-400 font-mono">{tasks.length} Total</span>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No active search tasks recorded across cases.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-750 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 transition"
                  >
                    <div className="space-y-1.5 max-w-md">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-900">
                          {task.case_id}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          SECTOR: {task.search_area || 'General'}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-white">{task.description}</p>

                      {task.volunteer_name && (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Assigned to: {task.volunteer_name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {task.status === 'PENDING' && (
                        <button
                          onClick={() => handleAssignTask(task.id)}
                          disabled={!selectedVolunteer}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-semibold transition"
                        >
                          Claim Task
                        </button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleCompleteTask(task.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition"
                        >
                          Mark Completed
                        </button>
                      )}

                      <Link
                        to={`/cases/${task.case_id}`}
                        className="p-1.5 text-slate-400 hover:text-white transition"
                        title="View Case"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
