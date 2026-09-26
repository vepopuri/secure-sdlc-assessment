// A decorative, hand-illustrated banner for the Home hero — one flat-style
// figure per engagement stage (all 8), each boxed in its own card, paired
// with a small cluster of supporting icon badges, and linked by a routed
// flowchart connector, in the spirit of a reference workflow illustration.
// Purely decorative: it carries no state and blocks no interaction.
import { Box, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import HandshakeIcon from '@mui/icons-material/Handshake';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import TuneIcon from '@mui/icons-material/Tune';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import SearchIcon from '@mui/icons-material/Search';
import ForumIcon from '@mui/icons-material/Forum';
import MicIcon from '@mui/icons-material/Mic';
import VerifiedIcon from '@mui/icons-material/Verified';
import GppGoodIcon from '@mui/icons-material/GppGood';
import SummarizeIcon from '@mui/icons-material/Summarize';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/** Shared body parts so every figure reads as one consistent illustration style. */
function Head({ skin, hair }: { skin: string; hair: string }) {
  return (
    <>
      <rect x="52" y="56" width="16" height="14" fill={skin} />
      <circle cx="60" cy="46" r="17" fill={skin} />
      <path d="M43 42a17 17 0 0 1 34 0c0-9-8-16-17-16s-17 7-17 16z" fill={hair} />
    </>
  );
}

function Legs({ color, shoe }: { color: string; shoe: string }) {
  return (
    <>
      <rect x="42" y="112" width="14" height="42" rx="6" fill={color} />
      <rect x="64" y="112" width="14" height="42" rx="6" fill={color} />
      <ellipse cx="49" cy="157" rx="10" ry="6" fill={shoe} />
      <ellipse cx="71" cy="157" rx="10" ry="6" fill={shoe} />
    </>
  );
}

function Ground() {
  return <ellipse cx="60" cy="163" rx="28" ry="5" fill="#000000" opacity="0.18" />;
}

function FigureKickoff() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person holding up an engagement kickoff card">
      <Ground />
      <Legs color="#20242B" shoe="#111318" />
      <rect x="38" y="70" width="44" height="48" rx="14" fill="#8B5CF6" />
      <path d="M42 78 Q20 60 26 34" stroke="#8B5CF6" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M78 78 Q100 60 94 34" stroke="#8B5CF6" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="26" cy="32" r="7" fill="#E8B98A" />
      <circle cx="94" cy="32" r="7" fill="#E8B98A" />
      <rect x="14" y="8" width="92" height="30" rx="5" fill="#00A3E0" />
      <rect x="22" y="16" width="50" height="6" rx="3" fill="#FFFFFF" />
      <rect x="22" y="26" width="70" height="6" rx="3" fill="#FFFFFF" opacity="0.85" />
      <Head skin="#E8B98A" hair="#3B2A1A" />
    </svg>
  );
}

function FigureScope() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person holding a clipboard of finalized scope items">
      <Ground />
      <Legs color="#1B2A4A" shoe="#0E1626" />
      <rect x="38" y="70" width="44" height="48" rx="14" fill="#1F9E89" />
      <path d="M40 82 Q26 92 30 112" stroke="#1F9E89" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M80 82 Q94 92 90 112" stroke="#1F9E89" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="114" r="7" fill="#D9A066" />
      <circle cx="90" cy="114" r="7" fill="#D9A066" />
      <rect x="30" y="92" width="60" height="42" rx="4" fill="#FFFFFF" stroke="#86BC25" strokeWidth="2" />
      <rect x="48" y="86" width="24" height="10" rx="3" fill="#86BC25" />
      <path d="M37 104l3 3 6-7" stroke="#86BC25" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="48" y="100" width="34" height="4" rx="2" fill="#282728" opacity="0.5" />
      <path d="M37 116l3 3 6-7" stroke="#86BC25" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="48" y="112" width="34" height="4" rx="2" fill="#282728" opacity="0.5" />
      <Head skin="#D9A066" hair="#1A1210" />
    </svg>
  );
}

