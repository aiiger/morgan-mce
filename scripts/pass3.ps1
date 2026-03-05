cd "c:\Users\t1glish\Downloads\nexus-construct-erp (2)"
$base = "c:\Users\t1glish\Downloads\nexus-construct-erp (2)"
$files = Get-ChildItem -Path "components" -Include "*.tsx" -Recurse
$updated = 0
foreach ($file in $files) {
  $c = [System.IO.File]::ReadAllText($file.FullName)
  $orig = $c
  $c = $c -replace 'text-zinc-200', 'text-gray-700'
  $c = $c -replace 'text-zinc-300', 'text-gray-600'
  $c = $c -replace 'text-zinc-400', 'text-gray-500'
  $c = $c -replace 'text-zinc-500', 'text-gray-500'
  $c = $c -replace 'text-zinc-600', 'text-gray-500'
  $c = $c -replace 'bg-zinc-500/10', 'bg-gray-100'
  $c = $c -replace 'bg-zinc-500/20', 'bg-gray-200'
  $c = $c -replace 'bg-zinc-500/30', 'bg-gray-200'
  $c = $c -replace 'bg-zinc-500(?![/\d])', 'bg-gray-400'
  $c = $c -replace 'bg-zinc-600(?![/\d])', 'bg-gray-400'
  if ($c -ne $orig) {
    [System.IO.File]::WriteAllText($file.FullName, $c)
    Write-Host "UPDATED: $($file.Name)"
    $updated++
  }
}
Write-Host "Done. $updated files updated."
