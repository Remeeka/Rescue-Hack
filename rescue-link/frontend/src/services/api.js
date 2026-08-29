import axios from 'axios';

// Use production API URL if configured in Vercel/Netlify, otherwise fallback to current host
const envApiUrl = import.meta.env.VITE_API_BASE_URL;
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL = envApiUrl || `http://${hostname}:5000/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCases = () => api.get('/cases');
export const getCase = (id) => api.get(`/cases/${id}`);
export const createCase = (data) => api.post('/cases', data);

export const reportSighting = (caseId, data) => api.post(`/cases/${caseId}/sightings`, data);
export const getSightings = (caseId) => api.get(`/cases/${caseId}/sightings`);

export const getTimeline = (caseId) => api.get(`/cases/${caseId}/timeline`);
export const generateBriefing = (caseId) => api.post(`/cases/${caseId}/briefing`);

export const getVolunteers = () => api.get('/volunteers');
export const registerVolunteer = (data) => api.post('/volunteers', data);

export const getTasks = (caseId = null) => api.get('/tasks', { params: { case_id: caseId } });
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (taskId, data) => api.patch(`/tasks/${taskId}`, data);

export default api;
