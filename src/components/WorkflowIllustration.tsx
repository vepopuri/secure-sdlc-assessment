// A decorative, hand-illustrated banner for the Home hero — three flat-style
// figures (kickoff, interviews, documentation review) linked by routed
// flowchart connectors, in the spirit of a reference workflow illustration.
// Purely decorative: it carries no state and blocks no interaction.
import { Box } from '@mui/material';

function FigureKickoff() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person holding up an engagement kickoff card">
      <ellipse cx="60" cy="163" rx="28" ry="5" fill="#000000" opacity="0.18" />
      <rect x="42" y="110" width="14" height="45" rx="6" fill="#20242B" />
      <rect x="64" y="110" width="14" height="45" rx="6" fill="#20242B" />
      <ellipse cx="49" cy="157" rx="10" ry="6" fill="#111318" />
      <ellipse cx="71" cy="157" rx="10" ry="6" fill="#111318" />
      <rect x="38" y="70" width="44" height="48" rx="14" fill="#8B5CF6" />
      <path d="M42 78 Q20 60 26 34" stroke="#8B5CF6" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M78 78 Q100 60 94 34" stroke="#8B5CF6" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="26" cy="32" r="7" fill="#E8B98A" />
      <circle cx="94" cy="32" r="7" fill="#E8B98A" />
      <rect x="14" y="8" width="92" height="30" rx="5" fill="#00A3E0" />
      <rect x="22" y="16" width="50" height="6" rx="3" fill="#FFFFFF" />
      <rect x="22" y="26" width="70" height="6" rx="3" fill="#FFFFFF" opacity="0.85" />
      <rect x="52" y="58" width="16" height="14" fill="#E8B98A" />
      <circle cx="60" cy="48" r="18" fill="#E8B98A" />
      <path d="M42 42a18 18 0 0 1 36 0c0-6-6-16-18-16s-18 10-18 16z" fill="#3B2A1A" />
    </svg>
  );
}

function FigureInterview() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person reaching toward a stakeholder for an interview">
      <ellipse cx="60" cy="163" rx="28" ry="5" fill="#000000" opacity="0.18" />
      <path d="M46 112 L38 158" stroke="#2952A3" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M70 112 L80 158" stroke="#2952A3" strokeWidth="16" strokeLinecap="round" fill="none" />
      <ellipse cx="37" cy="160" rx="9" ry="6" fill="#111318" />
      <ellipse cx="81" cy="160" rx="9" ry="6" fill="#111318" />
      <rect x="40" y="68" width="40" height="46" rx="14" fill="#C7B6F2" />
      <path d="M76 78 Q100 68 104 48" stroke="#C7B6F2" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="105" cy="45" r="7" fill="#8D5A3C" />
      <path d="M44 80 Q30 90 32 104" stroke="#C7B6F2" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="106" r="7" fill="#8D5A3C" />
      <rect x="24" y="100" width="16" height="18" rx="3" fill="#00A3E0" />
      <rect x="52" y="56" width="16" height="14" fill="#8D5A3C" />
      <circle cx="60" cy="46" r="17" fill="#8D5A3C" />
      <path d="M43 42a17 17 0 0 1 34 0c0-9-8-16-17-16s-17 7-17 16z" fill="#20140C" />
      <path d="M76 44c4 2 8 8 6 16" stroke="#20140C" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="105" cy="45" r="16" fill="none" stroke="#86EB22" strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
    </svg>
  );
}

function FigureDocReview() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person reviewing documentation and checking off a checklist">
      <ellipse cx="60" cy="163" rx="28" ry="5" fill="#000000" opacity="0.18" />
      <path d="M44 112 L38 132 Q60 150 82 132 L76 112 Z" fill="#5B4FBF" />
      <rect x="46" y="132" width="10" height="26" rx="5" fill="#F2C9A0" />
      <rect x="64" y="132" width="10" height="26" rx="5" fill="#F2C9A0" />
      <ellipse cx="51" cy="160" rx="9" ry="6" fill="#00A3E0" />
      <ellipse cx="69" cy="160" rx="9" ry="6" fill="#00A3E0" />
      <rect x="40" y="68" width="40" height="46" rx="14" fill="#E07A3F" />
      <path d="M78 78 Q98 74 100 58" stroke="#E07A3F" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="55" r="7" fill="#F2C9A0" />
      <path d="M42 80 Q30 86 30 100" stroke="#E07A3F" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="102" r="7" fill="#F2C9A0" />
      <rect x="52" y="56" width="16" height="14" fill="#F2C9A0" />
      <circle cx="60" cy="46" r="17" fill="#F2C9A0" />
      <path d="M43 40a17 17 0 0 1 34 0v6c0-10-8-18-17-18s-17 8-17 18z" fill="#1A1A1A" />
      <path d="M43 44l-4 30" stroke="#1A1A1A" strokeWidth="6" strokeLinecap="round" fill="none" />
      <rect x="86" y="36" width="28" height="26" rx="4" fill="#FFFFFF" stroke="#86BC25" strokeWidth="2" />
      <path d="M91 49l4 4 8-9" stroke="#86BC25" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Connectors() {
  return (
    <svg
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <path
        d="M18 45 V25 H50 V15 H83 V38"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle cx="18" cy="45" r="2" fill="#86EB22" opacity="0.7" />
      <circle cx="50" cy="15" r="2" fill="#00A3E0" opacity="0.7" />
      <circle cx="83" cy="38" r="2" fill="#86EB22" opacity="0.7" />
    </svg>
  );
}

export function WorkflowIllustration() {
  return (
    <Box sx={{ position: 'relative', height: { xs: 160, sm: 190 }, mb: 1 }}>
      <Connectors />
      <Box sx={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        <Box sx={{ width: { xs: 78, sm: 100 }, height: { xs: 130, sm: 160 } }}>
          <FigureKickoff />
        </Box>
        <Box sx={{ width: { xs: 78, sm: 100 }, height: { xs: 130, sm: 160 } }}>
          <FigureInterview />
        </Box>
        <Box sx={{ width: { xs: 78, sm: 100 }, height: { xs: 130, sm: 160 } }}>
          <FigureDocReview />
        </Box>
      </Box>
    </Box>
  );
}
