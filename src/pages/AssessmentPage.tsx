import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { frameworks } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import type { Control, Evidence, MaturityRating, ObservationStatus } from '../types';
import { MATURITY_LABELS } from '../types';
import { applyScope, includedControlIdsFor } from '../utils/scope';
import { autoAssessControl } from '../utils/autoAssess';

const STATUS_ICONS: Record<ObservationStatus, React.ElementType> = {
  'not-started': RadioButtonUncheckedIcon,
  'in-progress': DonutLargeIcon,
  complete: CheckCircleIcon,
};

const STATUS_COLORS: Record<ObservationStatus, string> = {
  'not-started': '#9AA0A6',
  'in-progress': '#00A3E0',
  complete: '#86BC25',
};

const STATUS_OPTIONS: { value: ObservationStatus; label: string }[] = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'complete', label: 'Complete' },
];

export function AssessmentPage() {
  const { getObservation, upsertObservation, evidence, scope, scopeDocument } = useAppData();
  const [copied, setCopied] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [assistMessage, setAssistMessage] = useState<string | null>(null);
  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const rawFramework = frameworks[frameworkIndex];
  const framework = applyScope(rawFramework, includedControlIdsFor(scope, rawFramework.id));
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  // Reset the selected control whenever the framework tab changes (render-time
  // state adjustment, per https://react.dev/learn/you-might-not-need-an-effect).
  const [lastFrameworkId, setLastFrameworkId] = useState(rawFramework.id);
  if (rawFramework.id !== lastFrameworkId) {
    setLastFrameworkId(rawFramework.id);
    setSelectedControlId(null);
  }

  const selected = (() => {
    if (!selectedControlId) return null;
    for (const fn of framework.functions) {
      const control = fn.controls.find((c) => c.id === selectedControlId);
      if (control) return { fn, control };
    }
    return null;
  })();

  const observation = selected ? getObservation(framework.id, selected.control.id) : undefined;

  // Reset the notes draft whenever the selected observation changes.
  const [notesDraft, setNotesDraft] = useState(observation?.notes ?? '');
  const [lastObservationKey, setLastObservationKey] = useState(observation?.id ?? null);
  if ((observation?.id ?? null) !== lastObservationKey) {
    setLastObservationKey(observation?.id ?? null);
    setNotesDraft(observation?.notes ?? '');
  }

  function selectControl(control: Control) {
    setSelectedControlId(control.id);
  }

  function handleStatusChange(status: ObservationStatus) {
    if (!selected) return;
    upsertObservation({ frameworkId: framework.id, controlId: selected.control.id, status });
  }

  function handleRatingChange(rating: MaturityRating) {
    if (!selected) return;
    upsertObservation({
      frameworkId: framework.id,
      controlId: selected.control.id,
      rating,
      status: observation?.status === 'not-started' || !observation ? 'in-progress' : observation.status,
      autoSuggested: false,
    });
  }

  function handleNotesBlur() {
    if (!selected) return;
    if (notesDraft === (observation?.notes ?? '')) return;
    upsertObservation({
      frameworkId: framework.id,
      controlId: selected.control.id,
      notes: notesDraft,
      autoSuggested: false,
    });
  }

  function linkedEvidenceFor(obs: { evidenceLinks: { evidenceId: string }[] } | undefined): Evidence[] {
    const ids = new Set((obs?.evidenceLinks ?? []).map((link) => link.evidenceId));
    return evidence.filter((item) => ids.has(item.id));
  }

  function handleAutoSuggest() {
    if (!selected) return;
    const result = autoAssessControl(selected.control, linkedEvidenceFor(observation));
    upsertObservation({
      frameworkId: framework.id,
      controlId: selected.control.id,
      rating: result.rating,
      notes: result.notes,
      autoSuggested: true,
      status: observation?.status === 'not-started' || !observation ? 'in-progress' : observation.status,
    });
    setNotesDraft(result.notes);
    setAssistMessage('Suggested rating and observations applied. Review and adjust before finalizing.');
  }

  async function handleAutoAssessAll() {
    setAssessing(true);
    let appliedCount = 0;
    for (const fn of framework.functions) {
      for (const control of fn.controls) {
        const existing = getObservation(framework.id, control.id);
        // Never overwrite a rating a reviewer has already confirmed by hand.
        if (existing && existing.rating !== null && !existing.autoSuggested) continue;
        const result = autoAssessControl(control, linkedEvidenceFor(existing));
        await upsertObservation({
          frameworkId: framework.id,
          controlId: control.id,
          rating: result.rating,
          notes: result.notes,
          autoSuggested: true,
          status: existing?.status === 'not-started' || !existing ? 'in-progress' : existing.status,
        });
        appliedCount += 1;
      }
    }
    setAssessing(false);
    setAssistMessage(
      appliedCount > 0
        ? `Suggested ratings applied to ${appliedCount} control(s). Review each one and adjust before finalizing.`
        : 'Every control already has a confirmed rating. Nothing to suggest.',
    );
  }

  function handleAddEvidenceLink(item: Evidence) {
    if (!selected) return;
    const current = observation?.evidenceLinks ?? [];
    if (current.some((link) => link.evidenceId === item.id)) return;
    const nextLinks = [...current, { evidenceId: item.id, section: '' }];
    const status = !observation || observation.status === 'not-started' ? 'in-progress' : observation.status;

    // Newly-linked evidence is exactly what the assistant needs to redraft its
    // suggestion — but never overwrite a rating a reviewer already confirmed.
    if (!observation || observation.rating === null || observation.autoSuggested) {
      const linked = linkedEvidenceFor({ evidenceLinks: nextLinks });
      const result = autoAssessControl(selected.control, linked);
      upsertObservation({
        frameworkId: framework.id,
        controlId: selected.control.id,
        evidenceLinks: nextLinks,
        rating: result.rating,
        notes: result.notes,
        autoSuggested: true,
        status,
      });
      setNotesDraft(result.notes);
    } else {
      upsertObservation({ frameworkId: framework.id, controlId: selected.control.id, evidenceLinks: nextLinks, status });
    }
  }

  function handleRemoveEvidenceLink(evidenceId: string) {
    if (!selected || !observation) return;
    upsertObservation({
      frameworkId: framework.id,
      controlId: selected.control.id,
      evidenceLinks: observation.evidenceLinks.filter((link) => link.evidenceId !== evidenceId),
    });
  }

  function handleEvidenceSectionBlur(evidenceId: string, section: string) {
    if (!selected || !observation) return;
    const existingLink = observation.evidenceLinks.find((link) => link.evidenceId === evidenceId);
    if ((existingLink?.section ?? '') === section) return;
    upsertObservation({
      frameworkId: framework.id,
      controlId: selected.control.id,
      evidenceLinks: observation.evidenceLinks.map((link) =>
        link.evidenceId === evidenceId ? { ...link, section } : link,
      ),
    });
  }

  function statusFor(control: Control): ObservationStatus {
    return getObservation(framework.id, control.id)?.status ?? 'not-started';
  }

  const hasScopeReference = Boolean(
    scopeDocument?.text.trim() || scopeDocument?.reviewLevel || scopeDocument?.applicationType || scopeDocument?.complianceRequirements.length,
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Assessment Workspace
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Link evidence and the assistant drafts a rating and observations for you to review and adjust.
      </Typography>

      {hasScopeReference && (
        <Accordion disableGutters variant="outlined" sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Engagement scope reference</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5, gap: 1 }}>
              {scopeDocument?.reviewLevel && (
                <Chip
                  size="small"
                  label={scopeDocument.reviewLevel === 'application' ? 'Application-level review' : 'Organization-level review'}
                />
              )}
              {scopeDocument?.applicationType && <Chip size="small" label={scopeDocument.applicationType} />}
              {scopeDocument?.complianceRequirements.map((req) => (
                <Chip key={req} size="small" variant="outlined" label={req} />
              ))}
            </Stack>
            {scopeDocument?.text.trim() && (
              <>
                <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(scopeDocument.text);
                        setCopied(true);
                      } catch {
                        // Clipboard access can be denied by the browser; nothing to recover from here.
                      }
                    }}
                  >
                    Copy
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {scopeDocument.text}
                </Typography>
              </>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      <Tabs
        value={frameworkIndex}
        onChange={(_e, v) => setFrameworkIndex(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {frameworks.map((f) => (
          <Tab key={f.id} label={`${f.shortName} ${f.version}`} sx={{ textTransform: 'none' }} />
        ))}
      </Tabs>

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={handleAutoAssessAll}
          disabled={assessing || framework.functions.length === 0}
        >
          {assessing ? 'Suggesting...' : `Auto-suggest all for ${framework.shortName}`}
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ maxHeight: 640, overflowY: 'auto' }}>
            {framework.functions.length === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No controls are in scope for this framework. Add some on the Home page.
                </Typography>
              </Box>
            )}
            {framework.functions.map((fn) => (
              <Accordion key={fn.id} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="subtitle2">
                      {fn.code} · {fn.name}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List dense disablePadding>
                    {fn.controls.map((control) => {
                      const status = statusFor(control);
                      const StatusIcon = STATUS_ICONS[status];
                      const isSuggested = Boolean(getObservation(framework.id, control.id)?.autoSuggested);
                      return (
                        <ListItemButton
                          key={control.id}
                          selected={selectedControlId === control.id}
                          onClick={() => selectControl(control)}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <StatusIcon fontSize="small" sx={{ color: STATUS_COLORS[status] }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${control.code}: ${control.name}`}
                            slotProps={{ primary: { variant: 'body2' } }}
                          />
                          {isSuggested && (
                            <Chip
                              size="small"
                              variant="outlined"
                              label="Suggested"
                              sx={{ ml: 1, flexShrink: 0, color: '#00A3E0', borderColor: '#00A3E0' }}
                            />
                          )}
                        </ListItemButton>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {selected ? (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary">
                {selected.control.code}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selected.control.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {selected.control.description}
              </Typography>
              {selected.control.guidance && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                  {selected.control.guidance}
                </Typography>
              )}

              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <Box sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <HelpOutlineIcon fontSize="small" sx={{ color: '#00A3E0', mt: 0.25 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                        Question to ask the client
                      </Typography>
                      <Typography variant="body2">{selected.control.question}</Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <LightbulbOutlinedIcon fontSize="small" sx={{ color: '#86BC25', mt: 0.25 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
                        What a strong answer looks like
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selected.control.sampleAnswer}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Status
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={observation?.status ?? 'not-started'}
                onChange={(_e, value) => value && handleStatusChange(value)}
                sx={{ mb: 2 }}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: 'none' }}>
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2">Maturity rating</Typography>
                  {observation?.autoSuggested && (
                    <Chip size="small" variant="outlined" label="Suggested, needs review" sx={{ color: '#00A3E0', borderColor: '#00A3E0' }} />
                  )}
                </Stack>
                <Button size="small" startIcon={<AutoAwesomeIcon />} onClick={handleAutoSuggest}>
                  Auto-suggest
                </Button>
              </Stack>
              <ToggleButtonGroup
                exclusive
                value={observation?.rating ?? null}
                onChange={(_e, value) => value !== null && handleRatingChange(value)}
                sx={{ mb: 1 }}
              >
                {([0, 1, 2, 3] as MaturityRating[]).map((rating) => (
                  <ToggleButton key={rating} value={rating}>
                    {rating}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                {observation?.rating !== null && observation?.rating !== undefined
                  ? MATURITY_LABELS[observation.rating]
                  : 'Not yet rated'}
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Observations
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="Observations for this control..."
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={handleNotesBlur}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Linked evidence
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Link one or more evidence items, and note which page or section of each one supports
                this control.
              </Typography>
              {(observation?.evidenceLinks ?? []).length > 0 && (
                <Stack spacing={1} sx={{ mb: 1.5 }}>
                  {(observation?.evidenceLinks ?? []).map((link) => {
                    const item = evidence.find((e) => e.id === link.evidenceId);
                    if (!item) return null;
                    return (
                      <Stack key={link.evidenceId} direction="row" spacing={1} alignItems="center">
                        <Chip label={item.title} size="small" sx={{ flexShrink: 0, maxWidth: 180 }} />
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Section / page reference (optional)"
                          defaultValue={link.section ?? ''}
                          onBlur={(e) => handleEvidenceSectionBlur(link.evidenceId, e.target.value)}
                        />
                        <IconButton
                          size="small"
                          aria-label={`Remove ${item.title}`}
                          onClick={() => handleRemoveEvidenceLink(link.evidenceId)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
              <Autocomplete
                // Remounts after every add/remove so the input clears instead of
                // sticking on the option label just picked (value stays null by design).
                key={(observation?.evidenceLinks ?? []).length}
                options={evidence.filter((item) => !(observation?.evidenceLinks ?? []).some((link) => link.evidenceId === item.id))}
                getOptionLabel={(item) => item.title}
                value={null}
                onChange={(_e, value) => value && handleAddEvidenceLink(value)}
                renderInput={(params) => <TextField {...params} placeholder="Add evidence..." />}
              />
            </Paper>
          ) : (
            <Typography color="text.secondary">Select a control to view details.</Typography>
          )}
        </Grid>
      </Grid>

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}>
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Copied to clipboard
        </Alert>
      </Snackbar>

      <Snackbar open={assistMessage !== null} autoHideDuration={4000} onClose={() => setAssistMessage(null)}>
        <Alert severity="info" variant="filled" onClose={() => setAssistMessage(null)}>
          {assistMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