function FigureCollection() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person scheduling meetings and collecting documents">
      <Ground />
      <Legs color="#4B3621" shoe="#20140C" />
      <rect x="38" y="70" width="44" height="48" rx="14" fill="#D9A521" />
      <path d="M78 78 Q98 66 98 44" stroke="#D9A521" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="98" cy="42" r="7" fill="#8D5A3C" />
      <path d="M42 82 Q28 90 28 106" stroke="#D9A521" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="108" r="7" fill="#8D5A3C" />
      <rect x="82" y="18" width="34" height="30" rx="3" fill="#FFFFFF" stroke="#00A3E0" strokeWidth="2" />
      <rect x="82" y="18" width="34" height="9" fill="#00A3E0" />
      <line x1="90" y1="14" x2="90" y2="22" stroke="#00A3E0" strokeWidth="2" strokeLinecap="round" />
      <line x1="108" y1="14" x2="108" y2="22" stroke="#00A3E0" strokeWidth="2" strokeLinecap="round" />
      <rect x="88" y="31" width="6" height="6" fill="#00A3E0" opacity="0.5" />
      <rect x="98" y="31" width="6" height="6" fill="#00A3E0" opacity="0.5" />
      <rect x="108" y="31" width="6" height="6" fill="#86BC25" />
      <path d="M14 98h20l4 6h18a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3v-22a3 3 0 0 1 3-3z" fill="#E07A3F" />
      <Head skin="#8D5A3C" hair="#150F0B" />
    </svg>
  );
}

function FigureDocReview() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person reviewing documentation and checking off a checklist">
      <Ground />
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
      <Head skin="#F2C9A0" hair="#1A1A1A" />
      <path d="M43 44l-4 30" stroke="#1A1A1A" strokeWidth="6" strokeLinecap="round" fill="none" />
      <rect x="86" y="36" width="28" height="26" rx="4" fill="#FFFFFF" stroke="#86BC25" strokeWidth="2" />
      <path d="M91 49l4 4 8-9" stroke="#86BC25" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FigureInterview() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person reaching toward a stakeholder for an interview">
      <Ground />
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
      <Head skin="#8D5A3C" hair="#20140C" />
      <path d="M76 44c4 2 8 8 6 16" stroke="#20140C" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="105" cy="45" r="16" fill="none" stroke="#86EB22" strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
    </svg>
  );
}

function FigureValidate() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person validating results with a verified shield">
      <Ground />
      <Legs color="#20242B" shoe="#111318" />
      <rect x="38" y="70" width="44" height="48" rx="14" fill="#3B6E8F" />
      <path d="M40 82 Q28 96 34 112" stroke="#3B6E8F" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M80 82 Q92 96 86 112" stroke="#3B6E8F" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="35" cy="114" r="7" fill="#E8B98A" />
      <circle cx="85" cy="114" r="7" fill="#E8B98A" />
      <path d="M60 84 L80 92 V108 Q80 122 60 130 Q40 122 40 108 V92 Z" fill="#FFFFFF" stroke="#86BC25" strokeWidth="2" />
      <path d="M50 106l7 7 13-15" stroke="#86BC25" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Head skin="#E8B98A" hair="#2A1F14" />
    </svg>
  );
}

function FigureReport() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person presenting a summarized findings report">
      <Ground />
      <Legs color="#2B2B2B" shoe="#111318" />
      <rect x="38" y="70" width="44" height="48" rx="14" fill="#E0574F" />
      <path d="M78 78 Q98 68 100 48" stroke="#E0574F" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="101" cy="45" r="7" fill="#C48A5A" />
      <path d="M42 82 Q30 96 34 112" stroke="#E0574F" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="114" r="7" fill="#C48A5A" />
      <rect x="76" y="18" width="34" height="30" rx="3" fill="#FFFFFF" stroke="#00A3E0" strokeWidth="2" />
      <rect x="82" y="38" width="5" height="6" fill="#00A3E0" />
      <rect x="90" y="32" width="5" height="12" fill="#86BC25" />
      <rect x="98" y="26" width="5" height="18" fill="#00A3E0" />
      <rect x="82" y="22" width="21" height="4" rx="2" fill="#282728" opacity="0.4" />
      <Head skin="#C48A5A" hair="#171310" />
    </svg>
  );
}

function FigureFinalize() {
  return (
    <svg viewBox="0 0 120 170" width="100%" height="100%" role="img" aria-label="Person celebrating the finalized engagement with a trophy">
      <Ground />
      <Legs color="#243B2C" shoe="#111318" />
      <rect x="38" y="70" width="44" height="48" rx="14" fill="#4B7F3D" />
      <path d="M42 78 Q22 62 26 38" stroke="#4B7F3D" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M78 78 Q98 62 94 38" stroke="#4B7F3D" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="26" cy="36" r="7" fill="#F2C9A0" />
      <circle cx="94" cy="36" r="7" fill="#F2C9A0" />
      <path d="M48 12h24v14a12 12 0 0 1-24 0z" fill="#00A3E0" />
      <path d="M48 16h-8a6 6 0 0 0 6 10" fill="none" stroke="#00A3E0" strokeWidth="4" />
      <path d="M72 16h8a6 6 0 0 1-6 10" fill="none" stroke="#00A3E0" strokeWidth="4" />
      <rect x="56" y="26" width="8" height="8" fill="#00A3E0" />
      <path d="M52 34h16l2 8H50z" fill="#86BC25" />
      <Head skin="#F2C9A0" hair="#B98A3A" />
    </svg>
  );
}

