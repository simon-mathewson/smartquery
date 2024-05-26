mv dist dist-raw
mkdir dist

# Copy all files ending in .exe, .dmg, .rpm, .deb to new build directory
find dist-raw -type f \( -name "dabase-link_*.exe" -o -name "dabase-link_*.dmg" -o -name "dabase-link_*.rpm" -o -name "dabase-link_*.deb" \) -exec cp {} dist \;

# Remove the dist-raw directory
rm -rf dist-raw
