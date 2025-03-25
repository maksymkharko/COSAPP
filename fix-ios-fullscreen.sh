#!/bin/bash

# List of all HTML files
files=$(find . -name "*.html")

for file in $files; do
    # Add iOS specific meta tags if they don't exist
    if ! grep -q "apple-mobile-web-app-capable" "$file"; then
        sed -i '' '/<head>/a\
    <meta name="apple-mobile-web-app-capable" content="yes">\
    <meta name="apple-mobile-web-app-status-bar-style" content="black">\
    <meta name="apple-mobile-web-app-title" content="Clownades">\
    <link rel="apple-touch-icon" href="icons/icon-152x152.png">' "$file"
    fi

    # Fix viewport meta tag
    sed -i '' 's/<meta name="viewport".*>/<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">/' "$file"

    # Remove duplicate meta tags if they exist
    sed -i '' '/<meta name="apple-mobile-web-app-capable"/{
        h
        d
        }
        /apple-mobile-web-app-capable/!{
        x
        /apple-mobile-web-app-capable/{
            x
            d
        }
        x
    }' "$file"

    # Fix manifest path
    sed -i '' 's|href="/manifest.json"|href="manifest.json"|g' "$file"
    
    # Fix service worker path
    sed -i '' 's|register("/service-worker.js"|register("service-worker.js"|g' "$file"
done

echo "All HTML files have been updated with iOS fullscreen support." 