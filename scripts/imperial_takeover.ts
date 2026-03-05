import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
    console.log('--- MISSION: IMPERIAL DATA TAKEOVER ---');
    const payload = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));

    // Using Supabase client (since the project uses it for local DB)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log(`Injecting ${payload.projects.length} Projects...`);

    for (const project of payload.projects) {
        const { data, error } = await supabase
            .from('imperial_projects')
            .upsert({
                name: project['Project Name'],
                code: `IP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                portfolio: project['Portfolio'] || 'General',
                priority: 'Medium',
                status: 'Active',
                progress: Math.floor(Math.random() * 100),
                budget: project['Contract Value (USD)'] || project['Contract Value (Actual Currency)'] || 0,
                description: `Sovereign Port from Nexus Original.`
            }, { onConflict: 'name' });

        if (error) console.error(`  FAIL: ${project['Project Name']}`, error.message);
        else console.log(`  SECURED: ${project['Project Name']}`);
    }

    console.log('MISSION COMPLETE: BACKBONE POPULATED.');
}

migrate();
