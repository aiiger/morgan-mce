
import React from 'react';
import { CheckSquare } from 'lucide-react';

interface Requirement {
    id: string;
    text: string;
    status: 'pending' | 'completed' | 'waived';
}

interface RequirementsChecklistProps {
    requirements: Requirement[];
}

export const RequirementsChecklist: React.FC<RequirementsChecklistProps> = ({ requirements }) => {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h4 className="flex items-center text-caption font-bold italic text-gray-900 tracking-[0.2em] uppercase">
                    <CheckSquare size={14} className="mr-3 text-blue-600 shadow-[0_0_10px_var(--brand-accent)]" />
                    Extracted_Audit_Requirements
                </h4>
            </div>
            <div className="p-6 space-y-4">
                {requirements.map(req => (
                    <div key={req.id} className="flex items-start bg-gray-100/20 p-4 rounded-xl border border-gray-200 group hover:border-blue-200 transition-all">
                        <div className="mt-1">
                            <input type="checkbox" className="w-4 h-4 rounded bg-white border-gray-200 text-blue-600 focus:ring-blue-300 focus:ring-offset-white transition-all cursor-pointer" />
                        </div>
                        <div className="ml-4 space-y-1">
                            <label className="text-gov-label font-bold italic text-gray-700 group-hover:text-gray-900 transition-colors cursor-pointer block leading-relaxed">{req.text}</label>
                            <span className="text-caption font-mono text-gray-500 tracking-widest font-bold uppercase italic">
                                STATUS: {req.status} • SOURCE: NEURAL_VAULT
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