interface StepVisual {
  key: string;
  label: string;
  Figure: () => React.JSX.Element;
  icons: [SvgIconComponent, SvgIconComponent];
  iconColors: [string, string];
}

const STEP_VISUALS: StepVisual[] = [
  { key: 'kickoff', label: 'Kickoff', Figure: FigureKickoff, icons: [HandshakeIcon, EventAvailableIcon], iconColors: ['#86EB22', '#00A3E0'] },
  { key: 'scope', label: 'Scope Finalization', Figure: FigureScope, icons: [FactCheckIcon, TuneIcon], iconColors: ['#00A3E0', '#86EB22'] },
  { key: 'collection', label: 'Document Collection & Meeting Scheduling', Figure: FigureCollection, icons: [CalendarMonthIcon, FolderIcon], iconColors: ['#86EB22', '#00A3E0'] },
  { key: 'docreview', label: 'Documentation Review', Figure: FigureDocReview, icons: [ArticleIcon, SearchIcon], iconColors: ['#00A3E0', '#86EB22'] },
  { key: 'interview', label: 'Interviews', Figure: FigureInterview, icons: [ForumIcon, MicIcon], iconColors: ['#86EB22', '#00A3E0'] },
  { key: 'validate', label: 'Process Data & Validate', Figure: FigureValidate, icons: [VerifiedIcon, GppGoodIcon], iconColors: ['#00A3E0', '#86EB22'] },
  { key: 'report', label: 'Prepare Report', Figure: FigureReport, icons: [SummarizeIcon, InsertChartIcon], iconColors: ['#86EB22', '#00A3E0'] },
  { key: 'finalize', label: 'Review & Finalize', Figure: FigureFinalize, icons: [EmojiEventsIcon, CheckCircleIcon], iconColors: ['#00A3E0', '#86EB22'] },
];

const COL_WIDTH = 118;

function Connectors() {
  const n = STEP_VISUALS.length;
  const points = STEP_VISUALS.map((_, i) => {
    const x = 4 + (i * 92) / (n - 1);
    const y = i % 2 === 0 ? 48 : 18;
    return { x, y };
  });
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  return (
    <svg
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <path d={d} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="3 3" />
      {points.map((p, i) => (
        <circle key={STEP_VISUALS[i].key} cx={p.x} cy={p.y} r="1.6" fill={i % 2 === 0 ? '#86EB22' : '#00A3E0'} opacity="0.8" />
      ))}
    </svg>
  );
}

/** A small badge cluster of two supporting icons floating beside a figure — reinforces each stage with more than one visual cue. */
function IconBadges({ icons, colors }: { icons: [SvgIconComponent, SvgIconComponent]; colors: [string, string] }) {
  const [IconA, IconB] = icons;
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: -4,
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: colors[0],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
        }}
      >
        <IconA sx={{ fontSize: 13, color: '#FFFFFF' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: -6,
          width: 20,
          height: 20,
          borderRadius: '50%',
          bgcolor: colors[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
        }}
      >
        <IconB sx={{ fontSize: 12, color: '#FFFFFF' }} />
      </Box>
    </>
  );
}

export function WorkflowIllustration() {
  return (
    <Box sx={{ position: 'relative', mb: 1, textAlign: 'center' }}>
      <Box
        sx={{
          position: 'relative',
          height: { xs: 250, sm: 268 },
          overflowX: { xs: 'auto', md: 'visible' },
          overflowY: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: { xs: 148, sm: 166 } }}>
          <Connectors />
        </Box>
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            justifyContent: { xs: 'flex-start', md: 'space-between' },
            alignItems: 'flex-start',
            minWidth: { xs: STEP_VISUALS.length * COL_WIDTH, md: 0 },
            px: 1,
          }}
        >
          {STEP_VISUALS.map(({ key, label, Figure, icons, iconColors }) => (
            <Box key={key} sx={{ width: COL_WIDTH, flexShrink: 0, textAlign: 'center', px: 0.75 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 148, sm: 166 },
                  mx: 'auto',
                  bgcolor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                }}
              >
                <Box sx={{ position: 'relative', width: '100%', height: '100%', p: 1 }}>
                  <Figure />
                </Box>
                <IconBadges icons={icons} colors={iconColors} />
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, display: 'block', lineHeight: 1.25, mt: 1 }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
