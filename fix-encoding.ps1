$dir = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
$replacements = @{
  'sidebar-logo"><div class="logo-icon">[^<]*</div>' = 'sidebar-logo"><div class="logo-icon">&#9830;</div>'
}
Get-ChildItem (Join-Path $dir '*.html') | ForEach-Object {
  $c = [System.IO.File]::ReadAllText($_.FullName)
  if ($c -match 'sidebar-logo') {
    $c = $c -replace '<div class="logo-icon">[^<]+</div>', '<div class="logo-icon">ET</div>'
    $c = $c -replace '<span class="search-icon">[^<]+</span>', '<span class="search-icon">&#128269;</span>'
    $c = $c -replace '(notification-bell[^>]*>\s*<button class="btn btn-secondary btn-icon">)[^<]+(</button>)', '${1}&#128276;${2}'
    $c = $c -replace '(id="theme-cycle"[^>]*>)[^<]+(</button>)', '${1}&#127912;${2}'
    $c = $c -replace '(id="menu-toggle"[^>]*>)[^<]+(</button>)', '${1}&#9776;${2}'
    [System.IO.File]::WriteAllText($_.FullName, $c, $utf8)
  }
}
Write-Host 'Done'
