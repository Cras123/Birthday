# Render Deployment Guide

## What Was Fixed

1. ✅ **MongoDB Connection Options**: Added proper timeout configurations for production

   - `serverSelectionTimeoutMS: 30000` (30 seconds)
   - `socketTimeoutMS: 45000` (45 seconds)
   - `family: 4` (Use IPv4)

2. ✅ **Port Configuration**: Changed from hardcoded port 2909 to use `process.env.PORT`

   - Render requires apps to use the PORT environment variable

3. ✅ **Server Startup Sequence**: Server now waits for DB connection before starting

   - Prevents requests before database is ready

4. ✅ **Health Check Route**: Added `/health` endpoint

   - Useful for monitoring and debugging

5. ✅ **Start Script**: Added `"start": "node app.js"` to package.json
   - Required for Render to know how to start your app

## Critical Steps for MongoDB Atlas

### 1. Whitelist All IP Addresses

This is the MOST IMPORTANT step to fix the timeout error:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on your cluster
3. Go to **Network Access** (in the left sidebar)
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"**
6. This will add `0.0.0.0/0` to the IP whitelist
7. Click **"Confirm"**

⚠️ **Why this is needed**: Render uses dynamic IP addresses, so you need to allow all IPs.

### 2. Verify Connection String

1. In MongoDB Atlas, click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
4. It should look like: `mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority`
5. Make sure to replace `<username>`, `<password>`, and `<database>` with your actual values

## Deployment Steps for Render

### 1. Create Environment Variable

1. Go to your Render dashboard
2. Select your web service
3. Go to **"Environment"** tab
4. Add a new environment variable:
   - **Key**: `ATLASDB_URL`
   - **Value**: Your MongoDB connection string (from step 2 above)
5. Click **"Save Changes"**

### 2. Deploy

1. Render will automatically redeploy after you save the environment variable
2. Or manually trigger a deploy from the **"Manual Deploy"** dropdown

### 3. Monitor the Deployment

1. Watch the **"Logs"** tab in Render
2. You should see:
   ```
   Connected to MongoDB
   Server is listening on port XXXX
   ```

### 4. Test Your App

1. Visit your Render URL: `https://your-app-name.onrender.com`
2. Check the health endpoint: `https://your-app-name.onrender.com/health`
   - Should show: `{"status":"OK","mongodb":"Connected","timestamp":"..."}`

## Troubleshooting

### If you still see timeout errors:

1. **Double-check MongoDB Atlas IP Whitelist**

   - Make sure `0.0.0.0/0` is added
   - It can take 1-2 minutes to take effect

2. **Verify Environment Variable**

   - Check that `ATLASDB_URL` is set correctly in Render
   - No extra spaces or quotes in the connection string

3. **Check MongoDB Atlas Cluster Status**

   - Make sure your cluster is running (not paused)
   - Free tier clusters pause after inactivity

4. **Review Render Logs**

   - Look for "Connected to MongoDB" message
   - Any error messages will show the specific issue

5. **Test Connection String Locally**
   ```bash
   # Add to your .env file locally
   ATLASDB_URL=your_connection_string
   # Then run:
   node app.js
   ```

### Common Issues:

- **"Bad auth"**: Username or password is incorrect in connection string
- **"Timeout"**: IP not whitelisted in MongoDB Atlas
- **"Invalid connection string"**: Check format and ensure password is URL-encoded
- **Cluster paused**: Resume it in MongoDB Atlas

## Important Notes

1. **Uploads Folder**: The `public/uploads` directory is for local development. On Render, uploaded files will be lost on redeploys. Consider using cloud storage (Cloudinary, AWS S3) for production.

2. **Environment Variables**: Never commit your `.env` file to Git. Keep your connection string secure.

3. **Node Version**: Your app is configured to use Node 20.15.0 (specified in package.json)

## Support

If you continue to experience issues, check:

- MongoDB Atlas status page
- Render status page
- Your Render deployment logs
