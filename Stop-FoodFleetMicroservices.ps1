$ErrorActionPreference = "SilentlyContinue"

$ports = @(5001, 5002, 5003, 5004, 5005, 5006, 5134)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($pid in $connections) {
        if ($pid -and $pid -ne 0) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process $pid on port $port."
        }
    }
}

Write-Host "Done."
