# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Best Practices

### Authentication & Authorization
- JWT tokens with secure expiration times
- Password hashing using bcrypt with salt rounds
- RBAC (Role-Based Access Control) implementation
- API key authentication for ML service

### Data Protection
- PII masking in MCP server
- Encrypted connections (HTTPS/TLS)
- Secure environment variable management
- Input validation using Zod schemas

### API Security
- Rate limiting on all endpoints
- CORS configuration
- Helmet.js for security headers
- Request validation and sanitization

### Database Security
- MongoDB Atlas with network isolation
- Indexed queries for performance
- Connection string encryption
- Regular backups

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@confirmly.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work to resolve the issue promptly.

## Security Checklist

- [ ] All dependencies are up to date
- [ ] Environment variables are not committed
- [ ] API keys are rotated regularly
- [ ] Database backups are configured
- [ ] Monitoring and alerting are set up
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain PII

