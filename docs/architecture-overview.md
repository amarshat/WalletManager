# Paysafe Embedded Wallet Platform - Architecture Overview

## Executive Summary

The Paysafe Embedded Wallet Platform is a sophisticated multi-tenant digital wallet solution that extends Paysafe's core wallet infrastructure with advanced tenant management, ring-fenced user ecosystems, and comprehensive co-branding capabilities. This platform enables organizations to deploy white-labeled wallet solutions with complete tenant isolation and administrative control.

## Core Architecture Principles

### 1. Multi-Tenant Ring-Fencing
- **Complete Data Isolation**: Each tenant operates in a completely isolated environment
- **Tenant-Specific User Management**: Tenant admins can only view and manage users within their organization
- **Ring-Fenced Financial Operations**: All transactions, payouts, and bulk transfers are isolated per tenant
- **Zero Cross-Tenant Visibility**: No tenant can access data or users from another tenant

### 2. Layered Architecture Approach
```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  • Web Interface                       │
│  • Mobile WebView App                  │
│  • Embedded Widgets                    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│      Tenant Management Layer           │
│  • Tenant Admin Authentication         │
│  • Ring-Fenced User Management         │
│  • Co-Branding & Customization         │
│  • Tenant-Specific Operations          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│       Paysafe Wallet Platform          │
│  • Core Wallet Infrastructure          │
│  • Transaction Processing              │
│  • Account Management                  │
│  • Payment Methods                     │
└─────────────────────────────────────────┘
```

## System Components

### 1. Tenant Management System
- **Tenant Registration & Onboarding**
- **Administrative Hierarchy (SuperAdmin → Tenant Admin → Users)**
- **Custom Branding Configuration**
- **Ring-Fenced Data Access Controls**

### 2. Authentication & Authorization
- **Multi-Level Access Control**
  - SuperAdmin: System-wide management
  - Tenant Admin: Tenant-specific administration
  - End Users: Wallet functionality only
- **Session Management with Tenant Context**
- **Secure Tenant Switching**

### 3. Co-Branding Engine
- **Dynamic Theme Application**
- **Logo Management (Global + Tenant)**
- **Color Scheme Customization**
- **Custom CSS Support**
- **Real-time Brand Preview**

### 4. Embedded Widget System
- **Iframe-based Embedding**
- **Micro-widget Components**
- **Cross-domain Authentication**
- **Responsive Design Templates**

### 5. Mobile Application Layer
- **WebView-based Mobile App**
- **Persistent Bottom Navigation**
- **Native App Experience**
- **Cross-platform Compatibility**

## Data Model Architecture

### Core Entities

#### Tenants
```sql
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Users (Ring-Fenced by Tenant)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  tenant_id INTEGER REFERENCES tenants(id),
  paysafe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Brand Settings (Tenant-Specific)
```sql
CREATE TABLE brand_settings (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  name VARCHAR(255),
  tagline TEXT,
  logo TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  custom_css TEXT,
  global_brand_name VARCHAR(255),
  global_brand_logo TEXT,
  global_brand_color VARCHAR(7)
);
```

### Data Isolation Strategy

#### 1. Tenant-Scoped Queries
All database queries include tenant context:
```sql
-- Example: Get users for specific tenant only
SELECT * FROM users WHERE tenant_id = :current_tenant_id;

-- Example: Ring-fenced transaction view
SELECT t.* FROM transactions t 
JOIN users u ON t.user_id = u.id 
WHERE u.tenant_id = :current_tenant_id;
```

#### 2. API-Level Enforcement
- Middleware validates tenant context on every request
- Automatic tenant_id injection in all queries
- Cross-tenant access prevention at application level

## Security Architecture

### 1. Multi-Level Access Control
```
SuperAdmin
├── System Configuration
├── Tenant Management
├── Global Branding
└── Cross-Tenant Analytics

Tenant Admin
├── User Management (Tenant-Scoped)
├── Bulk Transfers (Ring-Fenced)
├── Tenant Branding
└── Tenant Analytics

