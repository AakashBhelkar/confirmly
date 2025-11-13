'use client';

import { Box, Grid, Card, CardContent, Typography, Button, Chip, Stack, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Plan } from '../../lib/api/billing';

interface PlanSelectorProps {
  plans: Plan[];
  currentPlanId?: string;
  onSelect: (planId: string) => void;
  loading?: boolean;
}

export function PlanSelector({ plans, currentPlanId, onSelect, loading }: PlanSelectorProps) {
  return (
    <Grid container spacing={3}>
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        const isPopular = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('business');

        return (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: isCurrent ? 2 : 1,
                borderColor: isCurrent ? 'primary.main' : 'divider',
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {plan.description}
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h3" component="span" sx={{ fontWeight: 700 }}>
                    {plan.currency} {plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="span">
                    /{plan.interval}
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
                    Limits:
                  </Typography>
                  <Typography variant="body2">
                    {plan.limits.orders.toLocaleString()} orders/{plan.interval}
                  </Typography>
                  <Typography variant="body2">
                    {plan.limits.messages.toLocaleString()} messages/{plan.interval}
                  </Typography>
                </Box>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant={isCurrent ? 'outlined' : 'contained'}
                  fullWidth
                  onClick={() => onSelect(plan.id)}
                  disabled={isCurrent || loading}
                >
                  {isCurrent ? 'Current Plan' : 'Select Plan'}
                </Button>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

