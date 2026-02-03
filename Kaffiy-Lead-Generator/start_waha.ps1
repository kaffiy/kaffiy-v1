# WAHA container'i bot ile ayni API key ile baslatir (401 onlenir).
# kaffiy_bot/.env icindeki WAHA_API_KEY ile AYNI olmali.

$API_KEY = "72c66d88d5ff48e9b9236e5503ef9dbd"

Write-Host "Mevcut kaffiy_waha container durduruluyor (varsa)..." -ForegroundColor Yellow
docker stop kaffiy_waha 2>$null
docker rm kaffiy_waha 2>$null

Write-Host "WAHA baslatiliyor (port 3000, API key ayarli)..." -ForegroundColor Green
docker run -it -p 3000:3000 -e "WAHA_API_KEY=$API_KEY" --name kaffiy_waha devlikeapro/waha
