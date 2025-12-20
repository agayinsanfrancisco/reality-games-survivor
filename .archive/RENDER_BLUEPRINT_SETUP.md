# 🚀 Render Blueprint Setup - Step by Step

## ✅ Admin Credentials Ready

**Email**: `admin@rgfl.com`
**Password**: `admin123`
**Status**: ✅ Set in production database

---

## 📋 Create Render Service via Blueprint

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Log in to your Render account

### Step 2: Create Blueprint
1. Click **"Blueprints"** in the left sidebar
2. Click **"New Blueprint Instance"** button (blue button, top right)

### Step 3: Connect GitHub Repository
1. **Select Repository**: Choose or search for `penelopespawprint/rgfl-multi`
   - If you don't see it, click "Configure GitHub App" to grant access
2. **Branch**: Select `main`
3. Click **"Apply"** or **"Next"**

### Step 4: Review Blueprint Configuration
Render will read the `render.yaml` file and show you:

**Service to be created**:
- **Name**: `rgfl-multi`
- **Type**: Web Service
- **Environment**: Node
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`

**Environment Variables** (auto-configured):
- `NODE_ENV` = production
- `DATABASE_URL` = (from render.yaml)
- `PORT` = 5050
- `CLIENT_ORIGIN` = https://test.realitygamesfantasyleague.com
- `CLIENT_URL` = https://test.realitygamesfantasyleague.com
- `JWT_SECRET` = (auto-generated)
- `SESSION_SECRET` = (auto-generated)

### Step 5: Confirm and Deploy
1. Review the configuration
2. Click **"Apply"** or **"Create Blueprint"**
3. Render will start building and deploying

### Step 6: Wait for Build (2-5 minutes)
Watch the build logs:
- ✅ Installing dependencies...
- ✅ Generating Prisma client...
- ✅ Building TypeScript...
- ✅ Starting service...

### Step 7: Configure Custom Domain
Once deployed, add your custom domain:

1. Go to your service → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter: `test.realitygamesfantasyleague.com`
4. Render will provide DNS instructions (CNAME record)

**DNS Configuration**:
```
Type: CNAME
Name: test
Value: rgfl-multi.onrender.com (Render will provide exact value)
```

### Step 8: Verify Deployment
1. Wait for DNS to propagate (can take 5-60 minutes)
2. Visit: https://test.realitygamesfantasyleague.com
3. You should see the RGFL app login page

---

## 🔐 Test Admin Login

Once the site is live:

1. Go to: https://test.realitygamesfantasyleague.com
2. Click **"Login"**
3. Enter:
   - **Email**: `admin@rgfl.com`
   - **Password**: `admin123`
4. Click **"Login"**
5. You should see the admin dashboard

---

## 🐛 Troubleshooting

### Blueprint Not Found
**Issue**: Can't find Blueprints in Render dashboard
**Solution**:
- Look for "Infrastructure as Code" or "IaC"
- Or use Manual Web Service creation (see below)

### Repository Not Listed
**Issue**: `penelopespawprint/rgfl-multi` not showing
**Solution**:
1. Click "Configure GitHub App"
2. Grant Render access to the repository
3. Refresh and try again

### Build Fails
**Check**:
- Build logs for specific error
- Ensure all dependencies in package.json
- Verify DATABASE_URL is set

### Service Won't Start
**Check**:
- Service logs for errors
- Ensure PORT environment variable is set
- Test database connection

### 503 Error After Deploy
**Possible causes**:
- Service still starting (wait 1-2 minutes)
- Health check failing (check `/` route)
- Database connection timeout

---

## 🔄 Alternative: Manual Web Service Creation

If Blueprint doesn't work, create manually:

1. **New** → **Web Service**
2. **Connect repository**: `penelopespawprint/rgfl-multi`
3. **Name**: `rgfl-multi`
4. **Branch**: `main`
5. **Build Command**:
   ```
   npm install && npx prisma generate && npm run build
   ```
6. **Start Command**:
   ```
   npm start
   ```
7. **Environment Variables** - Add these:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://rgfl_survivor_ml_user:yhyJlseYWgor248l8jcb70hFMsdoLB1K@dpg-d4kbb5k9c44c73erlpp0-a.oregon-postgres.render.com/rgfl_survivor_ml?sslmode=require
   PORT=5050
   CLIENT_ORIGIN=https://test.realitygamesfantasyleague.com
   CLIENT_URL=https://test.realitygamesfantasyleague.com
   JWT_SECRET=<click "Generate" button>
   SESSION_SECRET=<click "Generate" button>
   ```
8. Click **"Create Web Service"**

---

## ✅ Verification Checklist

- [ ] Render service created successfully
- [ ] Build completed without errors
- [ ] Service is running (status: Live)
- [ ] Custom domain configured
- [ ] DNS propagated
- [ ] Site loads: https://test.realitygamesfantasyleague.com
- [ ] Can login with `admin@rgfl.com` / `admin123`
- [ ] Admin dashboard accessible
- [ ] All admin functions working

---

## 📞 Need Help?

If you get stuck:
1. Share the error from Render logs
2. Share the build output
3. Check: https://status.render.com/ for outages

---

## 🎯 Summary

**Repository**: https://github.com/penelopespawprint/rgfl-multi
**Branch**: main
**Database**: rgfl_survivor_ml (already configured)
**Admin**: admin@rgfl.com / admin123
**Target URL**: https://test.realitygamesfantasyleague.com

Everything is ready - just need to create the Render service! 🚀
