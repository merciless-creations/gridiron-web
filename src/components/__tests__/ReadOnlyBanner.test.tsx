import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReadOnlyBanner } from '../ReadOnlyBanner';

describe('ReadOnlyBanner', () => {
  it('displays the team name in scouting message', () => {
    render(<ReadOnlyBanner teamName="Atlanta Falcons" />);

    expect(screen.getByText('Scouting: Atlanta Falcons')).toBeInTheDocument();
  });

  it('displays the read-only mode message', () => {
    render(<ReadOnlyBanner teamName="Test Team" />);

    expect(screen.getByText(/You are viewing this team in read-only mode/i)).toBeInTheDocument();
  });

  it('uses custom message when provided', () => {
    render(<ReadOnlyBanner teamName="Test Team" message="Custom scouting message" />);

    expect(screen.getByText('Custom scouting message')).toBeInTheDocument();
    expect(screen.queryByText(/Scouting: Test Team/i)).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<ReadOnlyBanner teamName="Test Team" />);

    const banner = screen.getByRole('status');
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute('aria-label', 'Read-only mode');
  });

  it('applies warning styling classes', () => {
    render(<ReadOnlyBanner teamName="Test Team" />);

    const banner = screen.getByRole('status');
    expect(banner).toHaveClass('bg-gridiron-warning/10');
    expect(banner).toHaveClass('border-gridiron-warning/30');
  });

  it('includes an eye icon for visual indication', () => {
    const { container } = render(<ReadOnlyBanner teamName="Test Team" />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
