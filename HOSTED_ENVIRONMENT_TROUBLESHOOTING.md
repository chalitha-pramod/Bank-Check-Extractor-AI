# Hosted Environment Troubleshooting Guide - Bank Check AI

## 🚨 **Critical Issue: Database Not Persisting on Vercel**

### **Problem Description**
When you host your Bank Check AI application on Vercel, the **SQLite database gets reset on every deployment**. This means:
- ✅ Your app works initially
- ❌ **All check data disappears after deployment**
- ❌ **User accounts get reset**
- ❌ **Database connection fails**

### **Why This Happens**
1. **Vercel Serverless Functions**: Each function execution is stateless
2. **No Persistent Storage**: SQLite files don't persist between deployments
3. **Ephemeral File System**: Temporary storage that gets cleared
4. **Multiple Instances**: Different serverless instances can't share database state

---

## 🔧 **Solutions for Hosted Environments**

### **Option 1: Use External Database (Recommended)**

#### **A. PostgreSQL on Vercel**
```bash
# Install PostgreSQL adapter
npm install pg

# Update database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

#### **B. MongoDB Atlas**
```bash
# Install MongoDB driver
npm install mongodb

# Update database.js
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
```

#### **C. Supabase (Free Tier)**
```bash
# Install Supabase client
npm install @supabase/supabase-js

# Update database.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
```

### **Option 2: Use Vercel KV (Redis)**
```bash
# Install Vercel KV
npm install @vercel/kv

# Update database.js
import { kv } from '@vercel/kv';

// Store data in Redis
await kv.set('checks:user:123', JSON.stringify(checks));
```

### **Option 3: Use Vercel Postgres**
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Update database.js
import { sql } from '@vercel/postgres';

// Use SQL queries
const result = await sql`SELECT * FROM bank_checks WHERE user_id = ${userId}`;
```

---

## 🚀 **Quick Fix: Environment Variables**

### **1. Set Database URL in Vercel**
```bash
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables
DATABASE_URL=your_external_database_connection_string
```

### **2. Update Backend Configuration**
```javascript
// backend/config.js
module.exports = {
  DATABASE_URL: process.env.DATABASE_URL || 'sqlite:./database.sqlite',
  DATABASE_TYPE: process.env.DATABASE_TYPE || 'sqlite'
};
```

---

## 🔍 **Diagnosing Hosted Environment Issues**

### **Step 1: Check Environment**
```javascript
// Add this to your Dashboard component
console.log('🌐 Environment Check:');
console.log('Hostname:', window.location.hostname);
console.log('Is Vercel:', window.location.hostname.includes('vercel.app'));
console.log('Is Localhost:', window.location.hostname === 'localhost');
```

### **Step 2: Run Health Check**
```javascript
// Use the built-in health check
import { logHealthReport } from '../utils/databaseHealth';

// Click the "🏥 Health Check" button in Dashboard
// This will show detailed diagnostics
```

### **Step 3: Check Console Logs**
```javascript
// Look for these error patterns:
// ❌ "Database connection failed"
// ❌ "No checks data in response"
// ❌ "Server error: 500"
// ❌ "API endpoint not found: 404"
```

---

## 📊 **Database Migration Guide**

### **From SQLite to PostgreSQL**

#### **1. Update Database Schema**
```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bank_checks table
CREATE TABLE bank_checks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  micr_code TEXT,
  cheque_date TEXT,
  amount_number TEXT,
  amount_words TEXT,
  currency_name TEXT,
  payee_name TEXT,
  account_number TEXT,
  anti_fraud_features TEXT,
  image_filename TEXT,
  extracted_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. Update Database Connection**
```javascript
// backend/database.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0]);
  }
});
```

#### **3. Update Queries**
```javascript
// Old SQLite query
db.all('SELECT * FROM bank_checks WHERE user_id = ?', [userId], callback);

// New PostgreSQL query
pool.query('SELECT * FROM bank_checks WHERE user_id = $1', [userId], callback);
```

---

## 🧪 **Testing Your Hosted Environment**

### **1. Test Database Connection**
```bash
# Visit your hosted backend
https://your-backend.vercel.app/api/test-db

# Should return:
{
  "message": "Database connection successful",
  "test": { "now": "2024-01-01T12:00:00.000Z" }
}
```

### **2. Test Authentication**
```bash
# Test login endpoint
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### **3. Test Check Creation**
```bash
# Test sample data insertion
curl -X POST https://your-backend.vercel.app/api/checks/insert-sample \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 **Emergency Recovery Steps**

### **If Database is Completely Lost:**

#### **1. Check Vercel Logs**
```bash
# Go to Vercel Dashboard → Your Project → Functions
# Look for error logs in serverless function executions
```

#### **2. Verify Environment Variables**
```bash
# Check if DATABASE_URL is set correctly
# Ensure all required variables are present
```

#### **3. Test Backend Health**
```bash
# Test basic connectivity
curl https://your-backend.vercel.app/api/health

# Test database specifically
curl https://your-backend.vercel.app/api/test-db
```

#### **4. Check Frontend Console**
```javascript
// Open browser console and look for:
// - Network request failures
// - Authentication errors
// - Database connection errors
```

---

## 💡 **Best Practices for Hosted Environments**

### **1. Use Environment-Specific Configs**
```javascript
// backend/config.js
const config = {
  development: {
    database: 'sqlite:./database.sqlite',
    port: 5000
  },
  production: {
    database: process.env.DATABASE_URL,
    port: process.env.PORT || 5000
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

### **2. Implement Connection Pooling**
```javascript
// For PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### **3. Add Health Monitoring**
```javascript
// Regular health checks
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database health check passed');
  } catch (error) {
    console.error('❌ Database health check failed:', error);
  }
}, 60000); // Every minute
```

### **4. Implement Retry Logic**
```javascript
// Retry database operations
const retryOperation = async (operation, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## 🔧 **Quick Fix Commands**

### **For Immediate Relief:**
```bash
# 1. Check if backend is running
curl https://your-backend.vercel.app/api/health

# 2. Test database connection
curl https://your-backend.vercel.app/api/test-db

# 3. Check Vercel deployment status
# Go to Vercel Dashboard → Your Project → Deployments

# 4. Redeploy backend
# Go to Vercel Dashboard → Your Project → Deployments → Redeploy
```

### **For Long-term Solution:**
```bash
# 1. Set up external database (PostgreSQL/MongoDB)
# 2. Update environment variables
# 3. Migrate database schema
# 4. Test thoroughly
# 5. Deploy updated backend
```

---

## 📞 **Getting Help**

### **1. Check These First:**
- [ ] Vercel deployment logs
- [ ] Environment variables
- [ ] Database connection string
- [ ] Frontend console errors
- [ ] Backend health endpoint

### **2. Common Issues:**
- **Database URL malformed**: Check connection string format
- **SSL issues**: Add `?sslmode=require` to PostgreSQL URL
- **Permission denied**: Verify database user permissions
- **Connection timeout**: Check firewall/network settings

### **3. Support Resources:**
- Vercel Documentation: https://vercel.com/docs
- Database-specific documentation
- Browser console error logs
- Network tab in DevTools

---

## 🎯 **Summary**

**The main issue is that SQLite databases don't persist on Vercel.** To fix this:

1. **Immediate**: Use the Health Check feature to diagnose issues
2. **Short-term**: Set up external database (PostgreSQL/MongoDB)
3. **Long-term**: Implement proper database connection pooling and monitoring

**Remember**: Hosted environments require different database strategies than local development!
