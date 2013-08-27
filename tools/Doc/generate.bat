@echo off
cd ..\..\lib
yuidoc . --exclude automtn.min.js --outdir ..\doc\api
pause
exit