
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 NEURAL CLEANSE INITIATED...');

// 1. Kill only Next.js processes for THIS repo
try {
    console.log('💀 Terminating local Next.js zombies...');
    const repo = process.cwd().replace(/\\/g, '\\\\');
    const psCmd = "$repo='" + repo + "'; Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like ('*' + $repo + '*next*') } | ForEach-Object { Write-Host ('   - Killing PID ' + $_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }";

    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command \"${psCmd}\"`, { stdio: 'inherit' });
} catch (e) {
    console.log('   - No local Next.js zombies found (or permission denied).');
}

// 2. Delete .next folder
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
    console.log('🗑️  Dissolving Corrupted Cache (.next)...');
    try {
        fs.rmSync(nextDir, { recursive: true, force: true });
    } catch (e) {
        console.warn('   ! Could not fully delete .next. It might be locked. Continuing...');
    }
}

// 3. Start Dev Server
console.log('🚀 IGNIITING REACTORS...');
try {
    execSync('npm run dev -- -p 3000', { stdio: 'inherit' });
} catch (e) {
    // User cancelled or error
}
