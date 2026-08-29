import React from 'react';
import { ShieldAlert, Info, PhoneCall } from 'lucide-react';
import { getEmergencyConfig } from '../config/emergencyServices';

export default function SafetyDisclaimer({ compact = false, countryCode = 'IN' }) {
  const emergency = getEmergencyConfig(countryCode);

  if (compact) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <div>
          <strong className="text-slate-300">Safety & Emergency Notice:</strong> AI extractions and relevance rankings are assistive tools designed solely for human review. RescueLink does not confirm identities or replace police/emergency responders. For urgent emergencies, contact local emergency services immediately (<strong>Dial {emergency.emergencyNumber}</strong> in {emergency.countryName}).
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-start space-x-3.5">
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-sm text-slate-300 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              Safety Protocol & Local Emergency Response
            </h4>
            <span className="inline-flex items-center gap-1.5 bg-red-950 text-red-300 border border-red-800 px-2.5 py-0.5 rounded text-xs font-bold font-mono">
              <PhoneCall className="w-3 h-3" />
              Emergency Services: {emergency.emergencyNumber} ({emergency.countryName})
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>1. No Identity Confirmation:</strong> RescueLink utilizes Gemini AI strictly to structure natural language observations and prioritize incoming leads for human operators. The platform never confirms identity or replaces official police investigation.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>2. Do Not Confront:</strong> Volunteers and the public must NEVER confront suspicious individuals or conduct unauthorized interventions. If you observe someone in immediate danger or distress, immediately contact local emergency services (<strong>Dial {emergency.emergencyNumber}</strong>).
          </p>
        </div>
      </div>
    </div>
  );
}
