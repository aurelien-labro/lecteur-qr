# Ouvre SoWeSign dans le profil de navigateur d'un compte (lien lqr://open?b=...&p=...&u=... envoyé par le Lecteur QR).
# Il ne lit ni cookies ni mots de passe : il lance seulement le navigateur sur le bon profil, qui est déjà connecté.
# Tout ce qui arrive est traité comme non fiable : un seul argument, un navigateur de la liste, un profil qui existe déjà
# et une adresse app.sowesign.com. Le reste est refusé.
$dry = [bool]$env:LQR_DRYRUN

function Fail($msg) {
  if ($dry) { Write-Output "REFUSE: $msg"; exit 1 }
  Add-Type -AssemblyName System.Windows.Forms
  [void][System.Windows.Forms.MessageBox]::Show($msg, "Lecteur QR", "OK", "Warning")
  exit 1
}

if ($args.Count -ne 1) { Fail "Appel refusé (arguments inattendus)." }
$m = [regex]::Match([string]$args[0], '^lqr://open/?\?b=(chrome|edge|brave)&p=([A-Za-z0-9%_-]{1,60})&u=([A-Za-z0-9%._~!*()''-]{1,600})$')
if (-not $m.Success) { Fail "Appel refusé (lien invalide)." }

$b = $m.Groups[1].Value
$p = [uri]::UnescapeDataString($m.Groups[2].Value)
$url = [uri]::UnescapeDataString($m.Groups[3].Value)
if ($p -notmatch '^[A-Za-z0-9 _-]{1,40}$') { Fail "Nom de profil invalide." }
if ($url -notmatch '^https://app\.sowesign\.com(/[A-Za-z0-9/._~:?#=&%+@!$*(),;-]*)?$') { Fail "Adresse refusée : seul app.sowesign.com est autorisé." }

$local = $env:LOCALAPPDATA; $pf = $env:ProgramFiles; $pf86 = ${env:ProgramFiles(x86)}
$app = @{
  chrome = @{ exe = @("$pf\Google\Chrome\Application\chrome.exe", "$pf86\Google\Chrome\Application\chrome.exe", "$local\Google\Chrome\Application\chrome.exe"); data = "$local\Google\Chrome\User Data" }
  edge   = @{ exe = @("$pf86\Microsoft\Edge\Application\msedge.exe", "$pf\Microsoft\Edge\Application\msedge.exe"); data = "$local\Microsoft\Edge\User Data" }
  brave  = @{ exe = @("$pf\BraveSoftware\Brave-Browser\Application\brave.exe", "$pf86\BraveSoftware\Brave-Browser\Application\brave.exe", "$local\BraveSoftware\Brave-Browser\Application\brave.exe"); data = "$local\BraveSoftware\Brave-Browser\User Data" }
}[$b]

$exe = $app.exe | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
if (-not $exe) { Fail "Navigateur introuvable ($b)." }
# Un profil inconnu serait créé vide par le navigateur : on refuse plutôt que d'en fabriquer un
if (-not (Test-Path -LiteralPath (Join-Path $app.data $p))) { Fail "Profil « $p » introuvable dans $b. Lance profils.cmd pour voir les noms." }

$line = '--profile-directory="' + $p + '" "' + $url + '"'
if ($dry) { Write-Output "$exe $line"; exit 0 }
Start-Process -FilePath $exe -ArgumentList $line
