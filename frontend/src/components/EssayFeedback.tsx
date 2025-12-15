import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";
import { Essay, Resposta } from "../pages/CourseEdit";

interface EssayFeedbackProps {
  essay: Essay;
  response: Resposta;
  open: boolean;
  onClose: () => void;
  onSave: (essay: Essay) => void;
  studentName: string;
}

const EssayFeedback: React.FC<EssayFeedbackProps> = ({
  essay,
  response,
  open,
  onClose,
  onSave,
  studentName,
}) => {
  const [feedback, setFeedback] = useState(response.feedback || "");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Avaliação de Redação</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Aluno: {studentName}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Redação do Aluno:
          </Typography>
          <Box
            p={2}
            border={1}
            borderColor="grey.300"
            borderRadius={1}
            bgcolor="#f5f5f5"
          >
            <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
              {response.text}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Avaliação:
          </Typography>

          <TextField
            label="Feedback"
            variant="outlined"
            fullWidth
            multiline
            rows={6}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="default">
          Cancelar
        </Button>
        <Button
          onClick={() => {}}
          color="primary"
          variant="contained"
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar Avaliação"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EssayFeedback;
