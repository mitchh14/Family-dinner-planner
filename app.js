// Prevent double initialization
if (!window.MealPlannerApp) {
    window.MealPlannerApp = { initialized: true };

    // Supabase Configuration
    const SUPABASE_URL = 'https://plxcgmdicebzojyjdwzc.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBseGNnbWRpY2Viem9qeWpkd3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNjkwMjQsImV4cCI6MjA4Mzc0NTAyNH0.aeksysvhY9X340U6iWQJyUEnNPQ4o5CLbtDICxAgEeg';

    if (!window.supabaseClient) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase client initialized');
    }
}

const supabase = window.supabaseClient;

// Global State
let currentUser = null;
let currentMealId = null;
let currentWeekStart = null;
let currentPlanId = null;
let allMeals = [];
let currentSlot = null;

// Utility Functions
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    // Keep error visible for longer (10 seconds) so user can read it
    setTimeout(() => {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }, 10000);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`a[href="#${pageId.replace('-page', '')}"]`);
    if (activeLink) activeLink.classList.add('active');
}

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    console.log('Attempting login for:', email);

    // Simple bypass auth for testing
    if (password === 'Password') {
        console.log('✅ Using bypass authentication');

        // Try to get real user from Supabase first
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Use real Supabase user if they exist
            currentUser = user;
            console.log('Using existing Supabase user:', user.email);
        } else {
            // Create a consistent test user ID so data persists across sessions
            currentUser = {
                id: '00000000-0000-0000-0000-000000000001', // Fixed UUID for test user
                email: email,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('bypass-user', JSON.stringify(currentUser));
            console.log('Using bypass user:', email);
        }

        hideLoading();
        document.getElementById('main-nav').classList.remove('hidden');
        window.location.hash = '#meals';
        handleRoute();
        return;
    }

    // Try real Supabase auth if not using bypass password
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    hideLoading();

    if (error) {
        console.error('Login error:', error);
        showError('login-error', 'Use password "Password" to access the app, or login with valid Supabase credentials.');
    } else {
        console.log('Login successful:', data.user.email);
        currentUser = data.user;
        initApp();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    showLoading();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    console.log('Attempting signup for:', email);

    hideLoading();

    // For testing, just redirect to login
    alert('Account created! Please login with password "Password"');
    window.location.hash = '#login';
}

async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    document.getElementById('main-nav').classList.add('hidden');
    window.location.hash = '#login';
    showPage('login-page');
}

// Meal Library Functions
async function loadMeals(searchTerm = '', ratingFilter = '') {
    showLoading();

    let query = supabase
        .from('meals')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
    }

    if (ratingFilter) {
        query = query.gte('rating', parseInt(ratingFilter));
    }

    const { data, error } = await query;

    hideLoading();

    if (error) {
        console.error('Error loading meals:', error);
        return;
    }

    allMeals = data || [];
    renderMeals(allMeals);
}

