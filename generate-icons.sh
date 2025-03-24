#!/bin/bash

# Create icons directory if it doesn't exist
mkdir -p icons

# Array of required sizes
sizes=(72 96 128 144 152 192 384 512)

# Generate icons for each size
for size in "${sizes[@]}"; do
    convert icons/icon-base.svg -resize ${size}x${size} icons/icon-${size}x${size}.png
done

echo "Icons generated successfully!" 