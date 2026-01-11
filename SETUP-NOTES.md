# Important Setup Notes

## Supabase API Key Configuration

**CRITICAL**: The key you provided appears to be in a different format than expected. For this application to work, you need to use the **anon/public key** from Supabase.

### How to Get Your Anon Key

1. Go to your Supabase project dashboard: https://plxcgmdicebzojyjdwzc.supabase.co
2. Click on the **Settings** icon (⚙️) in the left sidebar
3. Navigate to **API** section
4. Look for the **Project API keys** section
5. Copy the **anon** **public** key (it will be a long JWT token starting with "eyJ...")

### Example of What the Keys Look Like

- ✅ **Correct (anon/public key)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...` (very long JWT token)
- ❌ **Incorrect (service role key)**: Should NOT be used in client-side code for security reasons

### Update the Configuration

Once you have your anon key:

1. Open `app.js`
2. Find the Supabase configuration section at the top:
   ```javascript
   const SUPABASE_URL = 'https://plxcgmdicebzojyjdwzc.supabase.co';
   const SUPABASE_KEY = 'your-anon-key-here';
   ```
3. Replace `'your-anon-key-here'` with your actual anon key

### Why This Matters

- The **anon key** is safe to use in client-side applications
- It has limited permissions and works with Row Level Security (RLS)
- The **service role key** should NEVER be exposed in client-side code as it bypasses RLS

## Database Setup Checklist

- [ ] Run the SQL commands from `database-setup.sql` in Supabase SQL Editor
- [ ] Verify all 4 tables are created (meals, weekly_plans, planned_meals, ingredients)
- [ ] Confirm Row Level Security is enabled on all tables
- [ ] Enable Email authentication in Supabase dashboard

## Quick Test After Setup

1. Open the app in your browser
2. Try to sign up with a test email
3. If you get authentication errors, check:
   - The anon key is correct in `app.js`
   - Email authentication is enabled in Supabase
   - Browser console for specific error messages

## Need Help?

If you encounter issues:
1. Check the browser console (F12 → Console tab)
2. Verify the Supabase project is active
3. Ensure all SQL commands ran successfully
4. Confirm the anon key is correctly copied
