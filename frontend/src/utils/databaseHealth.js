// Database Health Monitoring and Diagnostics

/**
 * Test database connection health
 */
export const testDatabaseHealth = async () => {
  const healthChecks = {
    timestamp: new Date().toISOString(),
    overall: 'unknown',
    checks: {}
  };

  try {
    // Test 1: Basic API connectivity
    console.log('🔍 Testing basic API connectivity...');
    const healthResponse = await fetch('https://bank-check-extractor-ai-backend.vercel.app/api/health');
    healthChecks.checks.apiHealth = {
      status: healthResponse.ok ? 'success' : 'failed',
      statusCode: healthResponse.status,
      response: await healthResponse.text()
    };
    console.log('✅ API Health Check:', healthChecks.checks.apiHealth);

    // Test 2: Database connection
    console.log('🔍 Testing database connection...');
    const dbResponse = await fetch('https://bank-check-extractor-ai-backend.vercel.app/api/test-db');
    healthChecks.checks.database = {
      status: dbResponse.ok ? 'success' : 'failed',
      statusCode: dbResponse.status,
      response: await dbResponse.json()
    };
    console.log('✅ Database Check:', healthChecks.checks.database);

    // Test 3: Authentication endpoint
    console.log('🔍 Testing authentication endpoint...');
    const authResponse = await fetch('https://bank-check-extractor-ai-backend.vercel.app/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || 'test'}`
      }
    });
    healthChecks.checks.authentication = {
      status: authResponse.ok ? 'success' : 'failed',
      statusCode: authResponse.status,
      response: authResponse.ok ? 'Authenticated' : 'Not authenticated'
    };
    console.log('✅ Authentication Check:', healthChecks.checks.authentication);

    // Test 4: Checks endpoint (without auth)
    console.log('🔍 Testing checks endpoint...');
    const checksResponse = await fetch('https://bank-check-extractor-ai-backend.vercel.app/api/checks');
    healthChecks.checks.checksEndpoint = {
      status: checksResponse.status === 401 ? 'success' : 'failed', // Should return 401 without auth
      statusCode: checksResponse.status,
      response: checksResponse.status === 401 ? 'Properly protected' : 'Unexpected response'
    };
    console.log('✅ Checks Endpoint Check:', healthChecks.checks.checksEndpoint);

    // Determine overall health
    const allChecks = Object.values(healthChecks.checks);
    const successfulChecks = allChecks.filter(check => check.status === 'success').length;
    
    if (successfulChecks === allChecks.length) {
      healthChecks.overall = 'healthy';
    } else if (successfulChecks > 0) {
      healthChecks.overall = 'degraded';
    } else {
      healthChecks.overall = 'unhealthy';
    }

    console.log('🏥 Overall Health Status:', healthChecks.overall);
    return healthChecks;

  } catch (error) {
    console.error('❌ Health check failed:', error);
    healthChecks.overall = 'error';
    healthChecks.error = error.message;
    return healthChecks;
  }
};

/**
 * Get detailed database diagnostics
 */
