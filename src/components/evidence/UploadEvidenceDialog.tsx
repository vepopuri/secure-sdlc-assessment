import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import type { EvidenceKind } from '../../types';
import { useAppData } from '../../context/useAppData';

function guessKindFromMime(mimeType: string): EvidenceKind {
  if (mimeType.startsWith('image/')) return 'image';
  if (
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/') ||
    mimeType.includes('word') ||
    mimeType.includes('document')
  ) {
    return 'document';
  }
  return 'other';
}

const FILE_KIND_OPTIONS: { value: EvidenceKind; label: string }[] = [
  { value: 'document', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'other', label: 'Other' },
];

type UploadTab = 'file' | 'note' | 'general';

export function UploadEvidenceDialog({
  open,
  onClose,
  initialTab = 'file',
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: UploadTab;
}) {
  const { addEvidenceFile, addEvidenceNote, addEvidenceGeneralNote } = useAppData();
  const [tab, setTab] = useState<UploadTab>(initialTab);
  const [lastOpenKey, setLastOpenKey] = useState(false);
  // Reset to the requested tab each time the dialog is (re)opened.
  if (open !== lastOpenKey) {
    setLastOpenKey(open);
    if (open) setTab(initialTab);
  }

  // File tab state — supports selecting multiple files at once.
  const [files, setFiles] = useState<File[]>([]);
  const [fileTitle, setFileTitle] = useState('');
  const [fileKind, setFileKind] = useState<EvidenceKind>('document');
  const [fileTags, setFileTags] = useState<string[]>([]);
  const [fileNotes, setFileNotes] = useState('');

  // Meeting notes tab state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteNotes, setNoteNotes] = useState('');

  // Additional notes tab state
  const [generalTitle, setGeneralTitle] = useState('');
  const [generalBody, setGeneralBody] = useState('');
  const [generalTags, setGeneralTags] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);

  function resetAndClose() {
    setFiles([]);
    setFileTitle('');
    setFileKind('document');
    setFileTags([]);
    setFileNotes('');
    setNoteTitle('');
    setNoteBody('');
    setNoteTags([]);
    setNoteNotes('');
    setGeneralTitle('');
    setGeneralBody('');
    setGeneralTags([]);
    onClose();
  }

  function handleFilesSelected(selected: File[]) {
    setFiles(selected);
    if (selected.length === 1) {
      setFileTitle(selected[0].name);
      setFileKind(guessKindFromMime(selected[0].type));
    }
  }

  function removeFileAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSaveFile() {
    if (files.length === 0) return;
    setSaving(true);
    try {
      if (files.length === 1) {
        await addEvidenceFile({
          file: files[0],
          title: fileTitle.trim() || files[0].name,
          kind: fileKind,
          tags: fileTags,
          notes: fileNotes,
        });
      } else {
        // Each file becomes its own evidence item, named after the file itself;
        // the shared tags/notes apply to all of them.
        await Promise.all(
          files.map((f) =>
            addEvidenceFile({
              file: f,
              title: f.name,
              kind: guessKindFromMime(f.type),
              tags: fileTags,
              notes: fileNotes,
            }),
          ),
        );
      }
      resetAndClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote() {
    if (!noteTitle.trim() || !noteBody.trim()) return;
    setSaving(true);
    try {
      await addEvidenceNote({ title: noteTitle.trim(), body: noteBody.trim(), tags: noteTags, notes: noteNotes });
      resetAndClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveGeneral() {
    if (!generalTitle.trim() || !generalBody.trim()) return;
    setSaving(true);
    try {
      await addEvidenceGeneralNote({ title: generalTitle.trim(), body: generalBody.trim(), tags: generalTags });
      resetAndClose();
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    tab === 'file'
      ? files.length > 0 && (files.length > 1 || Boolean(fileTitle.trim()))
      : tab === 'note'
        ? Boolean(noteTitle.trim() && noteBody.trim())
        : Boolean(generalTitle.trim() && generalBody.trim());

  const handleSave = tab === 'file' ? handleSaveFile : tab === 'note' ? handleSaveNote : handleSaveGeneral;

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add evidence</DialogTitle>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 3 }}>
        <Tab label="Documentation" value="file" />
        <Tab label="Meeting notes" value="note" />
        <Tab label="Additional notes" value="general" />
      </Tabs>
      <DialogContent>
        {tab === 'file' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Button variant="outlined" component="label">
              {files.length === 0 ? 'Choose file(s)' : `${files.length} file${files.length > 1 ? 's' : ''} selected`}
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => handleFilesSelected(Array.from(e.target.files ?? []))}
              />
            </Button>

            {files.length > 1 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  Each file will be added as its own evidence item, named after the file.
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {files.map((f, index) => (
                    <Chip key={`${f.name}-${index}`} label={f.name} size="small" onDelete={() => removeFileAt(index)} />
                  ))}
                </Stack>
              </Box>
            )}

            {files.length <= 1 && (
              <>
                <TextField
                  label="Title"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  fullWidth
                  required
                  disabled={files.length === 0}
                />
                <TextField
                  select
                  label="Kind"
                  value={fileKind}
                  onChange={(e) => setFileKind(e.target.value as EvidenceKind)}
                  fullWidth
                  disabled={files.length === 0}
                >
                  {FILE_KIND_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={fileTags}
              onChange={(_e, value) => setFileTags(value as string[])}
              renderInput={(params) => <TextField {...params} label="Tags" placeholder="Press enter to add" />}
            />
            <TextField
              label="Notes"
              value={fileNotes}
              onChange={(e) => setFileNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>
        ) : null}
        {tab === 'note' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Note body"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              fullWidth
              multiline
              minRows={5}
              required
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={noteTags}
              onChange={(_e, value) => setNoteTags(value as string[])}
              renderInput={(params) => <TextField {...params} label="Tags" placeholder="Press enter to add" />}
            />
            <TextField
              label="Notes"
              value={noteNotes}
              onChange={(e) => setNoteNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Box>
        )}
        {tab === 'general' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={generalTitle}
              onChange={(e) => setGeneralTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Note"
              value={generalBody}
              onChange={(e) => setGeneralBody(e.target.value)}
              fullWidth
              multiline
              minRows={5}
              required
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={generalTags}
              onChange={(_e, value) => setGeneralTags(value as string[])}
              renderInput={(params) => <TextField {...params} label="Tags" placeholder="Press enter to add" />}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={resetAndClose}>Cancel</Button>
        <Button variant="contained" disabled={!canSave || saving} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
