import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@material-ui/core";
import { CheckCircle, Edit, Schedule, Visibility } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { essayAPI } from "../contexts/api";
import { useAuth } from "../contexts/AuthContext";

// Define an interface for the essay answer structure
interface EssayAnswer {
  id: number;
  text: string;
  id_aluno: number; // Assuming this is the student ID
  aluno: {
    nome: string;
  };
  redacao: {
    id: number;
    tema: string;
    curso: {
      nome: string;
    };
    aula: {
      // Assuming aula is part of redacao for context
      id: number;
      titulo: string;
    };
  };
  correcao?: {
    // Correction might be optional
    id: number;
    descricao: string;
    nota?: number; // Assuming nota might be part of correcao
  } | null;
}

// Define interface for teacher essay view
interface TeacherEssayResponse {
  id: number;
  nome_aluno: string;
  nome_curso: string;
  nome_aula: string;
  tema_redacao: string;
  id_redacao: number;
  id_resposta: number;
  corrigida: boolean;
}

const AllEssays: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [essayAnswers, setEssayAnswers] = useState<EssayAnswer[]>([]);
  const [teacherEssays, setTeacherEssays] = useState<EssayAnswer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEssayAnswers = async () => {
      if (user && user.id) {
        try {
          setLoading(true);
          setError(null);

          if (user.role === "teacher") {
            const response = await essayAPI.getAllEssaysByTeacher(user.id);
            console.log("Fetched teacher essays:", response.data);
            setTeacherEssays(Array.isArray(response.data) ? response.data : []);
          } else {
            const response = await essayAPI.getAllEssaysAwnsersByStudent(
              user.id
            );
            console.log("Fetched essay answers:", response.data);
            setEssayAnswers(Array.isArray(response.data) ? response.data : []);
          }
        } catch (err: any) {
          console.error("Error fetching essays:", err);
          setError(
            err.response?.data?.error ||
              err.message ||
              "Falha ao buscar as redações."
          );
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchEssayAnswers();
  }, [user]);

  if (loading) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  // if (error) {
  //   return (
  //     <Container style={{ marginTop: "2rem" }}>
  //       {/* <Alert severity="error">{error}</Alert> */}
  //     </Container>
  //   );
  // }

  return (
    <Container
      maxWidth="lg"
      style={{ marginTop: "2rem", marginBottom: "2rem" }}
    >
      <Typography
        variant="h4"
        gutterBottom
        component="h1"
        style={{ marginBottom: "2rem" }}
      >
        {user?.role === "teacher"
          ? "Redações para Corrigir"
          : "Minhas Redações Enviadas"}
      </Typography>

      {user?.role === "teacher" ? (
        // Teacher view
        teacherEssays.length === 0 ? (
          <Card elevation={2} style={{ padding: "2rem", textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              Não há redações para corrigir no momento.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {teacherEssays.map((essay) => (
              <Grid item xs={12} md={6} lg={4} key={essay.id}>
                <Card
                  elevation={3}
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = theme.shadows[8];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = theme.shadows[3];
                  }}
                >
                  <CardContent style={{ flexGrow: 1, padding: "1.5rem" }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={2}
                    >
                      <Typography
                        variant="h6"
                        component="h3"
                        style={{ fontWeight: 600, lineHeight: 1.3 }}
                      >
                        {essay.redacao.tema}
                      </Typography>
                      <Chip
                        icon={essay.correcao ? <CheckCircle /> : <Schedule />}
                        label={essay.correcao ? "Corrigida" : "Pendente"}
                        color={essay.correcao ? "primary" : "default"}
                        size="small"
                        variant={essay.correcao ? "default" : "outlined"}
                      />
                    </Box>

                    <Box mb={1}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={{ fontWeight: 500 }}
                      >
                        Aluno
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{ marginBottom: "0.5rem" }}
                      >
                        {essay.aluno.nome}
                      </Typography>
                    </Box>

                    <Box mb={1}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={{ fontWeight: 500 }}
                      >
                        Curso
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{ marginBottom: "0.5rem" }}
                      >
                        {essay.redacao.curso?.nome || "Não especificado"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={{ fontWeight: 500 }}
                      >
                        Aula
                      </Typography>
                      <Typography variant="body1">
                        {essay.redacao.aula?.titulo}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions style={{ padding: "1rem 1.5rem" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<Edit />}
                      component={RouterLink}
                      to={`/feedback-redacao/${essay.redacao.id}/${essay.id_aluno}`}
                      style={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                        padding: "10px 16px",
                      }}
                    >
                      Corrigir Redação
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : // Student view
      essayAnswers.length === 0 ? (
        <Card elevation={2} style={{ padding: "2rem", textAlign: "center" }}>
          <Typography variant="h6" color="textSecondary">
            Você ainda não enviou nenhuma redação.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {essayAnswers.map((answer) => (
            <Grid item xs={12} md={6} lg={4} key={answer.id}>
              <Card
                elevation={3}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = theme.shadows[8];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = theme.shadows[3];
                }}
              >
                <CardContent style={{ flexGrow: 1, padding: "1.5rem" }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Typography
                      variant="h6"
                      component="h3"
                      style={{ fontWeight: 600, lineHeight: 1.3 }}
                    >
                      {answer.redacao.tema}
                    </Typography>
                    <Chip
                      icon={answer.correcao ? <CheckCircle /> : <Schedule />}
                      label={answer.correcao ? "Corrigida" : "Pendente"}
                      color={answer.correcao ? "primary" : "default"}
                      size="small"
                      variant={answer.correcao ? "default" : "outlined"}
                    />
                  </Box>

                  <Box mb={1}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ fontWeight: 500 }}
                    >
                      Curso
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{ marginBottom: "0.5rem" }}
                    >
                      {answer.redacao.curso.nome || "Não especificada"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ fontWeight: 500 }}
                    >
                      Aula
                    </Typography>
                    <Typography variant="body1">
                      {answer.redacao.aula?.titulo || "Não especificada"}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions style={{ padding: "1rem 1.5rem" }}>
                  {answer.correcao ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<Visibility />}
                      component={RouterLink}
                      to={`/feedback-redacao/${answer.redacao.id}/${answer.id_aluno}`}
                      style={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                        padding: "10px 16px",
                      }}
                    >
                      Ver Correção
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      fullWidth
                      disabled
                      style={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                        padding: "10px 16px",
                      }}
                    >
                      Aguardando Correção
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AllEssays;
