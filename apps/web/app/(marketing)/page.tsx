'use client';

import { Box, Container, Typography, Button, Grid, Card, CardContent, AppBar, Toolbar } from '@mui/material';
import Link from 'next/link';
import { PricingTable } from '../../src/components/marketing/pricing-table';
import { Testimonials } from '../../src/components/marketing/testimonials';
import { FAQ } from '../../src/components/marketing/faq';
import { ROICalculator } from '../../src/components/marketing/roi-calculator';

export default function MarketingPage() {
  return (
    <Box>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Confirmly
          </Typography>
          <Button component={Link} href="/login" color="inherit">
            Sign In
          </Button>
          <Button component={Link} href="/register" variant="contained" sx={{ ml: 2 }}>
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Reduce RTO by 60%+
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          AI-powered platform that reduces Return-to-Origin losses for eCommerce brands
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" size="large" component={Link} href="/register">
            Get Started
          </Button>
          <Button variant="outlined" size="large" component={Link} href="/login">
            Sign In
          </Button>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  AI Risk Scoring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Machine learning models predict RTO risk for every order
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Multi-Channel Confirmation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Send confirmations via WhatsApp, SMS, and Email
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Automated Workflows
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Auto-cancel unconfirmed orders and re-confirm when needed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Pricing Table */}
      <PricingTable />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to reduce your RTO?
        </Typography>
        <Button variant="contained" size="large" component={Link} href="/register" sx={{ mt: 2 }}>
          Start Free Trial
        </Button>
      </Container>
    </Box>
  );
}

