import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCase, getTimeline, generateBriefing, getTasks, createTask, updateTask } from '../services/api';
import RescueMap from '../components/RescueMap';
import Timeline from '../components/Timeline';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import BriefingViewer from '../components/BriefingViewer';
import { 
  User, 
  MapPin, 
  Clock, 
  Shirt, 
  Sparkles, 
  PlusCircle, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Users, 
  ListChecks, 
  ChevronRight, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export default function CaseDashboard() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState('');
  const [generatingBriefing, setGeneratingBriefing] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskArea, setNewTaskArea] = useState('');

  const loadData = useCallback(() => {
    Promise.all([getCase(id), getTimeline(id), getTasks(id)])
      .then(([caseRes, timelineRes, tasksRes]) => {
        setCaseData(caseRes.data);
        setTimelineEvents(timelineRes.data);
        setTasks(tasksRes.data);
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Auto-refresh for live sightings
    return () => clearInterval(interval);
  }, [loadData]);

  const handleGenerateBriefing = async () => {
    setGeneratingBriefing(true);
    try {
      const res = await generateBriefing(id);
      setBriefing(res.data.briefing);
    } catch (err) {
      console.error('Failed to generate briefing:', err);
    } finally {
      setGeneratingBriefing(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;
    try {
      await createTask({
        case_id: id,
        description: newTaskDesc,
        search_area: newTaskArea || 'Perimeter',
      });
      setNewTaskDesc('');
      setNewTaskArea('');
      loadData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      loadData();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
        Loading Case Dashboard ({id})...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Case not found.
      </div>
    );
  }

  const breakdown = caseData.relevance_breakdown || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar: Case ID & Status & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500 font-bold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/70 px-2.5 py-0.5 rounded border border-red-900">
                CASE {caseData.id}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-900">
                STATUS: {caseData.status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              {caseData.full_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            title="Refresh Live Data"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to={`/cases/${caseData.id}/report`}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md shadow-red-600/30 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Report Sighting
          </Link>
        </div>
      </div>

      {/* Case Details & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Missing Subject Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <User className="w-4 h-4 text-slate-400" />
            Subject Profile
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400">Age / Gender:</span>
              <span className="font-semibold text-white">
                {caseData.age ? `${caseData.age} yrs` : 'Unknown'} • {caseData.gender || 'Unspecified'}
              </span>
            </div>

            <div className="space-y-1 py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5 text-orange-400" />
                Clothing When Last Seen:
              </span>
              <p className="text-xs font-medium text-slate-200 bg-slate-800/60 p-2.5 rounded-lg">
                {caseData.clothing || 'Clothing details not specified.'}
              </p>
            </div>

            <div className="space-y-1 py-1 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Last Confirmed Location:
              </span>
              <p className="text-xs font-medium text-slate-200">
                {caseData.last_known_location}
              </p>
              <p className="text-[11px] text-slate-400">
                {caseData.last_known_time} {caseData.last_known_date ? `(${caseData.last_known_date})` : ''}
              </p>
            </div>

            {caseData.physical_description && (
              <div className="space-y-1 py-1">
                <span className="text-xs text-slate-400">Physical Features:</span>
                <p className="text-xs text-slate-300">
                  {caseData.physical_description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 2 cols: Live Sighting Metrics & Priorities */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="my-2">
              <span className="text-3xl font-black text-white">{caseData.total_sightings || 0}</span>
            </div>
            <span className="text-[11px] text-slate-500">Live Intake Feed</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">High Priority</span>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-orange-400">{breakdown.HIGH || 0}</span>
            </div>
            <span className="text-[11px] text-slate-500">Primary Match Clues</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Medium Priority</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-amber-400">{breakdown.MEDIUM || 0}</span>
            </div>
            <span className="text-[11px] text-slate-500">Partial Trait Match</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Low / Unclear</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            </div>
            <div className="my-2">
              <span className="text-3xl font-black text-blue-400">
                {(breakdown.LOW || 0) + (breakdown.INSUFFICIENT || 0)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Awaiting Verification</span>
          </div>

          {/* AI Rescue Briefing Bar inside metrics */}
          <div className="col-span-2 sm:col-span-4 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Gemini AI Rescue Briefing
              </h3>
              <p className="text-xs text-slate-400">
                Synthesize chronological sightings, identify movement patterns, and highlight search focus areas for coordinators.
              </p>
            </div>

            <button
              onClick={handleGenerateBriefing}
              disabled={generatingBriefing}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center gap-2"
            >
              {generatingBriefing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Briefing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Rescue Briefing
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Rendered Briefing Section if generated */}
      {briefing && <BriefingViewer rawBriefing={briefing} />}

      {/* Map & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RescueMap caseData={caseData} sightings={caseData.sightings || []} />
        <Timeline events={timelineEvents} />
      </div>

      {/* Sightings Feed (Structured View) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Structured Sightings Feed</h2>
            <p className="text-xs text-slate-400">All submitted reports processed and prioritized for human review</p>
          </div>
          <Link
            to={`/cases/${caseData.id}/report`}
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <span>+ Add Sighting</span>
          </Link>
        </div>

        {(!caseData.sightings || caseData.sightings.length === 0) ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No sightings reported yet.
          </div>
        ) : (
          <div className="space-y-4">
            {caseData.sightings.map((s, index) => {
              const rel = s.relevance_level || 'INSUFFICIENT INFORMATION';
              let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
              if (rel === 'HIGH') badgeColor = 'bg-orange-950/70 text-orange-300 border-orange-800';
              if (rel === 'MEDIUM') badgeColor = 'bg-amber-950/70 text-amber-300 border-amber-800';
              if (rel === 'LOW') badgeColor = 'bg-blue-950/70 text-blue-300 border-blue-800';

              return (
                <div
                  key={s.id || index}
                  className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 rounded-xl p-5 space-y-3 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        REPORT #{s.id}
                      </span>
                      <span className="text-xs text-slate-400">• Witness: {s.reporter_name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {s.extracted_language && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                          Lang: {s.extracted_language}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${badgeColor}`}>
                        AI Relevance: {rel}
                      </span>
                    </div>
                  </div>

                  {/* Raw Report */}
                  <div className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    "{s.original_report}"
                  </div>

                  {/* Extracted Structured Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">Extracted Location:</span>
                      <span className="text-slate-200 font-semibold truncate block">
                        {s.extracted_location || s.location || 'Unknown'}
                      </span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">Extracted Time:</span>
                      <span className="text-slate-200 font-semibold truncate block">
                        {s.extracted_time || s.time || 'Unknown'}
                      </span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">Reported Clothing:</span>
                      <span className="text-slate-200 font-semibold truncate block">
                        {s.extracted_clothing || 'Unspecified'}
                      </span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">Observed Objects:</span>
                      <span className="text-slate-200 font-semibold truncate block">
                        {s.extracted_objects || 'None reported'}
                      </span>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  {s.relevance_reasoning && (
                    <div className="text-xs text-slate-400 bg-slate-900/30 p-2.5 rounded border border-slate-850 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-300">AI Assessment:</strong> {s.relevance_reasoning}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Volunteer Search Tasks Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-emerald-400" />
              Volunteer Search Task Coordination
            </h2>
            <p className="text-xs text-slate-400">Assign search sectors and track field verification tasks</p>
          </div>
        </div>

        {/* Task Creation Form */}
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
          <input
            type="text"
            placeholder="Search task description (e.g. Check CCTV at East Market)"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            className="sm:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search Area / Sector"
              value={newTaskArea}
              onChange={(e) => setNewTaskArea(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex-shrink-0"
            >
              Add Task
            </button>
          </div>
        </form>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No tasks assigned yet. Create one above to direct search volunteers.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800/50 border border-slate-750 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      AREA: {task.search_area || 'General'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      task.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      task.status === 'IN_PROGRESS' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200">{task.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded text-xs font-semibold transition"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {task.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-semibold transition"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
