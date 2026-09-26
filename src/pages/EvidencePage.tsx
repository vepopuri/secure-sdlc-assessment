import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import type { Evidence, EvidenceKind } from '../types';
import { useAppData } from '../context/useAppData';
import { UploadEvidenceDialog } from '../components/evidence/UploadEvidenceDialog';
import { EvidencePreviewDialog } from '../components/evidence/EvidencePreviewDialog';
import { formatBytes } from '../utils/formatBytes';

const KIND_ICONS: Record<EvidenceKind, React.ElementType> = {
  document: DescriptionOutlinedIcon,
  image: ImageOutlinedIcon,
  'interview-note': ChatBubbleOutlineIcon,
  other: InsertDriveFileOutlinedIcon,
};

export function EvidencePage() {
  const { evidence, removeEvidence, loading } = useAppData();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<Evidence | null>(null);

  async function handleDelete(item: Evidence, event: React.MouseEvent) {
    event.stopPropagation();
    if (window.confirm(`Delete evidence "${item.title}"? This cannot be undone.`)) {
      await removeEvidence(item.id);
    }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Evidence Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Documents, interview notes, screenshots, and other artifacts supporting your assessment.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setUploadOpen(true)}>
          Add evidence
        </Button>
      </Stack>

      {!loading && evidence.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No evidence yet. Add a document, image, or interview note to get started.</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {evidence.map((item) => {
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
                    <Icon color="action" fontSize="small" />
                    <Typography variant="subtitle2" sx={{ mt: 1, wordBreak: 'break-word', pr: 3 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(item.addedAt).toLocaleDateString()}
                      {item.sizeBytes ? ` · ${formatBytes(item.sizeBytes)}` : ''}
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
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

      <UploadEvidenceDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <EvidencePreviewDialog evidence={previewItem} onClose={() => setPreviewItem(null)} />
    </Box>
  );
}
