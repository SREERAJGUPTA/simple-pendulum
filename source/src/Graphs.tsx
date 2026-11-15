import { useId } from 'react';

/** A snapshot of the authoritative model, in SI units (theta in radians). */
export type Sample = {
  time: number;
  theta: number;
  omega: number;
  kinetic: number;
  potential: number;
  mechanical: number;
  heat: number;
};

type EnergyGraphProps = {
  samples: Sample[];
  mode?: 'energy' | 'angle';
  currentTime?: number;
};

type GravityRecord = { length: number; period: number; id?: string };
type GravityFit = {
  slope: number;
  intercept: number;
  rSquared: number;
  gravity: number;
};

type GravityGraphProps = {
  records: GravityRecord[];
  fit: GravityFit | null;
};

const WIDTH = 680;
const HEIGHT = 252;
const BOX = { left: 58, right: 20, top: 23, bottom: 42 };
const PLOT_W = WIDTH - BOX.left - BOX.right;
const PLOT_H = HEIGHT - BOX.top - BOX.bottom;
const COLORS = {
  kinetic: '#ce6b4e',
  potential: '#48a39d',
  mechanical: '#c3a05a',
  heat: '#8a939d',
  angle: '#48a39d',
};

function niceUpper(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const fraction = value / magnitude;
  const step = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return step * magnitude;
}

function tickLabel(value: number): string {
  if (Math.abs(value) < 1e-10) return '0';
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, '');
  if (Math.abs(value) >= 1) return value.toFixed(2).replace(/\.?0+$/, '');
  return value.toFixed(3).replace(/\.?0+$/, '');
}

function energyLabel(value: number): string {
  return `${Math.abs(value) < 0.0005 ? '0.000' : value.toFixed(3)} J`;
}

function linePath<T>(items: T[], x: (item: T) => number, y: (item: T) => number): string {
  return items.map((item, i) => `${i === 0 ? 'M' : 'L'}${x(item).toFixed(2)},${y(item).toFixed(2)}`).join(' ');
}

