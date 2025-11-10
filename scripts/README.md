# Database Setup Scripts

This directory contains scripts for setting up and populating your Supabase database for the Framez social media app.

## Database Schema Setup

First, run the SQL script to create the necessary tables:

```bash
# Connect to your Supabase database and run:
# psql -h your-db-host -U postgres -d postgres -f scripts/create-tables.sql
```

Or copy and paste the contents of `scripts/create-tables.sql` into your Supabase SQL editor.

## Database Seeding Script

This script populates your Supabase database with sample data for the Framez social media app.

## Setup

1. **Install dependencies:**
   ```bash
   cd scripts
   npm install
   ```

2. **Configure environment variables:**
   Edit `scripts/.env` and add your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   Get these values from your Supabase dashboard → Settings → API.

## Usage

Run the seeding script:

```bash
cd scripts
node seed.js
```

## Database Tables Created

The `create-tables.sql` script creates the following tables:

- **follows**: User following relationships
- **messages**: Direct messaging between users
- **likes**: Post and comment likes
- **comments**: Post comments

## What the seeding script does

- Fetches 100 random users from Random User API
- Creates user profiles in the `profiles` table
- Generates 10 posts for each user (1,000 total posts)
- Uses Lorem Picsum for random post images
- Includes realistic bios, locations, and content
- Adds hashtags and varied post visibility

## Output

The script provides detailed progress logging:
- User creation progress
- Post creation progress
- Error handling for failed operations
- Final summary statistics

## Data Generated

- **100 Users**: Realistic profiles with avatars, bios, and verification status
- **1,000 Posts**: Mixed content with images, locations, and hashtags
- **Varied Content**: Different post types, visibility settings, and engagement potential

## Safety

- Uses service role key for admin operations
- Handles API rate limits gracefully
- Provides detailed error logging
- Can be run multiple times (will create new data each time)