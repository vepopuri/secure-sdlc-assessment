import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import { frameworks } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { scoreFramework, topGaps } from '../utils/scoring';
import { applyScope, includedControlIdsFor } from '../utils/scope';
import { aggregateTopGaps, buildExecutiveSummary, buildReportText, buildRoadmap } from '../utils/report';
import type { DetailedObservationGroup, RoadmapPhase } from '../utils/report';
import { MaturityBarChart } from '../components/MaturityBarChart';
import { MATURITY_LABELS, observationId } from '../types';
import type { Framework } from '../types';

const ROADMAP_PHASES: RoadmapPhase[] = ['Now (0 to 30 days)', 'Next (31 to 90 days)', 'Later (90+ days)'];

export function ReportsPage() {
  const { observations, evidence, scope, loading } = useAppData();
  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const [story, setStory] = useState('');
  const [peerInputs, setPeerInputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  if (loading) return null;

  const scopedFrameworks = frameworks.map((f) => applyScope(f, includedControlIdsFor(scope, f.id)));
  const rawFramework = frameworks[frameworkIndex];
  const framework = scopedFrameworks[frameworkIndex];
  const score = scoreFramework(framework, observations);
  const gaps = topGaps(framework, observations);

  const frameworkScores = scopedFrameworks.map((f) => scoreFramework(f, observations));
  const aggregatedGaps = aggregateTopGaps(scopedFrameworks, observations, 10);
  const executiveSummary = buildExecutiveSummary({ frameworkScores, gaps: aggregatedGaps, story });
  const roadmap = buildRoadmap(aggregatedGaps);

  const peerRows = frameworkScores.map((fs) => {
    const raw = peerInputs[fs.frameworkId];
    const parsed = raw !== undefined && raw.trim() !== '' ? Number(raw) : null;
    const peerAverage = parsed !== null && !Number.isNaN(parsed) ? Math.min(3, Math.max(0, parsed)) : null;
    return { frameworkShortName: fs.shortName, yourAverage: fs.averageRating, peerAverage };
  });

  function buildDetailedGroup(fw: Framework): DetailedObservationGroup {
    const entries = fw.functions.flatMap((fn) =>
      fn.controls.map((control) => {
        const obs = observations.find((o) => o.id === observationId(fw.id, control.id));
        const ratingLabel =
          obs?.rating !== null && obs?.rating !== undefined
            ? `${obs.rating} / 3 (${MATURITY_LABELS[obs.rating]})`
            : 'Not yet rated';
        const evidenceTitles = (obs?.evidenceLinks ?? [])
          .map((link) => evidence.find((e) => e.id === link.evidenceId)?.title)
          .filter((t): t is string => Boolean(t));
        return {
          code: control.code,
          name: control.name,
          ratingLabel,
          question: control.question,
          notes: obs?.notes ?? '',
          evidenceTitles,
        };
      }),
    );
    return { frameworkShortName: fw.shortName, entries };
  }

  async function handleCopyReport() {
    const text = buildReportText({
      title: 'Secure SDLC Assessment Report',
      executiveSummary,
      peerRows,
      gaps: aggregatedGaps,
      roadmap,
      detailedGroups: scopedFrameworks.map(buildDetailedGroup),
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard access can be denied by the browser; nothing to recover from here.
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Engagement report across every in scope framework, plus a per-framework detail view below.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={1} sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Executive summary
          </Typography>
          <Stack direction="row" spacing={1} className="no-print">
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopyReport}>
              Copy report as text
            </Button>
            <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
              Print / save as PDF
            </Button>
          </Stack>
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={2}
          className="no-print"
          label="Add context for the executive summary (optional)"
          placeholder="e.g. Frame this for the audit committee ahead of next quarter's board review."
          value={story}
          onChange={(e) => setStory(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2">{executiveSummary}</Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Maturity score vs. peer benchmark
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Peer benchmark values are optional and entered by you (e.g. from a prior industry survey); they are not
          sourced from real peer data by this app.
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Framework</TableCell>
                <TableCell align="right">Your average</TableCell>
                <TableCell align="right" className="no-print">
                  Peer benchmark
                </TableCell>
                <TableCell align="right">Difference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {peerRows.map((row, i) => (
                <TableRow key={row.frameworkShortName}>
                  <TableCell>{row.frameworkShortName}</TableCell>
                  <TableCell align="right">{row.yourAverage.toFixed(1)} / 3</TableCell>
                  <TableCell align="right" className="no-print">
                    <TextField
                      size="small"
                      type="number"
                      slotProps={{ htmlInput: { min: 0, max: 3, step: 0.1 } }}
                      sx={{ width: 90 }}
                      placeholder="0 to 3"
                      value={peerInputs[frameworks[i].id] ?? ''}
                      onChange={(e) => setPeerInputs((prev) => ({ ...prev, [frameworks[i].id]: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.peerAverage === null ? (
                      <Chip size="small" label="Not set" />
                    ) : (
                      <Chip
                        size="small"
                        color={row.yourAverage >= row.peerAverage ? 'success' : 'warning'}
                        label={`${row.yourAverage >= row.peerAverage ? '+' : ''}${(row.yourAverage - row.peerAverage).toFixed(1)}`}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Key gaps
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The most significant gaps across every in scope framework, worst first.
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Framework</TableCell>
                <TableCell>Control</TableCell>
                <TableCell align="right">Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aggregatedGaps.map((gap) => (
                <TableRow key={`${gap.frameworkId}:${gap.controlId}`}>
                  <TableCell>{gap.frameworkShortName}</TableCell>
                  <TableCell>
                    {gap.controlCode}: {gap.controlName}
                  </TableCell>
                  <TableCell align="right">
                    {gap.rating === null ? (
                      <Chip size="small" label="Unrated" />
                    ) : (
                      <Chip size="small" color="warning" label={gap.rating} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {aggregatedGaps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No gaps. Every in scope control is rated above the threshold.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Key recommendations and roadmap
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gaps grouped into a simple remediation timeline, worst first within each phase.
        </Typography>
        <Stack spacing={2}>
          {ROADMAP_PHASES.map((phase) => {
            const items = roadmap.filter((item) => item.phase === phase);
            if (items.length === 0) return null;
            return (
              <Box key={phase}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {phase}
                </Typography>
                <Stack component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {items.map((item) => (
                    <Typography key={`${item.frameworkShortName}:${item.controlCode}`} component="li" variant="body2">
                      {item.frameworkShortName} {item.recommendation}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            );
          })}
          {roadmap.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No open items. Nothing to schedule.
            </Typography>
          )}
        </Stack>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Framework detail
      </Typography>
      <Tabs
        value={frameworkIndex}
        onChange={(_e, v) => setFrameworkIndex(v)}
        className="no-print"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {frameworks.map((f) => (
          <Tab key={f.id} label={`${f.shortName} ${f.version}`} sx={{ textTransform: 'none' }} />
        ))}
      </Tabs>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Maturity by function ({rawFramework.shortName})
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {score.ratedCount} / {score.totalCount} controls rated · average {score.averageRating.toFixed(1)} / 3
        </Typography>
        <MaturityBarChart
          ariaLabel={`Average maturity by function for ${framework.shortName}`}
          data={score.functionScores.map((fs) => ({
            label: `${fs.code} · ${fs.name}`,
            averageRating: fs.averageRating,
            ratedCount: fs.ratedCount,
            totalCount: fs.totalCount,
          }))}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Top gaps in {rawFramework.shortName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Controls that are unrated or rated ≤ 1, worst first.
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Function</TableCell>
                <TableCell>Control</TableCell>
                <TableCell align="right">Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gaps.map((gap) => (
                <TableRow key={gap.controlId}>
                  <TableCell>{gap.functionCode}</TableCell>
                  <TableCell>
                    {gap.controlCode}: {gap.controlName}
                  </TableCell>
                  <TableCell align="right">
                    {gap.rating === null ? (
                      <Chip size="small" label="Unrated" />
                    ) : (
                      <Chip size="small" color="warning" label={gap.rating} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {gaps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No gaps. Every control is rated above the threshold.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Accordion disableGutters variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Detailed observations ({rawFramework.shortName})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {buildDetailedGroup(framework).entries.map((entry) => (
              <Grid key={entry.code} size={{ xs: 12, md: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle2">
                    {entry.code}: {entry.name}
                  </Typography>
                  <Chip size="small" sx={{ mt: 0.5, mb: 1 }} label={entry.ratingLabel} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                    Question asked
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {entry.question}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                    {entry.notes || 'No notes yet.'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                    Evidence
                  </Typography>
                  {entry.evidenceTitles.length > 0 ? (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                      {entry.evidenceTitles.map((title) => (
                        <Chip key={title} size="small" variant="outlined" label={title} />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No evidence linked yet.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)}>
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Report copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
}
