'use client';

import { Box, Grid, Card, CardContent, Typography, Avatar, Rating } from '@mui/material';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    company: 'FashionHub',
    role: 'Founder',
    image: '👨‍💼',
    rating: 5,
    text: 'Confirmly reduced our RTO by 65% in just 3 months. The automated confirmations are a game-changer!',
  },
  {
    name: 'Priya Sharma',
    company: 'TechStore',
    role: 'Operations Manager',
    image: '👩‍💼',
    rating: 5,
    text: 'The multi-channel approach works perfectly. Our customers love getting WhatsApp confirmations.',
  },
  {
    name: 'Amit Patel',
    company: 'HomeDecor Plus',
    role: 'CEO',
    image: '👨‍💼',
    rating: 5,
    text: 'Best investment we made this year. The ROI calculator was spot on - we saved ₹2.5L in the first quarter.',
  },
];

export function Testimonials() {
  return (
    <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 700 }}>
        What Our Customers Say
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
        Join hundreds of eCommerce brands reducing RTO losses
      </Typography>

      <Grid container spacing={4}>
        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, mr: 2, fontSize: 24 }}>
                    {testimonial.image}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {testimonial.role}, {testimonial.company}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  "{testimonial.text}"
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

