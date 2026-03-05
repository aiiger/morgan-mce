$base = "c:\Users\t1glish\Downloads\nexus-construct-erp (2)"
Set-Location $base

$targetFiles = @(
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

function Fix-Residuals($filePath) {
    if (-not (Test-Path $filePath)) { return "MISSING" }
    $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    $orig = $content

    # neon-cyan border variants
    $content = $content -replace 'border-neon-cyan/10', 'border-blue-100'
    $content = $content -replace 'border-neon-cyan/20', 'border-blue-200'
    $content = $content -replace 'border-neon-cyan/30', 'border-blue-200'
    $content = $content -replace 'border-neon-cyan/40', 'border-blue-300'
    $content = $content -replace 'border-neon-cyan/50', 'border-blue-300'
    $content = $content -replace 'hover:border-neon-cyan/40', 'hover:border-blue-400'
    $content = $content -replace 'hover:border-neon-cyan/[0-9]+', 'hover:border-blue-300'
    $content = $content -replace 'border-neon-cyan\b', 'border-blue-400'

    # neon-cyan gradient stops (gradient-to-r/tr etc.)
    $content = $content -replace 'from-neon-cyan/[0-9]+', 'from-blue-50'
    $content = $content -replace 'via-neon-cyan/[0-9]+', 'via-blue-50'
    $content = $content -replace 'to-neon-cyan/[0-9]+', 'to-blue-50'
    $content = $content -replace 'from-neon-cyan\b', 'from-blue-400'
    $content = $content -replace 'via-neon-cyan\b', 'via-blue-400'
    $content = $content -replace 'to-neon-cyan\b', 'to-blue-400'

    # neon-cyan opacity backgrounds
    $content = $content -replace 'bg-neon-cyan/[0-9]+', 'bg-blue-600/10'
    $content = $content -replace 'bg-blue-600/10\b', 'bg-blue-50'

    # CSS var(--neon-cyan) in inline styles / SVG
    $content = $content -replace "var\(--neon-cyan\)", '#3B82F6'
    # 'var(--neon-cyan)' string literals in JSX
    $content = $content -replace "'var\(--neon-cyan\)'", "'#3B82F6'"
    # fill: '#00ffff' etc
    $content = $content -replace "#00ffff", '#3B82F6'
    $content = $content -replace "#00FFFF", '#3B82F6'

    # shadow neon-cyan glow inline styles
    $content = $content -replace 'shadow-\[0_0_[0-9]+px_rgba\(0,255,255,[0-9.]+\)\]', 'shadow-sm'
    $content = $content -replace 'shadow-\[0_0_[0-9]+px_#00ffff[^]]*\]', 'shadow-sm'
    $content = $content -replace 'shadow-neon-cyan', 'shadow-blue-200'

    # stroke/fill neon-cyan in SVG attributes (JSX)
    $content = $content -replace 'stroke="var\(--neon-cyan\)"', 'stroke="#3B82F6"'
    $content = $content -replace "stroke: 'var\(--neon-cyan\)'", "stroke: '#3B82F6'"
    $content = $content -replace "fill: 'var\(--neon-cyan\)'", "fill: '#3B82F6'"
    $content = $content -replace 'stopColor="var\(--neon-cyan\)"', 'stopColor="#3B82F6"'
    $content = $content -replace "stopColor='var\(--neon-cyan\)'", "stopColor='#3B82F6'"

    # Remaining bare neon-cyan (catch-all)
    $content = $content -replace '(?<![\w-])neon-cyan\b', 'blue-600'

    # text-white that remained (followed by space or quote)
    $content = $content -replace 'text-white(?=[ "`])', 'text-gray-900'
    # hover:text-white
    $content = $content -replace 'hover:text-white(?=[ "`])', 'hover:text-gray-900'

    if ($content -ne $orig) {
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        return "UPDATED"
    }
    return "NO_CHANGE"
}

$updated = 0
foreach ($f in $targetFiles) {
    $result = Fix-Residuals (Join-Path $base $f)
    Write-Output "${result}: $f"
    if ($result -eq "UPDATED") { $updated++ }
}
Write-Output ""
Write-Output "Second pass updated: $updated files"
