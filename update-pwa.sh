#!/bin/bash

# List of all HTML files
files=$(find . -maxdepth 1 -name "*.html" ! -name "index.html")

for file in $files; do
    # Skip if it's index.html
    if [ "$file" = "./index.html" ]; then
        continue
    fi
    
    # Add PWA meta tags to each file
    sed -i '' '/<meta name="viewport"/c\
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\
    <link rel="manifest" href="/manifest.json">\
    <meta name="theme-color" content="#000000">\
    <meta name="apple-mobile-web-app-capable" content="yes">\
    <meta name="apple-mobile-web-app-status-bar-style" content="black">\
    <meta name="apple-mobile-web-app-title" content="Clownades">\
    <link rel="apple-touch-icon" href="/icons/icon-152x152.png">' "$file"
    
    # Add service worker registration before </body>
    sed -i '' '/<\/body>/i\
    <script>\
        if ("serviceWorker" in navigator) {\
            window.addEventListener("load", () => {\
                navigator.serviceWorker.register("/service-worker.js")\
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
done

echo "All HTML files have been updated with PWA meta tags and service worker registration." 