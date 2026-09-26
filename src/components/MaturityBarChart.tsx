// Horizontal bar chart for "average maturity by function/category", built as a
// plain SVG component per the dataviz skill: single consistent series color
// (position + label already carry identity), recessive gridlines at 0/1/2/3,
// numeric value at the bar end, and a lightweight hover tooltip.
import { useRef, useState } from 'react';

export interface MaturityBarDatum {
  label: string;
  averageRating: number; // 0-3
  ratedCount: number;
  totalCount: number;
}

const SERIES_COLOR = '#86BC25'; // Deloitte Green — brand's primary data-series color
const GRIDLINE_COLOR = '#E6E6E6';
const BASELINE_COLOR = '#BDBDBD';
const TEXT_PRIMARY = '#282728';
const TEXT_MUTED = '#555555';

const MAX_VALUE = 3;
const BAR_THICKNESS = 18;
const ROW_HEIGHT = 34;
const LABEL_COL_WIDTH = 132;
const VALUE_COL_WIDTH = 34;
const CHART_WIDTH = 560;
const TOP_PADDING = 8;
const BOTTOM_PADDING = 24;

function barPath(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, width, height / 2);
  if (width <= 0) {
    return `M${x},${y} L${x},${y + height} Z`;
  }
  return [
    `M${x},${y}`,
    `L${x + width - r},${y}`,
    `A${r},${r} 0 0 1 ${x + width},${y + r}`,
    `L${x + width},${y + height - r}`,
    `A${r},${r} 0 0 1 ${x + width - r},${y + height}`,
    `L${x},${y + height}`,
    'Z',
  ].join(' ');
}

export function MaturityBarChart({ data, ariaLabel }: { data: MaturityBarDatum[]; ariaLabel: string }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const plotWidth = CHART_WIDTH - LABEL_COL_WIDTH - VALUE_COL_WIDTH;
  const height = TOP_PADDING + data.length * ROW_HEIGHT + BOTTOM_PADDING;

  const handlePointerMove = (index: number) => (event: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverIndex(index);
    setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={ariaLabel}
        style={{ display: 'block', fontFamily: '"Open Sans", system-ui, -apple-system, "Segoe UI", sans-serif' }}
      >
        {/* Gridlines at 0/1/2/3 */}
        {[0, 1, 2, 3].map((tick) => {
          const x = LABEL_COL_WIDTH + (tick / MAX_VALUE) * plotWidth;
          return (
            <g key={tick}>
              <line
                x1={x}
                y1={TOP_PADDING}
                x2={x}
                y2={TOP_PADDING + data.length * ROW_HEIGHT}
                stroke={tick === 0 ? BASELINE_COLOR : GRIDLINE_COLOR}
                strokeWidth={1}
              />
              <text
                x={x}
                y={TOP_PADDING + data.length * ROW_HEIGHT + 16}
                fontSize={11}
                fill={TEXT_MUTED}
                textAnchor="middle"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {data.map((d, index) => {
          const rowY = TOP_PADDING + index * ROW_HEIGHT;
          const barY = rowY + (ROW_HEIGHT - BAR_THICKNESS) / 2;
          const barWidth = (Math.min(d.averageRating, MAX_VALUE) / MAX_VALUE) * plotWidth;
          const isHovered = hoverIndex === index;
          return (
            <g key={d.label}>
              <text
                x={LABEL_COL_WIDTH - 10}
                y={rowY + ROW_HEIGHT / 2}
                fontSize={12}
                fill={TEXT_PRIMARY}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {d.label}
              </text>
              <path
                d={barPath(LABEL_COL_WIDTH, barY, barWidth, BAR_THICKNESS, 4)}
                fill={SERIES_COLOR}
                opacity={isHovered ? 0.85 : 1}
              />
              <text
                x={LABEL_COL_WIDTH + barWidth + 8}
                y={rowY + ROW_HEIGHT / 2}
                fontSize={12}
                fill={TEXT_PRIMARY}
                dominantBaseline="middle"
              >
                {d.averageRating.toFixed(1)}
              </text>
              {/* Hit target: full row band, bigger than the painted bar */}
              <rect
                x={LABEL_COL_WIDTH}
                y={rowY}
                width={plotWidth + VALUE_COL_WIDTH}
                height={ROW_HEIGHT}
                fill="transparent"
                onPointerEnter={handlePointerMove(index)}
                onPointerMove={handlePointerMove(index)}
                onPointerLeave={() => setHoverIndex(null)}
                onFocus={() => setHoverIndex(index)}
                onBlur={() => setHoverIndex(null)}
                tabIndex={0}
                role="img"
                aria-label={`${d.label}: ${d.ratedCount} of ${d.totalCount} controls rated, average ${d.averageRating.toFixed(1)} of 3`}
              />
            </g>
          );
        })}
      </svg>
      {hoverIndex !== null && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltipPos.x + 12, CHART_WIDTH - 160),
            top: Math.max(tooltipPos.y - 36, 0),
            background: '#282728',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          {data[hoverIndex].ratedCount} of {data[hoverIndex].totalCount} controls rated
        </div>
      )}
    </div>
  );
}
