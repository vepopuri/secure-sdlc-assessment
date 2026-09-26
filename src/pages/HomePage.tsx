import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
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
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { frameworks, allControlIds } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { includedControlIdsFor, applyScope } from '../utils/scope';
import { scoreFramework, overallAverageRating } from '../utils/scoring';
import { formatBytes } from '../utils/formatBytes';
import { SuggestControlsDialog } from '../components/scope/SuggestControlsDialog';
import { WorkflowIllustration } from '../components/WorkflowIllustration';
import type { ReviewLevel } from '../types';

const APPLICATION_TYPES = [
  'Web Application',
  'Mobile Application',
  'API / Microservice',
  'Cloud Infrastructure',
  'Desktop Application',
  'Data Pipeline / Batch Service',
  'Other',
];

const ORGANIZATION_TYPES = [
  'Business Unit',
  'Subsidiary / Legal Entity',
  'Department / Function',
  'Product Line / Portfolio',
  'Entire Enterprise',
  'Other',
];

const COMPLIANCE_OPTIONS = [
  'PCI DSS',
  'HIPAA',
  'SOC 2',
  'ISO 27001',
  'GDPR',
  'FedRAMP',
  'NIST 800-53',
  'CCPA',
];

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#86BC25', flexShrink: 0 }} aria-hidden />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {children}
      </Typography>
    </Stack>
  );
}

interface StatTileProps {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}

function StatTile({ icon: Icon, value, label, color }: StatTileProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 130,
        p: 2,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        '&:hover': { transform: 'translateY(-3px)', borderColor: color },
      }}
    >
      <Icon sx={{ color, fontSize: 20, mb: 0.75 }} />
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
        {label}
      </Typography>
    </Box>
  );
}

interface StepCardProps {
  icon: React.ElementType;
  color: string;
  title: string;
  description: string;
  onClick: () => void;
}

function StepCard({ icon: Icon, color, title, description, onClick }: StepCardProps) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2.5,
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          borderColor: color,
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: '#282728',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        <Icon sx={{ color, fontSize: 22 }} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
}

