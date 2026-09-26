// A visual "top ribbon" walking the reviewer through the engagement
// lifecycle. Each stage's done/current/upcoming state is derived from real
// app data (scope, evidence, observations) — never fabricated — so the
// ribbon reflects genuine progress, not just decoration.
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import GroupsIcon from '@mui/icons-material/Groups';
import ArticleIcon from '@mui/icons-material/Article';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VerifiedIcon from '@mui/icons-material/Verified';
import SummarizeIcon from '@mui/icons-material/Summarize';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { frameworks } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { applyScope, includedControlIdsFor } from '../utils/scope';
import { scoreFramework } from '../utils/scoring';

interface WorkflowStep {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: WorkflowStep[] = [
  {
    key: 'kickoff',
    label: 'Kickoff',
    description: 'Confirm the review level and engagement details.',
    icon: HandshakeIcon,
  },
  {
    key: 'scope',
    label: 'Scope Finalization',
    description: 'Finalize which controls are in scope for this engagement.',
    icon: FactCheckIcon,
  },
  {
    key: 'collection',
    label: 'Document Collection & Meeting Scheduling',
    description: 'Gather supporting documents and schedule stakeholder meetings.',
    icon: GroupsIcon,
  },
  {
    key: 'docreview',
    label: 'Documentation Review',
    description: "Review submitted documentation against each control.",
    icon: ArticleIcon,
  },
  {
    key: 'interview',
    label: 'Interviews',
    description: 'Conduct interviews and capture notes as evidence.',
    icon: RecordVoiceOverIcon,
  },
  {
    key: 'validate',
    label: 'Process Data & Validate',
    description: 'Rate each control and validate findings against the framework.',
    icon: VerifiedIcon,
  },
  {
    key: 'report',
    label: 'Prepare Report',
    description: 'Compile findings into the assessment report.',
    icon: SummarizeIcon,
  },
  {
    key: 'finalize',
    label: 'Review & Finalize',
    description: 'Review the report with stakeholders and close out the engagement.',
    icon: EmojiEventsIcon,
  },
];

const CIRCLE = 44;
const DONE_COLOR = '#86BC25';
const CURRENT_GLOW = 'rgba(134, 188, 37, 0.18)';

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
      <Box sx={{ display: 'flex', overflowX: 'auto', pb: 0.5 }}>
        {STEPS.map((step, i) => {
          const isDone = doneMap[step.key];
          const isCurrent = i === currentIndex;
          const Icon = step.icon;
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
                  <Icon sx={{ color: isDone ? '#FFFFFF' : isCurrent ? '#86EB22' : 'rgba(255,255,255,0.55)', fontSize: 22 }} />
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
  );
}
