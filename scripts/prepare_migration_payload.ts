import fs from 'fs';
import path from 'path';

const tendersPath = 'c:/Users/t1glish/Downloads/nexus-construct-erp (2)/data_exports/mapped_tenders.json';
const projectsPath = 'c:/Users/t1glish/Downloads/nexus-construct-erp (2)/data_exports/projects_sheet1.csv';

function csvToJSON(csv: string) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[1].split(',');

    for (let i = 2; i < lines.length; i++) {
        if (!lines[i].trim() || lines[i].startsWith('ONGOING') || lines[i].startsWith('RECENTLY') || lines[i].startsWith('UPCOMING')) continue;

        const obj: any = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j]?.trim();
        }
        result.push(obj);
    }
    return result;
}

async function prepareMigration() {
    console.log('--- PREPARING MIGRATION PAYLOAD ---');

    // Load Tenders
    const tenders = JSON.parse(fs.readFileSync(tendersPath, 'utf8'));
    console.log(`Loaded ${tenders.length} tenders`);

    // Load Projects
    const projectsCsv = fs.readFileSync(projectsPath, 'utf8');
    const projects = csvToJSON(projectsCsv);
    console.log(`Loaded ${projects.length} projects`);

    const payload = {
        tenders,
        projects: projects.filter(p => p['Project Name'] && p['Client Name']) // Clean up empty rows
    };

    fs.writeFileSync('migration_payload.json', JSON.stringify(payload, null, 2));
    console.log('Migration payload saved to migration_payload.json');
}

prepareMigration();
