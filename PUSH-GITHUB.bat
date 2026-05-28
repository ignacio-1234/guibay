@echo off
setlocal
echo.
echo  Subiendo proyecto a GitHub...
echo.

cd /d "%~dp0"

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin https://github.com/ignacio-1234/guibay.git
)

git branch -M main
echo  [1/3] Preparando cambios

git add .
git diff --cached --quiet
if %errorlevel%==0 (
  echo  No hay cambios nuevos para commitear
) else (
  git commit -m "chore: actualizar proyecto"
)

echo  [2/3] Subiendo a GitHub
git push -u origin main

echo.
echo  [3/3] Listo: https://github.com/ignacio-1234/guibay
echo.
pause
