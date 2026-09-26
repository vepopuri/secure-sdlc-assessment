import { useMemo, useState } from 'react';
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
  Typography,
} from '@mui/material';
import { frameworks } from '../../data/frameworks';
import { useAppData } from '../../context/useAppData';
import { includedControlIdsFor } from '../../utils/scope';
import { suggestControls } from '../../utils/suggest';

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

  const [selected, setSelected] = useState<Set<string>>(() => new Set(suggestions.map((s) => s.controlId)));
  const [lastOpenKey, setLastOpenKey] = useState(false);
  if (open !== lastOpenKey) {
    setLastOpenKey(open);
    if (open) setSelected(new Set(suggestions.map((s) => s.controlId)));
  }

  function toggle(controlId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(controlId)) next.delete(controlId);
      else next.add(controlId);
      return next;
    });
  }

  async function handleApply() {
    const byFramework = new Map<string, string[]>();
    for (const s of suggestions) {
      if (!selected.has(s.controlId)) continue;
      const list = byFramework.get(s.frameworkId) ?? [];
      list.push(s.controlId);
      byFramework.set(s.frameworkId, list);
    }
    await Promise.all(
      Array.from(byFramework.entries()).map(([frameworkId, controlIds]) => {
        const framework = frameworks.find((f) => f.id === frameworkId);
        const allIds = framework ? framework.functions.flatMap((fn) => fn.controls.map((c) => c.id)) : [];
        const existing = includedControlIdsFor(scope, frameworkId) ?? new Set(allIds);
        const merged = new Set(existing);
        for (const id of controlIds) merged.add(id);
        return setScopeIncluded(frameworkId, Array.from(merged));
      }),
    );
    onClose();
  }

  const grouped = useMemo(() => {
    const map = new Map<string, typeof suggestions>();
    for (const s of suggestions) {
      const list = map.get(s.frameworkShortName) ?? [];
      list.push(s);
      map.set(s.frameworkShortName, list);
    }
    return map;
  }, [suggestions]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Suggested controls</DialogTitle>
      <DialogContent>
        {suggestions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No controls matched keywords from the scope document. Try adding more specific terms
            (technologies, processes, or control-related language) to the document.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Based on keywords in your scope document. Review and uncheck anything that doesn&apos;t
              apply, then add the rest to scope.
            </Typography>
            {Array.from(grouped.entries()).map(([shortName, items]) => (
              <Box key={shortName}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {shortName}
                </Typography>
                <Stack sx={{ pl: 1 }}>
                  {items.map((s) => (
                    <FormControlLabel
                      key={s.controlId}
                      control={<Checkbox size="small" checked={selected.has(s.controlId)} onChange={() => toggle(s.controlId)} />}
                      label={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body2">
                            {s.code} — {s.name}
                          </Typography>
                          <Chip size="small" variant="outlined" label={s.matchedKeywords.slice(0, 3).join(', ')} />
                        </Stack>
                      }
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={selected.size === 0} onClick={handleApply}>
          Add {selected.size > 0 ? selected.size : ''} to scope
        </Button>
      </DialogActions>
    </Dialog>
  );
}
