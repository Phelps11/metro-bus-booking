# Metro Bus App - Deployment Guide

This guide will help you deploy your Metro Bus booking application to production.

## Prerequisites

- Your Supabase project is set up and running
- You have your Supabase URL and Anon Key
- You have a GitHub account (for deployment platforms)

## Environment Variables

Your app requires these environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The values are currently in your `.env` file:
- **VITE_SUPABASE_URL**: https://ibgjhmjzjbxplhwkrxoc.supabase.co
- **VITE_SUPABASE_ANON_KEY**: (found in your .env file)

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables:
     - Add `VITE_SUPABASE_URL`
     - Add `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Your app will be live in minutes!**

### Option 2: Deploy to Netlify

1. **Push your code to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings are auto-detected from `netlify.toml`
   - Add environment variables in Site Settings:
     - Add `VITE_SUPABASE_URL`
     - Add `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy site"

3. **Your app will be live!**

### Option 3: Deploy to Render

1. **Push your code to GitHub** (same as above)

2. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Sign in with GitHub
   - Click "New" → "Static Site"
   - Connect your repository
   - Configure:
     - Build Command: `npm run build`
     - Publish Directory: `dist`
   - Add environment variables
   - Click "Create Static Site"

## After Deployment

### 1. Update Supabase Configuration

Go to your Supabase dashboard and add your production URL to:
- **Authentication** → **URL Configuration**
  - Add your deployed URL to "Site URL"
  - Add your deployed URL to "Redirect URLs"

### 2. Test Your App

1. Visit your deployed URL
2. Test sign up functionality
3. Test sign in functionality
4. Test booking a bus trip
5. Test all major features

### 3. Custom Domain (Optional)

Both Vercel and Netlify allow you to add custom domains:
- Go to your project settings
- Add your custom domain
- Follow the DNS configuration instructions

## Troubleshooting

### App shows blank page
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure the build completed successfully

### Authentication not working
- Verify Supabase URL and keys are correct
- Check Supabase dashboard for the production URL in redirect settings
- Ensure Row Level Security (RLS) policies are enabled

### Database errors
- Check that all migrations have been applied
- Verify RLS policies are configured correctly
- Check Supabase logs for detailed error messages

## Support

If you encounter issues:
1. Check the deployment platform's build logs
2. Check browser console for errors
3. Review Supabase logs in the dashboard
4. Verify all environment variables are set correctly

## Security Notes

- Never commit your `.env` file to version control
- Always use environment variables for sensitive data
- Keep your Supabase keys secure
- Regularly update dependencies for security patches

---

Your Metro Bus app is now ready for production! 🚌
