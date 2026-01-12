# Production Deployment Guide - Netlify

This guide will help you deploy and configure your Meal Planner app on Netlify with Supabase.

## ✅ Step 1: Verify Your Supabase Configuration

### 1.1 Get Your Supabase Anon Key

The app is already configured with the correct anon key for your project. You can verify it:

1. Go to: https://plxcgmdicebzojyjdwzc.supabase.co
2. Click **Settings** (⚙️) → **API**
3. Under "Project API keys", find the **anon** **public** key
4. It should match the key in `app.js` (line 4)

### 1.2 Run the Database Setup

**CRITICAL**: Make sure you've set up the database tables:

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database-setup.sql`
4. Paste and click **Run**
5. You should see: "Success. No rows returned"

Verify tables were created:
- Go to **Table Editor** in Supabase
- You should see: `meals`, `weekly_plans`, `planned_meals`, `ingredients`

## ✅ Step 2: Configure Supabase Authentication

### 2.1 Disable Email Confirmation (for testing)

For easier testing, disable email confirmation:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Click on **Email** provider
3. Scroll to **Confirm email** setting
4. **TOGGLE OFF** "Enable email confirmations"
5. Click **Save**

**Note**: For production, you should enable email confirmation and configure SMTP.

### 2.2 Add Your Netlify URL to Allowed Redirect URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your Netlify URL to **Site URL**: `https://your-app-name.netlify.app`
3. Add to **Redirect URLs**:
   - `https://your-app-name.netlify.app`
   - `https://your-app-name.netlify.app/**`
4. Click **Save**

## ✅ Step 3: Test Your Deployment

### 3.1 Open Browser Console

1. Go to your Netlify app URL
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for messages like:
   ```
   Supabase initialized with URL: https://plxcgmdicebzojyjdwzc.supabase.co
   Initializing app...
   No user session found
   ```

### 3.2 Try Creating an Account

1. Click **Sign up**
2. Enter an email and password (minimum 6 characters)
3. Click **Sign Up**

**Watch the console for messages:**

✅ **Success** - You should see:
```
Attempting signup for: your@email.com
Signup response: {user: {...}, session: {...}}
Account auto-confirmed, logging in...
User authenticated: your@email.com
```

❌ **If you see errors:**

**Error**: "Invalid API key"
- **Fix**: Make sure the anon key in `app.js` matches your Supabase dashboard

**Error**: "User already exists"
- **Fix**: The account exists. Try logging in instead, or use a different email

**Error**: "Email not confirmed"
- **Fix**: Disable email confirmation in Supabase (see Step 2.1 above)

### 3.3 Try Logging In

If you created an account:
1. Go to **Login** page
2. Enter your email and password
3. Click **Login**

**Watch the console:**

✅ **Success**:
```
Attempting login for: your@email.com
Login successful: your@email.com
User authenticated: your@email.com
```

Then you should be redirected to the Meal Library page.

## 🔍 Troubleshooting

### Problem: Can't sign up or login

**Check these things in order:**

1. **Console errors** - Open F12 → Console, look for red errors
2. **Supabase URL** - Should be: `https://plxcgmdicebzojyjdwzc.supabase.co`
3. **Anon key** - Check in app.js line 4, should be a long JWT token
4. **Database tables** - Go to Supabase → Table Editor, verify all 4 tables exist
5. **Email confirmation** - Disable in Supabase → Authentication → Providers → Email
6. **Network** - Check Network tab in DevTools for failed requests

### Problem: "Invalid login credentials" error

This usually means one of:
- Wrong password
- User doesn't exist (need to sign up first)
- Email confirmation required but not completed

**Solution**:
- Try signing up first
- Make sure email confirmation is disabled in Supabase
- Double-check your password

### Problem: Stuck on login page after successful login

This might be a session issue.

**Solution**:
1. Open Console (F12)
2. Clear site data: Right-click browser address bar → Site settings → Clear data
3. Refresh the page
4. Try logging in again
5. Watch console for auth state messages

### Problem: Database errors when trying to add meals

**Check**:
1. Did you run `database-setup.sql`?
2. Are all 4 tables created?
3. Are RLS policies enabled?

**Solution**:
1. Go to Supabase SQL Editor
2. Run this to verify tables:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```
3. You should see: meals, weekly_plans, planned_meals, ingredients
4. If not, run `database-setup.sql` again

## 📝 Checking User Accounts

To see if accounts were created:

1. In Supabase dashboard, go to **Authentication** → **Users**
2. You should see any accounts you've created
3. Check if email is confirmed (green checkmark)

## 🔐 Security Notes

### For Testing (Current Setup)
- ✅ Using anon/public key (safe for client-side)
- ✅ Row Level Security enabled
- ⚠️ Email confirmation disabled (easier testing)

### For Production (Recommended)
- ✅ Keep using anon/public key
- ✅ Keep Row Level Security enabled
- ✅ Enable email confirmation
- ✅ Configure SMTP for email delivery
- ✅ Add your domain to allowed redirect URLs
- ✅ Consider adding rate limiting

## 📱 Testing the Full Flow

Once logged in, test these features:

1. **Add a Meal**
   - Click "Add New Meal"
   - Fill in name, add ingredients
   - Save
   - Should appear in meal library

2. **Plan a Week**
   - Go to "Weekly Planner"
   - Click a meal slot
   - Select a meal
   - Should appear in the slot

3. **Generate Grocery List**
   - From weekly planner
   - Click "Generate Grocery List"
   - Should show all ingredients grouped by category

## 🎉 Success Criteria

You know everything is working when:
- ✅ You can sign up for an account
- ✅ You can log in with your credentials
- ✅ You see the navigation bar after login
- ✅ You're redirected to "Meal Library" page
- ✅ You can add a new meal
- ✅ Console shows no red errors

## 🆘 Still Having Issues?

1. **Check the Console** - F12 → Console tab shows detailed error messages
2. **Check Network** - F12 → Network tab shows API calls to Supabase
3. **Check Supabase Logs** - Dashboard → Logs shows server-side issues
4. **Verify Configuration** - Double-check all steps above

The app now has extensive console logging to help diagnose issues. Always check the console first!
