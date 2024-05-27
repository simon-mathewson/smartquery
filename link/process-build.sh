mv dist dist-raw
mkdir dist

# Copy all files ending in .exe, .dmg, .rpm, .deb to new build directory
find dist-raw -type f \( -name "dabase-link*.exe" -o -name "dabase-link*.dmg" -o -name "dabase-link*.rpm" -o -name "dabase-link*.deb" \) -exec cp {} dist \;

# Remove the dist-raw directory
rm -rf dist-raw
