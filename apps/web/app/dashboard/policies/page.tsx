'use client';

import { useState } from 'react';
import { Box, Container, Typography, Button, Paper, Stack, Dialog, DialogTitle, DialogContent } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { usePolicy, useSavePolicy, useTestPolicy } from '../../../src/hooks/use-policies';
import { PolicyBuilder } from '../../../src/components/policies/policy-builder';
import { PolicyPreview } from '../../../src/components/policies/policy-preview';
import { PolicySimulator } from '../../../src/components/policies/policy-simulator';
import { LoadingSpinner } from '../../../src/components/shared/loading';
import { PolicyRule } from '../../../src/lib/api/policies';

export default function PoliciesPage() {
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const { data, isLoading } = usePolicy();
  const savePolicy = useSavePolicy();
  const testPolicy = useTestPolicy();

  const policy = data?.data || { rules: [] };
  const [rules, setRules] = useState<PolicyRule[]>(policy.rules || []);

  const handleSave = async () => {
    await savePolicy.mutateAsync(rules);
  };

  const handleTest = async (orderData: any) => {
    const result = await testPolicy.mutateAsync(orderData);
    return result.data;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <LoadingSpinner message="Loading policy..." />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Policies
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<PlayArrowIcon />}
            onClick={() => setSimulatorOpen(true)}
          >
            Test Policy
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={savePolicy.isPending}
          >
            Save Policy
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Define rules to automatically handle orders based on conditions. Rules are evaluated in order, and the first matching rule determines the action.
        </Typography>
        <PolicyBuilder rules={rules} onChange={setRules} />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Policy Preview
        </Typography>
        <PolicyPreview rules={rules} />
      </Paper>

      <Dialog open={simulatorOpen} onClose={() => setSimulatorOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Test Policy</DialogTitle>
        <DialogContent>
          <PolicySimulator onTest={handleTest} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

