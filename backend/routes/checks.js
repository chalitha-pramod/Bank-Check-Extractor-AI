const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../database');
const { authenticateToken } = require('./auth');
const config = require('../config');

const router = express.Router();

// Configure Google Gemini AI with automatic environment variable extraction
const GEMINI_API_KEY = config.GEMINI_API_KEY;

// Initialize Gemini AI automatically
let genAI = null;
try {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Google Gemini AI initialized successfully with automatic API key extraction');
} catch (error) {
  console.error('❌ Failed to initialize Google Gemini AI:', error.message);
}

// Function to extract check information using AI
async function extractCheckInfo(imagePath) {
  // Always try to use AI - no manual fallback
  if (!genAI) {
    throw new Error('Gemini AI service not available');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Read image file
    const imageBuffer = fs.readFileSync(imagePath);
    const imageData = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `
    You are an expert document analyst AI. The image provided is a bank cheque. Extract the following fields accurately:
    1. MICR code (bottom line of numbers)
    2. Cheque Date
    3. Amount in numbers
    4. Amount in words
    5. Payee name
    6. Account number
    7. Any visible anti-fraud features (e.g., watermark, microprinting, "payable at par", etc.)

    Respond in a structured JSON format with keys: micr_code, cheque_date, amount_number, amount_words, payee_name, account_number, anti_fraud_features.
    If any field cannot be extracted, use an empty string for that field.
    `;

    console.log('🔍 Using Gemini 1.5-flash to extract check information...');
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Gemini AI extraction completed successfully');
    
    // Try to parse JSON response
    try {
      const extractedData = JSON.parse(text);
      console.log('📊 Extracted data:', extractedData);
      return {
        success: true,
        data: {
          micr_code: extractedData.micr_code || '',
          cheque_date: extractedData.cheque_date || '',
          amount_number: extractedData.amount_number || '',
          amount_words: extractedData.amount_words || '',
          currency_name: 'USD', // Default currency
          payee_name: extractedData.payee_name || '',
          account_number: extractedData.account_number || '',
          anti_fraud_features: extractedData.anti_fraud_features || '',
          extracted_text: text
        }
      };
    } catch (parseError) {
      console.log('⚠️ JSON parsing failed, using raw text:', parseError.message);
      // If JSON parsing fails, return the raw text
      return {
        success: true,
        data: {
          micr_code: '',
          cheque_date: '',
          amount_number: '',
          amount_words: '',
          currency_name: 'USD',
          payee_name: '',
          account_number: '',
          anti_fraud_features: '',
          extracted_text: text
        }
      };
    }
    } catch (error) {
    console.error('❌ Gemini AI extraction error:', error.message);
    
    // Throw error instead of returning manual fallback
    throw new Error(`Gemini AI extraction failed: ${error.message}`);
  }
}


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});



// Get all checks for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM bank_checks WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, checks) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ checks: checks || [] });
    }
  );
});

// Get a single check by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM bank_checks WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, check) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!check) {
        return res.status(404).json({ message: 'Check not found' });
      }
      
      res.json({ check });
    }
  );
});

