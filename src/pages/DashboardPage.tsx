import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { frameworks } from '../data/frameworks';
import { useAppData } from '../context/useAppData';
import { scoreFramework, overallAverageRating } from '../utils/scoring';
import { applyScope, includedControlIdsFor } from '../utils/scope';
import { MaturityBarChart } from '../components/MaturityBarChart';

function HeroMotif() {
  // Subtle background circular motif, per Deloitte brand digital guidance —
  // decorative only, low opacity, never competing with the data below it.
  return (
    <Box
      sx={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 220,
        height: 220,
        pointerEvents: 'none',
      }}
      aria-hidden
    >
      <svg viewBox="0 0 200 200" width="220" height="220" opacity={0.5}>
        <circle cx="100" cy="100" r="90" fill="none" stroke="#86BC25" strokeWidth="1.5" opacity={0.35} />
        <circle cx="100" cy="100" r="65" fill="none" stroke="#86EB22" strokeWidth="1.5" opacity={0.3} />
        <circle cx="100" cy="100" r="40" fill="none" stroke="#00A3E0" strokeWidth="1.5" opacity={0.25} />
      </svg>
    </Box>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        height: '100%',
        borderLeft: '3px solid #86BC25',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export function DashboardPage() {
  const { observations, evidence, scope, loading } = useAppData();
  const navigate = useNavigate();

  const scopedFrameworks = frameworks.map((f) => applyScope(f, includedControlIdsFor(scope, f.id)));
  const frameworkScores = scopedFrameworks.map((f) => scoreFramework(f, observations));
  const totalControls = frameworkScores.reduce((sum, fs) => sum + fs.totalCount, 0);
  const totalRated = frameworkScores.reduce((sum, fs) => sum + fs.ratedCount, 0);
  const overall = overallAverageRating(frameworkScores);

  if (loading) return null;

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 3, sm: 4 },
          mb: 3,
          background: 'linear-gradient(180deg, #FAFBF7 0%, #FFFFFF 100%)',
        }}
      >
        <HeroMotif />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, maxWidth: 640 }}>
          Secure SDLC Assessment
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mb: 2 }}>
          Track control maturity across OWASP SAMM, NIST CSF, and NIST SSDF on one normalized
          0&ndash;3 scale, backed by evidence you collect along the way.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/assessment')}>
            Continue assessment
          </Button>
          <Button variant="outlined" onClick={() => navigate('/scope')}>
            Define scope
          </Button>
        </Stack>
      </Paper>

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
        {scopedFrameworks.map((framework, index) => {
          const score = frameworkScores[index];
          return (
            <Grid key={framework.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {framework.shortName} {framework.version}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {score.ratedCount} / {score.totalCount} controls rated · avg {score.averageRating.toFixed(1)} / 3
                </Typography>
                {score.totalCount === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No controls in scope. Add some on the Scope page.
                  </Typography>
                ) : (
                  <MaturityBarChart
                    ariaLabel={`Average maturity by function for ${framework.shortName}`}
                    data={score.functionScores.map((fs) => ({
                      label: fs.code,
                      averageRating: fs.averageRating,
                      ratedCount: fs.ratedCount,
                      totalCount: fs.totalCount,
                    }))}
                  />
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
