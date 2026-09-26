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
          px: { xs: 2.5, sm: 4 },
          py: { xs: 2.5, sm: 3 },
          mb: 3,
          textAlign: 'center',
          color: '#282728',
          backgroundImage: 'linear-gradient(135deg, #F3F8EC 0%, #FFFFFF 45%, #E9F6FB 100%)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 140,
            height: 140,
            borderRadius: '50%',
            border: '1px solid rgba(134,188,37,0.25)',
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -40,
            width: 130,
            height: 130,
            borderRadius: '50%',
            border: '1px solid rgba(0,163,224,0.2)',
          }}
        />

        <Typography
          sx={{
            position: 'relative',
            fontWeight: 800,
            lineHeight: 1.2,
            mb: 0.75,
            fontSize: { xs: '1.4rem', sm: '1.65rem' },
          }}
        >
          Assess the Maturity of Your Secure <Box component="span" sx={{ color: '#86BC25' }}>SDLC</Box>
        </Typography>

        <Typography
          variant="body2"
          sx={{
            position: 'relative',
            maxWidth: 640,
            mx: 'auto',
            mb: 1.75,
            color: 'rgba(40,39,40,0.7)',
          }}
        >
          Scope, collect evidence, and score maturity across OWASP SAMM, NIST CSF, and NIST SSDF,
          from kickoff through a presentation-ready report.
        </Typography>

        <Stack direction="row" spacing={1.25} justifyContent="center" flexWrap="wrap" rowGap={1} sx={{ position: 'relative' }}>
          <Button
            size="small"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            sx={{ bgcolor: '#86BC25', '&:hover': { bgcolor: '#75A521' } }}
            onClick={() => navigate('/assessment')}
          >
            Go to assessment
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={{ color: '#282728', borderColor: 'rgba(40,39,40,0.3)' }}
            onClick={() => navigate('/evidence')}
          >
            Collect evidence
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={{ color: '#282728', borderColor: 'rgba(40,39,40,0.3)' }}
            onClick={() => navigate('/reports')}
          >
            View reports
          </Button>
        </Stack>
      </Box>

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
