// A visual "top ribbon" walking the reviewer through the engagement
// lifecycle. Each stage's done/current/upcoming state is derived from real
// app data (scope, evidence, observations) — never fabricated — so the
// ribbon reflects genuine progress, not just decoration. The three
// people-facing stages get a small illustrated figure instead of a plain
// icon, and a faint flowchart-style backdrop (dashed connectors, floating
// shapes) runs behind the row for a more "workflow diagram" feel.
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { frameworks } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { applyScope, includedControlIdsFor } from '../utils/scope';
import { scoreFramework } from '../utils/scoring';

type PersonProp = 'handshake' | 'calendar' | 'speech' | 'checklist' | 'search' | 'shield' | 'chart' | 'trophy';

interface WorkflowStep {
  key: string;
  label: string;
  description: string;
  person: PersonProp;
}

const STEPS: WorkflowStep[] = [
  {
    key: 'kickoff',
    label: 'Kickoff',
    description: 'Confirm the review level and engagement details.',
    person: 'handshake',
  },
  {
    key: 'scope',
    label: 'Scope Finalization',
    description: 'Finalize which controls are in scope for this engagement.',
    person: 'checklist',
  },
  {
    key: 'collection',
    label: 'Document Collection & Meeting Scheduling',
    description: 'Gather supporting documents and schedule stakeholder meetings.',
    person: 'calendar',
  },
  {
    key: 'docreview',
    label: 'Documentation Review',
    description: 'Review submitted documentation against each control.',
    person: 'search',
  },
  {
    key: 'interview',
    label: 'Interviews',
    description: 'Conduct interviews and capture notes as evidence.',
    person: 'speech',
  },
  {
    key: 'validate',
    label: 'Process Data & Validate',
    description: 'Rate each control and validate findings against the framework.',
    person: 'shield',
  },
  {
    key: 'report',
    label: 'Prepare Report',
    description: 'Compile findings into the assessment report.',
    person: 'chart',
  },
  {
    key: 'finalize',
    label: 'Review & Finalize',
    description: 'Review the report with stakeholders and close out the engagement.',
    person: 'trophy',
  },
];

const CIRCLE = 44;
const DONE_COLOR = '#86BC25';
const CURRENT_GLOW = 'rgba(134, 188, 37, 0.18)';

