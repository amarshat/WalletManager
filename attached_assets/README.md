# Project Charter: Paysafe GenAI Showcase — powered by PaySage

## 1. Objective
Build a white-label Digital Embedded Wallet Platform enabling organizations to:
- Brand their wallet (name, logo, tagline).
- Manage customers and wallets.
- Showcase real wallet operations (deposit, transfer, withdraw) using Paysafe Embedded Wallet APIs in sandbox.
- Highlight "Paysafe GenAI Showcase, powered by PaySage" branding.

Mobile-first, production-grade structure, with real API integration and heavy logging.

---

## 2. Core Features

### Admin Interface
- Admin Login (Username/Password).
- Configure Brand Name, Brand Icon/Image, Brand Tagline, Wallet Auth Key.
- Manage Customers (Create / Edit / Delete).
- Assign wallet currencies at creation.
- View detailed logs and system events.

### Customer Interface
- Customer Login (Username/Password).
- Profile (Full Name, Profile Photo, Country, Default Currency).
- Wallet Dashboard:
  - View balance across currencies.
  - View last 10 transactions.
  - Switch currencies and refresh dashboard.
- Transactions:
  - Add Money via Deposit API.
  - Send Money to other users (searchable by name/username).
  - Bulk Transfers via CSV upload.
  - Withdraw money to external instruments.
- Cards:
  - Save cards (auto-detect network like Visa, Mastercard).
  - Manage saved cards.

---

## 3. APIs to Use

| Action | API Endpoint |
|:-------|:-------------|
| Create Wallet | POST `/v2/wallets` |
| Create Wallet Accounts | POST `/v2/customers/{customerId}/accounts` |
| Get Balances | GET `/v2/customers/{customerId}/accounts` |
| Deposit Money | POST `/v2/transactions/deposits` |
| Transfer Money | POST `/v2/transactions/transfers` |
| Withdraw Money | POST `/v2/transactions/withdrawals` |
| Initiate Credentials Setup | POST `/v2/customers/{customerId}/credentials` |
| Retrieve Transactions | GET `/v2/transactions` (Optional for pagination) |
| Fetch Customer Profile | GET `/v2/customer-persons/{customerId}` |

Use **real sandbox payloads** and real balances, no ledger to maintain manually.

---

## 4. System Architecture

**Frontend**
- React + TailwindCSS
- Mobile-first responsive layout
- JWT based authentication

**Backend**
- Python + FastAPI
- OAuth2 for sandbox token generation
- API Gateway integration with sandbox.paysafe.com
- SQLite (simple prototyping) for Admin/Customer meta storage
- Heavy JSON-based logging

**Storage**
- SQLite (for users, branding config, saved cards)

**Authentication**
- Admin and Customer JWT tokens separately scoped.

---

## 5. Logging
- Every API request and response logged with timestamp and user context.
- All UI actions (clicks on refresh, transfer, bulk upload) acknowledged visibly.

---

## 6. Branding and Visuals
- "Paysafe GenAI Showcase, powered by PaySage" displayed in footer and splash.
- Admin-configured brand name, logo, and tagline visible on login screen and dashboard.

---

## 7. Optional Stretch Features
- Contact Info Update APIs for email/mobile.
- KYC session creation.
- Lift/Place Restrictions on customer accounts.
- Simulate error conditions (bad deposits, failed transfers).

---

## 8. Tech Stack (Recommended for Replit)

| Layer | Stack |
|:------|:------|
| Frontend | React (Vite or Create React App) |
| Styling | TailwindCSS |
| Backend | Python (FastAPI) |
| Database | SQLite |
| Authentication | JWT |
| API Client | HTTPx or Requests (async) |
| CSV Parsing | Papaparse (frontend) or Python csv |

---

## 9. Deliverables
- Admin Panel UI.
- Customer Wallet UI.
- Sandbox working end-to-end.
- Swagger UI via FastAPI.
- GitHub-ready structure.
- Full logs exportable if needed.



## How to Obtain Access Token (Paysafe Sandbox)

To interact with the Paysafe Embedded Wallet APIs, you first need an `access_token`.

Use the following cURL command to request a token:

curl --location 'https://sandbox.paysafe.com/digitalwallets/v1/auth/brands/dummy-us/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: Basic YjRkNThmYzctMzgyYy00NWRjLTg1NDctNzllYjg2ZDkxMTc2Ono3NVA3Mm0zbmhwRzU1RE9QZlBPa3BPYXI5eW5JWjg3' \
--data-urlencode 'grant_type=client_credentials'

Response 

{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9....",
  "token_type": "Bearer",
  "expires_in": 900
}
• access_token is valid for 900 seconds (15 minutes).
• Always refresh your token before it expires.
Important Notes
• Include Authorization: Bearer <access_token> in the header of all subsequent API requests.
• Tokens are scoped for sandbox use and will not work in production.
• Tokens are tied to your specific brand (dummy-us in this case).


