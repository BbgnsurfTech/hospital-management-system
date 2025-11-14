import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  People,
  HourglassEmpty,
  LocalHospital,
  Science,
  LocalPharmacy,
  TrendingUp,
} from '@mui/icons-material';
import api from '../config/api';
import { DashboardStats } from '../types';

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactElement;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
          }}
        >
          {React.cloneElement(icon, { sx: { color: 'white', fontSize: 32 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Today's Patients"
            value={stats.todayPatients}
            icon={<People />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Waiting Patients"
            value={stats.waitingPatients}
            icon={<HourglassEmpty />}
            color="#ed6c02"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="In Consultation"
            value={stats.consultationPatients}
            icon={<LocalHospital />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Lab Tests"
            value={stats.pendingLabTests}
            icon={<Science />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Pending Prescriptions"
            value={stats.pendingPrescriptions}
            icon={<LocalPharmacy />}
            color="#d32f2f"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Avg Wait Time"
            value={`${stats.avgWaitTime} min`}
            icon={<TrendingUp />}
            color="#0288d1"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            <Typography variant="body1">
              Today's Revenue: ${stats.todayRevenue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
