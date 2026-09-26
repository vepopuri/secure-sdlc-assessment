import { useState } from 'react';
import {
  Box,
  Chip,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { frameworks } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { scoreFramework, topGaps } from '../utils/scoring';
import { applyScope, includedControlIdsFor } from '../utils/scope';
import { MaturityBarChart } from '../components/MaturityBarChart';

export function ReportsPage() {
  const { observations, scope, loading } = useAppData();
  const [frameworkIndex, setFrameworkIndex] = useState(0);
  const rawFramework = frameworks[frameworkIndex];
  const framework = applyScope(rawFramework, includedControlIdsFor(scope, rawFramework.id));

  if (loading) return null;

  const score = scoreFramework(framework, observations);
  const gaps = topGaps(framework, observations);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Maturity by function and the highest-priority gaps for each framework.
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

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Maturity by function
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {score.ratedCount} / {score.totalCount} controls rated · average {score.averageRating.toFixed(1)} / 3
        </Typography>
        <MaturityBarChart
          ariaLabel={`Average maturity by function for ${framework.shortName}`}
          data={score.functionScores.map((fs) => ({
            label: `${fs.code} · ${fs.name}`,
            averageRating: fs.averageRating,
            ratedCount: fs.ratedCount,
            totalCount: fs.totalCount,
          }))}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Top gaps
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Controls that are unrated or rated ≤ 1, worst first.
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Function</TableCell>
                <TableCell>Control</TableCell>
                <TableCell align="right">Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gaps.map((gap) => (
                <TableRow key={gap.controlId}>
                  <TableCell>{gap.functionCode}</TableCell>
                  <TableCell>
                    {gap.controlCode}: {gap.controlName}
                  </TableCell>
                  <TableCell align="right">
                    {gap.rating === null ? (
                      <Chip size="small" label="Unrated" />
                    ) : (
                      <Chip size="small" color="warning" label={gap.rating} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {gaps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No gaps. Every control is rated above the threshold.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