// Extract check information from uploaded image
router.post('/extract', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    
    console.log('🚀 Starting automatic Gemini AI extraction...');
    
    // Extract check information using AI - no manual fallback
    const extractionResult = await extractCheckInfo(imagePath);
    const checkData = extractionResult.data;
    
    console.log('✅ Extraction completed, saving to database...');

    db.run(
      `INSERT INTO bank_checks (
        user_id, micr_code, cheque_date, amount_number, amount_words, 
        currency_name, payee_name, account_number, anti_fraud_features, 
        image_filename, extracted_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, checkData.micr_code, checkData.cheque_date, 
        checkData.amount_number, checkData.amount_words, checkData.currency_name,
        checkData.payee_name, checkData.account_number, checkData.anti_fraud_features,
        req.file.filename, checkData.extracted_text
      ],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error saving check data' });
        }
        
        // Get the created check
        db.get('SELECT * FROM bank_checks WHERE id = ?', [this.lastID], (err, check) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error retrieving created check' });
          }
          
          console.log('✅ Check saved successfully with ID:', this.lastID);
          
          res.status(201).json({
            message: 'Check information extracted successfully using Gemini AI!',
            check
          });
        });
      }
    );
    
  } catch (error) {
    console.error('❌ Error processing image:', error.message);
    
    let errorMessage = 'Gemini AI extraction failed';
    let details = '';
    
    if (error.message.includes('fetch failed')) {
      errorMessage = 'Network error - please check your internet connection';
      details = 'The Gemini AI service could not be reached. Please check your connection.';
    } else if (error.message.includes('API key')) {
      errorMessage = 'API configuration error';
      details = 'Please check your Google Gemini API key configuration.';
    } else if (error.message.includes('quota')) {
      errorMessage = 'API quota exceeded';
      details = 'Please try again later or check your API usage limits.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timeout';
      details = 'The request took too long. Please try again.';
    } else {
      details = 'Please check your internet connection and try again.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      details: details
    });
  }
});

// Manual test route to insert sample data
router.post('/insert-sample', authenticateToken, (req, res) => {
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

  console.log('📝 Inserting sample data:', sampleData);

  db.run(
    `INSERT INTO bank_checks (
      user_id, micr_code, cheque_date, amount_number, amount_words, 
      currency_name, payee_name, account_number, anti_fraud_features, 
      image_filename, extracted_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id, sampleData.micr_code, sampleData.cheque_date, 
      sampleData.amount_number, sampleData.amount_words, sampleData.currency_name,
      sampleData.payee_name, sampleData.account_number, sampleData.anti_fraud_features,
      'sample-check.jpg', sampleData.extracted_text
    ],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error inserting sample data' });
      }
      
      // Get the created check
      db.get('SELECT * FROM bank_checks WHERE id = ?', [this.lastID], (err, check) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error retrieving created check' });
        }
        
        console.log('✅ Sample check inserted successfully with ID:', this.lastID);
        console.log('📊 Created check data:', check);
        
        res.status(201).json({
          message: 'Sample check data inserted successfully!',
          check
        });
      });
    }
  );
});

// Route to update extracted data for existing checks
router.put('/:id/update-extracted-data', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { extractedData } = req.body;

  if (!extractedData) {
    return res.status(400).json({ message: 'Extracted data is required' });
  }

  console.log('📝 Updating extracted data for check ID:', id);
  console.log('📊 Extracted data:', extractedData);

  // Prepare the extracted text JSON
  const extractedText = JSON.stringify(extractedData);

  db.run(
    `UPDATE bank_checks SET 
      micr_code = ?, 
      cheque_date = ?, 
      amount_number = ?, 
      amount_words = ?, 
      payee_name = ?, 
      account_number = ?, 
      anti_fraud_features = ?, 
      extracted_text = ?
    WHERE id = ? AND user_id = ?`,
    [
      extractedData.micr_code || '',
      extractedData.cheque_date || '',
      extractedData.amount_number || '',
      extractedData.amount_words || '',
      extractedData.payee_name || '',
      extractedData.account_number || '',
      extractedData.anti_fraud_features || '',
      extractedText,
      id,
      req.user.id
    ],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error updating extracted data' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Check not found or no changes made' });
      }

      // Get the updated check
      db.get('SELECT * FROM bank_checks WHERE id = ?', [id], (err, check) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error retrieving updated check' });
        }

        console.log('✅ Extracted data updated successfully for check ID:', id);
        console.log('📊 Updated check data:', check);

        res.json({
          message: 'Extracted data updated successfully!',
          check
        });
      });
    }
  );
});

// Route to insert extracted data for a specific check
router.post('/:id/insert-extracted-data', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { extractedData } = req.body;

  if (!extractedData) {
    return res.status(400).json({ message: 'Extracted data is required' });
  }

  console.log('📝 Inserting extracted data for check ID:', id);
  console.log('📊 Extracted data:', extractedData);

  // Prepare the extracted text JSON
  const extractedText = JSON.stringify(extractedData);

  db.run(
    `UPDATE bank_checks SET 
      micr_code = ?, 
      cheque_date = ?, 
      amount_number = ?, 
      amount_words = ?, 
      payee_name = ?, 
      account_number = ?, 
      anti_fraud_features = ?, 
      extracted_text = ?
    WHERE id = ? AND user_id = ?`,
    [
      extractedData.micr_code || '',
      extractedData.cheque_date || '',
      extractedData.amount_number || '',
      extractedData.amount_words || '',
      extractedData.payee_name || '',
      extractedData.account_number || '',
      extractedData.anti_fraud_features || '',
      extractedText,
      id,
      req.user.id
    ],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error inserting extracted data' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Check not found or no changes made' });
      }

      // Get the updated check
      db.get('SELECT * FROM bank_checks WHERE id = ?', [id], (err, check) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error retrieving updated check' });
        }

        console.log('✅ Extracted data inserted successfully for check ID:', id);
        console.log('📊 Updated check data:', check);

        res.json({
          message: 'Extracted data inserted successfully!',
          check
        });
      });
    }
  );
});

