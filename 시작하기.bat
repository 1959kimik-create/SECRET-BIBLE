@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  SECRET BIBLE 앱을 시작합니다...
echo  창이 뜨기까지 30초 정도 걸릴 수 있습니다. 이 창은 닫지 마세요.
echo  맨 위 노란 줄에 「기본 JS」「Electron API」 가 ✓ 이어야 합니다.
echo  다른 Next 서버가 켜져 있으면 먼저 모두 끄고 다시 실행하세요.
echo  (첫 실행은 빌드 때문에 1~2분 걸릴 수 있습니다)
echo  종료할 때: 이 검은 창에서 Ctrl+C 를 누르세요.
echo.
call npm.cmd run electron:app
pause
