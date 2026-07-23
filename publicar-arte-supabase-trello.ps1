<#
  publicar-arte-supabase-trello.ps1

  Faz upload das artes geradas (tmp/) para o Supabase e atualiza os cards no
  Trello (attachments + comentário ARTE_GERADA + move para "Aprovar Arte").

  Todas as credenciais vêm do .env — nenhuma chave fica escrita neste arquivo.
  Rode a partir da raiz do projeto: .\publicar-arte-supabase-trello.ps1
#>

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# ── Carrega .env para variáveis de ambiente ──────────────────────────────────
Get-Content ".env" -Encoding UTF8 | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $parts = $_ -split '=', 2
  if ($parts.Count -eq 2) {
    $name  = $parts[0].Trim()
    $value = $parts[1].Trim()
    [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }
}

# ── Trava de licença ──────────────────────────────────────────────────────────
if ($env:LICENSE_KEY -ne 'JMADS') {
  Write-Host "`n🔒 Ferramenta bloqueada. Defina LICENSE_KEY=JMADS no .env.`n"
  exit 1
}

$key            = $env:TRELLO_KEY
$token          = $env:TRELLO_TOKEN
$listAprovarArte = $env:TRELLO_LIST_APROVAR_ARTE
$supaUrl        = $env:SUPABASE_URL
$svcKey         = $env:SUPABASE_SERVICE_ROLE
$bucket         = if ($env:SUPABASE_BUCKET) { $env:SUPABASE_BUCKET } else { "criativos" }

if (-not $key -or -not $token -or -not $supaUrl -or -not $svcKey) {
  Write-Host "`n❌ Faltam variáveis no .env (TRELLO_KEY, TRELLO_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE).`n"
  exit 1
}

$cards = Get-Content "cards-aprovados.json" -Raw -Encoding UTF8 | ConvertFrom-Json

# ── 1. Limpa Supabase (arquivos antigos por prefixo) ─────────────────────────
Write-Host "`n[1/3] Limpando Supabase..."
foreach ($c in $cards) {
  $cod = $c.cod
  $listBody = "{`"prefix`":`"$cod`_`",`"limit`":200,`"offset`":0}"
  try {
    $existing = Invoke-RestMethod -Method Post `
      -Uri "$supaUrl/storage/v1/object/list/$bucket" `
      -Body $listBody -ContentType "application/json" `
      -Headers @{ Authorization = "Bearer $svcKey" }
    if ($existing -and $existing.Count -gt 0) {
      $names = $existing | ForEach-Object { $_.name }
      $namesJson = ($names | ForEach-Object { '"' + $_ + '"' }) -join ","
      $deleteBody = "{`"prefixes`":[$namesJson]}"
      Invoke-RestMethod -Method Delete `
        -Uri "$supaUrl/storage/v1/object/$bucket" `
        -Body $deleteBody -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $svcKey" } | Out-Null
      Write-Host "  $cod`: $($names.Count) antigos deletados"
    }
  } catch { Write-Host "  $cod`: limpeza falhou (segue) — $($_.Exception.Message)" }
}

