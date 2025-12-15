import {
  Box,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  EssayResponse,
  Highlight,
  HighlightType,
} from "../../interfaces/interfaces";
import TextHighlighter from "../components/TextHighlighter";
import { comentarioRedacaoAPI, essayAPI } from "../contexts/api";
import { useStyles } from "../styles/EssayViewStyles";

const defaultHighlightTypes: HighlightType[] = [
  { id: "repertorio", name: "Repertório Sociocultural", color: "#a5d6a7" },
  { id: "gramatica", name: "Correção Gramatical", color: "#ef9a9a" },
  { id: "sugestao", name: "Sugestão de Melhoria", color: "#90caf9" },
];

const EssayViewPage: React.FC = () => {
  const classes = useStyles();
  const { essayId } = useParams<{ essayId: string }>();
  const [essay, setEssay] = useState<EssayResponse | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightTypes, setHighlightTypes] = useState<HighlightType[]>([]);
  useEffect(() => {
    const fetchEssayWithComments = async () => {
      try {
        // First, try to get essay data
        const essayResponse = await essayAPI.getEssayCorrection(
          Number(essayId)
        );
        if (essayResponse && essayResponse.data) {
          setEssay(essayResponse.data);
        }

        // Then fetch comments separately to avoid failing everything if comments fail
        try {
          const commentsResponse = await comentarioRedacaoAPI.getByResposta(
            Number(essayId)
          );

          if (
            commentsResponse &&
            commentsResponse.data &&
            Array.isArray(commentsResponse.data)
          ) {
            // Mapeamento correto dos comentários
            const commentHighlights = commentsResponse.data.map(
              (comment: any) => ({
                id: String(comment.id),
                start: comment.posicao_inicio,
                end: comment.posicao_fim,
                type: String(comment.tipo_comentario?.id || ""),
                comment: comment.texto_comentario || "",
              })
            );

            // Extrair tipos únicos dos comentários
            const types = commentsResponse.data.reduce(
              (acc: HighlightType[], comment: any) => {
                if (!comment.tipo_comentario) return acc;

                const exists = acc.some(
                  (type) => type.id === String(comment.tipo_comentario.id)
                );
                if (!exists) {
                  acc.push({
                    id: String(comment.tipo_comentario.id),
                    name: comment.tipo_comentario.nome || "",
                    color: comment.tipo_comentario.cor || "#000000",
                  });
                }
                return acc;
              },
              []
            );

            setHighlightTypes(types.length > 0 ? types : defaultHighlightTypes);
            setHighlights(commentHighlights);
          }
        } catch (commentError) {
          console.error("Error fetching comments:", commentError);
          // Use default highlight types if comments failed
          setHighlightTypes(defaultHighlightTypes);
        }
      } catch (error) {
        console.error("Error fetching essay:", error);
      }
    };

    fetchEssayWithComments();
  }, [essayId]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEssayWithComments = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, try to get essay data
        const essayResponse = await essayAPI.getEssayCorrection(
          Number(essayId)
        );
        if (essayResponse && essayResponse.data) {
          setEssay(essayResponse.data);
        } else {
          setError("Não foi possível carregar a redação");
        }

        // Then fetch comments separately to avoid failing everything if comments fail
        try {
          const commentsResponse = await comentarioRedacaoAPI.getByResposta(
            Number(essayId)
          );

          if (
            commentsResponse &&
            commentsResponse.data &&
            Array.isArray(commentsResponse.data)
          ) {
            // Mapeamento correto dos comentários
            const commentHighlights = commentsResponse.data.map(
              (comment: any) => ({
                id: String(comment.id),
                start: comment.posicao_inicio,
                end: comment.posicao_fim,
                type: String(comment.tipo_comentario?.id || ""),
                comment: comment.texto_comentario || "",
              })
            );

            // Extrair tipos únicos dos comentários
            const types = commentsResponse.data.reduce(
              (acc: HighlightType[], comment: any) => {
                if (!comment.tipo_comentario) return acc;

                const exists = acc.some(
                  (type) => type.id === String(comment.tipo_comentario.id)
                );
                if (!exists) {
                  acc.push({
                    id: String(comment.tipo_comentario.id),
                    name: comment.tipo_comentario.nome || "",
                    color: comment.tipo_comentario.cor || "#000000",
                  });
                }
                return acc;
              },
              []
            );

            setHighlightTypes(types.length > 0 ? types : defaultHighlightTypes);
            setHighlights(commentHighlights);
          }
        } catch (commentError) {
          console.error("Error fetching comments:", commentError);
          // Use default highlight types if comments failed
          setHighlightTypes(defaultHighlightTypes);
        }
      } catch (error) {
        console.error("Error fetching essay:", error);
        setError("Erro ao carregar redação. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchEssayWithComments();
  }, [essayId]);

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (error || !essay) {
    return (
      <Box className={classes.loadingContainer}>
        <Typography color="error">
          {error || "Redação não encontrada"}
        </Typography>
      </Box>
    );
  }

  const highlightsByType = highlights.reduce((acc, highlight) => {
    const type = highlightTypes.find((t) => t.id === highlight.type);
    if (type) {
      if (!acc[type.name]) {
        acc[type.name] = [];
      }
      acc[type.name].push(highlight);
    }
    return acc;
  }, {} as Record<string, Highlight[]>);

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} className={classes.mainPaper}>
            <Box className={classes.headerBox}>
              <Typography variant="h5">Sua Redação</Typography>
              {essay.feedback && (
                <Chip
                  label="Avaliado"
                  color="primary"
                  size="medium"
                  className={classes.chip}
                />
              )}
            </Box>
            <Divider className={classes.divider} />
            <Box className={classes.textContainer}>
              <TextHighlighter
                text={essay.text}
                highlights={highlights}
                highlightTypes={highlightTypes}
                readOnly
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} className={classes.feedbackPaper}>
            <Typography variant="h6" className={classes.feedbackTitle}>
              Feedback do Professor
            </Typography>
            <Typography variant="body1" paragraph>
              {essay.feedback}
            </Typography>
          </Paper>

          <Paper elevation={3} className={classes.commentsPaper}>
            <Typography variant="h6" className={classes.commentsTitle}>
              Resumo dos Comentários
            </Typography>
            {Object.entries(highlightsByType).map(
              ([typeName, typeHighlights]) => (
                <Box key={typeName} className={classes.commentTypeSection}>
                  <Typography
                    variant="subtitle1"
                    className={classes.commentTypeName}
                    gutterBottom
                  >
                    {typeName} ({typeHighlights.length})
                  </Typography>
                  {typeHighlights.map((highlight) => (
                    <Box key={highlight.id} className={classes.commentBox}>
                      <Typography
                        variant="body2"
                        className={classes.commentText}
                        gutterBottom
                      >
                        Trecho: "
                        <span className={classes.highlightedText}>
                          {essay.text.slice(highlight.start, highlight.end)}
                        </span>
                        "
                      </Typography>
                      <Typography variant="body2">
                        {highlight.comment}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EssayViewPage;
