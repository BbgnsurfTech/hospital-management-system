# Hospital Management System

A comprehensive, real-time hospital management system designed to optimize patient workflow and minimize wait times through automated notifications and seamless interdepartmental coordination.

## Features

### Core Capabilities

- **Real-Time Patient Tracking**: Track patients from registration through discharge
- **Instant Staff Notifications**: WebSocket-based alerts notify relevant staff immediately
- **Smart Queue Management**: Priority-based queuing with estimated wait times
- **Electronic Medical Records (EMR)**: Complete digital patient history
- **Automated Workflow**: Prescriptions and test orders automatically routed to relevant departments
- **Live Dashboard**: Real-time analytics and metrics for hospital operations
- **Role-Based Access Control**: Secure, role-specific access for all staff

### Modules

1. **Reception Module**
   - Patient registration with unique ID generation
   - Quick check-in for existing patients
   - Auto-notification to doctors and departments

2. **Doctor Module**
   - Patient queue management
   - Digital consultation with EMR access
   - Electronic prescription generation
   - Lab/radiology test ordering
   - Real-time result notifications

3. **Laboratory Module**
   - Test order management
   - Sample tracking
   - Result entry with critical value alerts
   - Automatic result distribution

4. **Pharmacy Module**
   - Prescription queue
   - Inventory management
   - Medication dispensing tracking
   - Low stock alerts

5. **Radiology Module**
   - Imaging test orders
   - Scheduling system
   - Report generation

6. **Billing Module**
   - Automated bill generation
   - Multiple payment methods
   - Insurance integration
   - Outstanding payment tracking

7. **Admin Dashboard**
   - Real-time statistics
   - Patient flow analytics
   - Revenue reports
   - Wait time metrics
   - Department performance

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+
- **Cache/Queue**: Redis 7+
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: express-validator

### Frontend (Ready for Implementation)
- **Framework**: React 18+ with TypeScript
- **State Management**: Context API / Redux Toolkit
- **UI Library**: Material-UI / Tailwind CSS
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios
- **Routing**: React Router v6

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+
- Redis 7+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hospital-management-system.git
   cd hospital-management-system
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb hospital_management

   # Run schema
   psql -d hospital_management -f src/database/schema.sql

   # (Optional) Load seed data
   psql -d hospital_management -f src/database/seed.sql
   ```

5. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000 (once implemented)

### Default Users (if using seed data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | Admin@123 |
| Doctor | dr.smith@hospital.com | Admin@123 |
| Nurse | nurse.brown@hospital.com | Admin@123 |
| Receptionist | reception@hospital.com | Admin@123 |
| Pharmacist | pharmacist@hospital.com | Admin@123 |
| Lab Technician | lab@hospital.com | Admin@123 |

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user

#### Patients
- `POST /patients` - Register new patient
- `POST /patients/:patientId/check-in` - Check-in patient
- `GET /patients` - List all patients
- `GET /patients/:id` - Get patient details
- `GET /patients/:id/history` - Get patient medical history

#### Doctor
- `GET /doctors/my-patients` - Get doctor's patient queue
- `POST /doctors/consultations/:visitId/start` - Start consultation
- `PATCH /doctors/consultations/:visitId` - Update consultation
- `POST /doctors/consultations/:visitId/prescriptions` - Issue prescription
- `POST /doctors/consultations/:visitId/lab-tests` - Order lab tests
- `POST /doctors/consultations/:visitId/complete` - Complete consultation

#### Laboratory
- `GET /lab/pending` - Get pending tests
- `PATCH /lab/:testId` - Update test status/results
- `GET /lab/patient/:patientId` - Get patient's test history

#### Pharmacy
- `GET /pharmacy/prescriptions/pending` - Get pending prescriptions
- `POST /pharmacy/prescriptions/:prescriptionId/dispense` - Dispense medication
- `GET /pharmacy/inventory` - Get inventory status
- `PATCH /pharmacy/inventory/:itemId` - Update inventory

#### Billing
- `POST /billing` - Create bill
- `POST /billing/:billId/payment` - Process payment
- `GET /billing/pending` - Get pending bills
- `GET /billing/visit/:visitId` - Get visit bill

#### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:notificationId/read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read

#### Analytics (Admin/Doctor)
- `GET /analytics/dashboard` - Get dashboard statistics
- `GET /analytics/patient-flow` - Get patient flow analytics
- `GET /analytics/departments` - Get department statistics
- `GET /analytics/revenue` - Get revenue analytics (Admin only)

For detailed API documentation, see [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)

## Workflow Example

### Typical Patient Journey

1. **Registration (Reception)**
   - Receptionist registers new patient or checks in existing patient
   - System generates visit number and adds to queue
   - **Auto-notification sent to doctor and nurses**

2. **Waiting (Queue)**
   - Patient appears in doctor's queue with estimated wait time
   - Real-time queue position updates

3. **Consultation (Doctor)**
   - Doctor starts consultation
   - Reviews patient history and vitals
   - Makes diagnosis
   - Issues prescription → **Auto-sent to pharmacy**
   - Orders lab tests → **Auto-sent to laboratory**

4. **Laboratory (if tests ordered)**
   - Lab technician sees test order immediately
   - Collects sample and processes
   - Enters results
   - **Critical results → Instant alert to doctor**
   - **Normal results → Auto-distributed to doctor**

5. **Pharmacy (if prescription issued)**
   - Pharmacist sees prescription in queue
   - Dispenses medication
   - **Auto-notification to billing**

6. **Billing**
   - Automated bill generation based on services
   - Multiple payment methods supported
   - Insurance claim processing

7. **Completion**
   - Patient checkout
   - All records saved in EMR

## Real-Time Features

### WebSocket Events

The system uses Socket.IO for real-time communication:

```javascript
// Client connection
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Listen for queue updates
socket.on('queue-updated', (data) => {
  console.log('Queue updated:', data);
});

// Listen for patient status changes
socket.on('patient-status-changed', (data) => {
  console.log('Patient status:', data);
});
```

## Database Schema

Key tables:
- `users` - Staff members
- `patients` - Patient information
- `visits` - Patient encounters
- `appointments` - Scheduled appointments
- `prescriptions` - Medication orders
- `lab_tests` - Laboratory test orders and results
- `radiology_tests` - Imaging tests
- `billing` - Financial transactions
- `notifications` - User notifications
- `queue` - Patient queue management
- `inventory` - Pharmacy and supply inventory

See [backend/src/database/schema.sql](./backend/src/database/schema.sql) for complete schema.

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## Performance Optimization

- Redis caching for queue management
- Database connection pooling
- Indexed database queries
- Compressed responses (gzip)
- Real-time updates reduce polling

## Project Structure

```
hospital-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Redis configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── database/        # SQL schemas and seeds
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (notifications, queue, socket)
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Helpers and utilities
│   │   └── server.ts        # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── docs/                    # Additional documentation
├── package.json             # Root package file
└── README.md
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md) - Detailed installation instructions
- [Architecture Overview](./docs/ARCHITECTURE.md) - System architecture and design decisions
- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/yourusername/hospital-management-system/issues)
- Documentation: See `docs/` folder

## Roadmap

- [ ] React frontend implementation
- [ ] Mobile app (React Native)
- [ ] Telemedicine integration
- [ ] Appointment scheduling system
- [ ] Patient portal
- [ ] SMS/Email notifications
- [ ] Biometric authentication
- [ ] AI-powered diagnosis suggestions
- [ ] IoT device integration (vitals monitors)
- [ ] Multi-language support
- [ ] HIPAA compliance certification

---

**Built for better healthcare workflows**
