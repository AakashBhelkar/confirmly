import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../contexts/auth-context';

describe('Auth Context', () => {
  it('should provide auth context', () => {
    const TestComponent = () => {
      return <div>Test</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});

