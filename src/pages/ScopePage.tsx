import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { frameworks, allControlIds } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { includedControlIdsFor } from '../utils/scope';
import { SuggestControlsDialog } from '../components/scope/SuggestControlsDialog';

export function ScopePage() {
  const { scope, setScopeIncluded, scopeDocument, setScopeDocumentText } = useAppData();
  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const framework = frameworks[frameworkIndex];

  const [docDraft, setDocDraft] = useState(scopeDocument?.text ?? '');
  const [lastDocKey, setLastDocKey] = useState(scopeDocument?.updatedAt ?? null);
  if ((scopeDocument?.updatedAt ?? null) !== lastDocKey) {
    setLastDocKey(scopeDocument?.updatedAt ?? null);
    setDocDraft(scopeDocument?.text ?? '');
  }

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const allIds = allControlIds(framework);
  const includedSet = includedControlIdsFor(scope, framework.id) ?? new Set(allIds);

  function handleDocBlur() {
    if (docDraft !== (scopeDocument?.text ?? '')) {
      setScopeDocumentText(docDraft);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(docDraft);
      setCopied(true);
    } catch {
      // Clipboard access can be denied by the browser; nothing to recover from here.
    }
  }

  function toggleControl(controlId: string) {
    const next = new Set(includedSet);
    if (next.has(controlId)) {
      next.delete(controlId);
    } else {
      next.add(controlId);
    }
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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Assessment Scope
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Describe what this engagement covers below — it&apos;s reference material you can copy
        elsewhere or come back to during review. When you&apos;re ready, use it to suggest which
        controls to include, or fine-tune the control checklist yourself further down.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderLeft: '3px solid #86BC25' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Engagement scope document
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleCopy} disabled={!docDraft.trim()}>
              Copy
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setSuggestOpen(true)}
              disabled={!docDraft.trim()}
            >
              Suggest controls
            </Button>
          </Stack>
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={6}
          placeholder="Paste or write the engagement's scope here: systems, applications, environments, and any explicit exclusions..."
          value={docDraft}
          onChange={(e) => setDocDraft(e.target.value)}
          onBlur={handleDocBlur}
        />
      </Paper>

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

      <SuggestControlsDialog open={suggestOpen} onClose={() => setSuggestOpen(false)} scopeText={docDraft} />

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)}>
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>
          Copied to clipboard
        </Alert>
      </Snackbar>
    </Box>
  );
}
