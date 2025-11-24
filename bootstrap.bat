@echo off
setlocal ENABLEDELAYEDEXPANSION
if "%1"=="" (
  set /p PROJECT_NAME="Nombre del proyecto: "
) else (
  set PROJECT_NAME=%1
)
if "%PROJECT_NAME%"=="" set PROJECT_NAME=visiting-world

set ROOT=%PROJECT_NAME%

echo Creando estructura para %ROOT%
mkdir %ROOT%\pages %ROOT%\assets\css %ROOT%\assets\js %ROOT%\assets\data %ROOT%\assets\img\places %ROOT%\assets\img\promotions %ROOT%\assets\img\partners %ROOT%\assets\img\ui %ROOT%\assets\video %ROOT%\assets\pdf %ROOT%\components %ROOT%\api 2>nul

for %%F in (index.html sitemap.xml robots.txt favicon.ico README.md package.json .gitignore) do (
  if not exist %ROOT%\%%F type nul > %ROOT%\%%F
)
for %%F in (destinations.html blog.html contact.html reservations.html partners.html about.html destination.html) do (
  if not exist %ROOT%\pages\%%F type nul > %ROOT%\pages\%%F
)
for %%F in (styles.css responsive.css theme.css) do (
  if not exist %ROOT%\assets\css\%%F type nul > %ROOT%\assets\css\%%F
)
for %%F in (main.js chatbot.js email.js whatsapp.js payment.js seo.js) do (
  if not exist %ROOT%\assets\js\%%F type nul > %ROOT%\assets\js\%%F
)
for %%F in (travel-data.json blog-posts.json partners.json) do (
  if not exist %ROOT%\assets\data\%%F type nul > %ROOT%\assets\data\%%F
)
for %%F in (header.html footer.html navbar.html card-destination.html) do (
  if not exist %ROOT%\components\%%F type nul > %ROOT%\components\%%F
)
for %%F in (weTravel.js email-service.js) do (
  if not exist %ROOT%\api\%%F type nul > %ROOT%\api\%%F
)
echo Estructura lista.
