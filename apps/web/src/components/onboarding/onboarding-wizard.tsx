'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import { WelcomeStep } from './steps/welcome';
import { BusinessInfoStep } from './steps/business-info';
import { ConnectShopifyStep } from './steps/connect-shopify';
import { ChooseChannelsStep } from './steps/choose-channels';
import { SetPreferencesStep } from './steps/set-preferences';
import { CreateTemplateStep } from './steps/create-template';
import { SuccessStep } from './steps/success';

const steps = [
  'Welcome',
  'Business Info',
  'Connect Shopify',
  'Choose Channels',
  'Set Preferences',
  'Create Template',
  'Complete',
];

export function OnboardingWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setFormData((prev: any) => ({ ...prev, ...stepData }));
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return <BusinessInfoStep onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 2:
        return <ConnectShopifyStep onNext={handleNext} onBack={handleBack} onSkip={() => handleNext()} />;
      case 3:
        return <ChooseChannelsStep onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 4:
        return <SetPreferencesStep onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 5:
        return <CreateTemplateStep onNext={handleNext} onBack={handleBack} initialData={formData} />;
      case 6:
        return <SuccessStep />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
          Welcome to Confirmly
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel onClick={() => index < activeStep && handleStepChange(index)}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 400, mb: 4 }}>{renderStep()}</Box>

        {activeStep < steps.length - 1 && (
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box />
          </Stack>
        )}
      </Paper>
    </Container>
  );
}

