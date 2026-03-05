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

$checkPattern = "neon-cyan|bg-zinc-[789]|border-white/[125]|text-white(?=[^/])|bg-black(?!/[1-7])|bg-glass\b|bg-slate-9|text-zinc-[2-6]\d{2}|text-zinc-[2-6]00"

$totalHits = 0
foreach ($f in $targetFiles) {
    $fullPath = Join-Path $base $f
    if (-not (Test-Path $fullPath)) { Write-Output "MISSING: $f"; continue }
    $matches = Select-String -Path $fullPath -Pattern $checkPattern -AllMatches
    if ($matches) {
        Write-Output "RESIDUAL: $f"
        $matches | ForEach-Object {
            Write-Output "  L$($_.LineNumber): $($_.Line.Trim().Substring(0,[Math]::Min(100,$_.Line.Trim().Length)))"
        }
        $totalHits += $matches.Count
    }
}

if ($totalHits -eq 0) {
    Write-Output "=== ALL 48 TARGET FILES ARE CLEAN ==="
} else {
    Write-Output "Total residual hits in target files: $totalHits"
}
