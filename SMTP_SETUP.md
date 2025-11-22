# SMTP Configuration for Password Reset Emails

## Overview
Your password reset functionality is now set up, but to send emails reliably in production, you need to configure a custom SMTP provider in Supabase.

## Current Status
- By default, Supabase uses their built-in SMTP for testing
- This works for development but has limitations (rate limits, delivery issues)
- For production, you need a custom SMTP provider

## Recommended SMTP Providers

### 1. **SendGrid** (Recommended)
- Free tier: 100 emails/day
- Easy to set up
- Reliable delivery
- Website: https://sendgrid.com

### 2. **Mailgun**
- Free tier: 5,000 emails/month (first 3 months)
- Great for transactional emails
- Website: https://mailgun.com

### 3. **AWS SES**
- Very cost-effective ($0.10 per 1,000 emails)
- Requires AWS account
- Website: https://aws.amazon.com/ses

## Setup Instructions

### Step 1: Get SMTP Credentials

#### For SendGrid:
1. Sign up at https://sendgrid.com
2. Navigate to **Settings > Sender Authentication**
3. Verify your domain or single sender email
4. Go to **Settings > API Keys**
5. Create a new API key with "Mail Send" permissions
6. Note down your credentials:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: (your API key)

#### For Mailgun:
1. Sign up at https://mailgun.com
2. Navigate to **Sending > Domain settings**
3. Get your SMTP credentials:
   - Host: `smtp.mailgun.org`
   - Port: `587`
   - Username: (provided by Mailgun)
   - Password: (provided by Mailgun)

### Step 2: Configure Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication > Settings** (or **Project Settings > Authentication**)
4. Scroll down to **SMTP Settings**
5. Enable **Enable Custom SMTP**
6. Enter your SMTP credentials:
   - **Sender email**: Your verified email address
   - **Sender name**: Your app name (e.g., "Metro Bus")
   - **Host**: Your SMTP host (e.g., smtp.sendgrid.net)
   - **Port**: Usually `587` (TLS) or `465` (SSL)
   - **Username**: From your provider
   - **Password**: From your provider
7. Click **Save**

### Step 3: Customize Email Templates (Optional)

1. In Supabase Dashboard, go to **Authentication > Email Templates**
2. Find **Reset Password** template
3. Customize the email content and styling
4. Use these variables in your template:
   - `{{ .ConfirmationURL }}` - The password reset link
   - `{{ .Token }}` - The reset token
   - `{{ .SiteURL }}` - Your site URL

Example template:
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
```

### Step 4: Test the Setup

1. Go to your login page
2. Click "Forgot password?"
3. Enter your email
4. Check your inbox for the reset email
5. Click the link and set a new password

## Troubleshooting

### Emails Not Being Received
- Check your spam folder
- Verify your SMTP credentials are correct
- Ensure your sender email is verified with your SMTP provider
- Check Supabase logs: **Logs > Auth Logs**

### "Invalid redirect URL" Error
- Make sure the redirect URL in the reset function matches your site's URL
- Update in Supabase Dashboard: **Authentication > URL Configuration**
- Add your production URL to the allowed redirect URLs

### Email Links Not Working
- Verify the redirect URL is added to Supabase's allowed URLs
- Check that the `/reset-password` route is accessible
- Ensure your domain is correct in the email link

## Security Best Practices

1. **Never expose SMTP credentials** - They're stored securely in Supabase
2. **Use environment variables** for any email-related configuration in your app
3. **Enable rate limiting** to prevent abuse
4. **Verify sender domain** with your SMTP provider for better deliverability
5. **Monitor email logs** regularly in your SMTP provider dashboard

## Additional Configuration

### Rate Limiting
In Supabase Dashboard:
- **Authentication > Rate Limits**
- Set limits for password reset requests (e.g., 5 per hour per IP)

### Email Redirect URLs
In Supabase Dashboard:
- **Authentication > URL Configuration**
- Add your production domain to **Redirect URLs**
- Format: `https://yourdomain.com/**`

## Cost Estimates

- **SendGrid Free**: 100 emails/day (sufficient for small apps)
- **Mailgun**: First 3 months free (5,000/month), then $0.80 per 1,000 emails
- **AWS SES**: $0.10 per 1,000 emails (cheapest for high volume)

## Support

If you encounter issues:
1. Check Supabase Auth Logs
2. Check your SMTP provider's logs
3. Contact Supabase support: https://supabase.com/support
4. Check Supabase Discord: https://discord.supabase.com
