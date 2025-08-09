const db = require('./database');

console.log('Testing database connection...');

// Test database connection
db.get('SELECT 1 as test', (err, row) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connection successful');
  }
});

// Test users table
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
  if (err) {
    console.error('❌ Error checking users table:', err.message);
  } else if (row) {
    console.log('✅ Users table exists');
  } else {
    console.log('❌ Users table does not exist');
  }
});

// Test bank_checks table
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='bank_checks'", (err, row) => {
  if (err) {
    console.error('❌ Error checking bank_checks table:', err.message);
  } else if (row) {
    console.log('✅ Bank_checks table exists');
  } else {
    console.log('❌ Bank_checks table does not exist');
  }
});

// Test inserting a user
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password_hash: 'test_hash'
};

db.run(
  'INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)',
  [testUser.username, testUser.email, testUser.password_hash],
  function(err) {
    if (err) {
      console.error('❌ Error inserting test user:', err.message);
    } else {
      console.log('✅ Test user inserted successfully');
      
      // Clean up test user
      db.run('DELETE FROM users WHERE username = ?', [testUser.username], (err) => {
        if (err) {
          console.error('❌ Error cleaning up test user:', err.message);
        } else {
          console.log('✅ Test user cleaned up');
        }
        
        console.log('\n🎉 Database test completed successfully!');
        process.exit(0);
      });
    }
  }
); 