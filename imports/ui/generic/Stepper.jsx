import React from 'react';
import {
  Box,
  Step,
  Stepper as ChStepper,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
} from '@chakra-ui/react';

export default function Stepper({ steps, activeStep }) {
  return (
    <ChStepper index={activeStep}>
      {steps.map((step, index) => (
        <Step key={step.title}>
          <StepIndicator>
            <StepStatus
              complete={<StepIcon />}
              incomplete={<StepNumber />}
              active={<StepNumber />}
            />
          </StepIndicator>

          <Box>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </Box>

          <StepSeparator />
        </Step>
      ))}
    </ChStepper>
  );
}
