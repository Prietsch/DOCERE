import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  CheckCircle as CheckCircleIcon,
  Grade as GradeIcon,
} from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { essayAPI } from "../contexts/api";

// Interfaces
interface GradeDialogProps {
  open: boolean;
  essay: Essay;
  onClose: () => void;
  onSubmit: (essayId: number, feedback: string) => void;
}

interface Aula {
  id: number;
  moduloId: number;
  ordem: number;
  titulo: string;
  urlVideo: string;
  correcao: string | null;
}

interface Curso {
  id: number;
  descricao: string;
  nome: string;
  professorId: number;
}

interface Professor {
  id: number;
  nome: string;
  email: string;
  senha: string;
}

export interface Essay {
  id: number;
  id_redacao: number;
  descricao: any;
  text: string;
  id_aluno: number;
  feedback?: string;
}

interface EssayResponse {
  aula: Aula;
  correcao: any;
  curso: Curso;
  professor: Professor;
  respostas: Essay[];
}

const GradeDialog: React.FC<GradeDialogProps> = ({
  open,
  essay,
  onClose,
  onSubmit,
}) => {
  const [feedback, setFeedback] = useState("");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Avaliar Redação</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Redação do Aluno:
          </Typography>
          <Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
            {essay.text}
          </Typography>
        </Box>
        <Divider />
        <TextField
          fullWidth
          label="Feedback"
          multiline
          rows={4}
          variant="outlined"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={() => onSubmit(essay.id, feedback)} color="primary">
          Enviar Avaliação
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StudentEssays: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [essayData, setEssayData] = useState<EssayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);

  useEffect(() => {
    fetchEssays();
    // eslint-disable-next-line
  }, [lessonId]);

  const fetchEssays = async () => {
    try {
      const response = await essayAPI.getEssaysByLesson(Number(lessonId));
      let data: EssayResponse = response.data[0];

      const updatedEssays = await Promise.all(
        data.respostas.map(async (essay) => {
          try {
            const correctionResponse = await essayAPI.getEssayCorrection(
              essay.id_redacao
            );
            return { ...essay, ...correctionResponse.data };
          } catch (err) {
            return essay;
          }
        })
      );
      data.respostas = updatedEssays;
      setEssayData(data);
    } catch (error) {
      console.error("Error fetching essays:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (essayId: number, feedback: string) => {
    try {
      if (!selectedEssay) return;
      if (essayData) {
        await essayAPI.submitEssayCorrection({
          id_redacao: selectedEssay?.id_redacao,
          id_redacao_resposta: selectedEssay?.id,
          descricao: feedback,
          id_professor: essayData.professor.id,
        });
        fetchEssays();
      }
    } catch (error) {
      console.error("Error submitting teacher response:", error);
    }
  };

  if (loading) return <CircularProgress />;
  if (!essayData)
    return <Typography variant="h6">Nenhuma redação encontrada.</Typography>;

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Redações dos Alunos - {essayData.aula.titulo}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Curso: {essayData.curso.nome}
      </Typography>
      <Grid container spacing={3}>
        {(essayData.respostas ?? []).map(
          (essay) => (
            console.log(essay),
            (
              <Grid item xs={12} key={essay.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="h6">
                        Aluno {essay.id_aluno}
                      </Typography>
                      {essay.descricao != null ? (
                        <IconButton color="primary" disabled>
                          <CheckCircleIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="primary"
                          onClick={() => setSelectedEssay(essay)}
                        >
                          <GradeIcon />
                        </IconButton>
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      color="textPrimary"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {essay.text}
                    </Typography>
                    {essay.feedback && (
                      <Box mt={2}>
                        <Typography variant="body2" color="textSecondary">
                          Feedback: {essay.feedback}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          )
        )}
      </Grid>
      {selectedEssay && (
        <GradeDialog
          open={!!selectedEssay}
          essay={selectedEssay}
          onClose={() => setSelectedEssay(null)}
          onSubmit={handleGradeSubmit}
        />
      )}
    </Container>
  );
};

export default StudentEssays;
