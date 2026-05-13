#!/bin/bash
# Story 1.1: Supabase Project Setup Guide
# This script documents the steps to set up Supabase and create the database schema with RLS

set -e

echo "🚀 GymFlow - Supabase Setup Guide"
echo "=================================="
echo ""
echo "This guide walks through manual Supabase setup (requires Supabase account)"
echo ""

# Step 1: Create Supabase Project
echo "Step 1: Create Supabase Project"
echo "================================"
echo "1. Go to https://supabase.com/dashboard/new"
echo "2. Create a new project:"
echo "   - Organization: Your organization"
echo "   - Project Name: gymflow-dev"
echo "   - Database Password: Generate strong password"
echo "   - Region: Choose closest to your users"
echo "3. Wait for project to be created (~2 minutes)"
echo ""

# Step 2: Get Credentials
echo "Step 2: Copy Credentials"
echo "========================"
echo "1. Go to Project Settings → API"
echo "2. Copy these values to .env.local:"
echo "   - NEXT_PUBLIC_SUPABASE_URL = (Project URL)"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY = (anon public key)"
echo "   - SUPABASE_SERVICE_ROLE_KEY = (service_role key)"
echo "3. Go to Project Settings → Security → JWT Settings"
echo "   - Copy JWT Secret to SUPABASE_JWT_SECRET"
echo ""

# Step 3: Database Connection
echo "Step 3: Database Connection Strings"
echo "===================================="
echo "1. Go to Project Settings → Database"
echo "2. Scroll to 'Connection Pooling' section"
echo "3. Copy connection strings:"
echo "   - DATABASE_URL = postgresql://postgres:[password]@[host]:6543/postgres"
echo "   - DATABASE_URL_UNPOOLED = postgresql://postgres:[password]@[host]:5432/postgres"
echo ""

# Step 4: Create Schema
echo "Step 4: Create Database Schema"
echo "=============================="
echo "After updating .env.local, run:"
echo ""
echo "  npm install"
echo "  npx prisma migrate dev --name init"
echo ""
echo "This will:"
echo "  1. Read prisma/schema.prisma"
echo "  2. Generate SQL migration"
echo "  3. Apply to Supabase PostgreSQL"
echo "  4. Generate Prisma types"
echo ""

# Step 5: Enable RLS
echo "Step 5: Enable RLS Policies"
echo "============================"
echo "Run the following in Supabase SQL Editor (Project → SQL Editor → New Query):"
echo ""
echo "Copy all SQL from: scripts/rls-policies.sql"
echo ""
echo "This enables Row-Level Security policies for:"
echo "  - members"
echo "  - packages"
echo "  - fees"
echo "  - notifications"
echo ""

# Step 6: Configure Auth
echo "Step 6: Configure Supabase Auth"
echo "================================"
echo "1. Go to Authentication → Providers"
echo "2. Enable 'Email' provider"
echo "3. Go to Email Templates → Confirm signup"
echo "4. Update redirect URL to: https://your-domain.com/auth/callback"
echo ""

# Step 7: Test Connection
echo "Step 7: Test Connection"
echo "======================="
echo "Run: npm run test:db"
echo ""
echo "This tests:"
echo "  - Supabase connection works"
echo "  - Prisma client initialized"
echo "  - RLS policies enforced"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next: Run 'npm run dev' and navigate to http://localhost:3000"
echo ""
