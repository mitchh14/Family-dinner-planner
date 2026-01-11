# Meal Planning Web App

A simple, lightweight meal planning application built with vanilla JavaScript, HTML, CSS, and Supabase for backend and authentication.

## Features

- **Meal Library**: Create, edit, and manage your meal recipes with ingredients
- **Weekly Planner**: Plan your breakfast, lunch, and dinner for the entire week
- **Grocery List Generator**: Automatically generate shopping lists from your weekly plan
- **User Authentication**: Secure login and signup with email/password
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup Instructions

### 1. Supabase Configuration

#### Get Your Supabase Credentials

1. Go to your Supabase project: https://plxcgmdicebzojyjdwzc.supabase.co
2. Click on **Settings** (gear icon) in the sidebar
3. Navigate to **API** section
4. Copy your **Project URL** and **anon/public key**

#### Update the App Configuration

Open `app.js` and update the Supabase configuration at the top of the file:

```javascript
const SUPABASE_URL = 'https://plxcgmdicebzojyjdwzc.supabase.co';
const SUPABASE_KEY = 'your-anon-public-key-here';
```

**IMPORTANT**: Use the **anon/public key**, NOT the service role key. The anon key is safe to use in client-side code.

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy the entire contents of `database-setup.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the script

This will create all necessary tables, enable Row Level Security (RLS), and set up proper access policies.

### 3. Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** provider is enabled
3. Configure email settings:
   - For development: Enable "Confirm email" can be disabled for testing
   - For production: Enable email confirmation and configure SMTP settings

### 4. Run the Application

You can run the app using any local web server. Here are a few options:

#### Option 1: Python (if installed)
```bash
python -m http.server 8000
```
Then open http://localhost:8000

#### Option 2: Node.js http-server (if installed)
```bash
npx http-server -p 8000
```
Then open http://localhost:8000

#### Option 3: VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage Guide

### First Time Setup

1. **Sign Up**: Create a new account with your email and password
2. **Add Meals**: Start by adding your favorite meals to the library
   - Include ingredients with quantities and categories
   - Add ratings after you cook them
3. **Plan Your Week**: Use the weekly planner to assign meals to specific days
4. **Generate Grocery List**: Click "Generate Grocery List" to create your shopping list
5. **Shop**: Use the mobile-friendly grocery list while shopping

### Adding a Meal

1. Click "Add New Meal" on the Meal Library page
2. Fill in the meal details:
   - Name (required)
   - Main dish, side grain, side vegetable
   - Recipe link (optional)
   - Notes (optional)
   - Rating (1-5 stars)
3. Add ingredients:
   - Click "Add Ingredient"
   - Enter name, quantity, and select category
   - Add as many as needed
4. Click "Save Meal"

### Planning Your Week

1. Navigate to "Weekly Planner"
2. Click on any meal slot (breakfast, lunch, or dinner)
3. Select a meal from your library
4. Repeat for all meals throughout the week
5. Use the navigation buttons to plan future weeks

### Using the Grocery List

1. From the Weekly Planner, click "Generate Grocery List"
2. Ingredients are automatically grouped by category
3. Check off items as you shop
4. Click "Clear Checked Items" to remove purchased items

## Project Structure

```
meal-planner/
├── index.html           # Main HTML file with all pages
├── styles.css           # Complete styling and responsive design
├── app.js              # Application logic and Supabase integration
├── database-setup.sql  # Database schema and RLS policies
└── README.md           # This file
```

## Database Schema

### Tables

- **meals**: Store meal recipes and details
- **ingredients**: Store ingredients for each meal
- **weekly_plans**: Store weekly meal plans
- **planned_meals**: Link meals to specific days and meal types

### Security

All tables use Row Level Security (RLS) to ensure users can only access their own data.

## Troubleshooting

### "Failed to fetch" or connection errors
- Check that your Supabase URL and anon key are correct in `app.js`
- Verify your Supabase project is active
- Check your browser console for specific error messages

### Email confirmation issues
- For testing, disable email confirmation in Supabase Authentication settings
- For production, configure SMTP settings properly

### Meals not showing up
- Make sure you're logged in with the account that created the meals
- Check the browser console for errors
- Verify RLS policies are set up correctly

### Grocery list is empty
- Make sure you've planned meals for the current week
- Ensure your meals have ingredients added
- Check that you clicked "Generate Grocery List"

## Features Roadmap

Potential enhancements:
- Recipe sharing between users
- Meal favorites and quick-add
- Nutritional information tracking
- Export grocery list to various formats
- Dark mode
- Meal prep scheduling

## Technologies Used

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Can be deployed to any static hosting (Netlify, Vercel, GitHub Pages, etc.)

## License

MIT License - feel free to use and modify for your own purposes.
