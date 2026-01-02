@echo off
title AppTestes - Ambiente DEV

echo ==========================================
echo 🚀 Iniciando AppTestes (DEV)
echo ==========================================

REM ===== VARIÁVEIS DE AMBIENTE =====
set NEXT_PUBLIC_API_URL=https://x8ki-letl-twmt.n7.xano.io/api:8lJ47Z3p
set XANO_API_BASE=https://x8ki-letl-twmt.n7.xano.io/api:8lJ47Z3p

set NEXT_PUBLIC_FASTAPI_URL=https://uncurious-joaquin-multiramose.ngrok-free.dev
set NEXT_PUBLIC_PDF_SERVICE_URL=https://uncurious-joaquin-multiramose.ngrok-free.dev
set STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY%
set STRIPE_WEBHOOK_SECRET=%STRIPE_WEBHOOK_SECRET%
set OPENAI_API_KEY=%OPENAI_API_KEY%

echo ✅ Variáveis de ambiente carregadas
echo.

echo.
echo ✅ Variáveis de ambiente carregadas
echo.

REM ===== FRONTEND (Next.js na RAIZ) =====
echo ▶ Iniciando FRONTEND
start "Frontend" cmd /k "npm run dev -- -p 3080"

timeout /t 2 >nul

REM ===== FASTAPI =====
echo ▶ Iniciando FASTAPI
start "FastAPI" cmd /k "uvicorn main:app --reload --port 8000"

timeout /t 2 >nul

REM ===== PDF SERVICE =====
echo ▶ Iniciando PDF SERVICE
if exist "pdf-service" (
  start "PDF Service" cmd /k "cd /d pdf-service && node index.js"
) else (
  echo ❌ ERRO: pasta pdf-service nao encontrada
)

timeout /t 2 >nul

REM ===== NGROK (expor FastAPI) =====
echo ▶ Iniciando NGROK (porta 3000)
start "Ngrok" cmd /k "ngrok http 3000"

timeout /t 2 >nul


REM ===== STRIPE CLI (WEBHOOK) =====
echo ▶ Iniciando Stripe CLI (webhook)
start "Stripe CLI" cmd /k "stripe listen --forward-to localhost:8000/v1/stripe/webhook"

echo.
echo 🎉 TODOS os serviços foram iniciados
echo ==========================================
pause