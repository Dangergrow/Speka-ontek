@echo off
setlocal
cd /d "%~dp0"
if not exist "dist\ONTEK_Orders.exe" (
    echo Run build.bat first.
    pause
    exit /b 1
)
python -m PyInstaller --noconfirm --onefile --windowed --add-data "dist\ONTEK_Orders.exe;." --add-data "index.html;." --add-data "css;css" --add-data "js;js" --add-data "exceljs.min.js;." --add-data "xlsx.full.min.js;." --add-data "icon.ico;." --icon "icon.ico" --name "ONTEK_Setup" --hidden-import=tkinter installer.py
if errorlevel 1 (
    echo Installer build failed. See the error above.
    pause
    exit /b 1
)
echo Build complete: dist\ONTEK_Setup.exe
pause
