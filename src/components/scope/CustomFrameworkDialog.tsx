// Lets a reviewer build the engagement's 4th "Custom" framework: either by
// describing the domains/controls they care about (matched offline against
// the same keyword heuristic as the scope suggester, across all three
// built-in catalogs) or by authoring a control by hand. Everything added
// here becomes a real Control under the synthetic "custom" framework
// (utils/customFramework.ts), so it rates, links evidence, and reports
// exactly like a built-in one.
import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { frameworks } from '../../data/frameworks';
import { getControl } from '../../data/frameworks';
import { useAppData } from '../../context/useAppData';
import { suggestControls, type SuggestedControl } from '../../utils/suggest';

export function CustomFrameworkDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCustomControl } = useAppData();
  const [tab, setTab] = useState<'suggest' | 'manual'>('suggest');

  const [prompt, setPrompt] = useState('');
  const [matches, setMatches] = useState<SuggestedControl[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [question, setQuestion] = useState('');
  const [sampleAnswer, setSampleAnswer] = useState('');

  function resetAndClose() {
    setPrompt('');
    setMatches(null);
    setSelected(new Set());
    setCode('');
    setName('');
    setDescription('');
    setQuestion('');
    setSampleAnswer('');
    setTab('suggest');
    onClose();
  }

  function handleFindMatches() {
    const found = suggestControls(prompt, frameworks);
    setMatches(found);
    setSelected(new Set(found.map((m) => `${m.frameworkId}:${m.controlId}`)));
  }

  function toggleMatch(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleAddSelected() {
    if (!matches) return;
    setAdding(true);
    try {
      const toAdd = matches.filter((m) => selected.has(`${m.frameworkId}:${m.controlId}`));
      await Promise.all(
        toAdd.map((m) => {
          const found = getControl(m.frameworkId, m.controlId);
          if (!found) return Promise.resolve();
          const { control } = found;
          return addCustomControl({
            code: `${m.frameworkShortName}/${control.code}`,
            name: control.name,
            description: control.description,
            question: control.question,
            sampleAnswer: control.sampleAnswer,
            guidance: control.guidance,
          });
        }),
      );
      resetAndClose();
    } finally {
      setAdding(false);
    }
  }

  async function handleAddManual() {
    if (!code.trim() || !name.trim()) return;
    setAdding(true);
    try {
      await addCustomControl({
        code: code.trim(),
        name: name.trim(),
        description: description.trim(),
        question: question.trim() || `How does the organization address ${name.trim()}?`,
        sampleAnswer: sampleAnswer.trim() || 'Describe the expected practice for this control.',
      });
      resetAndClose();
    } finally {
      setAdding(false);
    }
  }

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add to custom framework</DialogTitle>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 3 }}>
        <Tab label="Suggest from catalog" value="suggest" />
        <Tab label="Write a control" value="manual" />
      </Tabs>
      <DialogContent>
        {tab === 'suggest' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Describe the domains, technologies, or outcomes you want covered. This searches every
              control across SAMM, NIST CSF, and NIST SSDF by keyword, offline, so you can pull the
              best-fit ones into one combined framework.
            </Typography>
            <TextField
              multiline
              minRows={3}
              fullWidth
              placeholder="e.g. cloud infrastructure hardening, secrets management, and third-party dependency risk"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button variant="outlined" onClick={handleFindMatches} disabled={!prompt.trim()}>
              Find matching controls
            </Button>
            {matches !== null && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  {matches.length} match(es). Uncheck anything that doesn't apply.
                </Typography>
                <Stack sx={{ maxHeight: 260, overflowY: 'auto' }}>
                  {matches.map((m) => {
                    const key = `${m.frameworkId}:${m.controlId}`;
                    return (
                      <FormControlLabel
                        key={key}
                        control={<Checkbox size="small" checked={selected.has(key)} onChange={() => toggleMatch(key)} />}
                        label={
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip size="small" label={m.frameworkShortName} />
                            <Typography variant="body2">
                              {m.code}: {m.name}
                            </Typography>
                          </Stack>
                        }
                      />
                    );
                  })}
                  {matches.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No matches. Try different or broader wording, or write a control by hand instead.
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}
          </Box>
        )}
        {tab === 'manual' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} fullWidth required placeholder="e.g. CUSTOM-1" />
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Question to ask the client"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="What a strong answer looks like"
              value={sampleAnswer}
              onChange={(e) => setSampleAnswer(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={resetAndClose}>Cancel</Button>
        {tab === 'suggest' ? (
          <Button variant="contained" disabled={!matches || selected.size === 0 || adding} onClick={handleAddSelected}>
            Add {selected.size > 0 ? selected.size : ''} to custom framework
          </Button>
        ) : (
          <Button variant="contained" disabled={!code.trim() || !name.trim() || adding} onClick={handleAddManual}>
            Add control
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
