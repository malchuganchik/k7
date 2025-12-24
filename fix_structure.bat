@echo off
echo Moving assets to docs folder...
xcopy /E /I /Y blocks docs\blocks
xcopy /E /I /Y data docs\data
xcopy /E /I /Y img docs\img
xcopy /E /I /Y js docs\js

echo Cleaning up...
rmdir /S /Q blocks
rmdir /S /Q data
rmdir /S /Q img
rmdir /S /Q js

echo Done! Now your site is ready for GitHub Pages (Source: /docs).
pause
