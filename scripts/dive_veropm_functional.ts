import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('--- VERO PM PROJECTS & TENDERS DEEP DIVE START ---');
    try {
        const browser = await chromium.connectOverCDP('http://localhost:9222');
        const contexts = browser.contexts();
        let page = null;
        for (const context of contexts) {
            page = context.pages().find(p => p.url().includes('veropm.app'));
            if (page) break;
        }

        if (!page) {
            console.error('ERROR: No VeroPM tab found.');
            process.exit(1);
        }

        const artifactDir = 'C:/Users/t1glish/.gemini/antigravity/brain/b62ea85e-30c1-4c5f-a954-a6afe42a57a6';
        const projectData = {
            projects: {},
            proposals: {}
        };

        // 1. Projects Section
        console.log('Navigating to Projects...');
        const projectsLink = page.getByRole('link', { name: /projects/i }).first();
        if (await projectsLink.isVisible()) {
            await projectsLink.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_projects_list.png') });

            // Extract Project List structure
            projectData.projects.listColumns = await page.evaluate(() => {
                const headers = Array.from(document.querySelectorAll('th, .table-header, [role="columnheader"]'));
                return headers.map(h => h.innerText.trim()).filter(Boolean);
            });
            console.log('Project List Columns:', projectData.projects.listColumns);

            // Navigate to a sample project (if exists)
            const firstProject = page.locator('td, .table-cell').first();
            if (await firstProject.isVisible()) {
                await firstProject.click();
                await page.waitForTimeout(3000);
                await page.screenshot({ path: path.join(artifactDir, 'veropm_project_detail.png') });

                // Extract Detail Fields
                projectData.projects.detailFields = await page.evaluate(() => {
                    const labels = Array.from(document.querySelectorAll('label, .field-label, dt'));
                    return labels.map(l => l.innerText.trim()).filter(Boolean);
                });
                console.log('Project Detail Fields:', projectData.projects.detailFields);
            }
        }

        // 2. Proposal Pipeline (Tenders)
        console.log('Navigating to Proposal Pipeline...');
        const proposalsLink = page.getByRole('link', { name: /proposal pipeline/i }).first();
        if (await proposalsLink.isVisible()) {
            await proposalsLink.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(artifactDir, 'veropm_proposals_kanban.png') });

            // Extract Pipeline Stages
            projectData.proposals.stages = await page.evaluate(() => {
                const stages = Array.from(document.querySelectorAll('.kanban-column-header, h3, .stage-title'));
                return stages.map(s => s.innerText.trim()).filter(Boolean);
            });
            console.log('Proposal Stages:', projectData.proposals.stages);

            // Extract Proposal Fields from a card (if exists)
            const firstProposal = page.locator('.kanban-card, .proposal-card').first();
            if (await firstProposal.isVisible()) {
                await firstProposal.click();
                await page.waitForTimeout(3000);
                await page.screenshot({ path: path.join(artifactDir, 'veropm_proposal_detail.png') });

                projectData.proposals.detailFields = await page.evaluate(() => {
                    const labels = Array.from(document.querySelectorAll('label, .field-label, dt'));
                    return labels.map(l => l.innerText.trim()).filter(Boolean);
                });
                console.log('Proposal Detail Fields:', projectData.proposals.detailFields);
            }
        }

        fs.writeFileSync(path.join(artifactDir, 'veropm_functional_map_v2.json'), JSON.stringify(projectData, null, 2));
        console.log('Functional Map saved.');

        await browser.close();
    } catch (err) {
        console.error('FATAL ERROR:', err);
    }
}

main();