// Export check as CSV
router.get('/:id/export-csv', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM bank_checks WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    async (err, check) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!check) {
        return res.status(404).json({ message: 'Check not found' });
      }
      
      try {
        const csvWriter = createCsvWriter({
          path: `temp_check_${id}.csv`,
          header: [
            { id: 'field', title: 'Field' },
            { id: 'value', title: 'Value' }
          ]
        });
        
        const records = [
          { field: 'MICR Code', value: check.micr_code || 'Not available' },
          { field: 'Cheque Date', value: check.cheque_date || 'Not available' },
          { field: 'Amount (Numbers)', value: check.amount_number || 'Not available' },
          { field: 'Amount (Words)', value: check.amount_words || 'Not available' },
          { field: 'Currency', value: check.currency_name || 'Not available' },
          { field: 'Payee Name', value: check.payee_name || 'Not available' },
          { field: 'Account Number', value: check.account_number || 'Not available' },
          { field: 'Anti-Fraud Features', value: check.anti_fraud_features || 'Not available' },
          { field: 'Extracted On', value: new Date(check.created_at).toLocaleString() }
        ];
        
        await csvWriter.writeRecords(records);
        
        const filename = `bank_check_${check.payee_name || 'unknown'}_${new Date(check.created_at).toISOString().split('T')[0]}.csv`;
        
        res.download(`temp_check_${id}.csv`, filename, (err) => {
          // Clean up temp file
          fs.unlink(`temp_check_${id}.csv`, () => {});
        });
        
      } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ message: 'Error generating CSV' });
      }
    }
  );
});

// Export check as PDF
router.get('/:id/export-pdf', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM bank_checks WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    async (err, check) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!check) {
        return res.status(404).json({ message: 'Check not found' });
      }
      
      try {
        const doc = new PDFDocument();
        const filename = `bank_check_extraction_${new Date(check.created_at).toISOString().replace(/[:.]/g, '-')}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        doc.pipe(res);
        
        // Title
        doc.fontSize(24).text('Bank Check AI Extraction', { align: 'center' });
        doc.moveDown(2);
        
        // Extraction details
        doc.fontSize(12).text(`Extracted On: ${new Date(check.created_at).toLocaleString()}`);
        if (check.image_filename) {
          doc.text(`Image File: ${check.image_filename}`);
        }
        doc.moveDown(2);
        
        // Check details
        doc.fontSize(16).text('Extracted Check Details');
        doc.moveDown(1);
        
        const fields = [
          ['MICR Code', check.micr_code],
          ['Cheque Date', check.cheque_date],
          ['Amount (Numbers)', check.amount_number],
          ['Amount (Words)', check.amount_words],
          ['Currency', check.currency_name],
          ['Payee Name', check.payee_name],
          ['Account Number', check.account_number],
          ['Anti-Fraud Features', check.anti_fraud_features]
        ];
        
        fields.forEach(([field, value]) => {
          if (value) {
            doc.fontSize(12).text(`${field}: ${value}`);
            doc.moveDown(0.5);
          }
        });
        
        doc.moveDown(2);
        
        // Raw extracted text
        if (check.extracted_text) {
          doc.fontSize(16).text('Raw Extracted Text');
          doc.moveDown(1);
          doc.fontSize(10).text(check.extracted_text);
        }
        
        doc.end();
        
      } catch (error) {
        console.error('PDF export error:', error);
        res.status(500).json({ message: 'Error generating PDF' });
      }
    }
  );
});

// Delete a check
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM bank_checks WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, check) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!check) {
        return res.status(404).json({ message: 'Check not found' });
      }
      
      // Delete the image file
      if (check.image_filename) {
        const imagePath = path.join(__dirname, '../uploads', check.image_filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Delete from database
      db.run(
        'DELETE FROM bank_checks WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error deleting check' });
          }
          
          res.json({ message: 'Check deleted successfully' });
        }
      );
    }
  );
});

module.exports = router; 