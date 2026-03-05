import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
    console.log('--- NEXUS DATA EXPORT START ---');

    // Export Tenders
    const { data: tenders, error: tenderError } = await supabase
        .from('tenders')
        .select('*');

    if (tenderError) {
        console.error('Error fetching tenders:', tenderError);
    } else {
        console.log(`Fetched ${tenders?.length} tenders`);
        fs.writeFileSync('tenders_export.json', JSON.stringify(tenders, null, 2));
    }

    // Export Projects
    const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('*');

    if (projectError) {
        console.error('Error fetching projects:', projectError);
    } else {
        console.log(`Fetched ${projects?.length} projects`);
        fs.writeFileSync('projects_export.json', JSON.stringify(projects, null, 2));
    }

    console.log('--- EXPORT COMPLETE ---');
}

exportData();
