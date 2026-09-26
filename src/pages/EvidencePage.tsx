import { useState } from 'react';
import { Box, Button, Card, CardActionArea, CardContent, Chip, Grid, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GroupsIcon from '@mui/icons-material/Groups';
import type { Evidence, EvidenceKind } from '../types';
import { useAppData } from '../context/useAppData';
import { UploadEvidenceDialog } from '../components/evidence/UploadEvidenceDialog';
import { EvidencePreviewDialog } from '../components/evidence/EvidencePreviewDialog';
import { formatBytes } from '../utils/formatBytes';

const KIND_ICONS: Record<EvidenceKind, React.ElementType> = {
  document: DescriptionOutlinedIcon,
  image: ImageOutlinedIcon,
  'interview-note': ChatBubbleOutlineIcon,
  'general-note': NoteAltOutlinedIcon,
  other: InsertDriveFileOutlinedIcon,
};

const KIND_LABELS: Record<EvidenceKind, string> = {
  document: 'Document',
  image: 'Image',
  'interview-note': 'Meeting note',
  'general-note': 'Additional note',
  other: 'Other',
};

interface SectionDef {
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  uploadTab: 'file' | 'note' | 'general';
  matches: (kind: EvidenceKind) => boolean;
}

const SECTIONS: SectionDef[] = [
  {
    key: 'documentation',
    title: 'Documentation upload',
    description: 'Policies, standards, architecture diagrams, screenshots, and other supporting files.',
    icon: UploadFileIcon,
    color: '#00A3E0',
    uploadTab: 'file',
    matches: (kind) => kind === 'document' || kind === 'image' || kind === 'other',
  },
  {
    key: 'meeting-notes',
    title: 'Meeting notes upload',
    description: 'Notes captured during stakeholder interviews and working sessions.',
    icon: GroupsIcon,
    color: '#86BC25',
    uploadTab: 'note',
    matches: (kind) => kind === 'interview-note',
  },
  {
    key: 'additional-notes',
    title: 'Additional notes upload',
    description: 'Any other observation worth recording that isn’t tied to a specific meeting.',
    icon: NoteAltOutlinedIcon,
    color: '#00A3E0',
    uploadTab: 'general',
    matches: (kind) => kind === 'general-note',
  },
];

function serialLabel(n: number): string {
  return `REF-${String(n).padStart(3, '0')}`;
}

export function EvidencePage() {
  const { evidence, removeEvidence, loading } = useAppData();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'note' | 'general'>('file');
  const [previewItem, setPreviewItem] = useState<Evidence | null>(null);

  const serials = new Map<string, number>();
  [...evidence]
    .sort((a, b) => a.addedAt.localeCompare(b.addedAt))
    .forEach((item, i) => serials.set(item.id, i + 1));

  function openUpload(tab: 'file' | 'note' | 'general') {
    setUploadTab(tab);
    setUploadOpen(true);
  }

  async function handleDelete(item: Evidence, event: React.MouseEvent) {
    event.stopPropagation();
    if (window.confirm(`Delete evidence "${item.title}"? This cannot be undone.`)) {
      await removeEvidence(item.id);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Evidence Library
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Every document, meeting note, and additional observation collected for this engagement, each with its own
        reference number for traceability in the final report.
      </Typography>

      {SECTIONS.map((section) => {
        const items = evidence.filter((item) => section.matches(item.kind));
        return (
          <Box key={section.key} sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" rowGap={1} sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: '#282728',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <section.icon sx={{ color: section.color, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {section.title} <Typography component="span" variant="body2" color="text.secondary">({items.length})</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.description}
                  </Typography>
                </Box>
              </Stack>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => openUpload(section.uploadTab)}>
                Add
              </Button>
            </Stack>

            {!loading && items.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'background.paper', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nothing here yet.
                </Typography>
              </Box>
            )}

            <Grid container spacing={2}>
              {items.map((item) => {
                const Icon = KIND_ICONS[item.kind];
                return (
                  <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card variant="outlined" sx={{ height: '100%', position: 'relative' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDelete(item, e)}
                        aria-label={`Delete ${item.title}`}
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                      <CardActionArea onClick={() => setPreviewItem(item)} sx={{ height: '100%' }}>
                        <CardContent>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: 1,
                                bgcolor: `${section.color}1A`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon sx={{ fontSize: 15, color: section.color }} />
                            </Box>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={serialLabel(serials.get(item.id) ?? 0)}
                              sx={{ fontFamily: 'monospace', fontSize: 11 }}
                            />
                          </Stack>
                          <Typography variant="subtitle2" sx={{ wordBreak: 'break-word', pr: 3 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            {KIND_LABELS[item.kind]} · {new Date(item.addedAt).toLocaleDateString()}
                            {item.sizeBytes ? ` · ${formatBytes(item.sizeBytes)}` : ''}
                          </Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                            {item.tags.slice(0, 3).map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}

      <UploadEvidenceDialog open={uploadOpen} onClose={() => setUploadOpen(false)} initialTab={uploadTab} />
      <EvidencePreviewDialog evidence={previewItem} onClose={() => setPreviewItem(null)} />
    </Box>
  );
}
