import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Patient, PatientStatus } from '../../types';
import { format } from 'date-fns';

const getStatusColor = (status: PatientStatus): string => {
  const colors: Record<PatientStatus, string> = {
    [PatientStatus.REGISTERED]: 'default',
    [PatientStatus.WAITING]: 'warning',
    [PatientStatus.IN_CONSULTATION]: 'info',
    [PatientStatus.AWAITING_TESTS]: 'secondary',
    [PatientStatus.TESTS_IN_PROGRESS]: 'secondary',
    [PatientStatus.AWAITING_RESULTS]: 'secondary',
    [PatientStatus.AT_PHARMACY]: 'primary',
    [PatientStatus.AT_BILLING]: 'primary',
    [PatientStatus.COMPLETED]: 'success',
    [PatientStatus.ADMITTED]: 'error',
  };
  return colors[status];
};

export const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients', {
        params: { search, limit: 50 },
      });
      setPatients(response.data.data.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Patients</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/patients/register')}
        >
          Register New Patient
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, registration number, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Registration No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.registrationNumber}</TableCell>
                  <TableCell>
                    {patient.firstName} {patient.lastName}
                  </TableCell>
                  <TableCell>
                    {new Date().getFullYear() -
                      new Date(patient.dateOfBirth).getFullYear()}
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {patient.gender}
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.currentStatus}
                      color={getStatusColor(patient.currentStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