/** No curve fitting or decorative smoothing: every plotted point is a model sample. */
export function EnergyGraph({ samples, mode = 'energy', currentTime }: EnergyGraphProps) {
  const uniqueId = useId().replace(/:/g, '');
  const titleId = `energy-title-${uniqueId}`;
  const descId = `energy-desc-${uniqueId}`;
  const clipId = `energy-clip-${uniqueId}`;
  const clean = samples.filter((sample) => Object.values(sample).every(Number.isFinite));
  const last = clean[clean.length - 1];
  const now = Number.isFinite(currentTime) ? Math.max(0, currentTime!) : Math.max(0, last?.time ?? 0);
  const end = Math.max(12, now);
  const start = end - 12;
  const firstVisible = clean.findIndex((sample) => sample.time >= start);
  const visible = firstVisible < 0 ? [] : clean.slice(Math.max(0, firstVisible - 1)).filter((sample) => sample.time <= end + 0.00001);
  const isAngle = mode === 'angle';
  const maxValue = isAngle
    ? niceUpper(Math.max(5, ...visible.map((sample) => Math.abs(sample.theta * 180 / Math.PI))) * 1.08)
    : niceUpper(Math.max(0.001, ...visible.flatMap((sample) => [sample.kinetic, sample.potential, sample.mechanical, sample.heat])) * 1.08);
  const minValue = isAngle ? -maxValue : 0;
  const x = (time: number) => BOX.left + (time - start) / 12 * PLOT_W;
  const y = (value: number) => BOX.top + (maxValue - value) / (maxValue - minValue) * PLOT_H;
  const yTicks = Array.from({ length: 5 }, (_, index) => minValue + index / 4 * (maxValue - minValue));
  const xTicks = Array.from({ length: 5 }, (_, index) => start + index * 3);
  const traces: { key: 'kinetic' | 'potential' | 'mechanical' | 'heat'; title: string; dashed?: boolean }[] = [
    { key: 'kinetic', title: 'Kinetic' },
    { key: 'potential', title: 'Potential' },
    { key: 'mechanical', title: 'Mechanical', dashed: true },
    { key: 'heat', title: 'Dissipated', dashed: true },
  ];
  const description = last
    ? isAngle
      ? `Angle from the downward vertical against simulated time. Current angle ${(last.theta * 180 / Math.PI).toFixed(1)} degrees at ${last.time.toFixed(2)} seconds. The horizontal axis shows ${start.toFixed(1)} to ${end.toFixed(1)} seconds.`
      : `Energy against simulated time. At ${last.time.toFixed(2)} seconds: kinetic energy ${energyLabel(last.kinetic)}, potential energy ${energyLabel(last.potential)}, mechanical energy ${energyLabel(last.mechanical)}, and cumulative dissipated energy ${energyLabel(last.heat)}. Potential energy is zero at the lowest position.`
    : 'Start the pendulum to collect a trace. The horizontal axis uses simulated seconds, so changing playback speed does not change the measurement.';

  return (
    <figure className="chart energy-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby={`${titleId} ${descId}`} preserveAspectRatio="xMidYMid meet">
        <title id={titleId}>{isAngle ? 'Angle through time' : 'Energy through time'}</title>
        <desc id={descId}>{description}</desc>
        <defs><clipPath id={clipId}><rect x={BOX.left} y={BOX.top} width={PLOT_W} height={PLOT_H} /></clipPath></defs>
        {yTicks.map((value, index) => (
          <g key={`y-${index}`}>
            <line x1={BOX.left} x2={WIDTH - BOX.right} y1={y(value)} y2={y(value)} className={Math.abs(value) < 1e-10 ? 'chart-grid chart-zero' : 'chart-grid'} stroke="currentColor" opacity={Math.abs(value) < 1e-10 ? 0.22 : 0.1} />
            <text x={BOX.left - 12} y={y(value) + 4} textAnchor="end" className="chart-tick" fill="currentColor" fontSize="11">{tickLabel(value)}</text>
          </g>
        ))}
        {xTicks.map((value, index) => (
          <g key={`x-${index}`}>
            <line x1={x(value)} x2={x(value)} y1={BOX.top} y2={HEIGHT - BOX.bottom} className="chart-grid" stroke="currentColor" opacity="0.06" />
            <text x={x(value)} y={HEIGHT - 22} textAnchor="middle" className="chart-tick" fill="currentColor" fontSize="11">{value.toFixed(start > 0 ? 1 : 0)}</text>
          </g>
        ))}
        <text x={BOX.left} y="12" className="chart-axis-title" fill="currentColor" fontSize="10.5">{isAngle ? 'ANGLE (°)' : 'ENERGY (J)'}</text>
        <text x={WIDTH - BOX.right} y={HEIGHT - 4} textAnchor="end" className="chart-axis-title" fill="currentColor" fontSize="10.5">SIMULATED TIME (s)</text>
        <g clipPath={`url(#${clipId})`} fill="none" strokeLinejoin="round" strokeLinecap="round">
          {isAngle ? (
            <path d={linePath(visible, (sample) => x(sample.time), (sample) => y(sample.theta * 180 / Math.PI))} stroke={COLORS.angle} strokeWidth="2.4" />
          ) : traces.map(({ key, dashed }) => (
            <path key={key} d={linePath(visible, (sample) => x(sample.time), (sample) => y(sample[key]))} stroke={COLORS[key]} strokeWidth={key === 'mechanical' || key === 'heat' ? 1.6 : 2.4} strokeDasharray={dashed ? key === 'heat' ? '3 5' : '7 5' : undefined} />
          ))}
          {last && last.time >= start && last.time <= end && (
            <>
              <line x1={x(last.time)} x2={x(last.time)} y1={BOX.top} y2={HEIGHT - BOX.bottom} stroke="currentColor" strokeWidth="1" opacity="0.12" strokeDasharray="3 4" />
              {isAngle
                ? <circle cx={x(last.time)} cy={y(last.theta * 180 / Math.PI)} r="3.4" fill={COLORS.angle} stroke="none" />
                : traces.slice(0, 2).map(({ key }) => <circle key={key} cx={x(last.time)} cy={y(last[key])} r="3.2" fill={COLORS[key]} stroke="none" />)}
            </>
          )}
        </g>
        {!visible.length && <text x={WIDTH / 2} y={BOX.top + PLOT_H / 2} textAnchor="middle" fill="currentColor" opacity="0.55" fontSize="13">Your next swing starts the story.</text>}
      </svg>
      <figcaption>
        <div className="chart-legend">
          {isAngle ? (
            <span><i style={{ background: COLORS.angle }} aria-hidden="true" /> Angle <strong>{last ? `${(last.theta * 180 / Math.PI).toFixed(1)}°` : '—'}</strong></span>
          ) : traces.map(({ key, title, dashed }) => (
            <span key={key}><i className={dashed ? 'legend-dashed' : undefined} style={{ background: COLORS[key], color: COLORS[key] }} aria-hidden="true" /> {title} <strong>{last ? energyLabel(last[key]) : '—'}</strong></span>
          ))}
        </div>
        <p className="chart-caption">{isAngle ? 'One full cycle returns to the same angle and direction.' : 'Mechanical = kinetic + potential. Dissipated = energy transferred to the surroundings.'} <span>Window: 12 simulated seconds.</span></p>
      </figcaption>
    </figure>
  );
}

