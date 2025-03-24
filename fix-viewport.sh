#!/bin/bash

# List of all HTML files
files=$(find . -name "*.html")

for file in $files; do
    # Fix viewport meta tag
    sed -i '' 's/<meta name="viewport"/<meta name=viewport/g' "$file"
    
    # Fix manifest and icon paths (remove leading slash)
    sed -i '' 's/href="\/manifest/href="manifest/g' "$file"
    sed -i '' 's/href="\/icons/href="icons/g' "$file"
    
    # Fix service worker path
    sed -i '' 's/register("\/service-worker/register("service-worker/g' "$file"
done

echo "All HTML files have been updated with fixed viewport meta tags and paths." 