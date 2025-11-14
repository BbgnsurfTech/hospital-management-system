import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  People,
  LocalHospital,
  Science,
  LocalPharmacy,
  Payment,
  Assessment,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types';

const DRAWER_WIDTH = 240;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    roles: Object.values(UserRole),
  },
  {
    text: 'Patients',
    icon: <People />,
    path: '/patients',
    roles: [UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN],
  },
  {
    text: 'Register Patient',
    icon: <PersonAdd />,
    path: '/patients/register',
    roles: [UserRole.RECEPTIONIST, UserRole.ADMIN],
  },
  {
    text: 'Consultations',
    icon: <LocalHospital />,
    path: '/consultations',
    roles: [UserRole.DOCTOR, UserRole.ADMIN],
  },
  {
    text: 'Laboratory',
    icon: <Science />,
    path: '/laboratory',
    roles: [UserRole.LAB_TECHNICIAN, UserRole.DOCTOR, UserRole.ADMIN],
  },
  {
    text: 'Pharmacy',
    icon: <LocalPharmacy />,
    path: '/pharmacy',
    roles: [UserRole.PHARMACIST, UserRole.ADMIN],
  },
  {
    text: 'Billing',
    icon: <Payment />,
    path: '/billing',
    roles: [UserRole.BILLING, UserRole.ADMIN],
  },
  {
    text: 'Analytics',
    icon: <Assessment />,
    path: '/analytics',
    roles: [UserRole.ADMIN, UserRole.DOCTOR],
  },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
