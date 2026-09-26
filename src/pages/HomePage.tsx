import { useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { frameworks, allControlIds } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { formatBytes } from '../utils/formatBytes';
import { SuggestControlsDialog } from '../components/scope/SuggestControlsDialog';
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

const ACCEPTED_SCOPE_DOC_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
const ACCEPTED_SCOPE_DOC_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
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
        '&:hover .step-card-badge': { transform: 'scale(1.08)' },
        '&:hover .step-card-arrow': { opacity: 1, transform: 'translateX(0)' },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box
          className="step-card-badge"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: '#282728',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease',
          }}
        >
          <Icon sx={{ color, fontSize: 22 }} />
        </Box>
        <ArrowForwardIcon
          className="step-card-arrow"
          sx={{ color, fontSize: 18, opacity: 0, transform: 'translateX(-4px)', transition: 'opacity 0.15s ease, transform 0.15s ease' }}
        />
      </Stack>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
}

/** A framework badge in the hero: subtle, on-brand, and interactive rather than a static label. */
function FrameworkBadge({ label, version, controlCount, onClick }: { label: string; version: string; controlCount: number; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        px: 2,
        py: 1,
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.22)',
        bgcolor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(2px)',
        transition: 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: '#86EB22',
          bgcolor: 'rgba(134,235,34,0.08)',
        },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
        {label} <Box component="span" sx={{ fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>{version}</Box>
      </Typography>
      <Typography variant="caption" sx={{ color: '#86EB22' }}>
        {controlCount} controls
      </Typography>
    </Box>
  );
}

export function HomePage() {
  const {
    scopeDocument,
    updateScopeDocument,
    setScopeDocumentAttachment,
    removeScopeDocumentAttachment,
    getScopeDocumentAttachmentUrl,
  } = useAppData();
  const navigate = useNavigate();

  const [textDraft, setTextDraft] = useState(scopeDocument?.text ?? '');
  const [lastDocKey, setLastDocKey] = useState(scopeDocument?.updatedAt ?? null);
  if ((scopeDocument?.updatedAt ?? null) !== lastDocKey) {
    setLastDocKey(scopeDocument?.updatedAt ?? null);
    setTextDraft(scopeDocument?.text ?? '');
  }

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

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
    const extensionOk = ACCEPTED_SCOPE_DOC_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
    const mimeOk = ACCEPTED_SCOPE_DOC_MIME.includes(file.type);
    if (!extensionOk && !mimeOk) {
      setFileError('Only PDF, Word (.doc, .docx), or PowerPoint (.ppt, .pptx) files are accepted.');
      return;
    }
    await setScopeDocumentAttachment(file);
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

  // Feed the engagement's own intake profile into the keyword suggester, in
  // addition to the free-text description, so choosing a review level,
  // application type, or compliance requirement actually changes which
  // controls get suggested — not just the prose in the text box.
  const profileTokens = [
    scopeDocument?.reviewLevel === 'organization' ? 'organization' : scopeDocument?.reviewLevel === 'application' ? 'application' : '',
    scopeDocument?.applicationType ?? '',
    ...(scopeDocument?.complianceRequirements ?? []),
  ]
    .filter(Boolean)
    .join('. ');
  const effectiveScopeText = [textDraft, profileTokens].filter(Boolean).join('. ');

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          p: { xs: 2.5, sm: 4 },
          mb: 3,
          textAlign: 'center',
          color: '#FFFFFF',
          backgroundImage: 'linear-gradient(120deg, #1c2420, #282728, #123244, #282728)',
          backgroundSize: '300% 300%',
          animation: 'heroGradient 16s ease infinite',
          '@keyframes heroGradient': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.75 }}>
          Secure SDLC Assessment
        </Typography>
        <Typography
          variant="body1"
          sx={{ maxWidth: 640, mx: 'auto', mb: 2, color: 'rgba(255,255,255,0.8)' }}
        >
          A single workspace for running secure software development lifecycle assessments, from
          kickoff through final report. Scope the engagement, collect evidence, interview
          stakeholders, and score maturity across OWASP SAMM, NIST CSF, and NIST SSDF. Findings
          stay comparable, defensible, and ready to present.
        </Typography>

        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" sx={{ gap: 1.5, mb: 2.5 }}>
          {frameworks.map((f) => (
            <FrameworkBadge
              key={f.id}
              label={f.shortName}
              version={f.version}
              controlCount={allControlIds(f).length}
              onClick={() => navigate('/assessment')}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1.5} justifyContent="center">
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
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Where would you like to start?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Jump straight into any part of the engagement, wherever makes sense for you.
      </Typography>

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
              <Typography variant="caption" color="text.secondary">
                These selections feed the control suggester alongside the scope description, so
                narrowing them down changes what gets suggested.
              </Typography>
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
                  disabled={!effectiveScopeText.trim()}
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
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" rowGap={1}>
              <Button size="small" component="label" startIcon={<UploadFileIcon />}>
                Upload scope document
                <input
                  type="file"
                  hidden
                  accept={[...ACCEPTED_SCOPE_DOC_EXTENSIONS, ...ACCEPTED_SCOPE_DOC_MIME].join(',')}
                  onChange={handleFileInputChange}
                />
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75 }}>
              Accepted formats: PDF, Word (.doc, .docx), or PowerPoint (.ppt, .pptx) only.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <SuggestControlsDialog open={suggestOpen} onClose={() => setSuggestOpen(false)} scopeText={effectiveScopeText} />

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}>
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Copied to clipboard
        </Alert>
      </Snackbar>

      <Snackbar open={fileError !== null} autoHideDuration={4000} onClose={() => setFileError(null)}>
        <Alert severity="error" variant="filled" onClose={() => setFileError(null)}>
          {fileError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
