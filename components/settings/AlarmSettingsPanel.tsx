
import React, { useState, useEffect } from 'react';
import { Bell, Volume2, Mail, Clock } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
        <h3 className="text-xs font-bold italic text-gray-500 tracking-[0.2em] mb-4 flex items-center">
            {title}
        </h3>
        <div className="bg-white border border-[var(--surface-border)] rounded-lg p-6 space-y-4">
            {children}
        </div>
    </div>
);

// ... (other styled components remain the same)

const Checkbox = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex items-center">
        <input type="checkbox" {...props} className="w-4 h-4 rounded bg-gray-200 border-zinc-600 text-sky-500 focus:ring-sky-500" />
        <span className="ml-3 text-sm text-gray-700">{label}</span>
    </div>
);

export const AlarmSettingsPanel: React.FC = () => {
    const [prefs, setPrefs] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrefs = async () => {
            const response = await fetch('/api/notification-preferences');
            const data = await response.json();
            if (response.ok) {
                setPrefs(data || {});
            }
            setLoading(false);
        };
        fetchPrefs();
    }, []);

    const handlePrefChange = (key: string, value: any) => {
        setPrefs(current => ({...current, [key]: value}));
        // Note: In a real app, you might want to debounce this save call.
        fetch('/api/notification-preferences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [key]: value }),
        });
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-8">
            <Section title="Sound Preferences">
                <Checkbox 
                    label="Enable sound alerts" 
                    checked={prefs.sound_enabled ?? true}
                    onChange={e => handlePrefChange('sound_enabled', e.target.checked)}
                />
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={prefs.sound_volume ?? 75}
                    onChange={e => handlePrefChange('sound_volume', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                />
            </Section>

            <Section title="Email Preferences">
                <select 
                    value={prefs.email_frequency ?? 'immediate_critical'}
                    onChange={e => handlePrefChange('email_frequency', e.target.value)}
                    className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900"
                >
                    <option value="immediate_critical">Immediate for Critical, Daily digest for others</option>
                    <option value="immediate">Immediate (all notifications)</option>
                    <option value="daily">Daily digest only</option>
                </select>
            </Section>

            <Section title="Quiet Hours">
                 <Checkbox 
                    label="Enable quiet hours"
                    checked={prefs.quiet_hours_enabled ?? false}
                    onChange={e => handlePrefChange('quiet_hours_enabled', e.target.checked)}
                />
                <div className="flex items-center space-x-2">
                    <input 
                        type="time" 
                        value={prefs.quiet_hours_start ?? '22:00'}
                        onChange={e => handlePrefChange('quiet_hours_start', e.target.value)}
                        className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm w-full" 
                    />
                    <span className="text-gray-500">to</span>
                    <input 
                        type="time" 
                        value={prefs.quiet_hours_end ?? '07:00'}
                        onChange={e => handlePrefChange('quiet_hours_end', e.target.value)}
                        className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 text-sm w-full" 
                    />
                </div>
            </Section>
        </div>
    );
};
