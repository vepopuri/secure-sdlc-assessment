import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import type { Evidence } from '../../types';
import { useAppData } from '../../context/useAppData';

export function EvidencePreviewDialog({ evidence, onClose }: { evidence: Evidence | null; onClose: () => void }) {
  const { getEvidenceObjectUrl } = useAppData();
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!evidence?.hasBlob) return;
    let url: string | undefined;
    let cancelled = false;
    getEvidenceObjectUrl(evidence.id).then((u) => {
      if (cancelled) return;
      url = u;
      setObjectUrl(u);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [evidence, getEvidenceObjectUrl]);

  if (!evidence) return null;

  return (
    <Dialog open={Boolean(evidence)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{evidence.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip size="small" label={evidence.kind} />
            {evidence.tags.map((tag) => (
              <Chip key={tag} size="small" variant="outlined" label={tag} />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Added {new Date(evidence.addedAt).toLocaleString()}
          </Typography>

          {evidence.kind === 'interview-note' ? (
            <Box sx={{ whiteSpace: 'pre-wrap', bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
              <Typography variant="body2">{evidence.noteBody}</Typography>
            </Box>
          ) : evidence.kind === 'image' && objectUrl ? (
            <Box
              component="img"
              src={objectUrl}
              alt={evidence.title}
              sx={{ maxWidth: '100%', maxHeight: 360, borderRadius: 1, display: 'block', mx: 'auto' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {evidence.fileName} ({evidence.mimeType}): preview not available for this file type.
            </Typography>
          )}

          {evidence.notes && (
            <Box>
              <Typography variant="subtitle2">Notes</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {evidence.notes}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {evidence.hasBlob && objectUrl && (
          <Button
            startIcon={<DownloadIcon />}
            href={objectUrl}
            download={evidence.fileName}
            component="a"
          >
            Download
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
