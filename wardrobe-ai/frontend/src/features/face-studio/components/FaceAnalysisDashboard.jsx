'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Palette, Scissors, ScanFace, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaceChartTooltip } from '@/features/face-studio/components/FaceChartTooltip';
import {
  BEARD_ANALYSIS,
  FACE_SHAPE_SCORES,
  HAIR_ANALYSIS,
  PRIMARY_BEARD_TYPE,
  PRIMARY_FACE_SHAPE,
  PRIMARY_SKIN_TONE,
  SKIN_TONE_SCORES,
} from '@/features/face-studio/constants/faceAnalysisMockData';

const MAGENTA = '#e91e8c';
const VIOLET = '#7c3aed';
const AXIS_TICK = { fill: '#cbd5e1', fontSize: 11, fontWeight: 500 };
const GRID_STROKE = 'rgba(255, 255, 255, 0.12)';

function AnalysisStatRing({ value, label, sublabel, className }) {
  const clamped = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2 text-center', className)}>
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden>
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={MAGENTA}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold text-white">{clamped}%</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-white">{sublabel}</p>
      </div>
    </div>
  );
}

function TraitProgressBar({ label, value, highlight }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={cn('text-slate-300', highlight && 'font-semibold text-magenta')}>{label}</span>
        <span className="font-mono text-slate-300">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            highlight ? 'bg-gradient-to-r from-magenta to-violet' : 'bg-white/25',
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/**
 * @param {import('@/features/face-studio/utils/runBiometricAnalysis').BiometricAnalysisResult | null | undefined} analysis
 */
export function FaceAnalysisDashboard({ className, embedded = false, analysis = null }) {
  const faceShape = analysis?.faceShape ?? PRIMARY_FACE_SHAPE;
  const skinTone = analysis?.skinTone ?? PRIMARY_SKIN_TONE;
  const beardMatch = analysis?.beardMatch ?? PRIMARY_BEARD_TYPE;

  const radarData = useMemo(
    () =>
      (analysis?.faceShapeScores ?? FACE_SHAPE_SCORES).map((item) => ({
        subject: item.shape,
        score: item.score,
        fullMark: 100,
      })),
    [analysis?.faceShapeScores],
  );

  const skinToneChartData = analysis?.skinToneScores ?? SKIN_TONE_SCORES;
  const hairAnalysis = analysis?.hairAnalysis ?? HAIR_ANALYSIS;
  const beardScores = analysis?.beardScores ?? BEARD_ANALYSIS;

  return (
    <section
      className={cn(
        embedded
          ? 'flex flex-1 flex-col gap-4 overflow-y-auto pr-1'
          : 'animate-fade-in-view space-y-6 rounded-2xl border border-magenta/20 bg-[#07030d] p-6 shadow-[0_0_60px_rgba(233,30,140,0.12)]',
        className,
      )}
    >
      {!embedded && (
        <header className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-magenta">
              Face Analysis Engine
            </p>
            <h2 className="font-playfair text-2xl font-semibold text-white">Biometric Intelligence Report</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-magenta/30 bg-magenta/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-magenta">
              Shape · {faceShape}
            </span>
            <span className="rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-violet">
              Tone · {skinTone}
            </span>
          </div>
        </header>
      )}

      {embedded && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-magenta/30 bg-magenta/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-magenta">
            Shape · {faceShape}
            {analysis?.faceShapeMethod === 'landmarks' ? ' · AI' : analysis ? ' · Est.' : ''}
          </span>
          <span className="rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-violet">
            Tone · {skinTone}
            {analysis?.skinToneRgb
              ? ` · rgb(${analysis.skinToneRgb.r},${analysis.skinToneRgb.g},${analysis.skinToneRgb.b})`
              : ''}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#150d22]/80 p-4">
          <div className="mb-4 flex items-center gap-2">
            <ScanFace className="h-4 w-4 text-magenta" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                Morphology Scan
              </p>
              <h3 className="font-playfair text-lg font-semibold text-white">Face Shape Radar</h3>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke={GRID_STROKE} />
                <PolarAngleAxis dataKey="subject" tick={AXIS_TICK} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Match"
                  dataKey="score"
                  stroke={MAGENTA}
                  fill={MAGENTA}
                  fillOpacity={0.35}
                  strokeWidth={2}
                />
                <Tooltip content={<FaceChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#150d22]/80 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-4 w-4 text-violet" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                Dermis Mapping
              </p>
              <h3 className="font-playfair text-lg font-semibold text-white">Skin Tone Confidence</h3>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skinToneChartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="skinToneBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={VIOLET} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={MAGENTA} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis type="number" domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="tone"
                  width={72}
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<FaceChartTooltip />} cursor={{ fill: 'rgba(233,30,140,0.08)' }} />
                <Bar
                  dataKey="score"
                  fill="url(#skinToneBar)"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#150d22]/80 p-5">
          <div className="mb-5 flex items-center gap-2">
            <Scissors className="h-4 w-4 text-amber-400" />
            <h3 className="font-playfair text-lg font-semibold text-white">Hair Analysis</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <AnalysisStatRing
              value={hairAnalysis.length.confidence}
              label="Length"
              sublabel={hairAnalysis.length.label}
            />
            <AnalysisStatRing
              value={hairAnalysis.color.confidence}
              label="Color"
              sublabel={hairAnalysis.color.label}
            />
            <AnalysisStatRing
              value={hairAnalysis.style.confidence}
              label="Style"
              sublabel={hairAnalysis.style.label}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#150d22]/80 p-5">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-magenta" />
            <h3 className="font-playfair text-lg font-semibold text-white">Beard Analysis</h3>
          </div>
          <div className="space-y-4">
            {beardScores.map((item) => (
              <TraitProgressBar
                key={item.type}
                label={item.type}
                value={item.score}
                highlight={item.type === beardMatch}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
