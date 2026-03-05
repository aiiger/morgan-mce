
import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

// This would typically come from your types file
interface CommsEvent {
    id: string;
    event_type: string;
    direction: string;
    with_party: string;
    outcome: string;
    notes: string;
    event_at: string;
    logged_by_user_id: string;
}

interface CommsLogProps {
    tenderId: string;
    commsEvents: CommsEvent[];
    onAddComms: (newEvent: Omit<CommsEvent, 'id' | 'tender_id' | 'created_at' | 'logged_by_user_id' | 'event_at'>) => Promise<void>;
}

export const CommsLog: React.FC<CommsLogProps> = ({ tenderId, commsEvents, onAddComms }) => {
    const [notes, setNotes] = useState('');
    const [eventType, setEventType] = useState('call');
    const [withParty, setWithParty] = useState('');
    const [outcome, setOutcome] = useState('Follow-up');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes.trim()) return;

        const newEvent = {
            event_type: eventType,
            direction: 'outbound',
            with_party: withParty.trim() || 'Client',
            outcome,
            notes,
        };

        await onAddComms(newEvent);
        setNotes('');
        setWithParty('');
        setOutcome('Follow-up');
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
                <h4 className="flex items-center text-sm font-bold italic text-gray-900">
                    <MessageSquare size={16} className="mr-2 text-sky-400" />
                    Communication Log
                </h4>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
                {commsEvents.map(event => (
                    <div key={event.id} className="text-xs">
                        <div className="flex justify-between items-center">
                            <span className="font-bold italic text-sky-300 capitalize">{event.event_type}</span>
                            <span className="text-gray-500">{new Date(event.event_at).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700 mt-1">{event.notes}</p>
                    </div>
                ))}
                 {commsEvents.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">No communication events logged.</p>
                )}
            </div>

            <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Log a new call or email..."
                        className="w-full bg-white/30 border border-gray-200 rounded-lg p-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 outline-none"
                        rows={3}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            value={withParty}
                            onChange={(e) => setWithParty(e.target.value)}
                            placeholder="Party (e.g. Client, Subcontractor)"
                            className="bg-white/30 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                        <select
                            value={outcome}
                            onChange={(e) => setOutcome(e.target.value)}
                            className="bg-white/30 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                        >
                            <option value="Follow-up">Follow-up Required</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Pending">Pending Response</option>
                            <option value="Escalated">Escalated</option>
                            <option value="No Action">No Action</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center">
                        <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="bg-white/30 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900"
                        >
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                        </select>
                        <button type="submit" className="flex items-center bg-sky-600 hover:bg-sky-500 text-gray-900 font-bold italic text-xs px-4 py-2 rounded-lg transition-colors">
                            <Send size={14} className="mr-2" />
                            Log Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
