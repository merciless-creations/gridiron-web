import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResizableColumnHeader } from '../ResizableColumnHeader';

describe('ResizableColumnHeader', () => {
  const defaultProps = {
    columnKey: 'testColumn',
    onWidthChange: vi.fn(),
    children: <span>Test Header</span>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any document event listeners
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  describe('Rendering', () => {
    it('renders header content', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps}>
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      expect(screen.getByText('Test Header')).toBeInTheDocument();
    });

    it('renders resize handle', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      expect(screen.getByTestId('test-header-resize-handle')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} className="custom-class" data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).toHaveClass('custom-class');
    });

    it('applies width style when width prop is provided', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} width={200} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).toHaveStyle({ width: '200px', minWidth: '200px' });
    });

    it('does not apply width style when width prop is undefined', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).not.toHaveStyle({ width: '200px' });
    });
  });

  describe('Accessibility', () => {
    it('resize handle has correct role', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      expect(handle).toHaveAttribute('role', 'separator');
    });

    it('resize handle has aria-orientation', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('resize handle has aria-label', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      expect(handle).toHaveAttribute('aria-label', 'Resize testColumn column');
    });
  });

  describe('Resize Interaction', () => {
    it('calls onWidthChange on mouseup after drag', () => {
      const onWidthChange = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader
                {...defaultProps}
                onWidthChange={onWidthChange}
                data-testid="test-header"
              >
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      // Mock offsetWidth
      Object.defineProperty(header, 'offsetWidth', { value: 100, configurable: true });

      // Start resize
      fireEvent.mouseDown(handle, { clientX: 100 });

      // Move mouse
      fireEvent.mouseMove(document, { clientX: 150 });

      // End resize
      fireEvent.mouseUp(document, { clientX: 150 });

      expect(onWidthChange).toHaveBeenCalledWith('testColumn', 150);
    });

    it('respects minWidth during resize', () => {
      const onWidthChange = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader
                {...defaultProps}
                onWidthChange={onWidthChange}
                minWidth={80}
                data-testid="test-header"
              >
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      // Mock offsetWidth
      Object.defineProperty(header, 'offsetWidth', { value: 100, configurable: true });

      // Start resize
      fireEvent.mouseDown(handle, { clientX: 100 });

      // Move mouse to make column smaller than minWidth
      fireEvent.mouseMove(document, { clientX: 20 });

      // End resize
      fireEvent.mouseUp(document, { clientX: 20 });

      // Should be clamped to minWidth
      expect(onWidthChange).toHaveBeenCalledWith('testColumn', 80);
    });

    it('uses default minWidth of 50px', () => {
      const onWidthChange = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader
                {...defaultProps}
                onWidthChange={onWidthChange}
                data-testid="test-header"
              >
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      // Mock offsetWidth
      Object.defineProperty(header, 'offsetWidth', { value: 100, configurable: true });

      // Start resize
      fireEvent.mouseDown(handle, { clientX: 100 });

      // Move mouse to make column very small
      fireEvent.mouseMove(document, { clientX: 10 });

      // End resize
      fireEvent.mouseUp(document, { clientX: 10 });

      // Should be clamped to default minWidth of 50
      expect(onWidthChange).toHaveBeenCalledWith('testColumn', 50);
    });

    it('sets cursor to col-resize during drag', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      Object.defineProperty(header, 'offsetWidth', { value: 100, configurable: true });

      fireEvent.mouseDown(handle, { clientX: 100 });

      expect(document.body.style.cursor).toBe('col-resize');
      expect(document.body.style.userSelect).toBe('none');

      // Clean up
      fireEvent.mouseUp(document, { clientX: 100 });
    });

    it('cleans up cursor style on mouseup', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      Object.defineProperty(header, 'offsetWidth', { value: 100, configurable: true });

      fireEvent.mouseDown(handle, { clientX: 100 });
      fireEvent.mouseUp(document, { clientX: 150 });

      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
    });

    it('prevents default and stops propagation on mousedown', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      Object.defineProperty(header, 'offsetWidth', { value: 100, configurable: true });

      const mouseDownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: 100,
      });

      const preventDefaultSpy = vi.spyOn(mouseDownEvent, 'preventDefault');
      const stopPropagationSpy = vi.spyOn(mouseDownEvent, 'stopPropagation');

      handle.dispatchEvent(mouseDownEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();

      // Clean up
      fireEvent.mouseUp(document, { clientX: 100 });
    });
  });

  describe('Resize Handle Styling', () => {
    it('has hover styling classes', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      expect(handle).toHaveClass('cursor-col-resize');
      expect(handle).toHaveClass('hover:bg-gridiron-accent/50');
    });

    it('has position classes for right edge placement', () => {
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader {...defaultProps} data-testid="test-header">
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      expect(handle).toHaveClass('absolute');
      expect(handle).toHaveClass('top-0');
      expect(handle).toHaveClass('right-0');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing headerRef gracefully', () => {
      const onWidthChange = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader
                {...defaultProps}
                onWidthChange={onWidthChange}
                data-testid="test-header"
              >
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');

      // mouseDown without a valid ref should not crash
      fireEvent.mouseDown(handle, { clientX: 100 });

      // onWidthChange should not be called if ref is not properly initialized
      // This is an edge case that shouldn't happen in practice
    });

    it('handles multiple sequential resizes', () => {
      const onWidthChange = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader
                {...defaultProps}
                onWidthChange={onWidthChange}
                data-testid="test-header"
              >
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      Object.defineProperty(header, 'offsetWidth', { value: 100, configurable: true });

      // First resize
      fireEvent.mouseDown(handle, { clientX: 100 });
      fireEvent.mouseUp(document, { clientX: 150 });

      expect(onWidthChange).toHaveBeenCalledWith('testColumn', 150);

      // Update mock width for second resize
      Object.defineProperty(header, 'offsetWidth', { value: 150, configurable: true });

      // Second resize
      fireEvent.mouseDown(handle, { clientX: 150 });
      fireEvent.mouseUp(document, { clientX: 200 });

      expect(onWidthChange).toHaveBeenCalledWith('testColumn', 200);
      expect(onWidthChange).toHaveBeenCalledTimes(2);
    });

    it('increases column width when dragging right', () => {
      const onWidthChange = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader
                {...defaultProps}
                onWidthChange={onWidthChange}
                data-testid="test-header"
              >
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      Object.defineProperty(header, 'offsetWidth', { value: 100, configurable: true });

      fireEvent.mouseDown(handle, { clientX: 100 });
      fireEvent.mouseUp(document, { clientX: 200 });

      // Should increase: 100 + (200 - 100) = 200
      expect(onWidthChange).toHaveBeenCalledWith('testColumn', 200);
    });

    it('decreases column width when dragging left', () => {
      const onWidthChange = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <ResizableColumnHeader
                {...defaultProps}
                onWidthChange={onWidthChange}
                data-testid="test-header"
              >
                Test Header
              </ResizableColumnHeader>
            </tr>
          </thead>
        </table>
      );

      const handle = screen.getByTestId('test-header-resize-handle');
      const header = screen.getByTestId('test-header');

      Object.defineProperty(header, 'offsetWidth', { value: 150, configurable: true });

      fireEvent.mouseDown(handle, { clientX: 100 });
      fireEvent.mouseUp(document, { clientX: 50 });

      // Should decrease: 150 + (50 - 100) = 100
      expect(onWidthChange).toHaveBeenCalledWith('testColumn', 100);
    });
  });
});
