# OficiosYa — Arranque MVP esta semana
# Ejecutar desde la carpeta raíz del proyecto

Write-Host "=== OficiosYa MVP Setup ===" -ForegroundColor Green

# 1. Frontend dependencies
Write-Host "`n[1/5] Instalando dependencias frontend..." -ForegroundColor Yellow
Set-Location "C:\Users\grecc\OneDrive\Documentos\OficiosYa - vs code chatgpt editor agent"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR en npm install frontend" -ForegroundColor Red; exit 1 }

# 2. Backend dependencies
Write-Host "`n[2/5] Instalando dependencias backend..." -ForegroundColor Yellow
Set-Location "server-node"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR en npm install backend" -ForegroundColor Red; exit 1 }

# 3. Generar cliente Prisma
Write-Host "`n[3/5] Generando cliente Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR generando Prisma" -ForegroundColor Red; exit 1 }

# 4. Migrar base de datos
Write-Host "`n[4/5] Ejecutando migraciones..." -ForegroundColor Yellow
npx prisma migrate dev --name init_mvp
if ($LASTEXITCODE -ne 0) {
  Write-Host "Migracion fallida. Intentando con db push..." -ForegroundColor Yellow
  npx prisma db push
}

# 5. Instrucciones
Write-Host "`n[5/5] Listo! Para correr:" -ForegroundColor Green
Write-Host ""
Write-Host "  Terminal 1 (Backend):" -ForegroundColor Cyan
Write-Host "  cd 'C:\Users\grecc\OneDrive\Documentos\OficiosYa - vs code chatgpt editor agent\server-node'"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor Cyan
Write-Host "  cd 'C:\Users\grecc\OneDrive\Documentos\OficiosYa - vs code chatgpt editor agent'"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "  Abrir: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: Completar en server-node\.env:" -ForegroundColor Yellow
Write-Host "  MP_ACCESS_TOKEN=TEST-xxxx  (credenciales de prueba MercadoPago)"
Write-Host "  MP_PUBLIC_KEY=TEST-xxxx"