# ── 2. Upload de todos os arquivos ───────────────────────────────────────────
Write-Host "`n[2/3] Upload Supabase..."
$arquivos = Get-ChildItem "tmp" -Recurse -Include *.png,*.mp4
$total = $arquivos.Count
$ok = 0
foreach ($f in $arquivos) {
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $ct = if ($f.Extension -eq '.mp4') { 'video/mp4' } else { 'image/png' }
  try {
    Invoke-RestMethod -Method Post `
      -Uri "$supaUrl/storage/v1/object/$bucket/$($f.Name)" `
      -Body $bytes -ContentType $ct `
      -Headers @{ Authorization = "Bearer $svcKey"; "x-upsert" = "true" } | Out-Null
    $ok++
  } catch { Write-Host "  ! upload falhou: $($f.Name) — $($_.Exception.Message)" }
}
Write-Host "  Uploads OK: $ok / $total"

# ── 3. Para cada card: attachments + comment + move ──────────────────────────
Write-Host "`n[3/3] Atualizando Trello..."
$idx = 0
foreach ($c in $cards) {
  $cod = $c.cod
  $cardId = $c.trelloId
  if (-not $cardId) { Write-Host "  -> [$idx] $cod — sem trelloId, pulando"; $idx++; continue }
  $tipo = if (($idx % 3) -lt 2) { "xpost" } else { "carousel" }
  Write-Host "  -> [$idx] $cod ($tipo)"
  $idx++

  try {
    Invoke-RestMethod -Method Put `
      -Uri "https://api.trello.com/1/cards/$cardId?key=$key&token=$token" `
      -Body "closed=false" -ContentType "application/x-www-form-urlencoded" | Out-Null
  } catch {}

  try {
    $atts = Invoke-RestMethod "https://api.trello.com/1/cards/$cardId/attachments?key=$key&token=$token&fields=id,name"
    foreach ($a in $atts) {
      Invoke-RestMethod -Method Delete `
        -Uri "https://api.trello.com/1/cards/$cardId/attachments/$($a.id)?key=$key&token=$token" | Out-Null
      Start-Sleep -Milliseconds 150
    }
    if ($atts) { Write-Host "     attachments removidos: $($atts.Count)" }
  } catch { Write-Host "     ! delete attachments falhou: $($_.Exception.Message)" }

  try {
    $actions = Invoke-RestMethod "https://api.trello.com/1/cards/$cardId/actions?filter=commentCard&key=$key&token=$token"
    foreach ($a in $actions) {
      if ($a.data.text -and $a.data.text.Contains("ARTE_GERADA")) {
        Invoke-RestMethod -Method Delete `
          -Uri "https://api.trello.com/1/cards/$cardId/actions/$($a.id)/comments?key=$key&token=$token" | Out-Null
        Start-Sleep -Milliseconds 150
      }
    }
  } catch { Write-Host "     ! cleanup comments falhou: $($_.Exception.Message)" }

  $files = Get-ChildItem "tmp" -Recurse -Include "$cod*.png","$cod*.mp4" | Sort-Object Name
  $urls = @()
  foreach ($f in $files) {
    $publicUrl = "$supaUrl/storage/v1/object/public/$bucket/$($f.Name)"
    $body = "url=$([Uri]::EscapeDataString($publicUrl))&name=$([Uri]::EscapeDataString($f.Name))"
    try {
      Invoke-RestMethod -Method Post `
        -Uri "https://api.trello.com/1/cards/$cardId/attachments?key=$key&token=$token" `
        -Body $body -ContentType "application/x-www-form-urlencoded" | Out-Null
      $urls += $publicUrl
    } catch { Write-Host "     ! attach $($f.Name): $($_.Exception.Message)" }
    Start-Sleep -Milliseconds 200
  }
  Write-Host "     arquivos anexados: $($urls.Count)"

  $commentText = "ARTE_GERADA|tipo:$tipo`n" + ($urls -join "`n")
  $cbody = "text=$([Uri]::EscapeDataString($commentText))"
  try {
    Invoke-RestMethod -Method Post `
      -Uri "https://api.trello.com/1/cards/$cardId/actions/comments?key=$key&token=$token" `
      -Body $cbody -ContentType "application/x-www-form-urlencoded" | Out-Null
  } catch { Write-Host "     ! comment ARTE_GERADA: $($_.Exception.Message)" }

  if ($listAprovarArte) {
    try {
      Invoke-RestMethod -Method Put `
        -Uri "https://api.trello.com/1/cards/$cardId?key=$key&token=$token" `
        -Body (ConvertTo-Json @{ idList = $listAprovarArte }) `
        -ContentType "application/json" | Out-Null
    } catch { Write-Host "     ! move: $($_.Exception.Message)" }
  }
}

Write-Host "`n[DONE] $($cards.Count) cards processados."
