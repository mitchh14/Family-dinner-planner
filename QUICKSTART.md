# Quick Start Guide - Fix "Identifier 'supabase' has already been declared" Error

## 🔥 Immediate Fix

If you're seeing the error: **"Uncaught SyntaxError: Identifier 'supabase' has already been declared"**

This is a **browser cache issue** from a previous deployment. Here's how to fix it:

### Option 1: Hard Refresh Your Browser (Fastest)

**On Windows/Linux:**
- Press **Ctrl + Shift + R** (Chrome, Firefox, Edge)
- Or **Ctrl + F5**

**On Mac:**
- Press **Cmd + Shift + R** (Chrome, Firefox)
- Or **Cmd + Option + R** (Safari)

**On Mobile:**
- Clear your browser cache in settings
- Or open in private/incognito mode

### Option 2: Clear Netlify Cache and Redeploy

1. Go to your Netlify dashboard
2. Click on your site
3. Go to **Deploys** tab
4. Click **Trigger deploy** dropdown
5. Select **Clear cache and deploy site**

### Option 3: Clear Browser Site Data

1. Press **F12** to open Developer Tools
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Right-click on your site URL under "Storage"
4. Click **Clear** or **Delete all**
5. Refresh the page

## ✅ Verify It's Fixed

After clearing cache, you should see in the Console (F12):

```
Supabase initialized with URL: https://plxcgmdicebzojyjdwzc.supabase.co
Initializing app...
```

**No more "already declared" error!**

## 🚀 First Time Setup

Once the cache issue is fixed:

### Step 1: Disable Email Confirmation in Supabase (for testing)

1. Go to: https://plxcgmdicebzojyjdwzc.supabase.co
2. Navigate to **Authentication** → **Providers** → **Email**
3. **Toggle OFF** "Enable email confirmations"
4. Click **Save**

### Step 2: Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database-setup.sql` from this repo
4. Paste into the SQL editor
5. Click **Run**

You should see: "Success. No rows returned"

### Step 3: Verify Tables Were Created

1. Go to **Table Editor** in Supabase
2. You should see these 4 tables:
   - `meals`
   - `weekly_plans`
   - `planned_meals`
   - `ingredients`

### Step 4: Try the App

1. Open your Netlify app URL
2. Click **Sign Up**
3. Create an account with any email and password (min 6 characters)
4. You should be automatically logged in and see the Meal Library page

## 🔍 Still Having Issues?

### Check Console Messages

Open **F12** → **Console** tab and look for:

**✅ Good signs:**
```
Supabase initialized with URL: ...
Initializing app...
No user session found
```

**❌ Bad signs:**
- "Identifier 'supabase' has already been declared" → Clear cache (see above)
- "Invalid API key" → Contact support, the key might be wrong
- "relation 'meals' does not exist" → Run database-setup.sql

### Common Issues

**Issue: Can sign up but can't login**
- **Cause**: Email confirmation is enabled
- **Fix**: Disable in Supabase → Authentication → Providers → Email

**Issue: Can login but errors when adding meals**
- **Cause**: Database tables not created
- **Fix**: Run `database-setup.sql` in Supabase SQL Editor

**Issue: Page is blank or won't load**
- **Cause**: Browser cache or JavaScript error
- **Fix**: Hard refresh (Ctrl+Shift+R) and check Console for errors

## 📖 More Help

- **Full deployment guide**: See `PRODUCTION-DEPLOYMENT.md`
- **Feature documentation**: See `README.md`
- **Setup notes**: See `SETUP-NOTES.md`

## 🎉 You're Ready!

Once you can:
- ✅ Sign up for an account
- ✅ See the Meal Library page
- ✅ No errors in the console

You're all set! Start by adding your first meal.