/** A small flat-illustration person (head + body) with a task-specific prop badge — the "human" stages. */
function PersonBadge({ prop, color }: { prop: PersonProp; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden focusable="false">
      <circle cx="12" cy="7" r="4" fill={color} />
      <path d="M4 23c0-5 3.6-9 8-9s8 4 8 9" fill={color} />
      {prop === 'handshake' && (
        <g transform="translate(11,15)">
          <rect x="-6" y="0" width="16" height="7" rx="3.5" fill="#FFFFFF" />
          <path d="M-4 3.5h4l2-2 2 2h4" stroke={DONE_COLOR} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {prop === 'calendar' && (
        <g transform="translate(12,14)">
          <rect x="-6" y="-1" width="13" height="11" rx="2" fill="#FFFFFF" />
          <rect x="-6" y="-1" width="13" height="3.5" rx="2" fill="#00A3E0" />
          <path d="M-3.5 6l2 2 4-4.5" stroke={DONE_COLOR} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {prop === 'speech' && (
        <g transform="translate(12,14)">
          <path
            d="M-6-1h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H-1l-3 2.5V8h-2a2 2 0 0 1-2-2V1a2 2 0 0 1 2-2z"
            fill="#FFFFFF"
          />
          <circle cx="-3" cy="3.5" r="0.9" fill="#00A3E0" />
          <circle cx="0" cy="3.5" r="0.9" fill="#00A3E0" />
          <circle cx="3" cy="3.5" r="0.9" fill="#00A3E0" />
        </g>
      )}
      {prop === 'checklist' && (
        <g transform="translate(12,14)">
          <rect x="-6" y="-2" width="13" height="14" rx="2" fill="#FFFFFF" />
          <path d="M-4 1l1.4 1.4L0 -0.5" stroke={DONE_COLOR} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-4 5l1.4 1.4L0 3.5" stroke={DONE_COLOR} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="1.5" y="-0.6" width="4" height="1.2" fill="#00A3E0" />
          <rect x="1.5" y="3.4" width="4" height="1.2" fill="#00A3E0" />
        </g>
      )}
      {prop === 'search' && (
        <g transform="translate(12,14)">
          <rect x="-6" y="-2" width="12" height="14" rx="2" fill="#FFFFFF" />
          <rect x="-4" y="0" width="8" height="1.4" fill="#00A3E0" opacity="0.8" />
          <rect x="-4" y="3" width="8" height="1.4" fill="#00A3E0" opacity="0.8" />
          <circle cx="4.5" cy="6.5" r="3" fill="none" stroke={DONE_COLOR} strokeWidth="1.4" />
          <line x1="6.6" y1="8.6" x2="8.5" y2="10.5" stroke={DONE_COLOR} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
      {prop === 'shield' && (
        <g transform="translate(12,14)">
          <path d="M0-2l7 2.5v4c0 4-3 6.5-7 8-4-1.5-7-4-7-8v-4z" fill="#FFFFFF" />
          <path d="M-3 1.5l2 2 4-4.5" stroke={DONE_COLOR} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {prop === 'chart' && (
        <g transform="translate(12,14)">
          <rect x="-6" y="-2" width="13" height="14" rx="2" fill="#FFFFFF" />
          <rect x="-4" y="4" width="2" height="6" fill="#00A3E0" />
          <rect x="-1" y="1" width="2" height="9" fill={DONE_COLOR} />
          <rect x="2" y="-1" width="2" height="11" fill="#00A3E0" />
        </g>
      )}
      {prop === 'trophy' && (
        <g transform="translate(12,14)">
          <path d="M-3-2h6v4a3 3 0 0 1-6 0z" fill="#FFFFFF" />
          <path d="M-3-1h-2a2 2 0 0 0 2 3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
          <path d="M3-1h2a2 2 0 0 1-2 3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
          <rect x="-1" y="2" width="2" height="2.5" fill="#FFFFFF" />
          <path d="M-3 5h6l1 2.5h-8z" fill={DONE_COLOR} />
        </g>
      )}
    </svg>
  );
}

/** Faint decorative flowchart shapes behind the ribbon — connectors and nodes, never load-bearing for meaning. */
function WorkflowBackdrop() {
  const shapes: { top: string; left: string; size: number; kind: 'diamond' | 'circle'; color: string }[] = [
    { top: '5%', left: '12%', size: 10, kind: 'diamond', color: '#86EB22' },
    { top: '75%', left: '22%', size: 7, kind: 'circle', color: '#00A3E0' },
    { top: '10%', left: '38%', size: 8, kind: 'circle', color: '#FFFFFF' },
    { top: '80%', left: '55%', size: 10, kind: 'diamond', color: '#00A3E0' },
    { top: '8%', left: '68%', size: 7, kind: 'circle', color: '#86EB22' },
    { top: '78%', left: '84%', size: 9, kind: 'diamond', color: '#FFFFFF' },
  ];
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
      {shapes.map((s, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            bgcolor: s.color,
            opacity: 0.14,
            borderRadius: s.kind === 'circle' ? '50%' : 0.5,
            transform: s.kind === 'diamond' ? 'rotate(45deg)' : undefined,
          }}
        />
      ))}
    </Box>
  );
}

export function EngagementWorkflow() {
  const { scopeDocument, scope, evidence, observations } = useAppData();

  const scores = frameworks.map((f) => scoreFramework(applyScope(f, includedControlIdsFor(scope, f.id)), observations));
  const totalControls = scores.reduce((sum, s) => sum + s.totalCount, 0);
  const totalRated = scores.reduce((sum, s) => sum + s.ratedCount, 0);

  const doneMap: Record<string, boolean> = {
    kickoff: Boolean(scopeDocument?.reviewLevel),
    scope: scope.length > 0,
    collection: evidence.length > 0,
    docreview: observations.some((o) => o.notes.trim().length > 0),
    interview: evidence.some((e) => e.kind === 'interview-note'),
    validate: totalRated > 0,
    report: totalControls > 0 && totalRated === totalControls,
    finalize: false,
  };

  const currentIndex = STEPS.findIndex((s) => !doneMap[s.key]);
  const completedCount = STEPS.filter((s) => doneMap[s.key]).length;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
          Engagement workflow
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          {completedCount} of {STEPS.length} stages
        </Typography>
      </Stack>
      <Box sx={{ position: 'relative' }}>
        <WorkflowBackdrop />
        <Box sx={{ position: 'relative', display: 'flex', overflowX: 'auto', pb: 0.5 }}>
          {STEPS.map((step, i) => {
            const isDone = doneMap[step.key];
            const isCurrent = i === currentIndex;
            const iconColor = isDone ? '#FFFFFF' : isCurrent ? '#86EB22' : 'rgba(255,255,255,0.55)';
            const prevDone = i > 0 && doneMap[STEPS[i - 1].key];
            return (
              <Box key={step.key} sx={{ flex: '0 0 118px', position: 'relative', textAlign: 'center', px: 0.5 }}>
                {i > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: CIRCLE / 2,
                      left: 0,
                      width: '50%',
                      height: 2,
                      bgcolor: prevDone ? DONE_COLOR : 'rgba(255,255,255,0.2)',
                    }}
                    aria-hidden
                  />
                )}
                {i < STEPS.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: CIRCLE / 2,
                      right: 0,
                      width: '50%',
                      height: 2,
                      bgcolor: isDone ? DONE_COLOR : 'rgba(255,255,255,0.2)',
                    }}
                    aria-hidden
                  />
                )}
                <Tooltip title={step.description} arrow>
                  <Box
                    sx={{
                      width: CIRCLE,
                      height: CIRCLE,
                      borderRadius: '50%',
                      mx: 'auto',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1,
                      bgcolor: isDone ? DONE_COLOR : isCurrent ? CURRENT_GLOW : 'rgba(255,255,255,0.08)',
                      border: isCurrent ? `2px solid ${DONE_COLOR}` : '2px solid transparent',
                      boxShadow: isCurrent ? `0 0 0 6px ${CURRENT_GLOW}` : 'none',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': { transform: 'scale(1.1)' },
                    }}
                  >
                    <PersonBadge prop={step.person} color={iconColor} />
                  </Box>
                </Tooltip>
                <Typography
                  variant="caption"
                  sx={{
                    color: isCurrent ? '#FFFFFF' : isDone ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)',
                    fontWeight: isCurrent ? 700 : 400,
                    display: 'block',
                    lineHeight: 1.25,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
