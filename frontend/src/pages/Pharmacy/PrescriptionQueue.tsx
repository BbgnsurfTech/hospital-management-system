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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import api from '../../config/api';
import { Prescription, Medication } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const PrescriptionQueue: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/pharmacy/prescriptions/pending');
      setPrescriptions(response.data.data.prescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDialogOpen(true);
  };

  const handleDispense = async () => {
    if (!selectedPrescription) return;

    try {
      await api.post(`/pharmacy/prescriptions/${selectedPrescription.id}/dispense`, {
        status: 'dispensed',
      });
      toast.success('Prescription dispensed successfully');
      setDialogOpen(false);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error dispensing prescription:', error);
      toast.error('Failed to dispense prescription');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Prescription Queue
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Reg. No.</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Issued At</TableCell>
              <TableCell>Medications</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : prescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No pending prescriptions
                </TableCell>
              </TableRow>
            ) : (
              prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>
                    {prescription.firstName} {prescription.lastName}
                  </TableCell>
                  <TableCell>{prescription.registrationNumber}</TableCell>
                  <TableCell>Dr. {prescription.doctorId}</TableCell>
                  <TableCell>
                    {format(new Date(prescription.issuedAt), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>{prescription.medications.length} items</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewPrescription(prescription)}
                    >
                      View & Dispense
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Prescription Details</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Patient: {selectedPrescription?.firstName}{' '}
              {selectedPrescription?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Reg. No.: {selectedPrescription?.registrationNumber}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Medications
            </Typography>
            <List>
              {selectedPrescription?.medications.map(
                (med: Medication, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={med.medicationName}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Dosage: {med.dosage} | Frequency: {med.frequency} |
                            Duration: {med.duration}
                          </Typography>
                          <br />
                          {med.instructions && (
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              Instructions: {med.instructions}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                )
              )}
            </List>

            {selectedPrescription?.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Notes:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPrescription.notes}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDispense}>
            Dispense Medications
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
