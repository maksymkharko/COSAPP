#!/bin/bash

# Список всех HTML файлов
files=$(find . -name "*.html")

for file in $files; do
    echo "Processing $file..."
    
    # Удаляем дублирующиеся мета-теги если они есть
    sed -i '' '/apple-mobile-web-app-capable/d' "$file"
    sed -i '' '/apple-mobile-web-app-status-bar-style/d' "$file"
    sed -i '' '/apple-mobile-web-app-title/d' "$file"
    sed -i '' '/apple-touch-icon/d' "$file"
    sed -i '' '/manifest.json/d' "$file"
    sed -i '' '/theme-color/d' "$file"
    
    # Добавляем мета-теги после тега head
    sed -i '' '/<head>/a\
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\
    <meta name="apple-mobile-web-app-capable" content="yes">\
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\
    <meta name="apple-mobile-web-app-title" content="Clownades">\
    <link rel="apple-touch-icon" href="icons/icon-152x152.png">\
    <link rel="manifest" href="manifest.json">\
    <meta name="theme-color" content="#000000">' "$file"

    # Удаляем старую регистрацию service worker если она есть
    sed -i '' '/serviceWorker/,/script>/d' "$file"
    
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

    echo "Updated $file"
done

echo "PWA meta tags and service worker registration updated on all HTML files." 