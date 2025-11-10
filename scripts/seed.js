/*
 * ===================================
 * Supabase Profile & Post Seeding Script (UPSERT Version)
 * ===================================
 *
 * This script reads user data from a local 'users.json' file,
 * safely creates/updates their profiles using UPSERT, and generates posts.
 *
 * PREREQUISITES:
 * 1. A 'users.json' file in the same directory.
 * 2. A .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * 3. Run `npm install dotenv @supabase/supabase-js` to install dependencies.
 *
 * HOW TO RUN:
 * node seed.js
 *
 */

// Import necessary libraries
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// --- Configuration ---

// Validate that environment variables are set
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// --- Function to Load User Data from File ---

function loadUserDataFromFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`💥 Failed to read or parse ${filePath}:`, error.message);
    process.exit(1);
  }
}

// --- Helper Functions for Generating Content ---

function generatePostContent() {
  const contents = [
    "Just finished an amazing workout! Feeling energized and ready for the day ahead. 💪 #Fitness #HealthyLiving",
    "Beautiful sunset today! Nature never ceases to amaze me. 🌅 #Sunset #Nature",
    "Coffee and coding - the perfect combination for a productive morning ☕💻 #Coding #Coffee",
    "Exploring new places and making unforgettable memories! 🗺️✨ #Travel #Adventure",
    "Grateful for all the amazing people in my life. Here's to more great moments! 🙏❤️ #Gratitude #Friends",
    "Trying out a new recipe today! Can't wait to see how it turns out 🍳👨‍🍳 #Cooking #Foodie",
    "Morning run in the park was exactly what I needed to start the day right! 🏃‍♂️🌳 #Running #MorningRoutine",
    "Working on some exciting new projects. The creative process is so rewarding! 🎨✨ #Creativity #Projects",
    "Spending quality time with family. These are the moments that matter most. 👨‍👩‍👧‍👦❤️ #Family #QualityTime",
    "Reading a fascinating book that has me completely hooked! 📚🤓 #Reading #Books",
  ];
  return contents[Math.floor(Math.random() * contents.length)];
}

function generateLocation() {
  const locations = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA",
    "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
    "Fort Worth, TX", "Columbus, OH", "Charlotte, NC", "San Francisco, CA", "Indianapolis, IN", "Seattle, WA",
    "Denver, CO", "Boston, MA", "El Paso, TX", "Nashville, TN", "Detroit, MI", "Oklahoma City, OK",
    "Portland, OR", "Las Vegas, NV", "Memphis, TN", "Louisville, KY",
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

// --- Main Seeding Function ---

async function seedDatabase() {
  console.log('\n🚀 Starting profile and post seeding...');

  try {
    // Load user data from the local JSON file
    const userData = loadUserDataFromFile('users.json');
    const userIds = Object.keys(userData);
    console.log(`✅ Loaded ${userIds.length} users from users.json.`);

    // Loop through each user from the JSON file
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const userInfo = userData[userId];

      console.log(`\n👤 Processing profile ${i + 1}/${userIds.length}: User ID ${userId}`);

      // First, get the auth user data from Supabase auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

      if (authError || !authUser) {
        console.error(`❌ Could not find auth user for ${userId}. Reason: ${authError?.message || 'User not found'}`);
        continue;
      }

      // Extract user data from auth metadata
      const displayName = authUser.user?.user_metadata?.name || authUser.user?.user_metadata?.display_name || `User ${userId.slice(0, 4)}`;
      const email = authUser.user?.email || `${displayName.toLowerCase().replace(/\s+/g, '')}@example.com`;

      // Generate unique username from display name
      const baseUsername = displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
      const username = baseUsername + Math.floor(Math.random() * 1000);

      // --- Update existing profile with display name and username from auth.users ---
      // Only update username and display_name, keep existing email, bio, and avatar_url
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          username: username,
          display_name: displayName,
        })
        .eq('id', userId)
        .select('username, display_name')
        .single();

      if (profileError) {
        console.error(`❌ Could not create/update profile for ${userId}. Reason: ${profileError.message}`);
        continue;
      }

      console.log(`✅ Successfully updated profile: ${profile.display_name} (@${profile.username})`);

      // Skip post creation since posts already exist
      console.log(`⏭️  Skipping post creation - posts already exist for user ${userId}\n`);
    }

    console.log('\n🎉 Profile update complete! All profiles have been updated with display names and usernames from auth.users.');

  } catch (error) {
    console.error('\n💥 An unexpected error occurred during seeding:', error.message);
    process.exit(1);
  }
}

// --- Script Execution ---

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };