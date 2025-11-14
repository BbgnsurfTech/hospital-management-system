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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import api from '../../config/api';
import { LabTest, TestStatus } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const LabTestList: React.FC = () => {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [results, setResults] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/lab/pending');
      setTests(response.data.data.tests);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (test: LabTest) => {
    setSelectedTest(test);
    setResults('');
    setNormalRange('');
    setIsCritical(false);
    setNotes('');
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (testId: string, status: TestStatus) => {
    try {
      await api.patch(`/lab/${testId}`, { status });
      toast.success('Test status updated');
      fetchTests();
    } catch (error) {
      console.error('Error updating test:', error);
      toast.error('Failed to update test');
    }
  };

  const handleSubmitResults = async () => {
    if (!selectedTest) return;

    try {
      await api.patch(`/lab/${selectedTest.id}`, {
        status: TestStatus.REPORTED,
        results,
        normalRange,
        isCritical,
        notes,
      });
      toast.success('Test results submitted successfully');
      setDialogOpen(false);
      fetchTests();
    } catch (error) {
      console.error('Error submitting results:', error);
      toast.error('Failed to submit results');
    }
  };

  const getStatusColor = (status: TestStatus) => {
    const colors: Record<TestStatus, any> = {
      [TestStatus.ORDERED]: 'default',
      [TestStatus.SAMPLE_COLLECTED]: 'info',
      [TestStatus.IN_PROGRESS]: 'warning',
      [TestStatus.COMPLETED]: 'primary',
      [TestStatus.REPORTED]: 'success',
      [TestStatus.CRITICAL]: 'error',
    };
    return colors[status];
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Laboratory Tests
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Test Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Ordered By</TableCell>
              <TableCell>Ordered At</TableCell>
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
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No pending tests
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    {test.firstName} {test.lastName}
                  </TableCell>
                  <TableCell>{test.testName}</TableCell>
                  <TableCell>{test.testCategory}</TableCell>
                  <TableCell>Dr. {test.orderedBy}</TableCell>
                  <TableCell>
                    {format(new Date(test.orderedAt), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={test.status}
                      color={getStatusColor(test.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      {test.status === TestStatus.ORDERED && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleUpdateStatus(test.id, TestStatus.SAMPLE_COLLECTED)
                          }
                        >
                          Collect Sample
                        </Button>
                      )}
                      {test.status === TestStatus.SAMPLE_COLLECTED && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleUpdateStatus(test.id, TestStatus.IN_PROGRESS)
                          }
                        >
                          Start Processing
                        </Button>
                      )}
                      {test.status === TestStatus.IN_PROGRESS && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenDialog(test)}
                        >
                          Enter Results
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Test Results</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Test: {selectedTest?.testName}
            </Typography>
            <TextField
              fullWidth
              label="Results"
              multiline
              rows={3}
              value={results}
              onChange={(e) => setResults(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Normal Range"
              value={normalRange}
              onChange={(e) => setNormalRange(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                />
              }
              label="Mark as Critical (Will alert doctor immediately)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitResults}
            disabled={!results}
          >
            Submit Results
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
