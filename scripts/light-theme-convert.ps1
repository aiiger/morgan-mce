param([string[]]$Files)

$base = "c:\Users\t1glish\Downloads\nexus-construct-erp (2)"

function Convert-File($filePath) {
    if (-not (Test-Path $filePath)) { Write-Host "MISSING: $filePath"; return }
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    $orig = $content

    # === MODAL OVERLAYS ===
    $content = $content -replace 'bg-black/95 backdrop-blur-xl', 'bg-black/30 backdrop-blur-sm'
    $content = $content -replace 'bg-black/90 backdrop-blur-sm', 'bg-black/30 backdrop-blur-sm'
    $content = $content -replace 'bg-black/80 backdrop-blur-xl', 'bg-black/30 backdrop-blur-sm'
    $content = $content -replace 'bg-black/80 backdrop-blur-sm', 'bg-black/30 backdrop-blur-sm'
    $content = $content -replace 'bg-black/80', 'bg-black/30 backdrop-blur-sm'

    # === BG OPACITY VARIANTS ===
    $content = $content -replace 'bg-black/60', 'bg-gray-50'
    $content = $content -replace 'bg-black/40', 'bg-gray-50'
    $content = $content -replace 'bg-black/20', 'bg-white'
    $content = $content -replace 'bg-black/5', 'bg-gray-50'

    # === ZINC BACKGROUNDS (specific first) ===
    $content = $content -replace 'bg-zinc-950/50', 'bg-gray-50'
    $content = $content -replace 'bg-zinc-950/40', 'bg-gray-50'
    $content = $content -replace 'bg-zinc-950', 'bg-gray-50'
    $content = $content -replace 'bg-zinc-900/50', 'bg-gray-50'
    $content = $content -replace 'bg-zinc-900/40', 'bg-gray-50'
    $content = $content -replace 'bg-zinc-900/30', 'bg-gray-50'
    $content = $content -replace 'bg-zinc-900/10', 'bg-gray-50'
    $content = $content -replace 'bg-zinc-900', 'bg-gray-100'
    $content = $content -replace 'bg-zinc-800', 'bg-gray-100'
    $content = $content -replace 'bg-zinc-700', 'bg-gray-200'

    # === OTHER DARK BACKGROUNDS ===
    $content = $content -replace 'bg-\[#0a0a0a\]', 'bg-white'
    $content = $content -replace 'bg-slate-900', 'bg-white'
    $content = $content -replace 'bg-glass-subtle', 'bg-gray-50/80'
    # bg-glass (not followed by -card or other suffixes from another class)
    $content = $content -replace 'bg-glass\b', 'bg-white'
    # bare bg-black (not bg-black/N)
    $content = $content -replace 'bg-black(?=[ "''`\)])', 'bg-white'

    # === BORDERS ===
    $content = $content -replace 'border-white/5', 'border-gray-200'
    $content = $content -replace 'border-white/10', 'border-gray-200'
    $content = $content -replace 'border-white/20', 'border-gray-200'
    $content = $content -replace 'border-glass\b', 'border-gray-200'
    $content = $content -replace 'border-zinc-900', 'border-gray-200'
    $content = $content -replace 'border-zinc-800', 'border-gray-200'
    $content = $content -replace 'border-zinc-700', 'border-gray-200'

    # === TEXT COLORS ===
    $content = $content -replace 'text-white/40', 'text-gray-400'
    $content = $content -replace 'text-white/50', 'text-gray-400'
    $content = $content -replace 'text-white/60', 'text-gray-500'
    # text-white (standalone – replace space-bounded, quote-bounded occurrences)
    $content = $content -replace 'text-white(?=[ "''`\)])', 'text-gray-900'
    $content = $content -replace 'text-zinc-200', 'text-gray-700'
    $content = $content -replace 'text-zinc-300', 'text-gray-700'
    $content = $content -replace 'text-zinc-400', 'text-gray-500'
    $content = $content -replace 'text-zinc-500', 'text-gray-500'
    $content = $content -replace 'text-zinc-600', 'text-gray-500'
    $content = $content -replace '(?<![a-zA-Z-])text-neon-cyan(?![a-zA-Z-])', 'text-blue-600'
    $content = $content -replace '(?<![a-zA-Z-])text-cyan-400(?![a-zA-Z-])', 'text-blue-600'

    # === CYAN/NEON BACKGROUNDS ===
    $content = $content -replace '(?<![a-zA-Z-])bg-neon-cyan(?![a-zA-Z-])', 'bg-blue-600'
    $content = $content -replace 'bg-cyan-400', 'bg-blue-600'
    $content = $content -replace 'bg-cyan-500', 'bg-blue-600'

    # === HOVER STATES ===
    $content = $content -replace 'hover:bg-white/5\b', 'hover:bg-gray-50'
    $content = $content -replace 'hover:bg-white/8\b', 'hover:bg-gray-50'
    $content = $content -replace 'hover:bg-white/10\b', 'hover:bg-gray-50'
    $content = $content -replace 'hover:bg-glass\b', 'hover:bg-gray-50'
    $content = $content -replace 'hover:bg-zinc-800', 'hover:bg-gray-100'
    $content = $content -replace 'hover:bg-zinc-900', 'hover:bg-gray-100'
    $content = $content -replace 'hover:border-zinc-700', 'hover:border-gray-300'
    $content = $content -replace 'hover:text-white(?=[ "''`\)])', 'hover:text-gray-900'

    # === DIVIDE ===
    $content = $content -replace 'divide-zinc-900', 'divide-gray-100'
    $content = $content -replace 'divide-zinc-800', 'divide-gray-200'

    # === CSS VAR SURFACES (cards/panels) ===
    $content = $content -replace 'bg-\[var\(--surface-base\)\]', 'bg-white'

    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        return "UPDATED"
    }
    return "NO_CHANGE"
}

