#!/bin/bash
# Script to replace all hardcoded URLs with API_BASE_URL in JSX files

echo "🔄 Actualizando todas las URLs en archivos JSX..."

# Array de archivos a actualizar
files=(
  "src/pages/Statistics.jsx"
  "src/pages/BookCatalog.jsx"
  "src/pages/UserRegistration.jsx"
  "src/pages/ReceptionDashboard.jsx"
  "src/pages/Librarians.jsx"
  "src/components/RecentActivity.jsx"
  "src/components/Header.jsx"
  "src/components/GlobalSearch.jsx"
  "src/components/ChatWidget.jsx"
  "src/components/UserDetailModal.jsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # First, add import if not present
    if ! grep -q "import.*API_BASE_URL.*from.*config" "$file"; then
      sed -i "1s/^/import { API_BASE_URL } from '..\/..\/config';\n/" "$file"
    fi
    
    # Replace URLs
    sed -i "s|'https://brauni-backend.onrender.com/|'\${API_BASE_URL}/|g" "$file"
    sed -i 's|`https://brauni-backend.onrender.com/|`\${API_BASE_URL}/|g' "$file"
    
    echo "✅ Updated: $file"
  fi
done

echo "✨ ¡Listo! Todas las URLs han sido actualizadas"
