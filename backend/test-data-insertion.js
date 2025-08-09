const db = require('./database');

// Sample data from the user
const sampleData = {
  micr_code: "056111 063-978⑆ 1007928",
  cheque_date: "07 November 2017",
  amount_number: "8.01",
  amount_words: "EIGHT DOLLARS AND ONE CENT",
  payee_name: "JULIUS EVENTS COLLEGE PTY LTD",
  account_number: "",
  anti_fraud_features: "Watermark (likely, based on the background pattern), microprinting (possibly, but not clearly visible in the provided image), 'Not Negotiable' printed on the cheque.",
  currency_name: "USD",
  extracted_text: JSON.stringify({
    micr_code: "056111 063-978⑆ 1007928",
    cheque_date: "07 November 2017",
    amount_number: "8.01",
    amount_words: "EIGHT DOLLARS AND ONE CENT",
    payee_name: "JULIUS EVENTS COLLEGE PTY LTD",
    account_number: "",
    anti_fraud_features: "Watermark (likely, based on the background pattern), microprinting (possibly, but not clearly visible in the provided image), 'Not Negotiable' printed on the cheque."
  })
};

console.log('Testing data insertion and retrieval...');

// Insert test data
db.run(`
  INSERT INTO bank_checks (
    user_id, micr_code, cheque_date, amount_number, amount_words, 
    currency_name, payee_name, account_number, anti_fraud_features, 
    image_filename, extracted_text
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  1, // user_id (assuming user with ID 1 exists)
  sampleData.micr_code,
  sampleData.cheque_date,
  sampleData.amount_number,
  sampleData.amount_words,
  sampleData.currency_name,
  sampleData.payee_name,
  sampleData.account_number,
  sampleData.anti_fraud_features,
  'test-image.jpg',
  sampleData.extracted_text
], function(err) {
  if (err) {
    console.error('Error inserting test data:', err.message);
    return;
  }
  
  const testId = this.lastID;
  console.log('✅ Test data inserted with ID:', testId);
  
  // Retrieve the data
  db.get('SELECT * FROM bank_checks WHERE id = ?', [testId], (err, check) => {
    if (err) {
      console.error('Error retrieving test data:', err.message);
      return;
    }
    
    console.log('📊 Retrieved data:');
    console.log('Payee Name:', check.payee_name);
    console.log('Amount:', check.amount_number);
    console.log('Amount Words:', check.amount_words);
    console.log('Cheque Date:', check.cheque_date);
    console.log('MICR Code:', check.micr_code);
    console.log('Account Number:', check.account_number);
    console.log('Anti-Fraud Features:', check.anti_fraud_features);
    console.log('Currency:', check.currency_name);
    console.log('Extracted Text:', check.extracted_text);
    
    // Try to parse extracted_text
    try {
      const parsed = JSON.parse(check.extracted_text);
      console.log('✅ Extracted text parsed successfully:', parsed);
    } catch (e) {
      console.log('❌ Failed to parse extracted_text:', e.message);
    }
    
    // Clean up - delete test data
    db.run('DELETE FROM bank_checks WHERE id = ?', [testId], (err) => {
      if (err) {
        console.error('Error deleting test data:', err.message);
      } else {
        console.log('🧹 Test data cleaned up');
      }
      process.exit(0);
    });
  });
});




