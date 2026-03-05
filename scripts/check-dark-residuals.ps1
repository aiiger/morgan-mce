$base = "c:\Users\t1glish\Downloads\nexus-construct-erp (2)"
Set-Location $base

$darkPattern = 'bg-black(?!/3\d)|bg-zinc-9|bg-zinc-8|bg-zinc-7|border-white/[125]|bg-glass\b|bg-slate-9|text-neon-cyan|bg-neon-cyan|bg-cyan-[45]|text-cyan-4'

$allFiles = Get-ChildItem -Path "components" -Recurse -Include "*.tsx" | Where-Object { $_.FullName -notmatch "archive" }

$totalResidual = 0
foreach ($f in $allFiles) {
    $matches = Select-String -Path $f.FullName -Pattern $darkPattern -AllMatches
    if ($matches) {
        Write-Host "RESIDUAL: $($f.Name)"
        $matches | Select-Object -First 3 | ForEach-Object { Write-Host "  L$($_.LineNumber): $($_.Line.Trim().Substring(0, [Math]::Min(80, $_.Line.Trim().Length)))" }
        $totalResidual += $matches.Count
    }
}
if ($totalResidual -eq 0) {
    Write-Host "ALL CLEAN - No residual dark patterns found."
} else {
    Write-Host "Total residual hits: $totalResidual"
}
