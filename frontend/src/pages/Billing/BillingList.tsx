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
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import api from '../../config/api';
import { Bill } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const BillingList: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await api.get('/billing/pending');
      setBills(response.data.data.bills);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentDialog = (bill: Bill) => {
    setSelectedBill(bill);
    setPaidAmount(bill.balance.toString());
    setPaymentMethod('');
    setDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedBill || !paidAmount || !paymentMethod) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await api.post(`/billing/${selectedBill.id}/payment`, {
        paidAmount: parseFloat(paidAmount),
        paymentMethod,
      });
      toast.success('Payment processed successfully');
      setDialogOpen(false);
      fetchBills();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pending Bills
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Reg. No.</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No pending bills
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>
                    {bill.firstName} {bill.lastName}
                  </TableCell>
                  <TableCell>{bill.registrationNumber}</TableCell>
                  <TableCell>${bill.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>${bill.paidAmount.toFixed(2)}</TableCell>
                  <TableCell>${bill.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={bill.status}
                      color={bill.status === 'pending' ? 'warning' : 'info'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(bill.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenPaymentDialog(bill)}
                    >
                      Process Payment
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Patient: {selectedBill?.firstName} {selectedBill?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total: ${selectedBill?.totalAmount.toFixed(2)} | Balance: $
              {selectedBill?.balance.toFixed(2)}
            </Typography>

            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
              inputProps={{ step: '0.01', min: '0' }}
            />

            <TextField
              fullWidth
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="insurance">Insurance</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleProcessPayment}>
            Process Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
