# NERD Compliance Clearance System - Setup Guide

## Step 1: Add Your NERD Logo

Copy your `nerd-logo.png` file to the `assets` folder:

```
NERD/
└── assets/
    └── nerd-logo.png    <-- Put your logo here
```

---

## Step 2: Supabase Database Setup

### 2.1 Create a new Supabase project (if you haven't already)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project

### 2.2 Create the submissions table

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Create the submissions table
CREATE TABLE submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ndn TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    institution TEXT NOT NULL,
    faculty TEXT NOT NULL,
    department TEXT NOT NULL,
    submission_type TEXT NOT NULL,
    submission_date TIMESTAMPTZ NOT NULL,
    ncvs_compliance TEXT DEFAULT 'Not enforced',
    academic_report TEXT DEFAULT 'Complied',
    contribution_amount TEXT DEFAULT 'N/A (via Partner)',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on NDN for faster lookups
CREATE INDEX idx_submissions_ndn ON submissions(ndn);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read and insert)
CREATE POLICY "Anyone can view submissions" ON submissions
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert submissions" ON submissions
    FOR INSERT WITH CHECK (true);
```

### 2.3 Get your Supabase credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

---

## Step 3: Configure the Application

Open `js/supabase.js` and replace the placeholder values:

```javascript
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

---

## Step 4: Test Locally

You can test the application locally by opening `index.html` directly in your browser.

**Note:** For local development, you may need to use a local server due to CORS. You can use:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using VS Code Live Server extension
# Just right-click index.html → Open with Live Server
```

Then open `http://localhost:8000` in your browser.

---

## Step 5: Deploy to Vercel

### 5.1 Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

### 5.2 Deploy

In the project folder, run:

```bash
vercel
```

Follow the prompts to deploy.

### 5.3 Update BASE_URL (Optional)

After deployment, the QR codes will automatically use the correct domain since we use `window.location.origin`. No additional configuration needed!

---

## Project Structure

```
NERD/
├── index.html          # Form page
├── result.html         # Certificate display
├── verify.html         # QR verification page
├── css/
│   └── styles.css      # Styles
├── js/
│   ├── supabase.js     # Database config
│   ├── app.js          # Form handler
│   ├── result.js       # Certificate display
│   └── verify.js       # Verification logic
├── assets/
│   └── nerd-logo.png   # Your logo
└── README.md           # This file
```

---

## Features

- ✅ Form to enter all certificate details
- ✅ Automatic NDN generation (unique per certificate)
- ✅ QR code generation for verification
- ✅ PDF export with proper formatting
- ✅ Verification page for QR code scanning
- ✅ Supabase database for persistent storage
- ✅ Responsive design for all devices
