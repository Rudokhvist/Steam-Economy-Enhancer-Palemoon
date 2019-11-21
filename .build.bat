@echo off
rmdir /q /s out
mkdir out
"C:\Program Files\Git\bin\bash.exe" .getscripts.sh
7z a -tzip -r out\SteamEconomyEnhancer.xpi * -x!.* -x!out
rmdir /q /s content\scripts
