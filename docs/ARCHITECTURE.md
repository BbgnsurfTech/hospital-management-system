# Hospital Management System - Architecture Overview

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │    Tablets   │      │
│  │   (React)    │  │(React Native)│  │   (PWA)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │ HTTPS/WSS
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Nginx / Load Balancer                              │   │
│  │   - SSL Termination                                  │   │
│  │   - Rate Limiting                                    │   │
│  │   - Request Routing                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Express.js + TypeScript                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Auth     │  │  Patient   │  │   Doctor   │     │   │
│  │  │  Module    │  │   Module   │  │   Module   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │    Lab     │  │  Pharmacy  │  │  Billing   │     │   │
│  │  │  Module    │  │   Module   │  │   Module   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Socket.IO (Real-time Engine)               │   │
│  │   - Instant notifications                            │   │
│  │   - Queue updates                                    │   │
│  │   - Status changes                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            │                              │
            ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│   PostgreSQL         │      │      Redis           │
│   - Primary Data     │      │   - Queue Cache      │
│   - EMR Records      │      │   - Session Store    │
│   - Transactions     │      │   - Real-time Data   │
└──────────────────────┘      └──────────────────────┘
```

## Core Components

### 1. API Layer

**Technology**: Express.js + TypeScript

**Responsibilities**:
- RESTful API endpoints
- Request validation
- Authentication/Authorization
- Error handling
- Response formatting

**Key Files**:
- `src/server.ts` - Application entry point
- `src/routes/` - API route definitions
- `src/middleware/` - Auth, validation, error handling

### 2. Real-time Communication Layer

**Technology**: Socket.IO

**Responsibilities**:
- WebSocket connections
- Real-time notifications
- Queue updates
- Status broadcasts

**Key Files**:
- `src/services/socketService.ts` - Socket.IO initialization and management

**Events**:
```typescript
// Server → Client
- notification: New notification for user
- queue-updated: Queue position changed
- patient-status-changed: Patient moved to new status
- test-result-ready: Lab result available
- critical-result: Critical lab result alert

// Client → Server
- patient-status-update: Update patient status
- queue-update: Update queue information
```

### 3. Business Logic Layer

**Controllers**: Handle HTTP requests and responses
- `authController.ts` - Authentication
- `patientController.ts` - Patient management
- `doctorController.ts` - Doctor operations
- `labController.ts` - Laboratory operations
- `pharmacyController.ts` - Pharmacy operations
- `billingController.ts` - Billing operations
- `notificationController.ts` - Notification management
- `analyticsController.ts` - Analytics and reports

**Services**: Core business logic
- `notificationService.ts` - Notification distribution
- `queueService.ts` - Queue management
- `socketService.ts` - Real-time communication

### 4. Data Layer

#### PostgreSQL Database

**Purpose**: Primary data store

**Key Tables**:
- `users` - Staff accounts
- `patients` - Patient demographics
- `visits` - Patient encounters
- `prescriptions` - Medication orders
- `lab_tests` - Laboratory tests
- `radiology_tests` - Imaging tests
- `billing` - Financial transactions
- `notifications` - User notifications
- `queue` - Queue management
- `inventory` - Pharmacy stock

**Indexes**: Optimized for:
- Patient lookups
- Visit queries
- Queue operations
- Notification retrieval

#### Redis Cache

**Purpose**: Performance optimization and real-time data

**Usage**:
- Queue cache (`queue:{department}`)
- Session storage
- Rate limiting counters
- Real-time statistics

## Data Flow Examples

### 1. Patient Check-In Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐
│Reception│     │   API    │     │PostgreSQL│     │ Socket  │
└────┬────┘     └─────┬────┘     └────┬─────┘     └────┬────┘
     │                │               │                │
     │ POST /check-in │               │                │
     │───────────────>│               │                │
     │                │ INSERT visit  │                │
     │                │──────────────>│                │
     │                │               │                │
     │                │ INSERT queue  │                │
     │                │──────────────>│                │
     │                │               │                │
     │                │ INSERT notify │                │
     │                │──────────────>│                │
     │                │               │                │
     │                │  Emit 'notification' event     │
     │                │───────────────────────────────>│
     │                │               │                │
     │                │               │    ┌─────────┐ │
     │                │               │    │ Doctor  │ │
     │                │               │    │ receives│ │
     │                │               │    │  alert  │ │
     │                │               │    └─────────┘ │
     │<───Response────│               │                │
     │                │               │                │
```

### 2. Lab Result Notification Flow

```
┌──────┐     ┌─────┐     ┌──────┐     ┌────────┐     ┌──────┐
│ Lab  │     │ API │     │  DB  │     │ Socket │     │Doctor│
└──┬───┘     └──┬──┘     └───┬──┘     └───┬────┘     └───┬──┘
   │            │             │            │               │
   │ Update     │             │            │               │
   │ Result     │             │            │               │
   │───────────>│             │            │               │
   │            │ UPDATE test │            │               │
   │            │────────────>│            │               │
   │            │             │            │               │
   │            │ Check       │            │               │
   │            │ if critical │            │               │
   │            │<────────────│            │               │
   │            │             │            │               │
   │            │ Notify      │            │               │
   │            │ doctor      │            │               │
   │            │─────────────────────────>│               │
   │            │             │            │ notification  │
   │            │             │            │──────────────>│
   │            │             │            │               │
   │<───────────│             │            │               │
```

## Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Validate Credentials (bcrypt)
   ↓
3. Generate JWT Token
   ↓
4. Return Token to Client
   ↓
5. Client Stores Token
   ↓
