import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  CreativeWritingState,
  Redacao,
  RouteParams,
  TabPanelProps,
} from "../../interfaces/interfaces";
import { useAuth } from "../contexts/AuthContext";
import { essayAPI } from "../contexts/api";
import { useStyles } from "../styles/FazerRedacaoStyles";

// Constantes
const CREATIVE_WRITING_STAGES = {
  PREPARATION: 0,
  INCUBATION: 1,
  ILLUMINATION: 2,
  IMPLEMENTATION: 3,
};

const INITIAL_WRITING_STATE: CreativeWritingState = {
  preparation: "",
  incubation: "",
  illumination: "",
  implementation: "",
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`creative-writing-tabpanel-${index}`}
      aria-labelledby={`creative-writing-tab-${index}`}
      className={classes.tabPanel}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const FazerRedacao: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const [redacao, setRedacao] = useState<Redacao | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [creativeWriting, setCreativeWriting] = useState<CreativeWritingState>(
    INITIAL_WRITING_STATE
  );
  const history = useHistory();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [existingRedacao, setExistingRedacao] = useState<any>(null);
  const classes = useStyles();

  console.log("id", id);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch redação info
        const redacaoResponse = await essayAPI.getEssaysByLesson(Number(id));

        // Verificar se há redações disponíveis
        if (
          Array.isArray(redacaoResponse.data) &&
          redacaoResponse.data.length > 0
        ) {
          const redacaoData = redacaoResponse.data[0];
          setRedacao(redacaoData);
          console.log("redacaoData", redacaoData);

          // Fetch existing resposta if any
          if (user && redacaoData) {
            try {
              const respostaResponse = await essayAPI.getStudentEssayResponse(
                user.id,
                redacaoData.id
              );
              if (respostaResponse.data && respostaResponse.data.length > 0) {
                setExistingRedacao(respostaResponse.data[0]);
                console.log(respostaResponse.data[0]);
                setCreativeWriting({
                  preparation: respostaResponse.data[0].preparation || "",
                  incubation: respostaResponse.data[0].incubation || "",
                  illumination: respostaResponse.data[0].illumination || "",
                  implementation: respostaResponse.data[0].implementation || "",
                });
                setIsEditing(true);
              }
            } catch (error) {
              // No existing essay response
              console.log("No existing essay response");
            }
          }
        } else {
          console.log("Nenhuma redação encontrada para esta aula.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleEnviar = async () => {
    if (!redacao || !user) return;
    try {
      // Garantir que os campos não sejam undefined
      const requestData = {
        id_redacao: redacao.id,
        id_aluno: user.id,
        text: creativeWriting.implementation || "", // Campo text é obrigatório na API
        preparation: creativeWriting.preparation || null,
        incubation: creativeWriting.incubation || null,
        illumination: creativeWriting.illumination || null,
        implementation: creativeWriting.implementation || null,
      };

      if (isEditing && existingRedacao) {
        // Update existing redação
        await essayAPI.updateEssayResponse(existingRedacao.id, requestData);
      } else {
        // Create new redação
        await essayAPI.submitEssayResponse(requestData);
      }

      // Exibir mensagem de sucesso (poderia ser implementado com um Snackbar)
      alert(
        isEditing
          ? "Redação atualizada com sucesso!"
          : "Redação enviada com sucesso!"
      );

      // Extrair o ID do curso a partir da aula atual
      try {
        // Get lesson to find the course ID
        const lessonResponse = await essayAPI.getLessonById(Number(id));
        if (lessonResponse.data && lessonResponse.data.moduloId) {
          // Get module to find course ID
          const moduleResponse = await essayAPI.getModuleById(
            lessonResponse.data.moduloId
          );
          if (moduleResponse.data && moduleResponse.data.cursoId) {
            // Navigate back to the course view
            history.push(`/curso/${moduleResponse.data.cursoId}`);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to get course ID:", error);
      }

      // Fallback navigation if we can't get the course ID
      history.push("/painel");
    } catch (error) {
      console.error("Erro ao enviar redação", error);
      alert("Ocorreu um erro ao enviar a redação. Por favor, tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" style={{ marginTop: "2rem" }}>
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className={classes.root}>
      {redacao ? (
        <Paper elevation={3} style={{ padding: "2rem" }}>
          <Box mb={4}>
            <Typography variant="h4" gutterBottom color="primary">
              {isEditing
                ? "Editar Processo de Escrita Criativa"
                : "Nova Escrita Criativa"}
            </Typography>

            {isEditing && (
              <Box mb={3} p={2} bgcolor="#e3f2fd" borderRadius={1}>
                <Typography variant="subtitle1" gutterBottom>
                  Você está editando seu processo de escrita criativa. Suas
                  informações anteriores foram carregadas.
                </Typography>
                <Box mt={2} display="flex" flexWrap="wrap">
                  <Box mr={3} mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Preparação:{" "}
                      {creativeWriting.preparation
                        ? "Preenchido"
                        : "Não iniciado"}
                    </Typography>
                  </Box>
                  <Box mr={3} mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Incubação:{" "}
                      {creativeWriting.incubation
                        ? "Preenchido"
                        : "Não iniciado"}
                    </Typography>
                  </Box>
                  <Box mr={3} mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Geração:{" "}
                      {creativeWriting.illumination
                        ? "Preenchido"
                        : "Não iniciado"}
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      Implementação:{" "}
                      {creativeWriting.implementation
                        ? "Preenchido"
                        : "Não iniciado"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
              <Typography variant="h6" gutterBottom color="primary">
                Tema
              </Typography>
              <Typography variant="body1" paragraph>
                {redacao.tema}
              </Typography>

              {redacao.descricao && (
                <>
                  <Typography
                    variant="h6"
                    gutterBottom
                    color="primary"
                    style={{ marginTop: "1rem" }}
                  >
                    Descrição/Instruções
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {redacao.descricao}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <Box mb={3}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              className={classes.tabs}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab
                label="Preparação"
                icon={
                  creativeWriting.preparation ? (
                    <Box className={classes.completedMarker} />
                  ) : undefined
                }
              />
              <Tab
                label="Incubação"
                icon={
                  creativeWriting.incubation ? (
                    <Box className={classes.completedMarker} />
                  ) : undefined
                }
              />
              <Tab
                label="Geração"
                icon={
                  creativeWriting.illumination ? (
                    <Box className={classes.completedMarker} />
                  ) : undefined
                }
              />
              <Tab
                label="Implementação"
                icon={
                  creativeWriting.implementation ? (
                    <Box className={classes.completedMarker} />
                  ) : undefined
                }
              />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Box className={classes.stepContent}>
                <Typography variant="h6" gutterBottom>
                  Preparação
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Na fase de preparação, colete referências, pesquise e organize
                  suas ideias iniciais sobre o tema.
                </Typography>
                <TextField
                  placeholder="Anote referências, ideias iniciais e pesquisas sobre o tema..."
                  multiline
                  fullWidth
                  rows={8}
                  variant="outlined"
                  value={creativeWriting.preparation}
                  onChange={(e) =>
                    setCreativeWriting({
                      ...creativeWriting,
                      preparation: e.target.value,
                    })
                  }
                />
                {isEditing && creativeWriting.preparation && (
                  <Box mt={2} textAlign="right">
                    <Typography variant="caption" color="textSecondary">
                      Última edição: {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(1)}
                >
                  Próxima Etapa
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Box className={classes.stepContent}>
                <Typography variant="h6" gutterBottom>
                  Incubação
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Na fase de incubação, desenvolva as ideias iniciais e explore
                  as conexões entre elas. Esse é o momento do "ócio criativo"
                  onde seu cérebro processa as informações.
                </Typography>
                <TextField
                  placeholder="Desenvolva ideias, personagens, construa diálogos e cenários..."
                  multiline
                  fullWidth
                  rows={8}
                  variant="outlined"
                  value={creativeWriting.incubation}
                  onChange={(e) =>
                    setCreativeWriting({
                      ...creativeWriting,
                      incubation: e.target.value,
                    })
                  }
                />
                {isEditing && creativeWriting.incubation && (
                  <Box mt={2} textAlign="right">
                    <Typography variant="caption" color="textSecondary">
                      Última edição: {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button variant="outlined" onClick={() => setActiveTab(0)}>
                  Etapa Anterior
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(2)}
                >
                  Próxima Etapa
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Box className={classes.stepContent}>
                <Typography variant="h6" gutterBottom>
                  Geração
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Na fase de iluminação, refine suas ideias, organize a
                  estrutura da narrativa e defina o fluxo do texto. Este é o
                  momento de clareza onde a solução criativa emerge.
                </Typography>
                <TextField
                  placeholder="Organize a estrutura do texto, defina a sequência e refine as ideias..."
                  multiline
                  fullWidth
                  rows={8}
                  variant="outlined"
                  value={creativeWriting.illumination}
                  onChange={(e) =>
                    setCreativeWriting({
                      ...creativeWriting,
                      illumination: e.target.value,
                    })
                  }
                />
                {isEditing && creativeWriting.illumination && (
                  <Box mt={2} textAlign="right">
                    <Typography variant="caption" color="textSecondary">
                      Última edição: {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button variant="outlined" onClick={() => setActiveTab(1)}>
                  Etapa Anterior
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(3)}
                >
                  Próxima Etapa
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Box className={classes.stepContent}>
                <Typography variant="h6" gutterBottom>
                  Implementação
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Na fase de implementação, finalize sua redação, revise o texto
                  e refine os detalhes para criar uma narrativa coesa e
                  envolvente.
                </Typography>
                <TextField
                  placeholder="Escreva a versão final do seu texto..."
                  multiline
                  fullWidth
                  rows={10}
                  variant="outlined"
                  value={creativeWriting.implementation}
                  onChange={(e) =>
                    setCreativeWriting({
                      ...creativeWriting,
                      implementation: e.target.value,
                    })
                  }
                />
                {isEditing && creativeWriting.implementation && (
                  <Box mt={2} textAlign="right">
                    <Typography variant="caption" color="textSecondary">
                      Última edição: {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button variant="outlined" onClick={() => setActiveTab(2)}>
                  Etapa Anterior
                </Button>
              </Box>
            </TabPanel>
          </Box>

          <Divider className={classes.divider} />

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              size="large"
              className={classes.submitButton}
              onClick={handleEnviar}
            >
              {isEditing ? "Atualizar Redação" : "Enviar Redação"}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper elevation={3} style={{ padding: "2rem", textAlign: "center" }}>
          <Typography variant="h6" color="error">
            Redação não encontrada
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default FazerRedacao;
