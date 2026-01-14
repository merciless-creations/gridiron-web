import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SimulationLockBanner } from './SimulationLockBanner';

describe('SimulationLockBanner', () => {
  beforeEach(() => {
    // Mock the current time for consistent duration calculations
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the banner with simulation in progress message', () => {
    render(
      <SimulationLockBanner
        startedAt="2024-06-15T11:30:00Z"
        startedByUserName="Test User"
      />
    );

    expect(screen.getByText(/Simulation in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/started by Test User/i)).toBeInTheDocument();
  });

  it('displays the simulation duration', () => {
    render(
      <SimulationLockBanner
        startedAt="2024-06-15T11:30:00Z"
        startedByUserName="Admin"
      />
    );

    // 30 minutes ago
    expect(screen.getByText(/30 minutes/i)).toBeInTheDocument();
  });

  it('renders without user name when startedByUserName is null', () => {
    render(
      <SimulationLockBanner
        startedAt="2024-06-15T11:45:00Z"
        startedByUserName={null}
      />
    );

    expect(screen.getByText(/Simulation in progress/i)).toBeInTheDocument();
    expect(screen.queryByText(/started by/i)).not.toBeInTheDocument();
  });

  it('shows roster and depth chart disabled message', () => {
    render(
      <SimulationLockBanner
        startedAt="2024-06-15T11:00:00Z"
        startedByUserName="Commissioner"
      />
    );

    expect(
      screen.getByText(/Roster and depth chart changes are disabled/i)
    ).toBeInTheDocument();
  });

  it('has the correct accessibility attributes', () => {
    render(
      <SimulationLockBanner
        startedAt="2024-06-15T11:00:00Z"
        startedByUserName="Admin"
      />
    );

    const banner = screen.getByRole('status');
    expect(banner).toHaveAttribute('aria-label', 'Simulation in progress');
  });

  it('includes a spinning animation indicator', () => {
    const { container } = render(
      <SimulationLockBanner
        startedAt="2024-06-15T11:00:00Z"
        startedByUserName="Admin"
      />
    );

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with amber color scheme for visibility', () => {
    const { container } = render(
      <SimulationLockBanner
        startedAt="2024-06-15T11:00:00Z"
        startedByUserName="Admin"
      />
    );

    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toContain('amber');
  });

  it('handles longer durations correctly', () => {
    // Started 2 hours ago
    render(
      <SimulationLockBanner
        startedAt="2024-06-15T10:00:00Z"
        startedByUserName="Admin"
      />
    );

    expect(screen.getByText(/2 hours/i)).toBeInTheDocument();
  });
});
