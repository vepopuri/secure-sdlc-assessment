import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Tab,
  Tabs,
  TextField,
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

export function UploadEvidenceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addEvidenceFile, addEvidenceNote } = useAppData();
  const [tab, setTab] = useState<'file' | 'note'>('file');

  // File tab state
  const [file, setFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileKind, setFileKind] = useState<EvidenceKind>('document');
  const [fileTags, setFileTags] = useState<string[]>([]);
  const [fileNotes, setFileNotes] = useState('');

  // Note tab state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteNotes, setNoteNotes] = useState('');

  const [saving, setSaving] = useState(false);

  function resetAndClose() {
    setFile(null);
    setFileTitle('');
    setFileKind('document');
    setFileTags([]);
    setFileNotes('');
    setNoteTitle('');
    setNoteBody('');
    setNoteTags([]);
    setNoteNotes('');
    setTab('file');
    onClose();
  }

  async function handleSaveFile() {
    if (!file || !fileTitle.trim()) return;
    setSaving(true);
    try {
      await addEvidenceFile({ file, title: fileTitle.trim(), kind: fileKind, tags: fileTags, notes: fileNotes });
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

  const canSave = tab === 'file' ? Boolean(file && fileTitle.trim()) : Boolean(noteTitle.trim() && noteBody.trim());

  return (
    <Dialog open={open} onClose={resetAndClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add evidence</DialogTitle>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 3 }}>
        <Tab label="Upload file" value="file" />
        <Tab label="Interview note" value="note" />
      </Tabs>
      <DialogContent>
        {tab === 'file' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Button variant="outlined" component="label">
              {file ? file.name : 'Choose file'}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    if (!fileTitle) setFileTitle(selected.name);
                    setFileKind(guessKindFromMime(selected.type));
                  }
                }}
              />
            </Button>
            <TextField
              label="Title"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              select
              label="Kind"
              value={fileKind}
              onChange={(e) => setFileKind(e.target.value as EvidenceKind)}
              fullWidth
            >
              {FILE_KIND_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
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
        ) : (
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={resetAndClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!canSave || saving}
          onClick={tab === 'file' ? handleSaveFile : handleSaveNote}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
