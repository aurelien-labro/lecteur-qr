# Enregistre le lien lqr:// pour l'utilisateur courant (aucun droit administrateur) : le Lecteur QR peut alors
# ouvrir SoWeSign dans le bon profil de navigateur. « installer.cmd desinstaller » retire tout.
param([switch]$Desinstaller)
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$cle = "HKCU:\Software\Classes\lqr"

if ($Desinstaller) {
  Remove-Item -Path $cle -Recurse -Force -ErrorAction SilentlyContinue
  Write-Output "Outil retiré : le lien lqr:// n'est plus enregistré."
  exit 0
}

$script = Join-Path $PSScriptRoot "lqr-launcher.ps1"
if (-not (Test-Path -LiteralPath $script)) { Write-Output "lqr-launcher.ps1 introuvable à côté de ce script."; exit 1 }

New-Item -Path $cle -Force | Out-Null
Set-Item -Path $cle -Value "URL:Lecteur QR"
New-ItemProperty -Path $cle -Name "URL Protocol" -Value "" -Force | Out-Null
New-Item -Path "$cle\shell\open\command" -Force | Out-Null
Set-Item -Path "$cle\shell\open\command" -Value ('powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $script + '" "%1"')

Write-Output "Outil installé. Ne déplace pas ce dossier (sinon relance installer.cmd)."
Write-Output ""
Write-Output "Profils trouvés sur cet ordinateur :"
& (Join-Path $PSScriptRoot "profils.ps1")
