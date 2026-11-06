# Liste les profils de Chrome, Edge et Brave : le « Dossier » est ce qu'il faut indiquer dans le Lecteur QR.
param([string]$Racine = $env:LOCALAPPDATA)
[Console]::OutputEncoding = [Text.Encoding]::UTF8

$sources = @(@("chrome", "Google\Chrome"), @("edge", "Microsoft\Edge"), @("brave", "BraveSoftware\Brave-Browser"))
$lignes = foreach ($s in $sources) {
  $fichier = Join-Path $Racine ($s[1] + "\User Data\Local State")
  if (-not (Test-Path -LiteralPath $fichier)) { continue }
  $cache = (Get-Content -LiteralPath $fichier -Raw -Encoding UTF8 | ConvertFrom-Json).profile.info_cache
  foreach ($prop in $cache.PSObject.Properties) {
    [pscustomobject]@{ Navigateur = $s[0]; Dossier = $prop.Name; Nom = $prop.Value.name }
  }
}
if ($lignes) { $lignes | Format-Table -AutoSize } else { Write-Output "Aucun profil trouvé (Chrome, Edge ou Brave non installé ?)." }
