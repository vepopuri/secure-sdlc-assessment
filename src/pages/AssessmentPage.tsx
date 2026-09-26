import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Chip,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
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
import { frameworks } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import type { Control, MaturityRating, ObservationStatus } from '../types';
import { MATURITY_LABELS } from '../types';
import { applyScope, includedControlIdsFor } from '../utils/scope';

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
  const { getObservation, upsertObservation, evidence, scope } = useAppData();
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
    });
  }

  function handleNotesBlur() {
    if (!selected) return;
    upsertObservation({ frameworkId: framework.id, controlId: selected.control.id, notes: notesDraft });
  }

  function handleEvidenceChange(ids: string[]) {
    if (!selected) return;
    upsertObservation({ frameworkId: framework.id, controlId: selected.control.id, evidenceIds: ids });
  }

  function statusFor(control: Control): ObservationStatus {
    return getObservation(framework.id, control.id)?.status ?? 'not-started';
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Assessment Workspace
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Rate each control on the normalized 0–3 maturity scale and link supporting evidence.
      </Typography>

      <Tabs
        value={frameworkIndex}
        onChange={(_e, v) => setFrameworkIndex(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {frameworks.map((f) => (
          <Tab key={f.id} label={`${f.shortName} ${f.version}`} sx={{ textTransform: 'none' }} />
        ))}
      </Tabs>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ maxHeight: 640, overflowY: 'auto' }}>
            {framework.functions.length === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No controls are in scope for this framework. Add some on the Scope page.
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
                            primary={`${control.code} — ${control.name}`}
                            slotProps={{ primary: { variant: 'body2' } }}
                          />
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

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Maturity rating
              </Typography>
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
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="Assessment notes for this control..."
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={handleNotesBlur}
                sx={{ mb: 2 }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Linked evidence
              </Typography>
              <Autocomplete
                multiple
                options={evidence}
                getOptionLabel={(item) => item.title}
                value={evidence.filter((item) => observation?.evidenceIds.includes(item.id))}
                onChange={(_e, values) => handleEvidenceChange(values.map((v) => v.id))}
                renderInput={(params) => <TextField {...params} placeholder="Link evidence..." />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...rest } = getTagProps({ index });
                    return <Chip key={key} label={option.title} size="small" {...rest} />;
                  })
                }
              />
            </Paper>
          ) : (
            <Typography color="text.secondary">Select a control to view details.</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
