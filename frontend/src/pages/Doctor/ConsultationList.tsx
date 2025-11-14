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
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Visit, PatientStatus } from '../../types';
import { format } from 'date-fns';

export const ConsultationList: React.FC = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await api.get('/doctors/my-patients', {
        params: { status: PatientStatus.WAITING },
      });
      setVisits(response.data.data.visits);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (visitId: string) => {
    try {
      await api.post(`/doctors/consultations/${visitId}/start`);
      navigate(`/consultations/${visitId}`);
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Queue
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Visit No.</TableCell>
              <TableCell>Patient Name</TableCell>
              <TableCell>Reg. No.</TableCell>
              <TableCell>Chief Complaint</TableCell>
              <TableCell>Check-in Time</TableCell>
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
            ) : visits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No patients in queue
                </TableCell>
              </TableRow>
            ) : (
              visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{visit.visitNumber}</TableCell>
                  <TableCell>
                    {visit.firstName} {visit.lastName}
                  </TableCell>
                  <TableCell>{visit.registrationNumber}</TableCell>
                  <TableCell>{visit.chiefComplaint}</TableCell>
                  <TableCell>
                    {format(new Date(visit.checkInTime), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip label={visit.status} color="warning" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleStartConsultation(visit.id)}
                    >
                      Start Consultation
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
