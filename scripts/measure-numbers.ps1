# Measures commit counts from the local repos (read-only git) and writes src/data/numbers.json.
# Run on the owner's PC: powershell -File scripts/measure-numbers.ps1
# Fails loudly (non-zero exit, no file written) if any repo or git call is bad.
# The repo paths come from the gitignored scripts/local-paths.json (see local-paths.example.json).
# Counts cover branches, tags and remotes only: --all would also count tool checkpoint refs.
param([hashtable]$Repos = $null)
$ErrorActionPreference = 'Stop'
$inv = [Globalization.CultureInfo]::InvariantCulture
if (-not $Repos) {
  $cfgPath = Join-Path $PSScriptRoot 'local-paths.json'
  if (-not (Test-Path -LiteralPath $cfgPath)) {
    throw "$cfgPath is missing: copy scripts/local-paths.example.json to it and fill in this machine's paths"
  }
  $cfg = Get-Content -LiteralPath $cfgPath -Raw | ConvertFrom-Json
  $Repos = @{}
  foreach ($key in @('v1', 'matrix', 'xchart')) { $Repos[$key] = $cfg.repos.$key }
}
$refs = @('--branches', '--tags', '--remotes')
$today = (Get-Date).Date
$days = 90
$start = $today.AddDays(-($days - 1))
$startStr = $start.ToString('yyyy-MM-dd', $inv)
$out = Join-Path $PSScriptRoot '..\src\data\numbers.json'

function Invoke-Git {
  $r = & git @args
  if ($LASTEXITCODE -ne 0) { throw "git $($args -join ' ') failed with exit code $LASTEXITCODE" }
  return $r
}

$result = [ordered]@{ asOf = $today.ToString('yyyy-MM-dd', $inv); repos = [ordered]@{} }
foreach ($key in @('v1', 'matrix', 'xchart')) {
  $path = $Repos[$key]
  if (-not $path -or -not (Test-Path -LiteralPath $path)) { throw "Repo path for $key is missing: $path" }
  $total = [int](Invoke-Git -C $path rev-list --count @refs)
  $dates = @(Invoke-Git -C $path log @refs --date=short --format=%ad)
  if ($total -le 0 -or $dates.Count -eq 0) { throw "No commits found for $key at $path" }
  $first = ($dates | Sort-Object | Select-Object -First 1)
  $counts = @{}
  foreach ($d in @(Invoke-Git -C $path log @refs "--since=$startStr 00:00" --date=short --format=%ad)) {
    $counts[$d] = 1 + [int]$counts[$d]
  }
  $daily = @()
  for ($i = 0; $i -lt $days; $i++) {
    $daily += [int]$counts[$start.AddDays($i).ToString('yyyy-MM-dd', $inv)]
  }
  $result.repos[$key] = [ordered]@{ total = $total; first = $first; daily = $daily }
}
$json = $result | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText((Join-Path (Resolve-Path (Split-Path $out)).Path 'numbers.json'), $json + "`n", (New-Object Text.UTF8Encoding($false)))
Write-Host "Wrote numbers.json as of $($result.asOf)"
