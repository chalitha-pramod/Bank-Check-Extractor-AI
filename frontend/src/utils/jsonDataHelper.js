// Utility functions for handling JSON data in bank checks

/**
 * Try to safely parse a JSON string, including AI-formatted responses
 * - Strips markdown code fences
 * - Extracts the first JSON object substring if extra text is present
 */
export const parseExtractedJson = (extractedText) => {
  if (!extractedText || typeof extractedText !== 'string') return null;

  let text = extractedText.trim();

  // Remove code fences like ```json ... ``` or ``` ... ```
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json|javascript)?/i, '').replace(/```$/, '').trim();
  }

  // Direct parse first
  try {
    const direct = JSON.parse(text);
    console.log('✅ Successfully parsed JSON (direct):', direct);
    return direct;
  } catch (_) {}

  // Attempt to extract JSON object substring between first '{' and last '}'
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(candidate);
      console.log('✅ Successfully parsed JSON (substring):', parsed);
      return parsed;
    } catch (err) {
      console.warn('❌ Substring JSON parse failed:', err.message);
    }
  }

  console.warn('❌ Failed to parse extracted JSON');
  return null;
};

/**
 * Get value from either database field or JSON data
 */
export const getExtractedValue = (check, jsonData, dbField, jsonField, defaultValue = '') => {
  // First try database field
  if (check?.[dbField] !== undefined && check[dbField] !== null && String(check[dbField]).trim() !== '') {
    return check[dbField];
  }

  // Then try JSON field
  if (jsonData?.[jsonField] !== undefined && jsonData[jsonField] !== null && String(jsonData[jsonField]).trim() !== '') {
    return jsonData[jsonField];
  }

  return defaultValue; // empty by default; formatting layer decides placeholders
};

/**
 * Extract all check information from JSON data
 */
export const extractCheckInformation = (check) => {
  const jsonData = parseExtractedJson(check?.extracted_text);

  return {
    payee_name: getExtractedValue(check, jsonData, 'payee_name', 'payee_name', ''),
    amount_number: getExtractedValue(check, jsonData, 'amount_number', 'amount_number', ''),
    amount_words: getExtractedValue(check, jsonData, 'amount_words', 'amount_words', ''),
    cheque_date: getExtractedValue(check, jsonData, 'cheque_date', 'cheque_date', ''),
    micr_code: getExtractedValue(check, jsonData, 'micr_code', 'micr_code', ''),
    account_number: getExtractedValue(check, jsonData, 'account_number', 'account_number', ''),
    anti_fraud_features: getExtractedValue(check, jsonData, 'anti_fraud_features', 'anti_fraud_features', ''),
    currency: check?.currency_name || 'USD',
    jsonData: jsonData // Include the parsed JSON for debugging
  };
};

/**
 * Format check data for display with placeholders
 */
export const formatCheckForDisplay = (checkInfo) => {
  const payeeName = checkInfo.payee_name || 'Not available';
  const amountNumber = checkInfo.amount_number || '';
  const amount = amountNumber ? `${amountNumber} ${checkInfo.currency}` : `Not available ${checkInfo.currency}`;
  const amountWords = checkInfo.amount_words || 'Not available';
  const chequeDate = checkInfo.cheque_date || 'Not available';

  const micrCode = checkInfo.micr_code || 'Not available';
  const accountNumber = checkInfo.account_number || 'Not available';
  const currency = checkInfo.currency || 'USD';

  const antiFraud = checkInfo.anti_fraud_features || 'Not available';

  return {
    basicDetails: {
      payee_name: payeeName,
      amount: amount,
      amount_words: amountWords,
      cheque_date: chequeDate
    },
    bankDetails: {
      micr_code: micrCode,
      account_number: accountNumber,
      currency: currency
    },
    securityFeatures: {
      anti_fraud_features: antiFraud
    }
  };
};


