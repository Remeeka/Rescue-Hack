import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LifeBuoy, Users, PlusCircle, AlertTriangle, PhoneCall, Globe } from 'lucide-react';
import { getEmergencyConfig, getSupportedCountries, DEFAULT_COUNTRY } from '../config/emergencyServices';

export default function Navbar() {
  const location = useLocation();
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const emergency = getEmergencyConfig(selectedCountry);
  const countries = getSupportedCountries();

  const navLinks = [
    { name: 'Active Cases', path: '/' },
    { name: 'Register Missing Person', path: '/create-case' },
    { name: 'Volunteer Center', path: '/volunteers' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Location-Aware Emergency Notice Banner */}
      <div className="bg-amber-600 text-amber-950 px-4 py-1.5 text-xs font-semibold flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-950 flex-shrink-0" />
          <span>
            <strong>URGENT SITUATION?</strong> For life-threatening emergencies or immediate harm, contact local emergency authorities immediately:
          </span>
          <a
            href={`tel:${emergency.emergencyNumber}`}
            className="inline-flex items-center gap-1 bg-amber-950 text-amber-100 px-2 py-0.5 rounded font-black tracking-wide hover:bg-black transition"
          >
            <PhoneCall className="w-3 h-3" />
            <span>DIAL {emergency.emergencyNumber}</span>
          </a>
          <span className="hidden sm:inline text-amber-900 font-normal">
            ({emergency.countryName} Emergency Services)
          </span>
        </div>

        {/* Location / Country Switcher */}
        <div className="flex items-center space-x-1.5">
          <Globe className="w-3.5 h-3.5 text-amber-950" />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-amber-700/80 text-amber-950 text-[11px] font-bold rounded px-1.5 py-0.5 border border-amber-800 focus:outline-none cursor-pointer"
            title="Change emergency region"
          >
            {countries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>
                {c.flag} {c.countryName} ({c.emergencyNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:bg-red-500 transition-colors">
              <LifeBuoy className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Rescue<span className="text-red-500">Link</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Community Rescue Coordination
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/cases/RL-DEMO"
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
            >
              Demo Case (RL-DEMO)
            </Link>
            <Link
              to="/create-case"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-500 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Missing Person</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