export function HomePage() {
  const {
    scope,
    setScopeIncluded,
    scopeDocument,
    updateScopeDocument,
    setScopeDocumentAttachment,
    removeScopeDocumentAttachment,
    getScopeDocumentAttachmentUrl,
    evidence,
    observations,
  } = useAppData();
  const navigate = useNavigate();

  const frameworkScores = frameworks.map((f) =>
    scoreFramework(applyScope(f, includedControlIdsFor(scope, f.id)), observations),
  );
  const totalControls = frameworkScores.reduce((sum, s) => sum + s.totalCount, 0);
  const totalRated = frameworkScores.reduce((sum, s) => sum + s.ratedCount, 0);
  const pctRated = totalControls > 0 ? Math.round((totalRated / totalControls) * 100) : 0;
  const avgMaturity = overallAverageRating(frameworkScores);

  const [textDraft, setTextDraft] = useState(scopeDocument?.text ?? '');
  const [lastDocKey, setLastDocKey] = useState(scopeDocument?.updatedAt ?? null);
  if ((scopeDocument?.updatedAt ?? null) !== lastDocKey) {
    setLastDocKey(scopeDocument?.updatedAt ?? null);
    setTextDraft(scopeDocument?.text ?? '');
  }

  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const framework = frameworks[frameworkIndex];
  const allIds = allControlIds(framework);
  const includedSet = includedControlIdsFor(scope, framework.id) ?? new Set(allIds);

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleTextBlur() {
    if (textDraft !== (scopeDocument?.text ?? '')) {
      updateScopeDocument({ text: textDraft });
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textDraft);
      setCopied(true);
    } catch {
      // Clipboard access can be denied by the browser; nothing to recover from here.
    }
  }

  async function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await setScopeDocumentAttachment(file);
    if ((file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name)) && !textDraft.trim()) {
      const text = await file.text();
      setTextDraft(text);
      await updateScopeDocument({ text });
    }
  }

  async function handleDownloadAttachment() {
    const url = await getScopeDocumentAttachmentUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = scopeDocument?.attachmentFileName ?? 'scope-document';
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleControl(controlId: string) {
    const next = new Set(includedSet);
    if (next.has(controlId)) next.delete(controlId);
    else next.add(controlId);
    setScopeIncluded(framework.id, Array.from(next));
  }

  function toggleFunction(functionControlIds: string[], shouldInclude: boolean) {
    const next = new Set(includedSet);
    for (const id of functionControlIds) {
      if (shouldInclude) next.add(id);
      else next.delete(id);
    }
    setScopeIncluded(framework.id, Array.from(next));
  }

  function selectAll() {
    setScopeIncluded(framework.id, allIds);
  }

  function clearAll() {
    setScopeIncluded(framework.id, []);
  }

  return (
    <Box>
      <Box
        sx={{
          bgcolor: '#282728',
          color: '#FFFFFF',
          borderRadius: 2,
          p: { xs: 3, sm: 5 },
          mb: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Secure SDLC Assessment
        </Typography>
        <Typography
          variant="body1"
          sx={{ maxWidth: 640, mx: 'auto', mb: 3, color: 'rgba(255,255,255,0.8)' }}
        >
          A single, structured workspace for running secure software development lifecycle
          assessments, from kickoff through final report. Scope the engagement, collect evidence,
          interview stakeholders, and score maturity consistently across OWASP SAMM, NIST CSF, and
          NIST SSDF &mdash; so findings are comparable, defensible, and ready to present.
        </Typography>

        <WorkflowIllustration />

        <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mb: 3 }}>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#86BC25', '&:hover': { bgcolor: '#75A521' } }}
            onClick={() => navigate('/assessment')}
          >
            Go to assessment
          </Button>
          <Button
            variant="outlined"
            sx={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)' }}
            onClick={() => navigate('/reports')}
          >
            View reports
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ maxWidth: 720, mx: 'auto' }}>
          <StatTile icon={FactCheckIcon} value={String(totalControls)} label="Controls in scope" color="#00A3E0" />
          <StatTile icon={DonutLargeIcon} value={`${pctRated}%`} label="Controls assessed" color="#86BC25" />
          <StatTile icon={DescriptionOutlinedIcon} value={String(evidence.length)} label="Evidence collected" color="#00A3E0" />
          <StatTile icon={TrendingUpIcon} value={`${avgMaturity.toFixed(1)} / 3`} label="Avg. maturity" color="#86BC25" />
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StepCard
            icon={TuneIcon}
            color="#00A3E0"
            title="Scope & plan"
            description="Define review level, application, and compliance context."
            onClick={() => document.getElementById('scope-section')?.scrollIntoView({ behavior: 'smooth' })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StepCard
            icon={UploadFileIcon}
            color="#86BC25"
            title="Collect evidence"
            description="Upload documents and interview notes, linked to specific controls."
            onClick={() => navigate('/evidence')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StepCard
            icon={VerifiedIcon}
            color="#00A3E0"
            title="Assess & score"
            description="Rate maturity per control across SAMM, NIST CSF, and SSDF."
            onClick={() => navigate('/assessment')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StepCard
            icon={SummarizeIcon}
            color="#86BC25"
            title="Report & present"
            description="Compile findings into a defensible, presentation-ready report."
            onClick={() => navigate('/reports')}
          />
        </Grid>
      </Grid>

      <Grid id="scope-section" container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <CardHeader>Engagement details</CardHeader>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Review level
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={scopeDocument?.reviewLevel ?? null}
                  onChange={(_e, value: ReviewLevel | null) => {
                    if (!value) return;
                    const nextOptions = value === 'organization' ? ORGANIZATION_TYPES : APPLICATION_TYPES;
                    const currentType = scopeDocument?.applicationType ?? '';
                    updateScopeDocument({
                      reviewLevel: value,
                      // The two levels use different type vocabularies — clear a
                      // selection that no longer makes sense under the new level.
                      applicationType: nextOptions.includes(currentType) ? currentType : '',
                    });
                  }}
                >
                  <ToggleButton value="application" sx={{ textTransform: 'none' }}>
                    Application-level
                  </ToggleButton>
                  <ToggleButton value="organization" sx={{ textTransform: 'none' }}>
                    Organization-level
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <TextField
                select
                fullWidth
                label={scopeDocument?.reviewLevel === 'organization' ? 'Type of organization' : 'Type of application'}
                value={scopeDocument?.applicationType ?? ''}
                onChange={(e) => updateScopeDocument({ applicationType: e.target.value })}
                slotProps={{ select: { native: true } }}
              >
                <option value="" />
                {(scopeDocument?.reviewLevel === 'organization' ? ORGANIZATION_TYPES : APPLICATION_TYPES).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </TextField>
              <Autocomplete
                multiple
                freeSolo
                options={COMPLIANCE_OPTIONS}
                value={scopeDocument?.complianceRequirements ?? []}
                onChange={(_e, value) => updateScopeDocument({ complianceRequirements: value as string[] })}
                renderInput={(params) => <TextField {...params} label="Compliance requirements" />}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={1} sx={{ mb: 2.5 }}>
              <CardHeader>Scope description</CardHeader>
              <Stack direction="row" spacing={1}>
                <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy} disabled={!textDraft.trim()}>
                  Copy
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => setSuggestOpen(true)}
                  disabled={!textDraft.trim()}
                >
                  Suggest
                </Button>
              </Stack>
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={5}
              sx={{ flex: 1 }}
              placeholder="Describe the engagement's scope: systems, applications, environments, and any explicit exclusions..."
              value={textDraft}
              onChange={(e) => setTextDraft(e.target.value)}
              onBlur={handleTextBlur}
            />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
              <Button size="small" component="label" startIcon={<UploadFileIcon />}>
                Upload scope document
                <input type="file" hidden onChange={handleFileInputChange} />
              </Button>
              {scopeDocument?.attachmentFileName && (
                <Chip
                  icon={<DescriptionOutlinedIcon />}
                  label={`${scopeDocument.attachmentFileName} (${formatBytes(scopeDocument.attachmentSizeBytes)})`}
                  onClick={handleDownloadAttachment}
                  onDelete={() => removeScopeDocumentAttachment()}
                />
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Tabs
        value={frameworkIndex}
        onChange={(_e, v) => setFrameworkIndex(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {frameworks.map((f) => (
          <Tab key={f.id} label={`${f.shortName} ${f.version}`} sx={{ textTransform: 'none' }} />
        ))}
      </Tabs>

      <Accordion disableGutters variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box>
            <Typography variant="subtitle2">Fine-tune specific controls (optional)</Typography>
            <Typography variant="caption" color="text.secondary">
              {includedSet.size} / {allIds.length} controls in scope for {framework.shortName}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 1.5, pb: 0 }}>
            <Button size="small" onClick={selectAll}>
              Select all
            </Button>
            <Button size="small" onClick={clearAll}>
              Clear all
            </Button>
          </Stack>
          {framework.functions.map((fn) => {
            const functionControlIds = fn.controls.map((c) => c.id);
            const includedCount = functionControlIds.filter((id) => includedSet.has(id)).length;
            const allIncluded = includedCount === functionControlIds.length;
            const noneIncluded = includedCount === 0;
            return (
              <Accordion key={fn.id} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 2 }}>
                    <Typography variant="subtitle2">
                      {fn.code} · {fn.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {includedCount} / {functionControlIds.length} in scope
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <FormControlLabel
                    sx={{ mb: 0.5 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={allIncluded}
                        indeterminate={!allIncluded && !noneIncluded}
                        onChange={(e) => toggleFunction(functionControlIds, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={<Typography variant="body2">All controls in this function</Typography>}
                  />
                  <Stack sx={{ pl: 2 }}>
                    {fn.controls.map((control) => (
                      <FormControlLabel
                        key={control.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={includedSet.has(control.id)}
                            onChange={() => toggleControl(control.id)}
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {control.code} — {control.name}
                          </Typography>
                        }
                      />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </AccordionDetails>
      </Accordion>

      <SuggestControlsDialog open={suggestOpen} onClose={() => setSuggestOpen(false)} scopeText={textDraft} />

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}>
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
}
