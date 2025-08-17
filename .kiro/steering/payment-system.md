---
inclusion: always
---

# Payment System and Service Fee Model

## Service Fee Structure

### Fee Calculation
- **Service Fee Rate**: 20% of rent amount
- **Tenant Pays**: Rent Amount + Service Fee (20%)
- **Property Owner Receives**: 100% of Rent Amount
- **Platform Revenue**: Service Fee Amount (20% of rent)

### Example Calculation
```
Rent Amount: $1,000
Service Fee (20%): $200
Total Tenant Pays: $1,200
Property Owner Receives: $1,000
Platform Revenue: $200
```

## Payment Processing Workflow

### Step 1: Payment Initiation
- Tenant selects property and initiates payment
- System calculates service fee automatically
- Payment breakdown displayed clearly to tenant
- Payment gateway integration processes total amount

### Step 2: Payment Collection
- Collect full amount (rent + service fee) from tenant
- Generate payment confirmation and receipt
- Update booking status to "paid"
- Trigger property status update

### Step 3: Payment Distribution
- Transfer 100% of rent amount to property owner
- Retain service fee (20%) as platform revenue
- Generate distribution receipts for all parties
- Update financial records and analytics

### Step 4: Post-Payment Actions
- Remove property from available listings
- Send confirmation notifications to all parties
- Update property admin performance metrics
- Generate revenue reports for Super Admin

## Payment Security

### Security Measures
- PCI DSS compliant payment processing
- Encrypted payment data transmission
- Secure tokenization of payment methods
- Fraud detection and prevention

### Compliance Requirements
- GDPR compliance for payment data
- Financial regulations compliance
- Audit trail for all transactions
- Data retention policies

## Payment Gateway Integration

### Supported Payment Methods
- Credit/Debit Cards (Visa, MasterCard,M etc.)
- Bank Transfers
- Local payment methods (M-Pesa,Tigopesa etc.)

### Integration Requirements
- Webhook handling for payment status updates
- Error handling and retry mechanisms
- Payment method validation
- Currency conversion support

## Financial Reporting

### Revenue Tracking
- Real-time service fee collection monitoring
- Monthly/quarterly revenue reports
- Property admin performance impact on revenue
- Payment method analytics

### Reconciliation
- Daily payment reconciliation
- Property owner payment tracking
- Service fee collection verification
- Dispute resolution procedures

## Implementation Guidelines

### Database Schema
- Store rent amount and service fee separately
- Track payment distribution status
- Maintain audit trail for all transactions
- Support refund and dispute handling

### User Interface
- Clear service fee disclosure
- Payment breakdown visualization
- Receipt generation and download
- Payment history and tracking

### Error Handling
- Payment failure recovery
- Partial payment handling
- Refund processing
- Dispute resolution workflows