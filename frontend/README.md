# Hospital Management System - Frontend

Modern, responsive React frontend for the Hospital Management System with real-time features.

## Features

- **Real-Time Updates**: WebSocket-based notifications and live data updates
- **Role-Based UI**: Dynamic interface based on user role
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Material-UI Components**: Modern, accessible UI components
- **TypeScript**: Full type safety throughout the application
- **State Management**: Zustand for efficient state management
- **Form Validation**: React Hook Form for robust form handling

## Technology Stack

- **React 18**: Latest React with hooks
- **TypeScript**: Type-safe code
- **Material-UI (MUI)**: Component library
- **Vite**: Fast build tool and dev server
- **Zustand**: Lightweight state management
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client with interceptors
- **React Router v6**: Client-side routing
- **React Hot Toast**: Toast notifications
- **Recharts**: Data visualization
- **date-fns**: Date formatting

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Backend API running on http://localhost:5000

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3000

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Layout/        # Header, Sidebar, MainLayout
│   │   └── ProtectedRoute.tsx
│   ├── config/            # Configuration files
│   │   ├── api.ts         # Axios instance with interceptors
│   │   └── socket.ts      # Socket.IO setup
│   ├── pages/             # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Patients/      # Patient management pages
│   │   ├── Doctor/        # Doctor consultation pages
│   │   ├── Laboratory/    # Lab test pages
│   │   ├── Pharmacy/      # Pharmacy pages
│   │   └── Billing/       # Billing pages
│   ├── store/             # Zustand stores
│   │   ├── authStore.ts   # Authentication state
│   │   └── notificationStore.ts
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main app component with routing
│   └── main.tsx           # App entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features by Role

### Admin
- Full system access
- Dashboard with comprehensive statistics
- Analytics and reports
- User management (if implemented)

### Receptionist
- Patient registration
- Patient check-in
- View patient list
- Basic dashboard

### Doctor
- Patient queue (waiting patients)
- Start consultations
- View patient history
- Issue prescriptions
- Order lab tests
- View lab results
- Dashboard with patient stats

### Lab Technician
- View pending tests
- Update test status
- Enter test results
- Mark critical results
- Dashboard with lab stats

### Pharmacist
- View prescription queue
- Dispense medications
- Inventory management
- Dashboard with pharmacy stats

### Billing
- View pending bills
- Process payments
- Multiple payment methods
- Dashboard with revenue stats

## Key Components

### Authentication

The app uses JWT-based authentication with automatic token refresh:

```typescript
// Login
const { login } = useAuthStore();
await login(email, password);

// Logout
const { logout } = useAuthStore();
logout();

// Get current user
const { user } = useAuthStore();
```

### Real-Time Notifications

WebSocket connection is automatically established on login:

```typescript
// Notifications are received automatically
// and displayed as toast messages

// Access notifications
const { notifications, unreadCount } = useNotificationStore();

// Mark as read
const { markAsRead } = useNotificationStore();
markAsRead(notificationId);
```

### Protected Routes

Routes are automatically protected based on user roles:

```typescript
<ProtectedRoute allowedRoles={[UserRole.DOCTOR, UserRole.ADMIN]}>
  <ConsultationList />
</ProtectedRoute>
```

### API Calls

API calls are made using the configured Axios instance:

```typescript
import api from '@/config/api';

// GET request
const response = await api.get('/patients');

// POST request
const response = await api.post('/patients', data);

// Token is automatically added to headers
// Unauthorized responses (401) trigger automatic logout
```

## State Management

### Auth Store

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}
```

### Notification Store

```typescript
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  initializeNotifications: () => void;
}
```

## Styling

The app uses Material-UI with a custom theme:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

Customize the theme in `src/App.tsx`.

## Real-Time Events

The app listens to these Socket.IO events:

- `notification`: New notification for user
- `queue-updated`: Queue position changed
- `patient-status-changed`: Patient moved to new status
- `test-result-ready`: Lab result available
- `critical-result`: Critical lab result alert

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes are reflected immediately without page reload.

### TypeScript

The project uses strict TypeScript. All API responses and component props are typed.

### Code Organization

- Keep components small and focused
- Use custom hooks for complex logic
- Place reusable logic in `/utils`
- Define types in `/types`

### API Integration

The API client automatically:
- Adds authentication token to requests
- Handles 401 responses (logout)
- Provides consistent error handling

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add menu item in `src/components/Layout/Sidebar.tsx` (if needed)
4. Wrap with `ProtectedRoute` if authentication is required

### Adding a New API Endpoint

```typescript
// In your component or custom hook
import api from '@/config/api';

const fetchData = async () => {
  const response = await api.get('/your-endpoint');
  return response.data.data;
};
```

### Showing Notifications

```typescript
import toast from 'react-hot-toast';

// Success
toast.success('Operation successful');

// Error
toast.error('Operation failed');

// Loading
toast.loading('Processing...');
```

## Troubleshooting

### Cannot connect to API

1. Ensure backend is running on http://localhost:5000
2. Check `.env` file has correct API URL
3. Check browser console for CORS errors

### WebSocket not connecting

1. Ensure backend Socket.IO is running
2. Check token is valid
3. Check browser console for socket errors

### Authentication issues

1. Clear localStorage: `localStorage.clear()`
2. Restart both frontend and backend
3. Check JWT_SECRET matches between frontend and backend

### Build errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

## Performance Optimization

- Code splitting with React.lazy() (can be added)
- Image optimization (can be added)
- API response caching
- Memoization with useMemo/useCallback (can be added)
- Virtual scrolling for large lists (can be added)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Patient check-in interface
- [ ] Doctor consultation room with EMR
- [ ] Queue management dashboard
- [ ] Analytics charts and visualizations
- [ ] File upload for test results
- [ ] PDF generation for reports
- [ ] Print functionality
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Offline support with service workers
- [ ] Performance monitoring

## Contributing

See main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see main [LICENSE](../LICENSE) file for details.

---

For backend documentation, see [../backend/README.md](../backend/README.md)