6. Client Sends Token with Each Request
   ↓
7. Server Validates Token (middleware)
   ↓
8. Authorize Based on Role
```

### Role-Based Access Control (RBAC)

```typescript
Roles:
- admin: Full system access
- doctor: Patient care, prescriptions, test orders
- nurse: Patient vitals, basic care
- receptionist: Registration, check-in
- pharmacist: Prescription dispensing, inventory
- lab_technician: Test processing, results
- radiologist: Imaging tests
- billing: Financial operations

Permissions Matrix:
┌────────────────┬───────┬────────┬───────┬─────────────┐
│    Resource    │ Admin │ Doctor │ Nurse │ Receptionist│
├────────────────┼───────┼────────┼───────┼─────────────┤
│ Register       │  ✓    │   ✗    │  ✗    │     ✓       │
│ View Patients  │  ✓    │   ✓    │  ✓    │     ✓       │
│ Prescribe      │  ✓    │   ✓    │  ✗    │     ✗       │
│ Order Tests    │  ✓    │   ✓    │  ✗    │     ✗       │
│ View Analytics │  ✓    │   ✓    │  ✗    │     ✗       │
└────────────────┴───────┴────────┴───────┴─────────────┘
```

## Scalability Considerations

### Horizontal Scaling

**Load Balancing**:
```
         ┌──────────┐
         │  Nginx   │
         │  (LB)    │
         └────┬─────┘
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Node 1  │ │ Node 2  │ │ Node 3  │
└─────────┘ └─────────┘ └─────────┘
     │        │        │
     └────────┼────────┘
              ▼
      ┌──────────────┐
      │  PostgreSQL  │
      │   (Primary)  │
      └──────────────┘
```

**Session Management**:
- JWT tokens (stateless)
- Redis for session data
- Socket.IO sticky sessions

### Database Optimization

**Indexing Strategy**:
- Primary keys on all tables
- Foreign key indexes
- Composite indexes for common queries
- Full-text search indexes

**Query Optimization**:
- Connection pooling (max 20 connections)
- Prepared statements
- Query result caching in Redis
- Pagination for large datasets

**Read Replicas** (Future):
```
┌──────────────┐
│  Primary DB  │
│   (Write)    │
└──────┬───────┘
       │ Replication
   ┌───┴────┬────────┐
   ▼        ▼        ▼
┌─────┐  ┌─────┐  ┌─────┐
│Rep 1│  │Rep 2│  │Rep 3│
│(Read)  │(Read)  │(Read)│
└─────┘  └─────┘  └─────┘
```

### Caching Strategy

**Multi-Layer Caching**:
```
Request
  ↓
Application Memory Cache (Node.js)
  ↓ (miss)
Redis Cache
  ↓ (miss)
PostgreSQL Database
```

**Cache Keys**:
- `queue:{department}` - Queue data
- `patient:{id}` - Patient info
- `user:{id}` - User profile
- `stats:dashboard` - Dashboard stats

**TTL Strategy**:
- Queue data: 5 minutes
- Patient info: 1 hour
- Dashboard stats: 2 minutes
- User profiles: 30 minutes

## Performance Metrics

**Target Response Times**:
- Authentication: < 200ms
- Patient check-in: < 500ms
- Queue updates: < 100ms
- Real-time notifications: < 50ms
- Dashboard analytics: < 1s

**Throughput Targets**:
- 1000+ concurrent users
- 500+ WebSocket connections
- 10,000+ API requests/minute
- 50+ database writes/second

## Monitoring and Logging

**Logging Strategy**:
```typescript
Levels:
- error: System errors, critical issues
- warn: Warning conditions
- info: General information
- debug: Detailed debugging

Storage:
- Console (development)
- File rotation (production)
- Centralized logging (ELK stack)
```

**Metrics to Monitor**:
- API response times
- Database query performance
- Redis memory usage
- WebSocket connection count
- Queue wait times
- Error rates
- CPU/Memory usage

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────┐
│              Cloudflare / CDN               │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│             Nginx (Reverse Proxy)           │
│  - SSL Termination                          │
│  - Static file serving                      │
│  - Request forwarding                       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Docker Containers                 │
│  ┌────────────────────────────────────┐    │
│  │  Node.js App Container (3x)        │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │  PostgreSQL Container              │    │
│  └────────────────────────────────────┘    │
│  ┌────────────────────────────────────┐    │
│  │  Redis Container                   │    │
│  └────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## Future Enhancements

1. **Microservices Architecture**
   - Split into independent services
   - API Gateway (Kong/Traefik)
   - Service mesh (Istio)

2. **Event-Driven Architecture**
   - Message queue (RabbitMQ/Kafka)
   - Event sourcing
   - CQRS pattern

3. **Advanced Analytics**
   - Real-time dashboards (Grafana)
   - Predictive analytics (ML models)
   - Data warehouse integration

4. **High Availability**
   - Multi-region deployment
   - Database replication
   - Automatic failover
   - Disaster recovery

## Technology Decisions

### Why Node.js/Express?
- Non-blocking I/O for real-time operations
- Large ecosystem (npm)
- JavaScript/TypeScript across stack
- Excellent WebSocket support

### Why PostgreSQL?
- ACID compliance for medical data
- Complex query support
- JSON support for flexible schemas
- Mature and reliable

### Why Redis?
- In-memory performance
- Pub/sub for real-time events
- Simple data structures
- Persistence options

### Why Socket.IO?
- Real-time bidirectional communication
- Automatic reconnection
- Room/namespace support
- Fallback mechanisms

## References

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Socket.IO Documentation](https://socket.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
