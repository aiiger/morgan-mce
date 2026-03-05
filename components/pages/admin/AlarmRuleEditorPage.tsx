
import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, AlertCircle, Save, TestTube2, Plus } from 'lucide-react';

// (Styled components like Section, Label, Input, Select remain the same)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-bold italic text-gray-900 tracking-wider mb-4">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 outline-none" />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-sky-500 outline-none">
        {children}
    </select>
);

const RuleEditorForm = ({ onSave, rule }: { onSave: (rule: any) => void, rule: any }) => {
    const [formData, setFormData] = useState(rule);

    useEffect(() => setFormData(rule), [rule]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <Section title="General Settings">
                <Input name="name" value={formData.name} onChange={handleChange} />
            </Section>
             <Section title="Trigger Condition">
                <Select name="entity_type" value={formData.entity_type} onChange={handleChange}>
                    <option>Tender</option>
                    <option>Project Milestone</option>
                </Select>
                <Select name="condition_operator" value={formData.condition_operator} onChange={handleChange}>
                    <option>Days Before</option>
                </Select>
                <Input name="condition_value" type="number" value={formData.condition_value} onChange={handleChange} />
            </Section>
             <button onClick={() => onSave(formData)} className="w-full flex items-center justify-center py-2.5 bg-sky-600 text-white font-bold italic rounded-lg">
                <Save size={16} className="mr-2" /> Save Rule
            </button>
        </div>
    );
}


const AlarmRuleEditorPage = () => {
    const [rules, setRules] = useState<any[]>([]);
    const [selectedRule, setSelectedRule] = useState<any>(null);

    useEffect(() => {
        const fetchRules = async () => {
            const res = await fetch('/api/alarm-rules');
            const data = await res.json();
            setRules(data);
            setSelectedRule(data[0]);
        };
        fetchRules();
    }, []);

    const handleSave = async (rule: any) => {
        const method = rule.id ? 'PATCH' : 'POST';
        const url = rule.id ? `/api/alarm-rules/${rule.id}` : '/api/alarm-rules';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rule),
        });
        // (refresh list)
    };

    return (
        <div className="page-container space-y-6">
            <h1 className="text-2xl font-bold italic text-gray-900">Alarm Rule Editor</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <button onClick={() => setSelectedRule({ name: 'New Rule' })} className="w-full mb-4 flex items-center justify-center py-2 bg-emerald-600 text-white font-bold italic rounded-lg">
                            <Plus size={16} className="mr-2" /> Create New Rule
                        </button>
                        <div className="space-y-2">
                        {rules.map(rule => (
                            <div key={rule.id} onClick={() => setSelectedRule(rule)} 
                                className={`p-3 rounded-lg cursor-pointer ${selectedRule?.id === rule.id ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-100'}`}>
                                <p className="font-bold italic text-gray-900">{rule.name}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    {selectedRule && <RuleEditorForm rule={selectedRule} onSave={handleSave} />}
                </div>
            </div>
        </div>
    );
};

export default AlarmRuleEditorPage;

