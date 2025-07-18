# 🚀 Deployment Guide for PPoker

This guide helps you deploy PPoker to production environments and troubleshoot WebSocket connection issues.

## Quick Fix for WebSocket Issues

The most common deployment issue is **WebSocket connection refused** errors. We've implemented several fixes:

### 1. Fixed Server Configuration ✅
- **Issue**: `server.handleUpgrade() was called more than once`
- **Fix**: Removed duplicate WebSocket upgrade handling
- **Result**: WebSocket server now works correctly with deployment platforms

### 2. Enhanced Error Handling ✅
- **Added**: Connection timeouts and retry logic
- **Added**: Better error logging with connection codes
- **Added**: Health monitoring with ping/pong

### 3. Deployment-Ready Features ✅
- **Health Check**: `/health` endpoint for monitoring
- **Debug Tool**: `/debug` endpoint for WebSocket testing  
- **CORS Support**: Headers for cross-origin requests
- **Proxy Support**: Trust proxy settings for platforms like Render

## Platform-Specific Deployment

### Render.com

1. **Create a new Web Service** on Render
2. **Connect your repository** 
3. **Use these settings**:
   ```
   Build Command: npm install
   Start Command: npm start
   ```
4. **Set environment variable**:
   ```
   NODE_ENV=production
   ```

The included `render.yaml` file will automatically configure these settings.

### Heroku

1. **Create a new app**:
   ```bash
   heroku create your-ppoker-app
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

### Railway

1. **Connect your repository**
2. **Set environment variables**:
   ```
   NODE_ENV=production
   ```

## Troubleshooting WebSocket Issues

### 1. Use the Debug Tool
Visit `https://your-app.com/debug` to test WebSocket connectivity:
- ✅ Connection successful = All good!
- ❌ Connection failed = See solutions below

### 2. Check Health Endpoint
Visit `https://your-app.com/health` to verify server status:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-18T02:00:18.769Z",
  "clients": 0,
  "state": "REGISTRATION"
}
```

### 3. Common Issues & Solutions

#### Issue: "NS_ERROR_WEBSOCKET_CONNECTION_REFUSED"
**Causes:**
- Platform doesn't support WebSocket upgrades
- Reverse proxy not configured for WebSockets
- HTTPS/WSS protocol mismatch

**Solutions:**
1. ✅ **Check platform documentation** for WebSocket support
2. ✅ **Verify HTTPS**: Use `wss://` for HTTPS sites
3. ✅ **Test with debug tool**: `/debug` endpoint
4. ✅ **Check server logs** for WebSocket errors

#### Issue: "Connection timeout"
**Solutions:**
1. ✅ **Check firewall settings**
2. ✅ **Verify port configuration**
3. ✅ **Test health endpoint** first

#### Issue: "Connection drops frequently"
**Solutions:**
1. ✅ **Enable heartbeat** (already implemented)
2. ✅ **Check connection limits** on your platform
3. ✅ **Monitor server logs** for patterns

### 4. Platform Requirements

#### Render.com
- ✅ WebSocket support: **Yes**
- ✅ Auto-scaling: **Supported**
- ✅ HTTPS: **Automatic**

#### Heroku
- ✅ WebSocket support: **Yes**  
- ⚠️ **Note**: Free tier has connection limits
- ✅ HTTPS: **Automatic**

#### Railway
- ✅ WebSocket support: **Yes**
- ✅ Auto-scaling: **Supported**
- ✅ HTTPS: **Automatic**

## Testing Your Deployment

### 1. Quick Test Checklist
- [ ] Health check responds: `https://your-app.com/health`
- [ ] Debug tool loads: `https://your-app.com/debug`
- [ ] WebSocket connects successfully in debug tool
- [ ] Admin panel loads: `https://your-app.com/admin`
- [ ] Client page loads: `https://your-app.com/client`

### 2. Full Integration Test
1. **Open admin panel**: `https://your-app.com/admin`
2. **Open client page** in another tab: `https://your-app.com/client`
3. **Register a test user** on client page
4. **Start a session** from admin panel
5. **Cast a vote** from client page
6. **Reveal cards** from admin panel

## Environment Variables

```bash
# Required
NODE_ENV=production

# Optional (platform usually sets these)
PORT=3000
```

## Performance Tips

### For High Traffic
1. **Enable connection pooling** (already implemented)
2. **Monitor client count** via `/health` endpoint
3. **Use platform auto-scaling**

### For Low Latency
1. **Choose server region** close to users
2. **Use CDN** for static assets (not critical for this app)
3. **Monitor ping/pong** in server logs

## Server Logs

Look for these patterns in your deployment logs:

### ✅ Healthy Patterns
```
🚀 [SERVER] PPoker server running on port 3000
🔌 [SERVER] New WebSocket connection established
👤 [SERVER] Client registered successfully
```

### ❌ Problem Patterns
```
❌ [SERVER] WebSocket error: 
🔌 [SERVER] WebSocket connection closed. Code: 1006
💀 [SERVER] Terminating unresponsive WebSocket connection
```

## Getting Help

If you're still experiencing issues:

1. **Check the debug tool**: `/debug`
2. **Review server logs** for error patterns
3. **Test health endpoint**: `/health`
4. **Verify platform WebSocket support**
5. **Check your platform's documentation** for WebSocket configuration

## Summary of Fixes Applied

✅ **Fixed duplicate upgrade handling** - No more "handleUpgrade called twice" errors  
✅ **Added connection timeouts** - Prevents hanging connections  
✅ **Enhanced error logging** - Better debugging information  
✅ **Added health monitoring** - Ping/pong keeps connections alive  
✅ **CORS and proxy support** - Works with deployment platforms  
✅ **Debug tools** - Easy WebSocket testing  
✅ **Automatic reconnection** - Client recovers from network issues  

Your PPoker app should now deploy successfully to any modern hosting platform! 🎉

2. **Set environment variables**:
```bash
heroku config:set NODE_ENV=production
```

### Railway

1. **Add a `railway.toml` file**:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

### Vercel (Serverless)

⚠️ **Note**: Vercel's serverless functions don't support persistent WebSocket connections. For WebSocket applications, use platforms like Render, Railway, or Heroku instead.

## Debugging WebSocket Issues

### 1. Use the Built-in Debug Tool

Visit `/debug` on your deployed application to test WebSocket connectivity:
- `https://your-app.onrender.com/debug`

### 2. Check Health Endpoint

Visit `/health` to ensure the server is running:
- `https://your-app.onrender.com/health`

### 3. Browser Developer Tools

1. Open browser DevTools (F12)
2. Go to the Network tab
3. Look for WebSocket connections (WS filter)
4. Check for error messages in the Console

### 4. Server Logs

Check your platform's logs for WebSocket-related errors:

**Render**: Go to your service dashboard and check the "Logs" tab
**Heroku**: Use `heroku logs --tail`
**Railway**: Check the deployment logs in your project dashboard

## Common Fixes

### 1. Protocol Mismatch

Ensure the client uses the correct protocol:
- `ws://` for HTTP
- `wss://` for HTTPS

The application automatically detects this, but some platforms require manual configuration.

### 2. Proxy Configuration

Some platforms require specific configuration for WebSocket proxying. Our server includes:
- Proper CORS headers
- Trust proxy settings
- WebSocket upgrade handling

### 3. Connection Timeouts

The application includes:
- Automatic reconnection with exponential backoff
- Connection health monitoring (ping/pong)
- Configurable connection timeouts

### 4. Environment Variables

Set these environment variables in production:
```
NODE_ENV=production
PORT=3000  # Usually set automatically by the platform
```

## Testing Your Deployment

1. **Test HTTP endpoints**:
   - `GET /health` - Should return server status
   - `GET /ws-test` - Should return WebSocket information

2. **Test WebSocket connection**:
   - Visit `/debug` to run WebSocket diagnostics
   - Check browser console for connection errors

3. **Test the application**:
   - Visit `/admin` for the admin panel
   - Visit `/client` for the client interface
   - Try creating a session and adding participants

## Troubleshooting Checklist

- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] WebSocket debug tool connects successfully
- [ ] Browser console shows no WebSocket errors
- [ ] Admin panel loads and connects
- [ ] Client interface loads and connects
- [ ] Can create sessions and vote

## Platform-Specific Issues

### Render.com
- **Build fails**: Check that `package.json` has all dependencies
- **WebSocket fails**: Verify the service type is set to "Web Service"
- **Environment**: Make sure `NODE_ENV=production` is set

### Heroku
- **Port issues**: Heroku automatically sets `PORT` environment variable
- **Dyno sleeping**: Free dynos sleep after 30 minutes of inactivity

### Railway
- **Domain issues**: Railway provides auto-generated domains
- **Resource limits**: Check if you're hitting memory/CPU limits

## Support

If you continue experiencing issues:

1. Check the server logs for specific error messages
2. Use the `/debug` endpoint to diagnose WebSocket connectivity
3. Verify your platform's WebSocket support documentation
4. Test locally first to ensure the application works

## Performance Tips

1. **Enable connection pooling** in production
2. **Monitor connection count** via the health endpoint
3. **Set up proper logging** for production debugging
4. **Use CDN** for static assets if needed
