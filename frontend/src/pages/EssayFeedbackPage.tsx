import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputLabel,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { AddCircle as AddCircleIcon } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  EssayResponse,
  Highlight,
  HighlightType,
} from "../../interfaces/interfaces";
import TextHighlighter from "../components/TextHighlighter";
import {
  comentarioRedacaoAPI,
  essayAPI,
  tipoComentarioAPI,
} from "../contexts/api";
import { useAuth } from "../contexts/AuthContext";
import { useStyles } from "../styles/EssayFeedbackStyles";

const EssayFeedbackPage: React.FC = () => {
  const classes = useStyles();
  const { essayId, studentId } = useParams<{
    essayId: string;
    studentId: string;
  }>();
  const history = useHistory();
  const [response, setResponse] = useState<EssayResponse | null>(null);
  const [feedback, setFeedback] = useState("");
  const [highlightTypes, setHighlightTypes] = useState<HighlightType[]>([]);
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false);
  const [newType, setNewType] = useState({ name: "", color: "#000000" });
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [implementationHighlights, setImplementationHighlights] = useState<
    Highlight[]
  >([]);

  useEffect(() => {
    const fetchEssayData = async () => {
      try {
        const result = await essayAPI.getStudentEssayResponse(
          Number(studentId),
          Number(essayId)
        );
        const responseData = result.data[0];
        setResponse(responseData);

        if (responseData.correcao) {
          setFeedback(responseData.correcao.descricao ?? "");
        }

        const commentsResponse = await comentarioRedacaoAPI.getByResposta(
          responseData.id
        );

        const formatHighlight = (comment: any) => ({
          id: String(comment.id),
          start: comment.posicao_inicio,
          end: comment.posicao_fim,
          type: String(comment.tipo_comentario.id),
          comment: comment.texto_comentario,
        });

        const allComments = commentsResponse.data.map(formatHighlight);

        setImplementationHighlights(allComments);

        console.log("Comentários carregados e distribuídos por seção");
      } catch (error) {
        console.error("Error fetching essay data:", error);
      }
    };

    fetchEssayData();
  }, [essayId, studentId]);

  useEffect(() => {
    if (user?.role === "teacher") {
      fetchTiposComentario();
    }
  }, [user]);

  const fetchTiposComentario = async () => {
    try {
      const response = await tipoComentarioAPI.getByProfessor(user!.id);
      const tiposFormatados = response.data.map((tipo: any) => ({
        id: String(tipo.id),
        name: tipo.nome,
        color: tipo.cor,
      }));
      console.log("Tipos formatados:", tiposFormatados);
      setHighlightTypes(tiposFormatados);

      if (tiposFormatados.length === 0) {
        const tiposPadrao = [
          { nome: "Repertório Sociocultural", cor: "#a5d6a7" },
          { nome: "Correção Gramatical", cor: "#ef9a9a" },
          { nome: "Sugestão de Melhoria", cor: "#90caf9" },
        ];

        for (const tipo of tiposPadrao) {
          await tipoComentarioAPI.create({
            nome: tipo.nome,
            cor: tipo.cor,
            id_professor: user!.id,
          });
        }

        const newResponse = await tipoComentarioAPI.getByProfessor(user!.id);
        const newTiposFormatados = newResponse.data.map((tipo: any) => ({
          id: String(tipo.id),
          name: tipo.nome,
          color: tipo.cor,
        }));
        setHighlightTypes(newTiposFormatados);
      }
    } catch (error) {
      console.error("Error fetching tipos comentario:", error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (response?.correcao) {
        await essayAPI.updateEssayCorrection(response.correcao.id, {
          descricao: feedback,
        });
      } else if (response && user) {
        await essayAPI.submitEssayCorrection({
          id_redacao: Number(essayId),
          id_redacao_resposta: response.id,
          descricao: feedback,
          id_professor: user.id,
        });
      }
      alert("Avaliação salva com sucesso!");

      setTimeout(() => {
        history.goBack();
      }, 1000);
    } catch (error) {
      console.error("Error saving feedback:", error);
      alert("Erro ao salvar o feedback. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHighlight = async (highlight: Highlight) => {
    try {
      setIsLoading(true);
      const newComment = await comentarioRedacaoAPI.create({
        id_resposta: response!.id,
        id_tipo_comentario: Number(highlight.type),
        texto_comentario: highlight.comment,
        posicao_inicio: highlight.start,
        posicao_fim: highlight.end,
      });

      const newHighlight = {
        id: String(newComment.data.id),
        start: newComment.data.posicao_inicio,
        end: newComment.data.posicao_fim,
        type: String(newComment.data.id_tipo_comentario),
        comment: newComment.data.texto_comentario,
      };

      setImplementationHighlights((prev) => [...prev, newHighlight]);
    } catch (error) {
      console.error("Error adding highlight:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddType = async () => {
    try {
      setIsLoading(true);
      const response = await tipoComentarioAPI.create({
        nome: newType.name,
        cor: newType.color,
        id_professor: user!.id,
      });

      setHighlightTypes([
        ...highlightTypes,
        {
          id: String(response.data.id),
          name: response.data.nome,
          color: response.data.cor,
        },
      ]);
      setNewType({ name: "", color: "#000000" });
      setIsAddTypeDialogOpen(false);
    } catch (error) {
      console.error("Error creating tipo comentario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!response) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box p={3}>
              <Box className={classes.headerBox}>
                <Typography variant="h5">Avaliação da Redação</Typography>
                {response?.correcao && (
                  <Chip label="Já avaliada" color="primary" size="medium" />
                )}
              </Box>
              <Typography variant="h6" gutterBottom color="primary">
                Processo de Escrita
              </Typography>

              <Box className={classes.contentBox}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Preparação
                </Typography>
                <Typography
                  variant="subtitle2"
                  className={classes.sectionDescription}
                  gutterBottom
                >
                  Coleta de referências e organização das ideias
                </Typography>
                <Box className={classes.textDisplay}>
                  <Typography>
                    {response?.preparation ??
                      "Não há conteúdo para esta etapa."}
                  </Typography>
                </Box>
              </Box>

              <Box className={classes.contentBox}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Incubação
                </Typography>
                <Typography
                  variant="subtitle2"
                  className={classes.sectionDescription}
                  gutterBottom
                >
                  Desenvolvimento inicial das ideias
                </Typography>
                <Box className={classes.textDisplay}>
                  <Typography>
                    {response?.incubation ?? "Não há conteúdo para esta etapa."}
                  </Typography>
                </Box>
              </Box>

              <Box className={classes.contentBox}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Geração
                </Typography>
                <Typography
                  variant="subtitle2"
                  className={classes.sectionDescription}
                  gutterBottom
                >
                  Refinamento e esclarecimento das ideias
                </Typography>
                <Box className={classes.textDisplay}>
                  <Typography>
                    {response?.illumination ??
                      "Não há conteúdo para esta etapa."}
                  </Typography>
                </Box>
              </Box>

              <Divider className={classes.divider} />

              <Box className={classes.implementationSection}>
                <Typography variant="h6" gutterBottom color="primary">
                  Implementação (Texto Final)
                </Typography>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  className={classes.sectionDescription}
                >
                  Versão final da redação para avaliação
                </Typography>
                <Box className={classes.highlighterContainer}>
                  <TextHighlighter
                    text={
                      response?.implementation ??
                      response?.text ??
                      "Não há conteúdo para esta etapa."
                    }
                    highlights={implementationHighlights}
                    highlightTypes={highlightTypes}
                    onAddHighlight={handleAddHighlight}
                    readOnly={!!response?.correcao}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} className={classes.feedbackPaper}>
            <Box>
              <Box className={classes.feedbackHeader}>
                <Typography variant="h6">Feedback</Typography>
                {response?.correcao && (
                  <Chip
                    label="Já avaliado"
                    color="primary"
                    size="small"
                    className={classes.chip}
                  />
                )}
              </Box>
              <TextField
                label="Feedback Geral"
                multiline
                minRows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                disabled={!!response?.correcao}
                InputProps={{
                  readOnly: !!response?.correcao,
                }}
              />
              <Box className={classes.saveButton}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSave}
                  disabled={!!response?.correcao}
                >
                  Salvar Avaliação
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper elevation={3} className={classes.legendPaper}>
            <Box>
              <Box className={classes.legendHeader}>
                <Typography variant="h6">Legenda</Typography>
                <IconButton
                  size="small"
                  onClick={() => setIsAddTypeDialogOpen(true)}
                >
                  <AddCircleIcon />
                </IconButton>
              </Box>
              {highlightTypes?.map((type) => (
                <Box key={type.id} className={classes.legendItem}>
                  <Box
                    className={classes.colorBox}
                    style={{ backgroundColor: type.color }}
                  />
                  <Typography>{type.name}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={isAddTypeDialogOpen}
        onClose={() => setIsAddTypeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Adicionar Novo Tipo</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome do Tipo"
            fullWidth
            margin="normal"
            value={newType.name}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
          />
          <Box mt={2}>
            <InputLabel>Cor</InputLabel>
            <input
              type="color"
              value={newType.color}
              onChange={(e) =>
                setNewType({ ...newType, color: e.target.value })
              }
              className={classes.colorInput}
            />
          </Box>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button onClick={() => setIsAddTypeDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddType}
            color="primary"
            disabled={!newType.name.trim() || isLoading}
          >
            {isLoading ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EssayFeedbackPage;
