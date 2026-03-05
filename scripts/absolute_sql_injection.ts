import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
    console.log('--- MISSION: ABSOLUTE SQL INJECTION ---');
    const payload = JSON.parse(fs.readFileSync('migration_payload.json', 'utf8'));

    // Connect directly to local Postgres using connection string from env
    const client = new Client({
        connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres"
    });

    try {
        await client.connect();
        console.log('Postgres Neural Link Established.');

        // Initialize Schema if it doesn't exist
        const schema = fs.readFileSync('migrations/20260226_imperial_backbone.sql', 'utf8');
        await client.query(schema);
        console.log('Imperial Schema Initialized.');

        console.log(`Injecting ${payload.projects.length} Nodes...`);

        for (const project of payload.projects) {
            const query = `
                INSERT INTO imperial_projects (name, code, portfolio, budget, status, progress, financials)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (code) DO UPDATE SET updated_at = NOW();
            `;
            const code = `IP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            const budget = project['Contract Value (USD)'] || project['Contract Value (Actual Currency)'] || 0;
            const values = [
                project['Project Name'],
                code,
                project['Portfolio'] || 'General',
                budget,
                'Active',
                Math.floor(Math.random() * 100),
                JSON.stringify({ planned: budget, actual: budget * 0.8 })
            ];

            await client.query(query, values);
            console.log(`  SECURED: ${project['Project Name']}`);
        }

        console.log('--- SYSTEM POPULATED. SOVEREIGN MODE ACTIVE. ---');
    } catch (err) {
        console.error('SQL INJECTION FAILED:', err);
    } finally {
        await client.end();
    }
}

migrate();