$allFiles = @(
    "components\tenders\TenderKanban.tsx",
    "components\tenders\TenderIntakeWizard.tsx",
    "components\tenders\TenderDetail.tsx",
    "components\tenders\TenderChecklistTracker.tsx",
    "components\tenders\RequirementsChecklist.tsx",
    "components\tenders\CommsLog.tsx",
    "components\tasks\TasksDashboard.tsx",
    "components\tasks\TaskModal.tsx",
    "components\tasks\TaskKanbanView.tsx",
    "components\tasks\TaskCategoriesView.tsx",
    "components\tasks\CategoryModal.tsx",
    "components\tasks\TaskListView.tsx",
    "components\projects\ProjectDetail.tsx",
    "components\projects\ProjectPulse.tsx",
    "components\projects\FinancialSummary.tsx",
    "components\projects\RiskPulse.tsx",
    "components\projects\DriftBadge.tsx",
    "components\ui\Typography.tsx",
    "components\ui\Button.tsx",
    "components\ui\Card.tsx",
    "components\ui\GlassButton.tsx",
    "components\ui\GlassPanel.tsx",
    "components\ui\GlassInput.tsx",
    "components\ui\EmptyState.tsx",
    "components\ui\ErrorBoundary.tsx",
    "components\ui\LaserProgress.tsx",
    "components\ui\FinancialMetricCard.tsx",
    "components\ui\MetricDisplay.tsx",
    "components\ui\Toast.tsx",
    "components\ui\StatusBadge.tsx",
    "components\ui\Skeleton.tsx",
    "components\ui\PageHeader.tsx",
    "components\forms\ProjectWizard.tsx",
    "components\StyleTuner.tsx",
    "components\ChatWidget.tsx",
    "components\ChatAssistant.tsx",
    "components\ai\NexusCopilot.tsx",
    "components\settings\TeamManagement.tsx",
    "components\settings\AlarmSettingsPanel.tsx",
    "components\resources\ManpowerImporter.tsx",
    "components\resources\UtilizationChart.tsx",
    "components\resources\ResourceGrid.tsx",
    "components\resources\AllocationPanel.tsx",
    "components\documents\DeltaGateAlert.tsx",
    "components\admin\DocumentSyncPanel.tsx",
    "components\governance\DashboardFrame.tsx",
    "components\notifications\NotificationBell.tsx",
    "components\primitives\Card.tsx"
)

$updated = 0
$unchanged = 0
foreach ($f in $allFiles) {
    $fullPath = Join-Path $base $f
    $result = Convert-File $fullPath
    Write-Output "${result}: $f"
    if ($result -eq "UPDATED") { $updated++ } else { $unchanged++ }
}

Write-Output ""
Write-Output "=== SUMMARY ==="
Write-Output "Updated  : $updated"
Write-Output "Unchanged: $unchanged"
