@echo off
setlocal
cd /d "%~dp0"
python -c "import PyInstaller, webview, tkinter" >nul 2>&1
if errorlevel 1 (
    echo Install build dependencies first: python -m pip install pywebview pyinstaller
    pause
    exit /b 1
)
python -m PyInstaller --noconfirm --onefile --windowed --add-data "index.html;." --add-data "css;css" --add-data "js;js" --add-data "exceljs.min.js;." --add-data "xlsx.full.min.js;." --add-data "icon.ico;." --icon "icon.ico" --name "ONTEK_Orders" --hidden-import=webview --hidden-import=tkinter run.py
if errorlevel 1 (
    echo Build failed. See the error above.
    pause
    exit /b 1
)
echo Build complete: dist\ONTEK_Orders.exe
pause
