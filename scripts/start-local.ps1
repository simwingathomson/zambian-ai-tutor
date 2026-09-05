$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

$envFile = Join-Path $frontend ".env.local"
"NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000" | Set-Content -LiteralPath $envFile -NoNewline

Write-Host "Starting Zambian AI Tutor backend on http://127.0.0.1:8000"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
)

Write-Host "Starting Zambian AI Tutor frontend on http://localhost:3000"
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontend'; npm run dev"
)

Write-Host ""
Write-Host "Open http://localhost:3000/login after both terminals show ready."
