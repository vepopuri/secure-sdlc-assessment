import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { frameworks, allControlIds } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { includedControlIdsFor } from '../utils/scope';

export function ScopePage() {
  const { scope, setScopeIncluded } = useAppData();
  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const framework = frameworks[frameworkIndex];

  const allIds = allControlIds(framework);
  const includedSet = includedControlIdsFor(scope, framework.id) ?? new Set(allIds);

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
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Assessment Scope
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Choose which controls apply to this engagement. Every control is in scope by default —
        deselect anything that doesn&apos;t apply, and add controls back from the overall framework
        catalog at any time. Only in-scope controls appear in the Assessment Workspace, Dashboard,
        and Reports.
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

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {includedSet.size} / {allIds.length} controls in scope
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={selectAll}>
            Select all
          </Button>
          <Button size="small" onClick={clearAll}>
            Clear all
          </Button>
        </Stack>
      </Stack>

      <Paper variant="outlined">
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
      </Paper>
    </Box>
  );
}
