import { Box, Grid, Paper, Typography } from '@mui/material';
import { frameworks } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { scoreFramework, overallAverageRating } from '../utils/scoring';
import { MaturityBarChart } from '../components/MaturityBarChart';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 600, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export function DashboardPage() {
  const { observations, evidence, loading } = useAppData();

  const frameworkScores = frameworks.map((f) => scoreFramework(f, observations));
  const totalControls = frameworkScores.reduce((sum, fs) => sum + fs.totalCount, 0);
  const totalRated = frameworkScores.reduce((sum, fs) => sum + fs.ratedCount, 0);
  const overall = overallAverageRating(frameworkScores);

  if (loading) return null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Frameworks" value={String(frameworks.length)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Controls assessed" value={`${totalRated} / ${totalControls}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Evidence items" value={String(evidence.length)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatTile label="Overall avg. maturity" value={`${overall.toFixed(1)} / 3`} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {frameworks.map((framework, index) => {
          const score = frameworkScores[index];
          return (
            <Grid key={framework.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {framework.shortName} {framework.version}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {score.ratedCount} / {score.totalCount} controls rated · avg {score.averageRating.toFixed(1)} / 3
                </Typography>
                <MaturityBarChart
                  ariaLabel={`Average maturity by function for ${framework.shortName}`}
                  data={score.functionScores.map((fs) => ({
                    label: fs.code,
                    averageRating: fs.averageRating,
                    ratedCount: fs.ratedCount,
                    totalCount: fs.totalCount,
                  }))}
                />
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
