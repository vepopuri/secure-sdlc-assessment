import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { frameworks } from '../../data/frameworks';
import { useAppData } from '../../context/useAppData';
import { includedControlIdsFor } from '../../utils/scope';
import { suggestControls } from '../../utils/suggest';
import type { Control } from '../../types';

export function SuggestControlsDialog({
  open,
  onClose,
  scopeText,
}: {
  open: boolean;
  onClose: () => void;
  scopeText: string;
}) {
  const { scope, setScopeIncluded } = useAppData();

  const suggestions = useMemo(() => (open ? suggestControls(scopeText, frameworks) : []), [open, scopeText]);

  // One set of chosen control ids per framework, seeded from the keyword
  // suggestions on open but freely adjustable — unchecking a suggestion or
  // adding an unsuggested control both just edit this same set.
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [activeFrameworkIndex, setActiveFrameworkIndex] = useState(0);
  const [lastOpenKey, setLastOpenKey] = useState(false);
  if (open !== lastOpenKey) {
    setLastOpenKey(open);
    if (open) {
      const initial: Record<string, Set<string>> = {};
      for (const f of frameworks) {
        initial[f.id] = new Set(suggestions.filter((s) => s.frameworkId === f.id).map((s) => s.controlId));
      }
      setSelected(initial);
      setActiveFrameworkIndex(0);
    }
  }

  const activeFramework = frameworks[activeFrameworkIndex];
  const suggestionsForActive = suggestions.filter((s) => s.frameworkId === activeFramework.id);
  const suggestedIdsForActive = new Set(suggestionsForActive.map((s) => s.controlId));
  const allControlsForActive = activeFramework.functions.flatMap((fn) => fn.controls);
  const addableOptions = allControlsForActive.filter((c) => !suggestedIdsForActive.has(c.id));
  const selectedSetForActive = selected[activeFramework.id] ?? new Set<string>();
  const manuallyAddedForActive = addableOptions.filter((c) => selectedSetForActive.has(c.id));

  function toggleSuggested(controlId: string) {
    setSelected((prev) => {
      const next = { ...prev };
      const set = new Set(next[activeFramework.id] ?? []);
      if (set.has(controlId)) set.delete(controlId);
      else set.add(controlId);
      next[activeFramework.id] = set;
      return next;
    });
  }

  function handleAddableChange(values: Control[]) {
    setSelected((prev) => {
      const next = { ...prev };
      const set = new Set(next[activeFramework.id] ?? []);
      for (const c of addableOptions) set.delete(c.id);
      for (const v of values) set.add(v.id);
      next[activeFramework.id] = set;
      return next;
    });
  }

  const totalSelected = frameworks.reduce((sum, f) => sum + (selected[f.id]?.size ?? 0), 0);

  async function handleFinalize() {
    await Promise.all(
      frameworks.map((f) => {
        const controlIds = selected[f.id];
        if (!controlIds || controlIds.size === 0) return Promise.resolve();
        const allIds = f.functions.flatMap((fn) => fn.controls.map((c) => c.id));
        const existing = includedControlIdsFor(scope, f.id) ?? new Set(allIds);
        const merged = new Set(existing);
        for (const id of controlIds) merged.add(id);
        return setScopeIncluded(f.id, Array.from(merged));
      }),
    );
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review &amp; finalize controls</DialogTitle>
      <Tabs
        value={activeFrameworkIndex}
        onChange={(_e, v) => setActiveFrameworkIndex(v)}
        sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {frameworks.map((f) => {
          const count = selected[f.id]?.size ?? 0;
          return <Tab key={f.id} label={count > 0 ? `${f.shortName} (${count})` : f.shortName} sx={{ textTransform: 'none' }} />;
        })}
      </Tabs>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Suggestions come from keywords in your scope description. Uncheck anything that
            doesn&apos;t apply, and use &quot;Add other controls&quot; to bring in anything the
            keyword match missed. Nothing is added to scope until you finalize.
          </Typography>

          {suggestionsForActive.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Suggested from your scope description
              </Typography>
              <Stack sx={{ pl: 1 }}>
                {suggestionsForActive.map((s) => (
                  <FormControlLabel
                    key={s.controlId}
                    control={
                      <Checkbox size="small" checked={selectedSetForActive.has(s.controlId)} onChange={() => toggleSuggested(s.controlId)} />
                    }
                    label={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="body2">
                          {s.code}: {s.name}
                        </Typography>
                        <Chip size="small" variant="outlined" label={s.matchedKeywords.slice(0, 3).join(', ')} />
                      </Stack>
                    }
                  />
                ))}
              </Stack>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No {activeFramework.shortName} controls matched keywords from the scope description.
            </Typography>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Add other controls
            </Typography>
            <Autocomplete
              multiple
              options={addableOptions}
              value={manuallyAddedForActive}
              getOptionLabel={(c) => `${c.code}: ${c.name}`}
              onChange={(_e, values) => handleAddableChange(values)}
              renderInput={(params) => (
                <TextField {...params} placeholder={`Browse the full ${activeFramework.shortName} catalog...`} />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...rest } = getTagProps({ index });
                  return <Chip key={key} label={option.code} size="small" {...rest} />;
                })
              }
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={totalSelected === 0} onClick={handleFinalize}>
          Finalize scope{totalSelected > 0 ? ` (${totalSelected})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
