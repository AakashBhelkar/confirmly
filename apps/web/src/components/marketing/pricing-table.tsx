'use client';

import { Box, Grid, Card, CardContent, Typography, Button, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { usePlans } from '../../hooks/use-billing';
import { useRouter } from 'next/navigation';

export function PricingTable() {
  const { data: plansData, isLoading } = usePlans();
  const router = useRouter();
  const plans = plansData?.data || [];

  const handleSelectPlan = (planId: string) => {
    router.push(`/register?plan=${planId}`);
  };

  if (isLoading) {
    return <Typography>Loading plans...</Typography>;
  }

  return (
    <Box sx={{ py: 8 }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 700 }}>
        Simple, Transparent Pricing
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
        Choose the plan that's right for your business
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => {
          const isPopular = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('business');

          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: isPopular ? 2 : 1,
                  borderColor: isPopular ? 'primary.main' : 'divider',
                }}
              >
                {isPopular && (
                  <Chip
                    label="Popular"
                    color="primary"
                    size="small"
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h3" component="span" sx={{ fontWeight: 700 }}>
                      {plan.currency} {plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="span">
                      /month
                    </Typography>
                  </Box>
                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {plan.limits.orders.toLocaleString()} orders/month
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.limits.messages.toLocaleString()} messages/month
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    variant={isPopular ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    Get Started
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