export const getDatabaseDiagnostics = async () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      isVercel: window.location.hostname.includes('vercel.app'),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    },
    storage: {
      localStorage: {
        token: !!localStorage.getItem('token'),
        tokenLength: localStorage.getItem('token')?.length || 0
      },
      sessionStorage: {
        hasData: Object.keys(sessionStorage).length > 0
      }
    },
    network: {
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : 'Not available'
    }
  };

  try {
    // Test API endpoints
    const endpoints = [
      '/api/health',
      '/api/test-db',
      '/api/checks'
    ];

    diagnostics.endpoints = {};
    
    for (const endpoint of endpoints) {
      try {
        const startTime = performance.now();
        const response = await fetch(endpoint, { 
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        const endTime = performance.now();
        
        diagnostics.endpoints[endpoint] = {
          status: response.status,
          ok: response.ok,
          responseTime: Math.round(endTime - startTime),
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        diagnostics.endpoints[endpoint] = {
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Test with authentication if token exists
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const authResponse = await fetch('https://bank-check-extractor-ai-backend.vercel.app/api/checks', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        diagnostics.authenticatedRequest = {
          status: authResponse.status,
          ok: authResponse.ok,
          hasData: false
        };

        if (authResponse.ok) {
          const data = await authResponse.json();
          diagnostics.authenticatedRequest.hasData = !!data.checks;
          diagnostics.authenticatedRequest.checkCount = data.checks?.length || 0;
        }
      } catch (error) {
        diagnostics.authenticatedRequest = {
          error: error.message
        };
      }
    }

  } catch (error) {
    diagnostics.error = error.message;
  }

  return diagnostics;
};

/**
 * Generate a comprehensive health report
 */
export const generateHealthReport = async () => {
  const health = await testDatabaseHealth();
  const diagnostics = await getDatabaseDiagnostics();
  
  const report = {
    summary: {
      overall: health.overall,
      timestamp: new Date().toISOString(),
      environment: diagnostics.environment.isLocalhost ? 'Local Development' : 'Production/Hosted'
    },
    health: health,
    diagnostics: diagnostics,
    recommendations: []
  };

  // Generate recommendations based on health status
  if (health.overall === 'unhealthy') {
    report.recommendations.push('🔴 Critical: Backend services are not responding');
    report.recommendations.push('🔴 Critical: Database connection failed');
    report.recommendations.push('🟡 Check if backend server is running');
    report.recommendations.push('🟡 Verify backend deployment status');
  } else if (health.overall === 'degraded') {
    report.recommendations.push('🟡 Some services are experiencing issues');
    report.recommendations.push('🟡 Check specific failed health checks');
    report.recommendations.push('🟡 Verify database connectivity');
  } else if (health.overall === 'healthy') {
    report.recommendations.push('🟢 All systems are operational');
    report.recommendations.push('🟢 Database connection is working');
    report.recommendations.push('🟢 API endpoints are responding');
  }

  // Environment-specific recommendations
  if (diagnostics.environment.isVercel) {
    report.recommendations.push('🌐 Running on Vercel - check deployment logs');
    report.recommendations.push('🌐 Verify environment variables are set');
    report.recommendations.push('🌐 Check serverless function execution');
  }

  if (diagnostics.environment.isLocalhost) {
    report.recommendations.push('💻 Running locally - ensure backend server is started');
    report.recommendations.push('💻 Check if backend is running on port 5000');
    report.recommendations.push('💻 Verify database file exists');
  }

  // Network recommendations
  if (!diagnostics.network.connection.onLine) {
    report.recommendations.push('📡 Network: Device appears to be offline');
  }

  // Storage recommendations
  if (!diagnostics.storage.localStorage.token) {
    report.recommendations.push('🔑 No authentication token found - user needs to login');
  }

  return report;
};

/**
 * Display health report in console
 */
export const logHealthReport = async () => {
  const report = await generateHealthReport();
  
  console.group('🏥 DATABASE HEALTH REPORT');
  console.log('📊 Summary:', report.summary);
  console.log('🔍 Health Status:', report.health);
  console.log('💻 Diagnostics:', report.diagnostics);
  console.log('💡 Recommendations:', report.recommendations);
  console.groupEnd();
  
  return report;
};

/**
 * Display health report in UI
 */
export const displayHealthReport = async (containerElement) => {
  if (!containerElement) return;
  
  const report = await generateHealthReport();
  
  const healthHTML = `
    <div class="health-report" style="
      background: ${report.summary.overall === 'healthy' ? '#d4edda' : 
                   report.summary.overall === 'degraded' ? '#fff3cd' : '#f8d7da'};
      border: 1px solid ${report.summary.overall === 'healthy' ? '#c3e6cb' : 
                         report.summary.overall === 'degraded' ? '#ffeaa7' : '#f5c6cb'};
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      font-family: monospace;
      font-size: 14px;
    ">
      <h3 style="margin: 0 0 1rem 0; color: #333;">
        🏥 Health Report - ${report.summary.overall.toUpperCase()}
      </h3>
      
      <div style="margin-bottom: 1rem;">
        <strong>Environment:</strong> ${report.summary.environment}<br>
        <strong>Timestamp:</strong> ${new Date(report.summary.timestamp).toLocaleString()}<br>
        <strong>Overall Status:</strong> 
        <span style="
          color: ${report.summary.overall === 'healthy' ? '#155724' : 
                   report.summary.overall === 'degraded' ? '#856404' : '#721c24'};
          font-weight: bold;
        ">${report.summary.overall}</span>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <strong>Health Checks:</strong><br>
        ${Object.entries(report.health.checks).map(([key, check]) => 
          `• ${key}: <span style="color: ${check.status === 'success' ? '#155724' : '#721c24'}">${check.status}</span>`
        ).join('<br>')}
      </div>
      
      <div style="margin-bottom: 1rem;">
        <strong>Recommendations:</strong><br>
        ${report.recommendations.map(rec => `• ${rec}`).join('<br>')}
      </div>
      
      <details style="margin-top: 1rem;">
        <summary style="cursor: pointer; color: #666;">📋 Show Detailed Diagnostics</summary>
        <pre style="
          background: rgba(0,0,0,0.05);
          padding: 0.5rem;
          border-radius: 4px;
          margin-top: 0.5rem;
          overflow-x: auto;
          font-size: 12px;
        ">${JSON.stringify(report.diagnostics, null, 2)}</pre>
      </details>
    </div>
  `;
  
  containerElement.innerHTML = healthHTML;
};

export default {
  testDatabaseHealth,
  getDatabaseDiagnostics,
  generateHealthReport,
  logHealthReport,
  displayHealthReport
};
