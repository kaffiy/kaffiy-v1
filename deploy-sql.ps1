# ========================================
# Kaffiy Supabase SQL Deployment Script
# ========================================

Write-Host "🚀 Kaffiy Supabase SQL Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Project configuration
$PROJECT_REF = "ivuhmjtnnhieguiblnbr"
$SQL_DIR = ".\supabase"

# SQL files to execute (in order)
$SQL_FILES = @(
    "rls_policies.sql",
    "process_qr_scan_function.sql"
)

Write-Host "📋 SQL Files to execute:" -ForegroundColor Yellow
foreach ($file in $SQL_FILES) {
    Write-Host "  - $file" -ForegroundColor Gray
}
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "🔍 Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $version = supabase --version 2>&1
    Write-Host "✅ Supabase CLI found: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Supabase CLI first:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use Supabase Dashboard > SQL Editor instead" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if project is linked
Write-Host "🔗 Checking project link..." -ForegroundColor Yellow
$linkStatus = supabase status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Project not linked. Linking now..." -ForegroundColor Yellow
    supabase link --project-ref $PROJECT_REF
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link project!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please run manually:" -ForegroundColor Yellow
        Write-Host "  supabase login" -ForegroundColor Cyan
        Write-Host "  supabase link --project-ref $PROJECT_REF" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host "✅ Project linked successfully" -ForegroundColor Green
Write-Host ""

# Execute SQL files
Write-Host "📝 Executing SQL files..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($file in $SQL_FILES) {
    $filePath = Join-Path $SQL_DIR $file
    
    if (Test-Path $filePath) {
        Write-Host "  Executing: $file" -ForegroundColor Cyan
        
        supabase db execute -f $filePath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Success: $file" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ❌ Failed: $file" -ForegroundColor Red
            $failCount++
        }
    } else {
        Write-Host "  ⚠️  File not found: $file" -ForegroundColor Yellow
        $failCount++
    }
    
    Write-Host ""
}

# Summary
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  ✅ Successful: $successCount" -ForegroundColor Green
Write-Host "  ❌ Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 All SQL files executed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Create admin user in Supabase Dashboard" -ForegroundColor Gray
    Write-Host "  2. Test QR scan function" -ForegroundColor Gray
    Write-Host "  3. Verify RLS policies" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some files failed to execute" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please check the errors above and:" -ForegroundColor Yellow
    Write-Host "  - Fix any SQL syntax errors" -ForegroundColor Gray
    Write-Host "  - Ensure you have proper permissions" -ForegroundColor Gray
    Write-Host "  - Try running failed files manually in Supabase Dashboard" -ForegroundColor Gray
}

Write-Host ""
