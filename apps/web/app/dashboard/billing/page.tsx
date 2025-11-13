'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { usePlans, useSubscription, useUsage, useInvoices, useCreateCheckout, useCreatePortalSession } from '../../../src/hooks/use-billing';
import { PlanSelector } from '../../../src/components/billing/plan-selector';
import { UsageMeter } from '../../../src/components/billing/usage-meter';
import { InvoiceHistory } from '../../../src/components/billing/invoice-history';
import { LoadingSpinner } from '../../../src/components/shared/loading';

export default function BillingPage() {
  const [tab, setTab] = useState(0);
  const { data: plansData, isLoading: plansLoading } = usePlans();
  const { data: subscriptionData, isLoading: subscriptionLoading } = useSubscription();
  const { data: usageData, isLoading: usageLoading } = useUsage();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();
  const createCheckout = useCreateCheckout();
  const createPortal = useCreatePortalSession();

  const plans = plansData?.data || [];
  const subscription = subscriptionData?.data;
  const usage = usageData?.data;
  const invoices = invoicesData?.data || [];

  const handlePlanSelect = (planId: string) => {
    const successUrl = `${window.location.origin}/dashboard/billing?success=true`;
    const cancelUrl = `${window.location.origin}/dashboard/billing?canceled=true`;
    createCheckout.mutate({ planId, successUrl, cancelUrl });
  };

  const handleManageBilling = () => {
    const returnUrl = `${window.location.origin}/dashboard/billing`;
    createPortal.mutate(returnUrl);
  };

  const isLoading = plansLoading || subscriptionLoading || usageLoading || invoicesLoading;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Billing & Team
        </Typography>
        {subscription && (
          <Button
            variant="outlined"
            startIcon={<PaymentIcon />}
            onClick={handleManageBilling}
          >
            Manage Billing
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="Plans" />
          <Tab label="Usage" />
          <Tab label="Invoices" />
        </Tabs>
      </Paper>

      {isLoading ? (
        <LoadingSpinner message="Loading billing information..." />
      ) : (
        <>
          {tab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Choose a Plan
              </Typography>
              {subscription && usage && (
                <UsageMeter
                  usage={usage}
                  limits={plans.find((p) => p.id === subscription.planId)?.limits || { orders: 0, messages: 0 }}
                />
              )}
              <Box sx={{ mt: 4 }}>
                <PlanSelector
                  plans={plans}
                  currentPlanId={subscription?.planId}
                  onSelect={handlePlanSelect}
                  loading={createCheckout.isPending}
                />
              </Box>
            </Box>
          )}

          {tab === 1 && usage && subscription && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Usage & Limits
              </Typography>
              <UsageMeter
                usage={usage}
                limits={plans.find((p) => p.id === subscription.planId)?.limits || { orders: 0, messages: 0 }}
              />
            </Box>
          )}

          {tab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Invoice History
              </Typography>
              <InvoiceHistory invoices={invoices} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