export function GravityGraph({ records, fit }: GravityGraphProps) {
  const uniqueId = useId().replace(/:/g, '');
  const titleId = `gravity-title-${uniqueId}`;
  const descId = `gravity-desc-${uniqueId}`;
  const clipId = `gravity-clip-${uniqueId}`;
  const clean = records.filter((record) => Number.isFinite(record.length) && Number.isFinite(record.period) && record.length > 0 && record.period > 0);
  const safeFit = fit && Object.values(fit).every(Number.isFinite) && fit.slope > 0 ? fit : null;
  const distinct = new Set(clean.map((record) => record.length.toFixed(6))).size;
  const xMax = clean.length ? niceUpper(Math.max(...clean.map((record) => record.length)) * 1.12) : 2.5;
  const yMax = clean.length ? niceUpper(Math.max(...clean.map((record) => record.period ** 2), safeFit ? Math.max(0, safeFit.intercept + safeFit.slope * xMax) : 0) * 1.1) : 12;
  const x = (length: number) => BOX.left + length / xMax * PLOT_W;
  const y = (periodSquared: number) => BOX.top + (1 - periodSquared / yMax) * PLOT_H;
  const description = clean.length
    ? `${clean.length} measured trials at ${distinct} distinct lengths. ${safeFit ? `The fitted slope is ${safeFit.slope.toFixed(3)} seconds squared per metre; the inferred gravity is ${safeFit.gravity.toFixed(3)} metres per second squared. R squared is ${safeFit.rSquared.toFixed(4)}.` : 'Collect at least three distinct lengths under the same small-angle, undamped conditions to fit a line.'}`
    : 'No observations yet. Record trials at three or more different lengths while keeping gravity, small release angle, and zero damping unchanged.';

  return (
    <figure className="chart gravity-chart">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby={`${titleId} ${descId}`} preserveAspectRatio="xMidYMid meet">
        <title id={titleId}>Period squared against pendulum length</title>
        <desc id={descId}>{description}</desc>
        <defs><clipPath id={clipId}><rect x={BOX.left} y={BOX.top} width={PLOT_W} height={PLOT_H} /></clipPath></defs>
        {Array.from({ length: 5 }, (_, index) => (
          <g key={index}>
            <line x1={BOX.left} x2={WIDTH - BOX.right} y1={y(index * yMax / 4)} y2={y(index * yMax / 4)} stroke="currentColor" opacity={index === 0 ? 0.2 : 0.1} className="chart-grid" />
            <text x={BOX.left - 12} y={y(index * yMax / 4) + 4} textAnchor="end" fill="currentColor" fontSize="11" className="chart-tick">{tickLabel(index * yMax / 4)}</text>
            <line x1={x(index * xMax / 4)} x2={x(index * xMax / 4)} y1={BOX.top} y2={HEIGHT - BOX.bottom} stroke="currentColor" opacity="0.06" className="chart-grid" />
            <text x={x(index * xMax / 4)} y={HEIGHT - 22} textAnchor="middle" fill="currentColor" fontSize="11" className="chart-tick">{tickLabel(index * xMax / 4)}</text>
          </g>
        ))}
        <text x={BOX.left} y="12" fill="currentColor" fontSize="10.5" className="chart-axis-title">PERIOD², T² (s²)</text>
        <text x={WIDTH - BOX.right} y={HEIGHT - 4} textAnchor="end" fill="currentColor" fontSize="10.5" className="chart-axis-title">LENGTH, L (m)</text>
        <g clipPath={`url(#${clipId})`}>
          {safeFit && <line x1={x(0)} y1={y(safeFit.intercept)} x2={x(xMax)} y2={y(safeFit.intercept + safeFit.slope * xMax)} stroke={COLORS.mechanical} strokeWidth="2" strokeDasharray="7 5" />}
          {clean.map((record, index) => (
            <g key={record.id ?? index}>
              <circle cx={x(record.length)} cy={y(record.period ** 2)} r="7" fill={COLORS.potential} opacity="0.15" />
              <circle cx={x(record.length)} cy={y(record.period ** 2)} r="4" fill={COLORS.potential} stroke="currentColor" strokeWidth="0.6">
                <title>{`Trial ${index + 1}: L = ${record.length.toFixed(2)} m, T = ${record.period.toFixed(3)} s, T² = ${(record.period ** 2).toFixed(3)} s²`}</title>
              </circle>
            </g>
          ))}
        </g>
        {!clean.length && (
          <g fill="currentColor" textAnchor="middle">
            <text x={WIDTH / 2} y="113" opacity="0.7" fontSize="15">Every observation adds a point.</text>
            <text x={WIDTH / 2} y="139" opacity="0.5" fontSize="11.5">Try 0.50 m, 1.00 m, and 1.50 m.</text>
          </g>
        )}
      </svg>
      <figcaption>
        <div className="chart-legend">
          <span><i style={{ background: COLORS.potential }} aria-hidden="true" /> Measured trials <strong>{clean.length}</strong></span>
          {safeFit && <span><i className="legend-dashed" style={{ background: COLORS.mechanical, color: COLORS.mechanical }} aria-hidden="true" /> Best-fit line <strong>R² = {safeFit.rSquared.toFixed(4)}</strong></span>}
        </div>
        <p className="chart-caption">{safeFit
          ? <>Slope = {safeFit.slope.toFixed(3)} s²/m. Since T² ≈ (4π²/g)L, g ≈ 4π² ÷ slope.</>
          : <>Use at least three distinct lengths with the same gravity, a small release angle, and no damping. {distinct > 0 && `${distinct} of 3 lengths collected.`}</>}</p>
      </figcaption>
    </figure>
  );
}
