import { Container, type ContainerProps } from '@mui/material';
import type { ReactNode } from 'react';

interface PageContainerProps extends Omit<ContainerProps, 'maxWidth'> {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  py?: number;
}

export const PageContainer = ({ 
  children, 
  maxWidth = "lg", 
  py = 4,
  sx,
  ...props 
}: PageContainerProps) => {
  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ py, ...sx }} 
      {...props}
    >
      {children}
    </Container>
  );
};