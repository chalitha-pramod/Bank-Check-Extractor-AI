const db = require('./database');

console.log('🔍 Debugging Database Content...');

// Function to check all checks in database
function debugDatabaseContent() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM bank_checks ORDER BY created_at DESC', (err, checks) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`📊 Found ${checks.length} checks in database`);
      
      checks.forEach((check, index) => {
        console.log(`\n--- Check ${index + 1} (ID: ${check.id}) ---`);
        console.log('Database Fields:');
        console.log('  - payee_name:', check.payee_name);
        console.log('  - amount_number:', check.amount_number);
        console.log('  - amount_words:', check.amount_words);
        console.log('  - cheque_date:', check.cheque_date);
        console.log('  - micr_code:', check.micr_code);
        console.log('  - account_number:', check.account_number);
        console.log('  - anti_fraud_features:', check.anti_fraud_features);
        console.log('  - currency_name:', check.currency_name);
        console.log('  - image_filename:', check.image_filename);
        console.log('  - created_at:', check.created_at);
        
        console.log('\nExtracted Text (Raw):');
        console.log('  - extracted_text:', check.extracted_text);
        
        // Try to parse JSON
        if (check.extracted_text) {
          try {
            const parsed = JSON.parse(check.extracted_text);
            console.log('\nParsed JSON Data:');
            console.log('  - payee_name:', parsed.payee_name);
            console.log('  - amount_number:', parsed.amount_number);
            console.log('  - amount_words:', parsed.amount_words);
            console.log('  - cheque_date:', parsed.cheque_date);
            console.log('  - micr_code:', parsed.micr_code);
            console.log('  - account_number:', parsed.account_number);
            console.log('  - anti_fraud_features:', parsed.anti_fraud_features);
          } catch (e) {
            console.log('❌ Failed to parse JSON:', e.message);
          }
        } else {
          console.log('❌ No extracted_text found');
        }
        
        console.log('\n' + '='.repeat(50));
      });
      
      resolve(checks);
    });
  });
}

// Run the debug
async function runDebug() {
  try {
    await debugDatabaseContent();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runDebug();