function renderMeals(meals) {
    const grid = document.getElementById('meals-grid');

    if (meals.length === 0) {
        grid.innerHTML = '<p>No recipes found. Click "Add Recipe" to get started!</p>';
        return;
    }

    grid.innerHTML = meals.map(meal => {
        const stars = '★'.repeat(meal.rating || 0) + '☆'.repeat(5 - (meal.rating || 0));
        return `
            <div class="meal-card" data-id="${meal.id}">
                <div class="meal-card-header">
                    <div>
                        <h3>${meal.name}</h3>
                        <div class="meal-rating">${stars}</div>
                    </div>
                </div>
                ${meal.recipe_link ? `<div class="meal-details"><a href="${meal.recipe_link}" target="_blank">View Recipe →</a></div>` : ''}
                ${meal.notes ? `<div class="meal-details" style="font-size: 0.85rem; color: #6c757d;">${meal.notes.substring(0, 100)}${meal.notes.length > 100 ? '...' : ''}</div>` : ''}
                <div class="meal-actions">
                    <button class="btn btn-primary btn-edit" onclick="editMeal('${meal.id}')">Edit</button>
                    <button class="btn btn-danger btn-delete" onclick="deleteMeal('${meal.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function showMealForm(mealId = null) {
    currentMealId = mealId;

    if (mealId) {
        const meal = allMeals.find(m => m.id === mealId);
        if (meal) {
            document.getElementById('meal-form-title').textContent = 'Edit Recipe';
            document.getElementById('meal-name').value = meal.name || '';
            document.getElementById('recipe-link').value = meal.recipe_link || '';
            document.getElementById('meal-notes').value = meal.notes || '';
            setRating(meal.rating || 0);
        }
    } else {
        document.getElementById('meal-form-title').textContent = 'Add New Recipe';
        document.getElementById('meal-form').reset();
        setRating(0);
    }

    showPage('meal-form-page');
}

async function loadIngredients(mealId) {
    const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('meal_id', mealId);

    if (error) {
        console.error('Error loading ingredients:', error);
        return;
    }

    const list = document.getElementById('ingredients-list');
    list.innerHTML = '';

    if (data && data.length > 0) {
        data.forEach(ing => addIngredientRow(ing));
    }
}

function addIngredientRow(ingredient = null) {
    const list = document.getElementById('ingredients-list');
    const row = document.createElement('div');
    row.className = 'ingredient-item';
    row.innerHTML = `
        <input type="text" class="ingredient-name" placeholder="Ingredient name" value="${ingredient?.ingredient_name || ''}" required>
        <input type="text" class="ingredient-quantity" placeholder="Quantity" value="${ingredient?.quantity || ''}">
        <select class="ingredient-category">
            <option value="produce" ${ingredient?.category === 'produce' ? 'selected' : ''}>Produce</option>
            <option value="protein" ${ingredient?.category === 'protein' ? 'selected' : ''}>Protein</option>
            <option value="grains" ${ingredient?.category === 'grains' ? 'selected' : ''}>Grains</option>
            <option value="dairy" ${ingredient?.category === 'dairy' ? 'selected' : ''}>Dairy</option>
            <option value="pantry" ${ingredient?.category === 'pantry' ? 'selected' : ''}>Pantry</option>
            <option value="other" ${ingredient?.category === 'other' ? 'selected' : ''}>Other</option>
        </select>
        <button type="button" class="remove-ingredient" onclick="this.parentElement.remove()">×</button>
    `;
    list.appendChild(row);
}

function setRating(rating) {
    document.getElementById('meal-rating').value = rating;
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

async function saveMeal(e) {
    e.preventDefault();
    showLoading();

    const mealData = {
        user_id: currentUser.id,
        name: document.getElementById('meal-name').value,
        recipe_link: document.getElementById('recipe-link').value,
        notes: document.getElementById('meal-notes').value,
        rating: parseInt(document.getElementById('meal-rating').value) || null,
        updated_at: new Date().toISOString()
    };

    if (currentMealId) {
        // Update existing meal
        const { error } = await supabase
            .from('meals')
            .update(mealData)
            .eq('id', currentMealId);

        if (error) {
            console.error('Error updating recipe:', error);
            hideLoading();
            alert('Error saving recipe');
            return;
        }
    } else {
        // Create new meal
        const { data, error } = await supabase
            .from('meals')
            .insert([mealData])
            .select();

        if (error) {
            console.error('Error creating recipe:', error);
            hideLoading();
            alert('Error creating recipe');
            return;
        }
    }

    hideLoading();
    window.location.hash = '#meals';
    await loadMeals();
}

async function saveIngredients(mealId) {
    // Delete existing ingredients
    await supabase
        .from('ingredients')
        .delete()
        .eq('meal_id', mealId);

    // Add new ingredients
    const ingredientRows = document.querySelectorAll('.ingredient-item');
    const ingredients = [];

    ingredientRows.forEach(row => {
        const name = row.querySelector('.ingredient-name').value;
        const quantity = row.querySelector('.ingredient-quantity').value;
        const category = row.querySelector('.ingredient-category').value;

        if (name) {
            ingredients.push({
                meal_id: mealId,
                ingredient_name: name,
                quantity: quantity,
                category: category
            });
        }
    });

    if (ingredients.length > 0) {
        await supabase.from('ingredients').insert(ingredients);
    }
}

async function deleteMeal(mealId) {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    showLoading();

    const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

    hideLoading();

    if (error) {
        console.error('Error deleting meal:', error);
        alert('Error deleting meal');
    } else {
        await loadMeals();
    }
}

function editMeal(mealId) {
    showMealForm(mealId);
}

// Weekly Planner Functions
function initWeeklyPlanner() {
    currentWeekStart = getMonday(new Date());
    loadWeeklyPlan();
    if (allMeals.length === 0) {
        loadMeals();
    }
}

async function loadWeeklyPlan() {
    showLoading();

    const weekStartISO = formatDateISO(currentWeekStart);

    // Get or create weekly plan
    let { data: plans, error: planError } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('week_start_date', weekStartISO);

    if (planError) {
        console.error('Error loading plan:', planError);
        hideLoading();
        return;
    }

    if (!plans || plans.length === 0) {
        // Create new plan
        const { data: newPlan, error: createError } = await supabase
            .from('weekly_plans')
            .insert([{
                user_id: currentUser.id,
                week_start_date: weekStartISO
            }])
            .select();

        if (createError) {
            console.error('Error creating plan:', createError);
            hideLoading();
            return;
        }

        currentPlanId = newPlan[0].id;
    } else {
        currentPlanId = plans[0].id;
    }

    // Load planned meals (menu + assignments)
    const { data: plannedMeals, error: mealsError } = await supabase
        .from('planned_meals')
        .select(`
            *,
            meals (*)
        `)
        .eq('weekly_plan_id', currentPlanId);

    hideLoading();

    if (mealsError) {
        console.error('Error loading planned meals:', mealsError);
        return;
    }

    renderWeeklyPlanner(plannedMeals || []);
}

function renderWeeklyPlanner(plannedMeals) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    document.getElementById('current-week').textContent =
        `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;

    // Render the weekly menu (staging area)
    const menuContainer = document.getElementById('weekly-menu');
    const menuMeals = plannedMeals.filter(pm => pm.day_of_week === null || pm.day_of_week === undefined);

    if (menuMeals.length === 0) {
        menuContainer.innerHTML = '<p class="empty-state">Click "Add Recipe to Menu" to build this week's meal plan</p>';
    } else {
        menuContainer.innerHTML = menuMeals.map(pm => `
            <div class="menu-item" draggable="true" data-meal-id="${pm.meal_id}" data-planned-id="${pm.id}">
                <div class="menu-item-content">
                    <strong>${pm.meals.name}</strong>
                    ${pm.meals.recipe_link ? `<a href="${pm.meals.recipe_link}" target="_blank" onclick="event.stopPropagation()">📖</a>` : ''}
                </div>
                <button class="remove-menu-item" onclick="removeFromMenu('${pm.id}')">×</button>
            </div>
        `).join('');
    }

    // Render the weekly calendar
    const grid = document.getElementById('planner-grid');
    grid.innerHTML = days.map((day, dayIndex) => {
        const dayMeals = plannedMeals.filter(pm => pm.day_of_week === dayIndex);

        return `
            <div class="day-column" data-day="${dayIndex}">
                <div class="day-header">${day}</div>
                <div class="day-meals">
                    ${dayMeals.length > 0 ? dayMeals.map(pm => `
                        <div class="day-meal-item">
                            <span>${pm.meals.name}</span>
                            <button class="remove-day-meal" onclick="unassignMeal('${pm.id}')">×</button>
                        </div>
                    `).join('') : '<div class="empty-day">No meals assigned</div>'}
                </div>
                <button class="assign-meal-btn" onclick="assignMealToDay(${dayIndex})">+ Assign Meal</button>
            </div>
        `;
    }).join('');
}

function changeWeek(direction) {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    currentWeekStart = newDate;
    loadWeeklyPlan();
}

// Add recipe to this week's menu (staging area)
async function addToMenu() {
    if (allMeals.length === 0) {
        await loadMeals();
    }

    const modal = document.getElementById('meal-modal');
    const list = document.getElementById('modal-meals-list');

    list.innerHTML = allMeals.map(meal => {
        const stars = '★'.repeat(meal.rating || 0);
        return `
            <div class="modal-meal-item" onclick="selectMealForMenu('${meal.id}')">
                <div>
                    <strong>${meal.name}</strong>
                    ${stars ? `<div style="color: #ffc107; font-size: 0.9rem;">${stars}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    modal.classList.remove('hidden');
}

async function selectMealForMenu(mealId) {
    showLoading();
    closeMealModal();

    // Add to menu (no day assignment, so day_of_week is null)
    const { error } = await supabase
        .from('planned_meals')
        .insert([{
            weekly_plan_id: currentPlanId,
            meal_id: mealId,
            day_of_week: null,
            meal_type: null
        }]);

    hideLoading();

    if (error) {
        console.error('Error adding to menu:', error);
        alert('Error adding recipe to menu');
    } else {
        await loadWeeklyPlan();
    }
}

async function removeFromMenu(plannedMealId) {
    showLoading();

    const { error } = await supabase
        .from('planned_meals')
        .delete()
        .eq('id', plannedMealId);

    hideLoading();

    if (error) {
        console.error('Error removing from menu:', error);
        alert('Error removing recipe');
    } else {
        await loadWeeklyPlan();
    }
}

// Assign a meal from the menu to a specific day
async function assignMealToDay(dayIndex) {
    currentSlot = { day: dayIndex };

    const modal = document.getElementById('meal-modal');
    const list = document.getElementById('modal-meals-list');

    // Load planned meals to get the menu
    const { data: menuMeals } = await supabase
        .from('planned_meals')
        .select(`
            *,
            meals (*)
        `)
        .eq('weekly_plan_id', currentPlanId)
        .is('day_of_week', null);

    if (!menuMeals || menuMeals.length === 0) {
        alert('Add some recipes to this week\'s menu first!');
        return;
    }

    list.innerHTML = menuMeals.map(pm => `
        <div class="modal-meal-item" onclick="assignMealToSlot('${pm.id}', ${dayIndex})">
            <strong>${pm.meals.name}</strong>
        </div>
    `).join('');

    modal.classList.remove('hidden');
}

async function assignMealToSlot(plannedMealId, dayIndex) {
    showLoading();
    closeMealModal();

    // Update the planned meal to assign it to this day
    const { error } = await supabase
        .from('planned_meals')
        .update({ day_of_week: dayIndex })
        .eq('id', plannedMealId);

    hideLoading();

    if (error) {
        console.error('Error assigning meal:', error);
        alert('Error assigning meal to day');
    } else {
        await loadWeeklyPlan();
    }
}

// Unassign meal from day (move back to menu)
async function unassignMeal(plannedMealId) {
    showLoading();

    const { error } = await supabase
        .from('planned_meals')
        .update({ day_of_week: null })
        .eq('id', plannedMealId);

    hideLoading();

    if (error) {
        console.error('Error unassigning meal:', error);
        alert('Error unassigning meal');
    } else {
        await loadWeeklyPlan();
    }
}

function closeMealModal() {
    document.getElementById('meal-modal').classList.add('hidden');
    currentSlot = null;
}

// Grocery List Functions
async function generateGroceryList() {
    showLoading();

    const { data: plannedMeals, error } = await supabase
        .from('planned_meals')
        .select(`
            meal_id,
            meals (
                ingredients (*)
            )
        `)
        .eq('weekly_plan_id', currentPlanId);

    hideLoading();

    if (error) {
        console.error('Error generating grocery list:', error);
        alert('Error generating grocery list');
        return;
    }

    // Aggregate ingredients
    const ingredientMap = {};

    plannedMeals.forEach(pm => {
        if (pm.meals && pm.meals.ingredients) {
            pm.meals.ingredients.forEach(ing => {
                const key = `${ing.ingredient_name}-${ing.category}`;
                if (ingredientMap[key]) {
                    ingredientMap[key].quantity += `, ${ing.quantity}`;
                } else {
                    ingredientMap[key] = { ...ing };
                }
            });
        }
    });

    renderGroceryList(Object.values(ingredientMap));
    window.location.hash = '#grocery';
}

function renderGroceryList(ingredients) {
    const categories = ['produce', 'protein', 'grains', 'dairy', 'pantry', 'other'];
    const list = document.getElementById('grocery-list');

    if (ingredients.length === 0) {
        list.innerHTML = '<p>No ingredients found. Plan your week first!</p>';
        return;
    }

    list.innerHTML = categories.map(category => {
        const items = ingredients.filter(ing => ing.category === category);
        if (items.length === 0) return '';

        return `
            <div class="grocery-category">
                <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                ${items.map(item => `
                    <div class="grocery-item">
                        <input type="checkbox" onchange="toggleGroceryItem(this)">
                        <div class="grocery-item-text">
                            <span class="grocery-item-quantity">${item.quantity || ''}</span>
                            ${item.ingredient_name}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

function toggleGroceryItem(checkbox) {
    checkbox.parentElement.classList.toggle('checked', checkbox.checked);
}

function clearCheckedItems() {
    const checkedItems = document.querySelectorAll('.grocery-item.checked');
    checkedItems.forEach(item => item.remove());
}

// Router
function handleRoute() {
    const hash = window.location.hash.slice(1) || 'login';

    if (!currentUser && hash !== 'login' && hash !== 'signup') {
        window.location.hash = '#login';
        return;
    }

    switch (hash) {
        case 'login':
            showPage('login-page');
            break;
        case 'signup':
            showPage('signup-page');
            break;
        case 'meals':
            showPage('meals-page');
            loadMeals();
            break;
        case 'planner':
            showPage('planner-page');
            initWeeklyPlanner();
            break;
        case 'grocery':
            showPage('grocery-page');
            break;
        default:
            if (currentUser) {
                window.location.hash = '#meals';
            } else {
                window.location.hash = '#login';
            }
    }
}

// Initialize App
async function initApp() {
    console.log('Initializing app...');

    try {
        // Check if we already have a bypass user
        if (currentUser) {
            console.log('Using existing user:', currentUser.email);
            document.getElementById('main-nav').classList.remove('hidden');
            if (!window.location.hash || window.location.hash === '#login' || window.location.hash === '#signup') {
                window.location.hash = '#meals';
            } else {
                handleRoute();
            }
            return;
        }

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Error getting user:', error);
        }

        if (user) {
            console.log('User authenticated:', user.email);
            currentUser = user;
            document.getElementById('main-nav').classList.remove('hidden');
            if (!window.location.hash || window.location.hash === '#login' || window.location.hash === '#signup') {
                window.location.hash = '#meals';
            } else {
                handleRoute();
            }
        } else {
            console.log('No user session found - please login');
            document.getElementById('main-nav').classList.add('hidden');
            window.location.hash = '#login';
        }
    } catch (error) {
        console.error('Error in initApp:', error);
        document.getElementById('main-nav').classList.add('hidden');
        window.location.hash = '#login';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Auth
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Meals
    document.getElementById('add-meal-btn').addEventListener('click', () => showMealForm());
    document.getElementById('cancel-meal-btn').addEventListener('click', () => window.location.hash = '#meals');
    document.getElementById('meal-form').addEventListener('submit', saveMeal);

    // Search and filter
    document.getElementById('meal-search').addEventListener('input', (e) => {
        const rating = document.getElementById('rating-filter').value;
        loadMeals(e.target.value, rating);
    });

    document.getElementById('rating-filter').addEventListener('change', (e) => {
        const search = document.getElementById('meal-search').value;
        loadMeals(search, e.target.value);
    });

    // Star rating
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', (e) => {
            setRating(parseInt(e.target.dataset.value));
        });
    });

    // Weekly planner
    document.getElementById('prev-week-btn').addEventListener('click', () => changeWeek(-1));
    document.getElementById('next-week-btn').addEventListener('click', () => changeWeek(1));
    document.getElementById('add-to-menu-btn').addEventListener('click', addToMenu);

    // Modal
    document.querySelector('.modal-close').addEventListener('click', closeMealModal);
    document.getElementById('meal-modal').addEventListener('click', (e) => {
        if (e.target.id === 'meal-modal') closeMealModal();
    });

    document.getElementById('modal-meal-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.modal-meal-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });

    // Grocery list
    document.getElementById('clear-grocery-btn').addEventListener('click', clearCheckedItems);

    // Router
    window.addEventListener('hashchange', handleRoute);

    // Auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            document.getElementById('main-nav').classList.remove('hidden');
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            document.getElementById('main-nav').classList.add('hidden');
            window.location.hash = '#login';
        } else if (event === 'USER_UPDATED') {
            currentUser = session?.user || null;
        }
    });

    // Initialize
    initApp();
});
