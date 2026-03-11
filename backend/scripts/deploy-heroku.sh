#!/bin/bash
# ============================================================
# Heroku Deployment Script — Skill Training ERP Backend
# ============================================================
# Usage: bash scripts/deploy-heroku.sh [app-name]
# Example: bash scripts/deploy-heroku.sh skill-erp-api
# ============================================================

set -e

APP_NAME=${1:-"skill-erp-api-$(date +%s)"}
REGION="us"

echo ""
echo "=========================================="
echo "  Skill Training ERP — Heroku Deployment"
echo "=========================================="
echo ""

# ---- 1. Check Prerequisites ----
echo "🔍 Checking prerequisites..."
command -v heroku >/dev/null 2>&1 || { echo "❌ Heroku CLI not found. Install: https://devcenter.heroku.com/articles/heroku-cli"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git not found. Install git first."; exit 1; }

echo "✅ Heroku CLI found: $(heroku --version)"
echo "✅ Git found: $(git --version)"

# ---- 2. Heroku Login ----
echo ""
echo "🔐 Checking Heroku login..."
if ! heroku auth:whoami >/dev/null 2>&1; then
  echo "   Please log in to Heroku:"
  heroku login
fi
echo "✅ Logged in as: $(heroku auth:whoami)"

# ---- 3. Initialize Git (if needed) ----
cd "$(dirname "$0")/.."

if [ ! -d ".git" ]; then
  echo ""
  echo "📦 Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit: Skill Training ERP Backend"
  echo "✅ Git initialized"
else
  echo ""
  echo "📦 Staging all files..."
  git add .
  if git diff --cached --quiet; then
    echo "   No new changes to commit"
  else
    git commit -m "Heroku deployment: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "✅ Changes committed"
  fi
fi

# ---- 4. Create Heroku App ----
echo ""
echo "🚀 Creating Heroku app: $APP_NAME"
if heroku apps:info --app "$APP_NAME" >/dev/null 2>&1; then
  echo "   App '$APP_NAME' already exists, using it."
else
  heroku create "$APP_NAME" --region "$REGION"
  echo "✅ App created: https://$APP_NAME.herokuapp.com"
fi

# ---- 5. Add Heroku Postgres ----
echo ""
echo "🗄️  Adding Heroku Postgres (essential-0)..."
if heroku addons:info heroku-postgresql --app "$APP_NAME" >/dev/null 2>&1; then
  echo "   PostgreSQL add-on already exists"
else
  heroku addons:create heroku-postgresql:essential-0 --app "$APP_NAME"
  echo "✅ PostgreSQL add-on added"
fi

# ---- 6. Set Config Variables ----
echo ""
echo "⚙️  Setting environment variables..."

JWT_SECRET=$(openssl rand -base64 48 2>/dev/null || cat /dev/urandom | head -c 48 | base64)
JWT_REFRESH_SECRET=$(openssl rand -base64 48 2>/dev/null || cat /dev/urandom | head -c 48 | base64)

heroku config:set \
  NODE_ENV="production" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_EXPIRES_IN="7d" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  RATE_LIMIT_WINDOW_MS="900000" \
  RATE_LIMIT_MAX="1000" \
  CACHE_TTL="300" \
  UPLOAD_DIR="/tmp/uploads" \
  MAX_FILE_SIZE="10485760" \
  NSDC_API_URL="https://api.nsdc.org.in/v1" \
  --app "$APP_NAME"

echo "✅ Config vars set"
echo "   ⚠️  Remember to set FRONTEND_URL after deploying frontend:"
echo "      heroku config:set FRONTEND_URL=https://your-app.vercel.app --app $APP_NAME"

# ---- 7. Disable NPM_CONFIG_PRODUCTION so devDeps install ----
echo ""
echo "🔧 Configuring build settings..."
heroku config:set NPM_CONFIG_PRODUCTION=false --app "$APP_NAME"

# ---- 8. Set Heroku Remote & Deploy ----
echo ""
echo "📡 Setting Heroku git remote..."
heroku git:remote --app "$APP_NAME"

echo ""
echo "🚀 Deploying to Heroku..."
git push heroku main 2>&1 || git push heroku master 2>&1

# ---- 9. Final Output ----
echo ""
echo "=========================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "  🌐 App URL:     https://$APP_NAME.herokuapp.com"
echo "  📡 API Health:  https://$APP_NAME.herokuapp.com/health"
echo "  📋 Logs:        heroku logs --tail --app $APP_NAME"
echo "  ⚙️  Config:      heroku config --app $APP_NAME"
echo "  🗄️  DB:          heroku pg:info --app $APP_NAME"
echo ""
echo "  ⚠️  Next steps:"
echo "  1. Set FRONTEND_URL config var"
echo "  2. Run seed (optional):"
echo "     heroku run 'DATABASE_URL=\$(heroku config:get DATABASE_URL) npx ts-node src/utils/seed.ts' --app $APP_NAME"
echo ""
