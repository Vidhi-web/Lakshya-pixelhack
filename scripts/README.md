# Test Scripts

## Setup Test Script

**Purpose**: Validates your entire Lakshya setup before running the app

### Run the test:

```bash
npm run test:setup
```

### What it checks:

✅ **Environment Variables**
- `.env.local` file exists
- All required API keys are configured
- Keys have correct format

✅ **Directory Structure**
- All required folders exist
- Auth and public routes are set up

✅ **Required Files**
- All pages and components exist
- Configuration files present
- Library files ready

✅ **Dependencies**
- All npm packages installed
- `node_modules` exists
- Correct versions

✅ **Supabase Schema**
- SQL file exists
- All table definitions present

✅ **Middleware**
- Auth middleware configured
- Routes protected

✅ **TypeScript**
- Config valid
- Path aliases set up

### Output:

The script will show:
- ✅ Green checkmarks for passing tests
- ❌ Red X for errors that must be fixed
- ⚠️ Yellow warnings for optional issues
- ℹ️ Blue info for helpful tips

### Example Output:

```
🎯 Lakshya - Setup Test Script
Testing your configuration...

============================================================
Testing Environment Variables
============================================================
✅ .env.local file exists
✅ NEXT_PUBLIC_SUPABASE_URL is configured
✅ All environment variables are configured!

...

============================================================
Test Summary
============================================================
✅ 🎉 All tests passed! Your setup is ready!

📋 Next Steps:
ℹ️  1. Make sure you ran the SQL schema in Supabase SQL Editor
ℹ️  2. Run: npm run dev
ℹ️  3. Visit: http://localhost:3000
ℹ️  4. Try signing up and logging in
```

### Common Issues:

**Problem**: Missing API keys
**Solution**: Add them to `.env.local`

**Problem**: Missing dependencies
**Solution**: Run `npm install`

**Problem**: Files not found
**Solution**: Check if you're in the correct directory

---

## Running the App

After tests pass:

```bash
npm run dev
```

Visit: http://localhost:3000

🎯 **Happy coding with Lakshya!**
