#!/bin/bash

BLACKLIST=("rm" "php artisan migrate:refresh" "php artisan migrate:fresh" "mysql" "ssh" "shutdown" "reboot" "dd" "mkfs" ":(){ :|:& };:" "halt" "poweroff" "init 0" "init 6" "kill -9")

GITHUB_DIR="$1"

if [ ! -d "$GITHUB_DIR" ]; then
    echo "Error: Directory $GITHUB_DIR does not exist."
    exit 1
fi

PARENT_DIR=$(dirname "$GITHUB_DIR")

echo "Processing files in directory: $GITHUB_DIR and its parent directory: $PARENT_DIR"

# Process files in .github directory
find "$GITHUB_DIR" -type f | while read -r file; do
    echo "Processing file: $file"
    TEMP_FILE=$(mktemp)
    while IFS= read -r line; do
        should_remove_line=false
        for keyword in "${BLACKLIST[@]}"; do
            if [[ $line == *"$keyword"* ]]; then
                echo "Line containing blacklisted keyword '$keyword' found and removed from $file"
                should_remove_line=true
                break
            fi
        done
        if [ "$should_remove_line" = false ]; then
            echo "$line" >> "$TEMP_FILE"
        fi
    done < "$file"
    mv "$TEMP_FILE" "$file"
done

# Process files in the parent directory of .github
find "$PARENT_DIR" -maxdepth 1 -type f | while read -r file; do
    echo "Processing file: $file"
    TEMP_FILE=$(mktemp)
    while IFS= read -r line; do
        should_remove_line=false
        for keyword in "${BLACKLIST[@]}"; do
            if [[ $line == *"$keyword"* ]]; then
                echo "Line containing blacklisted keyword '$keyword' found and removed from $file"
                should_remove_line=true
                break
            fi
        done
        if [ "$should_remove_line" = false ]; then
            echo "$line" >> "$TEMP_FILE"
        fi
    done < "$file"
    mv "$TEMP_FILE" "$file"
done

echo "Processing complete. Lines containing keywords have been removed from all relevant files."
