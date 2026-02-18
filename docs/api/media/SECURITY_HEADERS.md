<p align="center">
  <img src="https://hack23.github.io/cia-compliance-manager/icon-192.png" alt="Hack23 AB Logo" width="192" height="192">
</p>

<h1 align="center">🛡️ Hack23 AB — Security Headers Implementation</h1>

<p align="center">
  <strong>🔒 Technical Security Controls</strong><br>
  <em>🎯 Implementing defense-in-depth for API services</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Owner-CEO-0A66C2?style=for-the-badge" alt="Owner"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-1.0-555?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Effective-2025--02--16-success?style=for-the-badge" alt="Effective Date"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Review-Quarterly-orange?style=for-the-badge" alt="Review Cycle"/></a>
</p>

**📋 Document Owner:** CEO | **📄 Version:** 1.0 | **📅 Last Updated:** 2025-02-16 (UTC)  
**🔄 Review Cycle:** Quarterly | **⏰ Next Review:** 2025-05-16

---

# Security Headers Implementation

## Overview
This document explains the security headers implemented to protect the European Parliament MCP Server API, in compliance with [Hack23 AB's ISMS](https://github.com/Hack23/ISMS-PUBLIC) [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md).

## Background
As a Node.js/TypeScript API server implementing the Model Context Protocol (MCP), this service requires comprehensive HTTP security headers to protect against common web vulnerabilities and ensure secure communication with MCP clients accessing European Parliament data.

This implementation aligns with:
- **[Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md)** - Security testing and DAST requirements
- **[Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md)** - Security controls implementation
- **[Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)** - GDPR and data protection requirements

## Implemented Security Headers

### 1. Content Security Policy (CSP)
**HTTP Header:**
```http
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'
```

**Purpose:** Restricts the sources from which content can be loaded. For an API server, we use a highly restrictive policy.

**Directives Explained:**
- `default-src 'none'` - Deny all resource loading by default (API doesn't serve client-side content)
- `frame-ancestors 'none'` - Prevent API responses from being embedded in frames (clickjacking protection)
- `base-uri 'none'` - Prevent base tag injection attacks

**Implementation (Express.js):**
```typescript
import helmet from 'helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'none'"]
  }
}));
```

**ZAP/OWASP Issues Addressed:**
- ✅ Content Security Policy (CSP) Header Not Set
- ✅ Clickjacking protection
- ✅ Base tag injection prevention

### 2. X-Frame-Options
**HTTP Header:**
```http
X-Frame-Options: DENY
```

**Purpose:** Prevents API responses from being displayed in frames, iframes, or embedded objects.

**Implementation (Express.js):**
```typescript
app.use(helmet.frameguard({ action: 'deny' }));
```

**ZAP/OWASP Issues Addressed:**
- ✅ Missing Anti-clickjacking Header

### 3. X-Content-Type-Options
**HTTP Header:**
```http
X-Content-Type-Options: nosniff
```

**Purpose:** Prevents browsers from MIME-sniffing responses, ensuring the declared Content-Type is respected.

**Implementation (Express.js):**
```typescript
app.use(helmet.noSniff());
```

**ZAP/OWASP Issues Addressed:**
- ✅ X-Content-Type-Options Header Missing
- ✅ MIME-sniffing attacks

### 4. Strict-Transport-Security (HSTS)
**HTTP Header:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Purpose:** Forces all connections to use HTTPS, preventing protocol downgrade attacks.

**Configuration:**
- `max-age=31536000` - 1 year validity
- `includeSubDomains` - Apply to all subdomains
- `preload` - Eligible for browser HSTS preload lists

**Implementation (Express.js):**
```typescript
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
```

**ZAP/OWASP Issues Addressed:**
- ✅ Strict-Transport-Security Header Not Set
- ✅ Protocol downgrade attacks

**Note:** Only enable HSTS if your API is served exclusively over HTTPS.

### 5. X-XSS-Protection
**HTTP Header:**
```http
X-XSS-Protection: 0
```

**Purpose:** Disables legacy XSS filters that can introduce vulnerabilities. Modern protection comes from CSP.

**Implementation (Express.js):**
```typescript
app.use(helmet.xssFilter());
```

**Rationale:** Modern browsers have deprecated XSS filters due to security issues. CSP provides better protection.

### 6. Referrer-Policy
**HTTP Header:**
```http
Referrer-Policy: no-referrer
```

**Purpose:** Controls referrer information sent with requests. For API security, no referrer is sent.

**Implementation (Express.js):**
```typescript
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
```

**Benefits:**
- Prevents leaking sensitive API endpoint information
- Protects European Parliament data access patterns
- GDPR privacy enhancement

### 7. Permissions-Policy
**HTTP Header:**
```http
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
```

**Purpose:** Controls which browser features and APIs can be used.

**Implementation (Express.js):**
```typescript
app.use(helmet.permissionsPolicy({
  features: {
    geolocation: [],
    microphone: [],
    camera: [],
    payment: [],
    usb: []
  }
}));
```

**Features Disabled:**
- Geolocation API
- Microphone access
- Camera access
- Payment Request API
- USB device access

### 8. Cross-Origin-Opener-Policy (COOP)
**HTTP Header:**
```http
Cross-Origin-Opener-Policy: same-origin
```

**Purpose:** Isolates the browsing context from cross-origin documents.

**Implementation (Express.js):**
```typescript
app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin' }));
```

**ZAP/OWASP Issues Addressed:**
- ✅ Spectre-style attacks mitigation

### 9. Cross-Origin-Resource-Policy (CORP)
**HTTP Header:**
```http
Cross-Origin-Resource-Policy: same-origin
```

**Purpose:** Prevents other origins from reading the resource.

**Implementation (Express.js):**
```typescript
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));
```

**Benefits:**
- Protects European Parliament data from unauthorized cross-origin access
- Prevents information leakage to third-party sites

### 10. Cross-Origin-Embedder-Policy (COEP)
**HTTP Header:**
```http
Cross-Origin-Embedder-Policy: require-corp
```

**Purpose:** Prevents loading cross-origin resources without explicit permission.

**Implementation (Express.js):**
```typescript
app.use(helmet.crossOriginEmbedderPolicy());
```

## API-Specific Security Headers

### 11. X-API-Version
**HTTP Header:**
```http
X-API-Version: 1.0.0
```

**Purpose:** Informs clients of the API version for compatibility and debugging.

**Implementation (Express.js):**
```typescript
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0');
  next();
});
```

### 12. X-RateLimit-* Headers
**HTTP Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1644841200
```

**Purpose:** Informs clients of rate limiting status to prevent abuse.

**Implementation (Express.js):**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

app.use('/api/', limiter);
```

**Benefits:**
- DoS protection
- Fair resource allocation
- Client self-regulation

### 13. Cache-Control (API Responses)
**HTTP Header:**
```http
Cache-Control: no-store, no-cache, must-revalidate, private
```

**Purpose:** Prevents caching of sensitive European Parliament data.

**Implementation (Express.js):**
```typescript
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
```

**GDPR Alignment:**
- Prevents unauthorized data retention
- Supports right to erasure
- Minimizes data exposure window

## CORS Configuration for MCP Server

### Secure CORS Headers
**HTTP Headers:**
```http
Access-Control-Allow-Origin: https://trusted-mcp-client.example.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

**Implementation (Express.js):**
```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
```

**Security Considerations:**
- Never use `Access-Control-Allow-Origin: *` for authenticated APIs
- Whitelist specific MCP client origins
- Validate Origin header server-side
- Use credentials only when necessary

## Complete Security Middleware Setup

### Recommended Express.js Configuration
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// 1. Helmet - Core security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'no-referrer'
  },
  permissionsPolicy: {
    features: {
      geolocation: [],
      microphone: [],
      camera: [],
      payment: [],
      usb: []
    }
  }
}));

// 2. CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));

// 3. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// 4. Custom security headers
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Your API routes here
app.use('/api', apiRoutes);

export default app;
```

## Testing

### Unit Tests for Security Headers
Create comprehensive tests to validate all security headers:

```typescript
import request from 'supertest';
import app from './app';

describe('Security Headers', () => {
  it('should set CSP header', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['content-security-policy']).toContain("default-src 'none'");
  });

  it('should set X-Frame-Options header', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });

  it('should set X-Content-Type-Options header', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should set Strict-Transport-Security header', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
  });

  it('should set Referrer-Policy header', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it('should set COOP header', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin');
  });

  it('should set CORP header', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['cross-origin-resource-policy']).toBe('same-origin');
  });

  it('should set Cache-Control for API responses', async () => {
    const response = await request(app).get('/api/parliament/members');
    expect(response.headers['cache-control']).toContain('no-store');
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(101).fill(null).map(() => request(app).get('/api/health'));
    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});
```

## DAST Verification with OWASP ZAP

### Running ZAP Against the API
```bash
# Start the API server
npm start

# Run ZAP baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000/api \
  -r zap-report.html

# Run ZAP full scan (for comprehensive testing)
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:3000/api \
  -r zap-full-report.html
```

### Expected ZAP Results
- ✅ No high-severity vulnerabilities
- ✅ All security headers present
- ✅ No CORS misconfigurations
- ✅ No sensitive data in error messages
- ✅ Rate limiting functional

## GDPR Compliance Headers

### Data Protection Headers
For European Parliament data handling, consider additional headers:

```typescript
// Indicate data processing purpose
res.setHeader('X-Data-Processing-Purpose', 'european-parliament-api-access');

// Indicate data retention policy
res.setHeader('X-Data-Retention-Days', '90');

// Indicate GDPR compliance
res.setHeader('X-GDPR-Compliant', 'true');
```

**Note:** These are custom headers for internal documentation and should not replace proper GDPR compliance measures.

## Monitoring and Logging

### Security Header Monitoring
Implement logging for security header violations:

```typescript
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // Log if security headers are missing
    const requiredHeaders = [
      'content-security-policy',
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security'
    ];
    
    requiredHeaders.forEach(header => {
      if (!res.getHeader(header)) {
        console.error(`Security header missing: ${header}`, {
          path: req.path,
          method: req.method,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return originalSend.call(this, data);
  };
  next();
});
```

## Browser Compatibility
HTTP security headers are supported by:
- ✅ Chrome/Edge (all modern versions)
- ✅ Firefox (all modern versions)
- ✅ Safari (all modern versions)
- ✅ Node.js HTTP clients (fetch, axios, etc.)
- ✅ MCP client libraries

## Deployment Considerations

### Production Checklist
Before deploying to production:
- [ ] All security headers implemented and tested
- [ ] HTTPS enforced with valid TLS certificate
- [ ] HSTS header enabled (after HTTPS validation)
- [ ] Rate limiting configured appropriately
- [ ] CORS origins whitelisted (never use `*`)
- [ ] Error messages sanitized (no stack traces)
- [ ] Audit logging enabled for all API access
- [ ] GDPR compliance verified
- [ ] DAST scan passed with no high-severity issues

### Infrastructure-Level Headers
If using a reverse proxy (nginx, Cloudflare, etc.), configure headers at that level:

**Nginx example:**
```nginx
add_header Content-Security-Policy "default-src 'none'; frame-ancestors 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Referrer-Policy "no-referrer" always;
```

## Future Improvements
1. **Certificate Transparency** - Monitor TLS certificate issuance
2. **Subresource Integrity (SRI)** - If serving any client-side resources
3. **Report-URI / report-to** - CSP violation reporting
4. **NEL (Network Error Logging)** - Network-level error tracking
5. **HTTPS Certificate Pinning** - Advanced certificate validation

---

## 📚 Related Documents

### Internal Documentation
- 🔒 [SECURITY.md](SECURITY.md) - Security policy and vulnerability reporting
- 📖 [README.md](README.md) - Project overview
- 🤖 [Copilot Agents](.github/agents/) - Security-focused development agents

### ISMS-PUBLIC Policies
- 🔐 [Information Security Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Information_Security_Policy.md) - Overall security governance
- 🛠️ [Secure Development Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Secure_Development_Policy.md) - SDLC and security testing requirements
- 🔍 [Vulnerability Management](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Vulnerability_Management.md) - Security vulnerability handling
- 🔒 [Privacy Policy](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md) - GDPR compliance
- 🏷️ [Classification Framework](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) - CIA triad and impact levels

### External References
- [MDN: HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP: Security Headers](https://owasp.org/www-project-secure-headers/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [SecurityHeaders.com](https://securityheaders.com/) - Test your API's security headers
- [ZAP Scanning Rules](https://www.zaproxy.org/docs/alerts/)
- [NIST: API Security](https://csrc.nist.gov/publications/detail/sp/800-204/final)

---

**📋 Document Control:**  
**✅ Approved by:** James Pether Sörling, CEO  
**📤 Distribution:** Public  
**🏷️ Classification:** [![Confidentiality: Public](https://img.shields.io/badge/C-Public-lightgrey?style=flat-square)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md#confidentiality-levels)  
**📅 Effective Date:** 2025-02-16  
**⏰ Next Review:** 2025-05-16  
**🎯 Framework Compliance:** [![ISO 27001](https://img.shields.io/badge/ISO_27001-2022_Aligned-blue?style=flat-square&logo=iso&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![NIST CSF 2.0](https://img.shields.io/badge/NIST_CSF-2.0_Aligned-green?style=flat-square&logo=nist&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![CIS Controls](https://img.shields.io/badge/CIS_Controls-v8.1_Aligned-orange?style=flat-square&logo=cisecurity&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![OWASP](https://img.shields.io/badge/OWASP-Aligned-purple?style=flat-square&logo=owasp&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/CLASSIFICATION.md) [![GDPR Compliant](https://img.shields.io/badge/GDPR-Compliant-success?style=flat-square&logo=european-union&logoColor=white)](https://github.com/Hack23/ISMS-PUBLIC/blob/main/Privacy_Policy.md)
