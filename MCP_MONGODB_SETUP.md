# Connecting Cursor with MongoDB via MCP

## Quick Setup Guide

### Step 1: Install MongoDB MCP Server

```bash
npm install -g mongodb-mcp-server
```

Or use npx (no installation needed):
```bash
npx -y mongodb-mcp-server
```

### Step 2: Configure Cursor MCP Settings

1. **Open Cursor Settings**:
   - Press `Ctrl+,` (Windows) or `Cmd+,` (Mac)
   - Or: `File > Preferences > Settings`

2. **Search for "MCP"** in settings

3. **Add MongoDB MCP Server Configuration**:

   The MCP configuration is typically in:
   - **Windows**: `%APPDATA%\Cursor\User\globalStorage\mcp.json`
   - **Mac**: `~/Library/Application Support/Cursor/User/globalStorage/mcp.json`
   - **Linux**: `~/.config/Cursor/User/globalStorage/mcp.json`

   Or configure via Cursor's settings UI:

   **Configuration Format**:
   ```json
   {
     "mcpServers": {
       "mongodb": {
         "command": "npx",
         "args": [
           "-y",
           "mongodb-mcp-server"
         ],
         "env": {
           "MONGODB_URI": "mongodb+srv://username:password@cluster.mongodb.net/confirmly"
         }
       }
     }
   }
   ```

### Step 3: Set Your MongoDB Connection String

Replace the connection string with your actual MongoDB URI:

**For MongoDB Atlas**:
```
mongodb+srv://username:password@cluster.mongodb.net/confirmly
```

**For Local MongoDB**:
```
mongodb://localhost:27017/confirmly
```

### Step 4: Also Set in Your Project

Make sure `apps/api/.env` has the same connection string:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/confirmly
```

### Step 5: Restart Cursor

1. Close Cursor completely
2. Reopen Cursor
3. MCP server should connect automatically

### Step 6: Verify Connection

Once connected, you can ask Cursor to:

1. **List Collections**:
   ```
   Show me all collections in MongoDB
   List all databases and collections
   ```

2. **Query Data**:
   ```
   Query users from the database
   Show me all plans in the database
   Check if admin account exists
   Find all merchants
   ```

3. **Run Setup**:
   ```
   Run the database setup script
   Create the default plans and admin account
   Initialize the database
   ```

4. **Check Schema**:
   ```
   Show me the schema for the users collection
   Describe the orders collection structure
   ```

**Note**: If you get "You need to connect to a MongoDB instance", make sure:
- MCP configuration is correct in Cursor settings
- MongoDB connection string is valid
- Cursor has been restarted after configuration

## Alternative: Using Cursor's MCP Settings UI

1. **Open Cursor Settings** (`Ctrl+,` or `Cmd+,`)
2. **Search for "MCP"**
3. **Click "Edit MCP Servers"** or similar option
4. **Add New Server**:
   - **Name**: `mongodb`
   - **Command**: `npx`
   - **Args**: `-y`, `mongodb-mcp-server`
   - **Environment Variables**:
     - `MONGODB_URI`: `your-connection-string`

## Using MCP After Setup

Once connected, you can:

1. **Query Database**:
   ```
   Show me all users in MongoDB
   Check if plans collection exists
   Query merchants from database
   ```

2. **Run Setup Script**:
   ```
   Run the database setup script to create plans and admin account
   ```

3. **Create Collections**:
   ```
   Create the users collection with proper schema
   ```

## Troubleshooting

### MCP Server Not Connecting

1. **Check MongoDB URI**:
   - Verify connection string format
   - Test with MongoDB Compass
   - For Atlas: Check IP whitelist

2. **Check Installation**:
   ```bash
   npx -y mongodb-mcp-server --version
   ```

3. **Check Cursor Logs**:
   - `Help > Toggle Developer Tools`
   - Check Console for MCP errors

### "Command Not Found"

- Use full path to npx:
  - Windows: `C:\Users\YourName\AppData\Roaming\npm\npx.cmd`
  - Mac/Linux: `/usr/local/bin/npx`

### Connection Timeout

- Verify MongoDB is accessible
- Check network connectivity
- For Atlas: Verify IP whitelist and firewall rules

## Security Notes

1. **Never commit credentials** to git
2. **Use environment variables** for connection strings
3. **Use read-only MongoDB user** for MCP when possible
4. **Rotate credentials** regularly

## Next Steps

After MCP is connected:

1. **Run database setup**:
   ```bash
   cd apps/api
   pnpm setup:db
   ```

2. **Or ask Cursor**:
   ```
   Run the database setup script to create plans and admin account
   ```

3. **Verify setup**:
   ```
   Check if admin account exists in MongoDB
   Show me all plans in the database
   ```

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MongoDB MCP Server](https://github.com/mongodb/mongodb-mcp-server)
- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)
