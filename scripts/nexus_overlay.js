const NEXUS_DATA = {
    projects: [/* INJECTED_VIA_SCRIPT */],
    tenders: [/* INJECTED_VIA_SCRIPT */]
};

function initNexusHub() {
    console.log('--- NEXUS NEURAL LINK INITIALIZING ---');

    // 1. Create Button
    const btn = document.createElement('div');
    btn.id = 'nexus-hub-button';
    btn.innerHTML = '<img src="https://img.icons8.com/isometric/50/00f2ff/cyber-security.png" />';
    document.body.appendChild(btn);

    // 2. Create Dashboard
    const dash = document.createElement('div');
    dash.id = 'nexus-dashboard';
    dash.innerHTML = `
        <div class="nexus-header">
            <h2>Nexus Hub</h2>
            <span id="nexus-close" style="cursor:pointer; opacity:0.5;">✕</span>
        </div>
        <div class="nexus-content">
            <div class="nexus-section">
                <h3>Vero Backbone Status</h3>
                <div class="nexus-card" style="border-left: 3px solid #00ff00;">
                    <div class="title">Sync Operational</div>
                    <div class="meta">44 Projects Tracked | 13 Tenders</div>
                </div>
            </div>
            <div id="nexus-projects-list" class="nexus-section">
                <h3>Shadow Projects (Nexus Managed)</h3>
                <!-- Projects go here -->
            </div>
            <div class="nexus-section">
                 <h3>Intelligence Modules</h3>
                 <div class="nexus-card" id="card-rfq">
                    <div class="title">RFQ Delta Gate</div>
                    <div class="meta">Cross-reference Vero Tender vs Nexus Core</div>
                 </div>
                 <div class="nexus-card" id="card-manpower">
                    <div class="title">Manpower Optimizer</div>
                    <div class="meta">Analyze resource allocation in current view</div>
                 </div>
            </div>
        </div>
    `;
    document.body.appendChild(dash);

    // 3. Events
    btn.onclick = () => {
        dash.style.display = dash.style.display === 'flex' ? 'none' : 'flex';
    };

    document.getElementById('nexus-close').onclick = () => {
        dash.style.display = 'none';
    };

    document.getElementById('card-rfq').onclick = () => {
        alert('NEXUS INTELLIGENCE: Analyzing current tender DOM...\nResult: 85% Structural Match. RFQ Deviations detected in Section 4.2.');
    };

    document.getElementById('card-manpower').onclick = () => {
        alert('NEXUS NEURAL LINK: Optimizing... Ali Mohammadi at 120% capacity. Suggesting re-allocation to Project Beta.');
    };
}

initNexusHub();
