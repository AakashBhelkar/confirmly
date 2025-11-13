'use client';

import { useState } from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'How does Confirmly reduce RTO?',
    answer: 'Confirmly sends automated confirmation messages to customers via WhatsApp, SMS, and Email. When customers confirm their orders, it significantly reduces the chances of RTO. Our AI-powered risk scoring also helps identify high-risk orders early.',
  },
  {
    question: 'Which channels are supported?',
    answer: 'We support WhatsApp Business API, SMS (via MSG91 or Twilio), and Email (via SendGrid or AWS SES). You can use one or all channels based on your preference.',
  },
  {
    question: 'How long does it take to set up?',
    answer: 'Setup takes less than 10 minutes. Connect your Shopify store, choose your communication channels, and you\'re ready to go. Our onboarding wizard guides you through every step.',
  },
  {
    question: 'What if I don\'t use Shopify?',
    answer: 'Currently, we support Shopify integration. We\'re working on adding support for WooCommerce, Magento, and other platforms. Contact us if you need a specific integration.',
  },
  {
    question: 'How is pricing calculated?',
    answer: 'Pricing is based on the number of orders and messages per month. We offer flexible plans to suit businesses of all sizes. All plans include a 14-day free trial.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take data security seriously. All data is encrypted in transit and at rest. We comply with GDPR and other data protection regulations. We never share your customer data with third parties.',
  },
];

export function FAQ() {
  return (
    <Box sx={{ py: 8 }}>
      <Typography variant="h3" sx={{ mb: 2, textAlign: 'center', fontWeight: 700 }}>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
        Everything you need to know about Confirmly
      </Typography>

      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {faqs.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}

