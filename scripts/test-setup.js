#!/usr/bin/env node

/**
 * Lakshya Setup Test Script
 * Tests all configurations before running the app
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'blue');
  console.log('='.repeat(60) + '\n');
}

let hasErrors = false;
let hasWarnings = false;

// Test 1: Check if .env.local exists and has required keys
function testEnvironmentVariables() {
  header('Testing Environment Variables');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    error('.env.local file not found!');
    info('Please create .env.local file with your API keys');
    hasErrors = true;
    return;
  }
  
  success('.env.local file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredKeys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
  ];
  
  let allKeysPresent = true;
  
  requiredKeys.forEach(key => {
    const regex = new RegExp(`${key}=(.+)`);
    const match = envContent.match(regex);
    
    if (!match || !match[1] || match[1].trim() === '') {
      error(`${key} is missing or empty`);
      allKeysPresent = false;
      hasErrors = true;
    } else {
      success(`${key} is configured`);
      
      // Validate format
      if (key.includes('SUPABASE_URL')) {
        if (!match[1].startsWith('https://')) {
          warning(`${key} should start with https://`);
          hasWarnings = true;
        }
      }
      
      if (key.includes('KEY')) {
        if (match[1].length < 20) {
          warning(`${key} seems too short, check if it's correct`);
          hasWarnings = true;
        }
      }
    }
  });
  
  if (allKeysPresent) {
    success('All environment variables are configured!');
  }
}

// Test 2: Check required directories exist
function testDirectoryStructure() {
  header('Testing Directory Structure');
  
  const requiredDirs = [
    'app',
    'app/(public)',
    'app/(public)/login',
    'app/(public)/signup',
    'app/(auth)',
    'app/(auth)/dashboard',
    'components',
    'components/ui',
    'lib',
    'lib/supabase',
  ];
  
  let allDirsExist = true;
  
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      success(`${dir}/ exists`);
    } else {
      error(`${dir}/ is missing`);
      allDirsExist = false;
      hasErrors = true;
    }
  });
  
  if (allDirsExist) {
    success('All required directories exist!');
  }
}

// Test 3: Check required files exist
function testRequiredFiles() {
  header('Testing Required Files');
  
  const requiredFiles = [
    'app/page.tsx',
    'app/layout.tsx',
    'app/(public)/login/page.tsx',
    'app/(public)/signup/page.tsx',
    'app/(auth)/dashboard/page.tsx',
    'lib/supabase/client.ts',
    'lib/supabase/server.ts',
    'lib/supabase/middleware.ts',
    'lib/types.ts',
    'middleware.ts',
    'package.json',
    'tsconfig.json',
  ];
  
  // Files that can have multiple extensions or be optional
  const flexibleFiles = [
    { name: 'next.config', exts: ['.js', '.ts', '.mjs'], required: true },
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      success(`${file} exists`);
    } else {
      error(`${file} is missing`);
      allFilesExist = false;
      hasErrors = true;
    }
  });
  
  flexibleFiles.forEach(({ name, exts }) => {
    let found = false;
    let foundExt = '';
    
    for (const ext of exts) {
      const filePath = path.join(process.cwd(), name + ext);
      if (fs.existsSync(filePath)) {
        found = true;
        foundExt = ext;
        break;
      }
    }
    
    if (found) {
      success(`${name}${foundExt} exists`);
    } else {
      error(`${name} is missing (checked: ${exts.join(', ')})`);
      allFilesExist = false;
      hasErrors = true;
    }
  });
  
  if (allFilesExist) {
    success('All required files exist!');
  }
}

// Test 4: Check package.json dependencies
function testDependencies() {
  header('Testing Dependencies');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    error('package.json not found!');
    hasErrors = true;
    return;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    '@supabase/ssr',
    '@google/generative-ai',
    'zustand',
    'framer-motion',
    'lucide-react',
    'tailwindcss',
    'typescript',
  ];
  
  let allDepsInstalled = true;
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      success(`${dep} is installed (${dependencies[dep]})`);
    } else {
      error(`${dep} is not installed`);
      allDepsInstalled = false;
      hasErrors = true;
    }
  });
  
  if (allDepsInstalled) {
    success('All required dependencies are installed!');
  } else {
    info('Run: npm install');
  }
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    error('node_modules not found!');
    info('Run: npm install');
    hasErrors = true;
  } else {
    success('node_modules exists');
  }
}

// Test 5: Check Supabase schema file
function testSupabaseSchema() {
  header('Testing Supabase Schema');
  
  const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    error('supabase/schema.sql not found!');
    hasErrors = true;
    return;
  }
  
  success('supabase/schema.sql exists');
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  const requiredTables = [
    'users',
    'goals',
    'milestones',
    'tasks',
    'notes',
    'timetable_events',
    'analytics_events',
  ];
  
  let allTablesFound = true;
  
  requiredTables.forEach(table => {
    if (schemaContent.includes(`CREATE TABLE IF NOT EXISTS public.${table}`)) {
      success(`Table: ${table}`);
    } else {
      error(`Table definition for '${table}' not found`);
      allTablesFound = false;
      hasWarnings = true;
    }
  });
  
  if (allTablesFound) {
    success('All required table definitions found!');
  }
  
  info('Remember to run this SQL in Supabase SQL Editor!');
}

// Test 6: Validate middleware configuration
function testMiddleware() {
  header('Testing Middleware Configuration');
  
  const middlewarePath = path.join(process.cwd(), 'middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    error('middleware.ts not found!');
    hasErrors = true;
    return;
  }
  
  success('middleware.ts exists');
  
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
  
  if (middlewareContent.includes('updateSession')) {
    success('updateSession function imported');
  } else {
    error('updateSession function not found in middleware');
    hasErrors = true;
  }
  
  if (middlewareContent.includes('export const config')) {
    success('Middleware config export found');
  } else {
    warning('Middleware config export not found');
    hasWarnings = true;
  }
}

// Test 7: Check TypeScript configuration
function testTypeScriptConfig() {
  header('Testing TypeScript Configuration');
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!fs.existsSync(tsconfigPath)) {
    error('tsconfig.json not found!');
    hasErrors = true;
    return;
  }
  
  success('tsconfig.json exists');
  
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
  
  if (tsconfig.compilerOptions?.paths?.['@/*']) {
    success('Path alias @/* is configured');
  } else {
    warning('Path alias @/* not found');
    hasWarnings = true;
  }
}

// Test 8: Summary and Next Steps
function printSummary() {
  header('Test Summary');
  
  if (!hasErrors && !hasWarnings) {
    success('🎉 All tests passed! Your setup is ready!');
    console.log('\n📋 Next Steps:');
    info('1. Make sure you ran the SQL schema in Supabase SQL Editor');
    info('2. Run: npm run dev');
    info('3. Visit: http://localhost:3000');
    info('4. Try signing up and logging in');
    console.log('\n');
  } else if (!hasErrors && hasWarnings) {
    warning('⚠️  Setup is mostly ready but has some warnings');
    warning('Review the warnings above');
    console.log('\n📋 You can proceed but fix warnings for production');
    info('Run: npm run dev');
    console.log('\n');
  } else {
    error('❌ Setup has errors that need to be fixed!');
    error('Please fix the errors above before running the app');
    console.log('\n📋 Common Fixes:');
    info('• Add missing API keys to .env.local');
    info('• Run: npm install');
    info('• Create missing directories/files');
    console.log('\n');
    process.exit(1);
  }
}

// Run all tests
function runTests() {
  console.log('\n');
  log('🎯 Lakshya - Setup Test Script', 'cyan');
  log('Testing your configuration...\n', 'cyan');
  
  testEnvironmentVariables();
  testDirectoryStructure();
  testRequiredFiles();
  testDependencies();
  testSupabaseSchema();
  testMiddleware();
  testTypeScriptConfig();
  printSummary();
}

// Execute tests
runTests();
