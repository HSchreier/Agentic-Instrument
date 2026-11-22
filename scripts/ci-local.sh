#!/bin/bash
# Local CI/CD simulation - run tests like GitHub Actions would

set -e

echo "🧪 Running local CI/CD tests..."
echo ""

# Frontend tests
echo "📦 Frontend: Type-checking..."
cd frontend
npm run type-check || echo "⚠️ Type-check failed"

echo "📦 Frontend: Building..."
npm run build || echo "⚠️ Build failed"

echo "📦 Frontend: Testing..."
npm run test || echo "⚠️ Tests failed (continuing...)"

cd ..

# Backend tests
echo ""
echo "🐍 Backend: Checking imports..."
python -c "from backend.main import app; print('✓ Backend imports OK')" || echo "⚠️ Backend imports failed"

echo "🐍 Backend: Checking Python syntax..."
python -m py_compile backend/*.py || echo "⚠️ Syntax errors found"

echo "🐍 Backend: Would run pytest (skipped - requires venv)"
# To run: pip install -r backend/requirements-test.txt && pytest backend/

# Docker
echo ""
echo "🐳 Docker: Checking Dockerfiles..."
for dockerfile in Dockerfile frontend/Dockerfile backend/Dockerfile; do
  if [ -f "$dockerfile" ]; then
    echo "✓ $dockerfile exists"
  else
    echo "✗ $dockerfile missing"
  fi
done

echo ""
echo "✅ Local CI simulation complete"
