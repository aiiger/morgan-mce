
import React, { useState } from 'react';

import { PageHeader } from '../ui/PageHeader';

const RedactionPage = () => {
    const [inputText, setInputText] = useState('Contact me at test@example.com or 555-123-4567. My ID is 784-1980-1234567-1.');
    const [redactedText, setRedactedText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRedact = async () => {
        setLoading(true);
        const res = await fetch('/api/redact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputText }),
        });
        const data = await res.json();
        setRedactedText(data.redactedText);
        setLoading(false);
    };

    return (
        <div className="page-container space-y-8 pb-32">
            <PageHeader 
                title="Compliance Redaction"
                subtitle="L4 Protocol // Neural Filter"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-bold italic mb-2">Original Text</h3>
                    <textarea 
                        className="w-full h-64 bg-gray-50 border border-gray-200 rounded-md p-4 text-gray-900"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                    />
                </div>
                <div>
                     <h3 className="text-lg font-bold italic mb-2">Redacted Text</h3>
                    <div className="w-full h-64 bg-gray-50 border border-gray-200 rounded-md p-4 text-gray-500">
                        {redactedText}
                    </div>
                </div>
            </div>
            <button 
                onClick={handleRedact}
                disabled={loading}
                className="px-6 py-3 bg-rose-600 text-white font-bold italic rounded-lg disabled:bg-gray-300"
            >
                {loading ? 'Redacting...' : 'Redact Text'}
            </button>
        </div>
    );
};

export default RedactionPage;

