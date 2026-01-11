-- Meal Planning App - Database Setup
-- Run these commands in your Supabase SQL Editor

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  recipe_link TEXT,
  notes TEXT,
  main_dish TEXT,
  side_grain TEXT,
  side_veg TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for meals
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create policies for meals
CREATE POLICY "Users can view own meals" ON meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" ON meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON meals
  FOR DELETE USING (auth.uid() = user_id);

-- Create weekly_plans table
CREATE TABLE IF NOT EXISTS weekly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- Enable RLS for weekly_plans
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for weekly_plans
CREATE POLICY "Users can view own plans" ON weekly_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" ON weekly_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON weekly_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" ON weekly_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create planned_meals table
CREATE TABLE IF NOT EXISTS planned_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_plan_id UUID REFERENCES weekly_plans ON DELETE CASCADE NOT NULL,
  meal_id UUID REFERENCES meals ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for planned_meals
ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;

-- Create policies for planned_meals
CREATE POLICY "Users can view own planned meals" ON planned_meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weekly_plans
      WHERE weekly_plans.id = planned_meals.weekly_plan_id
      AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own planned meals" ON planned_meals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM weekly_plans
      WHERE weekly_plans.id = planned_meals.weekly_plan_id
      AND weekly_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own planned meals" ON planned_meals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM weekly_plans
      WHERE weekly_plans.id = planned_meals.weekly_plan_id
      AND weekly_plans.user_id = auth.uid()
    )
  );

-- Create ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_id UUID REFERENCES meals ON DELETE CASCADE NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity TEXT,
  category TEXT CHECK (category IN ('produce', 'protein', 'grains', 'dairy', 'pantry', 'other'))
);

-- Enable RLS for ingredients
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for ingredients
CREATE POLICY "Users can view ingredients for own meals" ON ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = ingredients.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ingredients for own meals" ON ingredients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = ingredients.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ingredients for own meals" ON ingredients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = ingredients.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ingredients for own meals" ON ingredients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = ingredients.meal_id
      AND meals.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_id ON weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_week_start ON weekly_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_planned_meals_weekly_plan_id ON planned_meals(weekly_plan_id);
CREATE INDEX IF NOT EXISTS idx_planned_meals_meal_id ON planned_meals(meal_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_meal_id ON ingredients(meal_id);
