import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Smoke tests', () => {
  it('renders the button component', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});