End User
├── Wallet Operations
├── Transaction History
└── Profile Management
```

### 2. Data Security Measures
- **Encrypted Password Storage** (scrypt hashing)
- **Session-based Authentication**
- **CORS Protection for Widgets**
- **Secure Cookie Handling**
- **SQL Injection Prevention**

### 3. Ring-Fencing Implementation
- **Database-level tenant isolation**
- **API middleware tenant validation**
- **UI component tenant context**
- **Widget authentication scope**

## Integration Architecture

### 1. Paysafe Platform Integration
- **API Abstraction Layer**: Seamless integration with Paysafe's wallet APIs
- **PhantomPay Sandbox**: Mock backend for development and testing
- **Transaction Processing**: Direct integration with Paysafe's transaction engine
- **Account Management**: Leverages Paysafe's account infrastructure

### 2. Widget Embedding System
```javascript
// Iframe Integration
<iframe src="https://wallet.amar.im/widgets/balance?tenant=paysafe&theme=dark" />

// Micro-widget Integration  
<div data-paysafe-widget="balance" data-tenant="justpark"></div>
```

### 3. Mobile Integration
- **WebView Architecture**: Native app wrapper around web interface
- **Cross-platform Support**: iOS and Android compatibility
- **Offline Capability**: Cached content for improved performance

## Deployment Architecture

### 1. Multi-Environment Support
- **Development**: Local development with PhantomPay sandbox
- **Staging**: Integration testing with Paysafe sandbox
- **Production**: Live deployment with Paysafe production APIs

### 2. Scalability Considerations
- **Horizontal Scaling**: Stateless application design
- **Database Optimization**: Indexed tenant-scoped queries
- **CDN Integration**: Static asset delivery
- **Load Balancing**: Multi-instance deployment support

### 3. Monitoring & Analytics
- **Tenant-Specific Metrics**: Ring-fenced analytics per tenant
- **System Health Monitoring**: Application performance tracking
- **Security Monitoring**: Authentication and authorization audit logs
- **Usage Analytics**: Widget embedding and mobile app usage

## Key Differentiators

### 1. True Multi-Tenancy
Unlike simple user segmentation, this platform provides:
- **Complete data isolation between tenants**
- **Independent administrative control**
- **Tenant-specific customization**
- **Ring-fenced financial operations**

### 2. Embedded Widget Ecosystem
- **Multiple integration methods** (iframe, micro-widgets, full embedding)
- **Cross-domain authentication** with secure session sharing
- **Responsive design** adapting to any website
- **Real-time data synchronization**

### 3. Comprehensive Branding System
- **Co-branding support** (Global brand + Tenant brand)
- **Dynamic theme application** via URL parameters
- **Custom CSS injection** for advanced customization
- **Real-time brand preview** and testing

### 4. Mobile-First Approach
- **WebView-based mobile app** leveraging existing web interface
- **Persistent navigation panel** for enhanced mobile UX
- **Cross-platform compatibility** with single codebase
- **App Store deployment ready**

## Business Value Proposition

### For Platform Operators
- **Rapid tenant onboarding** with self-service capabilities
- **Scalable architecture** supporting unlimited tenants
- **Comprehensive administrative control** with ring-fenced isolation
- **Revenue opportunities** through white-label licensing

### For Tenant Organizations
- **Complete brand control** with co-branding options
- **Isolated user management** with no cross-tenant visibility
- **Embedded wallet capabilities** for their own websites/apps
- **Professional mobile app experience** without development costs

### For End Users
- **Consistent brand experience** across all touchpoints
- **Seamless wallet functionality** powered by Paysafe infrastructure
- **Multi-platform access** (web, mobile, embedded widgets)
- **Secure, ring-fenced financial operations**

This architecture demonstrates how sophisticated multi-tenant capabilities can be layered on top of existing financial infrastructure while maintaining complete security, isolation, and customization for each tenant organization.