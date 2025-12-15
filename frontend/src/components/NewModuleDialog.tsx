import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@material-ui/core";
import { Add as AddIcon, Delete as DeleteIcon } from "@material-ui/icons";
import React, { useState } from "react";

interface NewModuleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (moduleData: {
    nome: string;
    cursoId: number;
    aulas?: string[];
  }) => void;
  courseId: number;
}

const NewModuleDialog: React.FC<NewModuleDialogProps> = ({
  open,
  onClose,
  onSave,
  courseId,
}) => {
  const [moduleName, setModuleName] = useState("");
  const [lessons, setLessons] = useState<string[]>([]);
  const [newLesson, setNewLesson] = useState("");

  const handleAddLesson = () => {
    if (newLesson.trim()) {
      setLessons([...lessons, newLesson.trim()]);
      setNewLesson("");
    }
  };

  const handleRemoveLesson = (index: number) => {
    const updatedLessons = [...lessons];
    updatedLessons.splice(index, 1);
    setLessons(updatedLessons);
  };

  const handleSave = () => {
    if (!moduleName.trim()) return;

    onSave({
      nome: moduleName.trim(),
      cursoId: courseId,
      aulas: lessons.length > 0 ? lessons : undefined,
    });

    // Reset form
    setModuleName("");
    setLessons([]);
    setNewLesson("");
  };

  const handleClose = () => {
    // Reset form
    setModuleName("");
    setLessons([]);
    setNewLesson("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="form-dialog-title">Novo Módulo</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Preencha os campos abaixo para criar um novo módulo. Você pode
          opcionalmente adicionar aulas a este módulo.
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          id="moduleName"
          label="Nome do Módulo"
          type="text"
          fullWidth
          value={moduleName}
          onChange={(e) => setModuleName(e.target.value)}
          required
        />

        <Box mt={3}>
          <Typography variant="subtitle1">Aulas (opcional)</Typography>
          <Box display="flex" alignItems="center" mt={1}>
            <TextField
              margin="dense"
              id="lessonTitle"
              label="Título da Aula"
              type="text"
              fullWidth
              value={newLesson}
              onChange={(e) => setNewLesson(e.target.value)}
            />
            <IconButton
              color="primary"
              onClick={handleAddLesson}
              disabled={!newLesson.trim()}
            >
              <AddIcon />
            </IconButton>
          </Box>

          {lessons.length > 0 && (
            <Box mt={2} mb={2}>
              <Divider />
              <List dense>
                {lessons.map((lesson, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={lesson}
                      secondary={`Aula ${index + 1}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveLesson(index)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={!moduleName.trim()}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewModuleDialog;
