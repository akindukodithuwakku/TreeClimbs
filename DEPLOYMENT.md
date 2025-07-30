# 🚀 Vercel Deployment Guide

This guide will help you deploy the Coconut Tree Climber Dashboard to Vercel with proper environment variable configuration.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Firebase Project** - Already configured with Realtime Database

## 🔧 Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add environment variables support"
   git push origin main
   ```

## 🌐 Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard:**

   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import from GitHub:**

   - Select your repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Project:**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## 🔐 Step 3: Add Environment Variables

**In your Vercel project dashboard, go to Settings → Environment Variables and add:**

### Required Environment Variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCAZAzffI5C3bgrIVduRZ25pOea8YI4-ts
VITE_FIREBASE_AUTH_DOMAIN=treeclimber-b1f3c.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://treeclimber-b1f3c-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=treeclimber-b1f3c
VITE_FIREBASE_STORAGE_BUCKET=treeclimber-b1f3c.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=554804238885
VITE_FIREBASE_APP_ID=1:554804238885:web:6ec3c4281f3696914c7dcc

# Firebase Authentication
VITE_FIREBASE_USER_EMAIL=akindukodithuwakku@gmail.com
VITE_FIREBASE_USER_PASSWORD=akindu123
```

### How to Add in Vercel:

1. **Go to Project Settings** → **Environment Variables**
2. **Add each variable:**
   - **Name**: `VITE_FIREBASE_API_KEY`
   - **Value**: `AIzaSyCAZAzffI5C3bgrIVduRZ25pOea8YI4-ts`
   - **Environment**: Production, Preview, Development
3. **Repeat for all variables above**

## 🎯 Step 4: Deploy

1. **Click "Deploy"** in Vercel
2. **Wait for build** (usually 1-2 minutes)
3. **Your app will be live** at `https://your-project.vercel.app`

## 🔍 Step 5: Verify Deployment

1. **Check your live URL**
2. **Test Firebase connection**
3. **Verify ESP32 data is showing**

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails:**

   - Check if all dependencies are in `package.json`
   - Verify Vite configuration

2. **Environment Variables Not Working:**

   - Ensure all variables start with `VITE_`
   - Check if variables are set for all environments
   - Redeploy after adding variables

3. **Firebase Connection Issues:**
   - Verify Firebase project settings
   - Check database rules allow read access
   - Ensure authentication credentials are correct

### Firebase Database Rules:

Make sure your Firebase Realtime Database has these rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## 📱 Local Development with Environment Variables

1. **Copy the example file:**

   ```bash
   cp env.example .env.local
   ```

2. **The values are already filled in** - no changes needed

3. **Start development server:**
   ```bash
   npm run dev
   ```

**Note:** All environment variables are required. The app will not work without them.

## 🔄 Updating Deployment

After making changes:

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Update dashboard"
   git push origin main
   ```

2. **Vercel will auto-deploy** from your GitHub repository

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Firebase Console**: Monitor database usage
- **Browser Console**: Check for client-side errors

## 🎉 Success!

Your Coconut Tree Climber Dashboard is now live and ready to receive data from your ESP32! 🌴📈
