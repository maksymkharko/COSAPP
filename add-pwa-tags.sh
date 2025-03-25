#!/bin/bash

# Список всех HTML файлов
files=$(find . -name "*.html")

for file in $files; do
    # Проверяем, есть ли уже мета-теги
    if ! grep -q "apple-mobile-web-app-capable" "$file"; then
        # Добавляем мета-теги после тега head
        sed -i '' '/<head>/a\
    <meta name="apple-mobile-web-app-capable" content="yes">\
    <meta name="apple-mobile-web-app-status-bar-style" content="black">\
    <meta name="apple-mobile-web-app-title" content="Clownades">\
    <link rel="apple-touch-icon" href="icons/icon-152x152.png">\
    <link rel="manifest" href="manifest.json">\
    <meta name="theme-color" content="#000000">' "$file"
    fi

    # Проверяем, есть ли уже регистрация service worker
    if ! grep -q "serviceWorker" "$file"; then
        # Добавляем регистрацию service worker перед закрывающим тегом body
        sed -i '' '/<\/body>/i\
    <script>\
        if ("serviceWorker" in navigator) {\
            window.addEventListener("load", () => {\
                navigator.serviceWorker.register("service-worker.js")\
                    .then((registration) => {\
                        console.log("ServiceWorker registration successful");\
                    })\
                    .catch((err) => {\
                        console.log("ServiceWorker registration failed: ", err);\
                    });\
            });\
        }\
    </script>\
' "$file"
    fi
done

echo "PWA meta tags and service worker registration added to all HTML files." 