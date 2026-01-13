import { useState, useRef, useCallback, type ReactNode, type MouseEvent } from 'react';

interface ResizableColumnHeaderProps {
  /** Column key identifier */
  columnKey: string;
  /** Current width in pixels (undefined = auto) */
  width?: number;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Content to render inside the header */
  children: ReactNode;
  /** Base className for the th element */
  className?: string;
  /** Callback when resize starts (before any movement) */
  onResizeStart?: () => void;
  /** Callback when width changes */
  onWidthChange: (columnKey: string, width: number) => void;
  /** Test ID for the header */
  'data-testid'?: string;
}

const DEFAULT_MIN_WIDTH = 36;

export function ResizableColumnHeader({
  columnKey,
  width,
  minWidth = DEFAULT_MIN_WIDTH,
  children,
  className = '',
  onResizeStart,
  onWidthChange,
  'data-testid': testId,
}: ResizableColumnHeaderProps) {
  const [isResizing, setIsResizing] = useState(false);
  const headerRef = useRef<HTMLTableCellElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Double-click to collapse to minimum width
  const handleDoubleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Set inline style immediately for visual feedback
    if (headerRef.current) {
      headerRef.current.style.width = `${minWidth}px`;
      headerRef.current.style.minWidth = `${minWidth}px`;
      headerRef.current.style.maxWidth = `${minWidth}px`;
    }

    // Notify parent to initialize all column widths (measures AFTER style is set)
    // Use requestAnimationFrame to ensure the style has been applied before measuring
    requestAnimationFrame(() => {
      onResizeStart?.();
      onWidthChange(columnKey, minWidth);
    });
  }, [columnKey, minWidth, onResizeStart, onWidthChange]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!headerRef.current) return;

    // Notify parent before any resize happens
    onResizeStart?.();

    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = headerRef.current.offsetWidth;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(minWidth, startWidthRef.current + delta);

      // Update width in real-time via CSS
      if (headerRef.current) {
        headerRef.current.style.width = `${newWidth}px`;
        headerRef.current.style.minWidth = `${newWidth}px`;
        headerRef.current.style.maxWidth = `${newWidth}px`;
      }
    };

    const handleMouseUp = (upEvent: globalThis.MouseEvent) => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Calculate final width and persist
      const delta = upEvent.clientX - startXRef.current;
      const newWidth = Math.max(minWidth, startWidthRef.current + delta);
      onWidthChange(columnKey, newWidth);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [columnKey, minWidth, onResizeStart, onWidthChange]);

  const style = width ? {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
  } : undefined;

  return (
    <th
      ref={headerRef}
      className={`${className} relative group overflow-hidden`}
      style={style}
      data-testid={testId}
    >
      <div className="overflow-hidden whitespace-nowrap min-w-0">
        {children}
      </div>
      {/* Resize Handle */}
      <div
        className={`
          absolute top-0 right-0 w-1 h-full cursor-col-resize
          hover:bg-gridiron-accent/50 transition-colors
          ${isResizing ? 'bg-gridiron-accent' : 'bg-transparent group-hover:bg-gridiron-border-emphasis'}
        `}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        data-testid={testId ? `${testId}-resize-handle` : undefined}
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${columnKey} column`}
      />
    </th>
  );
}

export default ResizableColumnHeader;
