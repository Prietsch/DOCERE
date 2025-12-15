import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  LibraryBooks as LibraryBooksIcon,
  Link as LinkIcon,
  Movie as MovieIcon,
  People as PeopleIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  VideoLibrary as VideoIcon,
} from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import DocumentList from "../components/DocumentList";
import DocumentUpload from "../components/DocumentUpload";
import FileUploadArea from "../components/FileUploadArea";
import NewModuleDialog from "../components/NewModuleDialog";
import VideoPlayer from "../components/VideoPlayer";
import { useAuth } from "../contexts/AuthContext";
import { courseAPI, essayAPI, lessonAPI, moduleAPI } from "../contexts/api";
import { useStyles } from "../styles/CourseEditStyles";

interface Curso {
  id: number;
  nome: string;
  descricao: string;
  professorId: number;
  modulos?: Modulo[];
}

interface Modulo {
  id: number;
  nome: string;
  aulas?: Aula[];
}

interface Aula {
  id: number;
  titulo: string;
  urlVideo: string;
  redacoes?: Essay[];
}

export interface Essay {
  id: number;
  id_redacao: number;
  tema: string;
  descricao: string;
  respostas: Array<{
    id: number;
    id_aluno: number;
    text: string;
    feedback?: string;
    aluno: {
      nome: string;
      email: string;
    };
  }>;
}

export interface Resposta {
  id: number;
  id_aluno: number;
  text: string;
  feedback?: string;
  aluno: {
    nome: string;
  };
}
interface Aluno {
  id: number;
  nome: string;
  email: string;
}

// Interface para o progresso do aluno em um curso
interface Student {
  id: number;
  alunoId: number;
  cursoId: number;
  completedLessons: string; // JSON string contendo um array de IDs de aulas completadas
  courseProgress: number; // Porcentagem de conclusão do curso
  createdAt: string; // Data ISO 8601
  updatedAt: string; // Data ISO 8601
  aluno: Aluno; // Campo opcional para quando a relação é carregada
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;
  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-edit-tabpanel-${index}`}
      aria-labelledby={`course-edit-tab-${index}`}
      className={classes.tabPanel}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `course-edit-tab-${index}`,
    "aria-controls": `course-edit-tabpanel-${index}`,
  };
}

const CourseEdit: React.FC = () => {
  const classes = useStyles();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const history = useHistory();

  // Estado para armazenar um único curso
  const [course, setCourse] = useState<Curso | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [uploadingVideo, setUploadingVideo] = useState({
    moduleIdx: -1,
    lessonIdx: -1,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteModuleDialogOpen, setDeleteModuleDialogOpen] = useState<{
    open: boolean;
    moduleId: number | null;
  }>({ open: false, moduleId: null });
  const [newModuleDialogOpen, setNewModuleDialogOpen] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshDocuments, setRefreshDocuments] = useState<
    Record<number, number>
  >({});

  // Novos estados para melhor UX
  const [activeSection, setActiveSection] = useState<
    "info" | "modules" | "students"
  >("info");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "teacher") {
      fetchCourse();
      fetchStudents();
    }
  }, [user, id]);

  // Busca o curso especifico com seus relacionamentos
  const fetchCourse = async () => {
    try {
      setLoading(true);
      // Ajustado para buscar um único curso pelo id
      const response = await courseAPI.getCourseById(id);

      // O backend deve retornar um único curso com seus relacionamentos (modulos, aulas, redacoes)
      if (response.data.modulos) {
        for (const modulo of response.data.modulos) {
          if (modulo.aulas) {
            for (const aula of modulo.aulas) {
              try {
                // Buscar as redações específicas para cada aula
                const essaysResponse = await essayAPI.getEssaysByLesson(
                  aula.id
                );
                aula.redacoes = essaysResponse.data;
              } catch (essayError) {
                console.error(
                  `Erro ao buscar redações da aula ${aula.id}:`,
                  essayError
                );
                aula.redacoes = [];
              }
            }
          }
        }
      }

      setCourse(response.data);

      // Expandir o primeiro módulo por padrão
      if (response.data.modulos && response.data.modulos.length > 0) {
        setExpandedModuleId(response.data.modulos[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await courseAPI.getCourseStudents(Number(id));
      setStudents(response.data);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (!course) return;

      // Update the main course info
      await courseAPI.updateCourse(course.id, {
        nome: course.nome,
        descricao: course.descricao,
      });

      // Update each module and its lessons separately
      if (course.modulos && course.modulos.length > 0) {
        for (let modulo of course.modulos) {
          // PUT route for updating a module (ensure id exists)
          if (modulo.id) {
            await moduleAPI.updateModule(modulo.id, {
              nome: modulo.nome,
            });
          }

          // Update lessons linked to this module
          if (modulo.aulas && modulo.aulas.length > 0) {
            for (let aula of modulo.aulas) {
              if (aula.id) {
                await lessonAPI.updateLesson(aula.id, {
                  titulo: aula.titulo,
                  urlVideo: aula.urlVideo,
                });
              }
            }
          }
        }
      }

      setUnsavedChanges(false);
      setShowSuccess(true);
      setSuccessMessage("Curso atualizado com sucesso!");
      await fetchCourse(); // Refresh the course details
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      setShowSuccess(true);
      setSuccessMessage("Erro ao salvar alterações. Tente novamente.");
    }
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      if (course) {
        await courseAPI.deleteCourse(course.id);
        history.push("/painel"); // Redireciona após a deleção
      }
    } catch (error) {
      console.error("Erro ao deletar curso:", error);
    }
  };
  const handleDeleteModule = async (moduleId: number) => {
    setDeleteModuleDialogOpen({ open: false, moduleId: null });
    try {
      await moduleAPI.deleteModule(moduleId);
      setShowSuccess(true);
      setSuccessMessage("Módulo removido com sucesso!");
      await fetchCourse(); // Refresh course data
    } catch (error) {
      console.error("Erro ao remover módulo:", error);
      // Show error message to the user
      setShowSuccess(true);
      setSuccessMessage("Erro ao remover módulo. Por favor, tente novamente.");

      // If it's an axios error, log more details
      // if (error.response) {
      //   console.error("Error response:", error.response.data);
      //   console.error("Status code:", error.response.status);
      // }
    }
  };
  const handleAddModule = () => {
    setNewModuleDialogOpen(true);
  };
  const handleSaveNewModule = async (moduleData: {
    nome: string;
    cursoId: number;
    aulas?: string[];
  }) => {
    try {
      if (!course) return;

      // Create the module first
      const moduleResponse = await moduleAPI.createModule(
        course.id,
        moduleData
      );
      const newModuleId = moduleResponse.data.id;

      // If there are lessons to create
      if (moduleData.aulas && moduleData.aulas.length > 0) {
        const createLessonsPromises = moduleData.aulas.map(
          async (aulaTitle) => {
            // Create a FormData for the lesson creation
            const formData = new FormData();

            // Add lesson title, module ID, and explicitly set empty urlVideo
            formData.append("titulo", aulaTitle);
            formData.append("moduloId", newModuleId.toString());
            formData.append("urlVideo", ""); // Explicitly set empty URL instead of relying on a video file
            formData.append("ordem", "1"); // Default order

            // No video file is being attached now - users will add it later in edit mode
            return lessonAPI.createLesson(formData);
          }
        );

        await Promise.all(createLessonsPromises);
      }

      setNewModuleDialogOpen(false);
      setShowSuccess(true);
      setSuccessMessage("Novo módulo adicionado com sucesso!");
      await fetchCourse(); // Refresh course data
    } catch (error) {
      console.error("Erro ao adicionar módulo:", error);
      setShowSuccess(true);
      setSuccessMessage(
        "Erro ao adicionar módulo. Por favor, tente novamente."
      );
    }
  };

  const handleModuleExpand = (moduleId: number) => {
    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
    } else {
      setExpandedModuleId(moduleId);
    }
  };

  const handleVideoUpload = async (
    file: File,
    moduleIdx: number,
    lessonIdx: number
  ) => {
    const lesson = course?.modulos?.[moduleIdx]?.aulas?.[lessonIdx];
    if (!lesson?.id) {
      console.error("Lesson ID not found");
      return;
    }

    setUploadingVideo({ moduleIdx, lessonIdx });

    try {
      const formData = new FormData();
      // Change the field name from "video" to "videoFile" to match backend expectation
      formData.append("videoFile", file);

      console.log(`Uploading video for lesson ID: ${lesson.id}`);

      // Log the FormData to help debug
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      await lessonAPI.updateLessonVideo(lesson.id, formData);
      await fetchCourse(); // Refresh course data
      setShowSuccess(true);
      setSuccessMessage("Vídeo atualizado com sucesso!");
    } catch (error) {
      console.error("Error uploading video:", error);
      setShowSuccess(true);
      setSuccessMessage(
        "Erro ao atualizar vídeo. Verifique o console para detalhes."
      );
    } finally {
      setUploadingVideo({ moduleIdx: -1, lessonIdx: -1 });
    }
  };

  // Add this function to check if a URL is from YouTube
  const isYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
    return youtubeRegex.test(url);
  };

  // Create a YouTube video component
  const YouTubePlayer: React.FC<{ url: string; title: string }> = ({
    url,
    title,
  }) => {
    // Extract video ID from YouTube URL
    const getYouTubeVideoId = (url: string): string | null => {
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYouTubeVideoId(url);

    if (!videoId)
      return <Typography color="error">Link do YouTube inválido</Typography>;

    return (
      <Box className={classes.youtubeContainer}>
        <iframe
          title={title}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          style={{ border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    );
  };

  // Novos componentes para melhor UX
  const EditableField: React.FC<{
    label: string;
    value: string;
    onSave: (value: string) => void;
    multiline?: boolean;
    fieldKey: string;
  }> = ({ label, value, onSave, multiline = false, fieldKey }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const handleSave = () => {
      onSave(tempValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setTempValue(value);
      setIsEditing(false);
    };

    return (
      <Box>
        {isEditing ? (
          <Box display="flex" alignItems="center" style={{ gap: 8 }}>
            <TextField
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              multiline={multiline}
              minRows={multiline ? 3 : 1}
              size="small"
              autoFocus
              fullWidth
              variant="outlined"
            />
            <IconButton size="small" onClick={handleSave} color="primary">
              <CheckIcon />
            </IconButton>
            <IconButton size="small" onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" style={{ gap: 8 }}>
            <Typography variant="body1" style={{ flex: 1 }}>
              {value || `Clique para adicionar ${label.toLowerCase()}`}
            </Typography>
            <Tooltip title={`Editar ${label}`}>
              <IconButton size="small" onClick={() => setIsEditing(true)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    );
  };

  const NavigationSidebar: React.FC = () => (
    <Paper style={{ height: "fit-content", position: "sticky", top: 20 }}>
      <List component="nav">
        <ListItem
          button
          selected={activeSection === "info"}
          onClick={() => setActiveSection("info")}
        >
          <ListItemIcon>
            <InfoIcon
              color={activeSection === "info" ? "primary" : "inherit"}
            />
          </ListItemIcon>
          <ListItemText primary="Informações Gerais" />
        </ListItem>
        <ListItem
          button
          selected={activeSection === "modules"}
          onClick={() => setActiveSection("modules")}
        >
          <ListItemIcon>
            <LibraryBooksIcon
              color={activeSection === "modules" ? "primary" : "inherit"}
            />
          </ListItemIcon>
          <ListItemText primary="Módulos e Aulas" />
          <Chip size="small" label={course?.modulos?.length || 0} />
        </ListItem>
        <ListItem
          button
          selected={activeSection === "students"}
          onClick={() => setActiveSection("students")}
        >
          <ListItemIcon>
            <GroupIcon
              color={activeSection === "students" ? "primary" : "inherit"}
            />
          </ListItemIcon>
          <ListItemText primary="Alunos" />
          <Chip size="small" label={students.length} />
        </ListItem>
      </List>
    </Paper>
  );

  const LoadingSkeleton: React.FC = () => (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Paper style={{ padding: 16 }}>
          <Box height={60} bgcolor="grey.300" borderRadius={1} mb={2} />
          <Box height={20} bgcolor="grey.200" borderRadius={1} width="60%" />
        </Paper>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper style={{ padding: 16, height: 200 }}>
            <Box height={20} bgcolor="grey.300" borderRadius={1} mb={2} />
            <Box height={20} bgcolor="grey.200" borderRadius={1} mb={2} />
            <Box height={20} bgcolor="grey.200" borderRadius={1} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper style={{ padding: 16, height: 400 }}>
            <Box height={40} bgcolor="grey.300" borderRadius={1} mb={3} />
            <Box height={100} bgcolor="grey.200" borderRadius={1} mb={2} />
            <Box height={100} bgcolor="grey.200" borderRadius={1} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );

  const VideoUploadArea: React.FC<{
    currentVideo?: string;
    onVideoUpload: (file: File) => void;
    onUrlChange: (url: string) => void;
    isUploading: boolean;
    lessonTitle: string;
  }> = ({
    currentVideo,
    onVideoUpload,
    onUrlChange,
    isUploading,
    lessonTitle,
  }) => {
    const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");
    const [videoUrl, setVideoUrl] = useState(currentVideo || "");
    const [showUploadOptions, setShowUploadOptions] = useState(!currentVideo);

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <MovieIcon style={{ verticalAlign: "middle", marginRight: 8 }} />
          Vídeo da Aula
        </Typography>

        {currentVideo && (
          <Paper
            style={{
              padding: 16,
              marginBottom: 16,
              backgroundColor: "#f5f5f5",
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <CheckCircleIcon style={{ color: green[500], marginRight: 8 }} />
              <Typography variant="subtitle2" color="primary">
                Vídeo configurado
              </Typography>
            </Box>
            {isYouTubeUrl(currentVideo) ? (
              <YouTubePlayer url={currentVideo} title={lessonTitle} />
            ) : (
              <VideoPlayer url={currentVideo} title={lessonTitle} />
            )}
            <Box mt={2} display="flex" justifyContent="center">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => setShowUploadOptions(!showUploadOptions)}
                size="small"
              >
                {showUploadOptions ? "Cancelar Alteração" : "Alterar Vídeo"}
              </Button>
            </Box>
          </Paper>
        )}

        {showUploadOptions && (
          <>
            <Box display="flex" style={{ gap: 8 }} mb={2}>
              <Button
                variant={uploadMethod === "file" ? "contained" : "outlined"}
                onClick={() => setUploadMethod("file")}
                startIcon={<CloudUploadIcon />}
                size="small"
              >
                Upload de Arquivo
              </Button>
              <Button
                variant={uploadMethod === "url" ? "contained" : "outlined"}
                onClick={() => setUploadMethod("url")}
                startIcon={<LinkIcon />}
                size="small"
              >
                Link Externo
              </Button>
            </Box>

            {uploadMethod === "file" ? (
              <FileUploadArea
                onFileSelected={onVideoUpload}
                isUploading={isUploading}
              />
            ) : (
              <Box>
                <TextField
                  fullWidth
                  label="URL do vídeo (YouTube, Vimeo, etc.)"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    onUrlChange(e.target.value);
                  }}
                  helperText="Cole o link do vídeo hospedado externamente"
                  variant="outlined"
                  size="small"
                />
              </Box>
            )}
          </>
        )}

        {isUploading && (
          <Box mt={2}>
            <LinearProgress />
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              style={{ marginTop: 8 }}
            >
              Enviando vídeo...
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!course) {
    return (
      <Container maxWidth="lg" className={classes.root}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Typography variant="h6">Curso não encontrado</Typography>
        </Box>
      </Container>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "info":
        return (
          <Card>
            <CardContent>
              <Box mb={3}>
                <Breadcrumbs>
                  <Link color="inherit" href="/dashboard">
                    <HomeIcon style={{ marginRight: 4, fontSize: 16 }} />
                    Dashboard
                  </Link>
                  <Typography color="textPrimary">Editar Curso</Typography>
                </Breadcrumbs>
              </Box>

              <Box display="flex" alignItems="center" mb={3}>
                <SchoolIcon
                  fontSize="large"
                  style={{ marginRight: "16px", color: "#2A4B8D" }}
                />
                <Box flex={1}>
                  <Typography variant="h4" gutterBottom>
                    {course.nome}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    ID: {course.id} • Professor ID: {course.professorId}
                  </Typography>
                </Box>
                <Box>
                  <Tooltip title="Voltar ao painel">
                    <IconButton onClick={() => history.push("/painel")}>
                      <ArrowBackIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir curso">
                    <IconButton
                      color="secondary"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider style={{ margin: "16px 0" }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Nome do Curso
                  </Typography>
                  <EditableField
                    label="Nome do Curso"
                    value={course.nome}
                    onSave={(value) => {
                      // Auto-save implementation
                      setCourse({ ...course, nome: value });
                      setUnsavedChanges(true);
                    }}
                    fieldKey="nome"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Descrição
                  </Typography>
                  <EditableField
                    label="Descrição"
                    value={course.descricao}
                    onSave={(value) => {
                      setCourse({ ...course, descricao: value });
                      setUnsavedChanges(true);
                    }}
                    multiline
                    fieldKey="descricao"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    mt={2}
                    display="flex"
                    alignItems="center"
                    style={{ gap: 8 }}
                  >
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${students.length} Alunos Matriculados`}
                      variant="outlined"
                      color="primary"
                    />
                    <Chip
                      icon={<VideoIcon />}
                      label={`${
                        course.modulos?.reduce(
                          (total, modulo) =>
                            total + (modulo.aulas?.length || 0),
                          0
                        ) || 0
                      } Aulas`}
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>
                </Grid>
              </Grid>

              {unsavedChanges && (
                <Box mt={3} p={2} bgcolor="warning.light" borderRadius={1}>
                  <Typography variant="body2">
                    <InfoIcon
                      style={{ verticalAlign: "middle", marginRight: 8 }}
                    />
                    Você tem alterações não salvas. Clique em "Salvar
                    Alterações" para confirmar.
                  </Typography>
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSave}
                      startIcon={<SaveIcon />}
                    >
                      Salvar Alterações
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case "modules":
        return (
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h5">Módulos e Aulas</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddModule}
              >
                Adicionar Módulo
              </Button>
            </Box>

            {course.modulos && course.modulos.length > 0 ? (
              course.modulos.map((modulo, mIdx) => (
                <Card key={modulo.id} style={{ marginBottom: 16 }}>
                  <CardHeader
                    avatar={
                      <Avatar style={{ backgroundColor: "#2A4B8D" }}>
                        <LibraryBooksIcon />
                      </Avatar>
                    }
                    title={
                      <EditableField
                        label="Nome do Módulo"
                        value={modulo.nome}
                        onSave={(value) => {
                          const updatedModulos = [...(course.modulos || [])];
                          updatedModulos[mIdx] = { ...modulo, nome: value };
                          setCourse({ ...course, modulos: updatedModulos });
                          setUnsavedChanges(true);
                        }}
                        fieldKey={`module-${modulo.id}`}
                      />
                    }
                    subheader={`${modulo.aulas?.length || 0} aulas`}
                    action={
                      <Box>
                        <Tooltip title="Excluir módulo">
                          <IconButton
                            onClick={() =>
                              setDeleteModuleDialogOpen({
                                open: true,
                                moduleId: modulo.id,
                              })
                            }
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          onClick={() => handleModuleExpand(modulo.id)}
                        >
                          <ExpandMoreIcon
                            style={{
                              transform:
                                expandedModuleId === modulo.id
                                  ? "rotate(180deg)"
                                  : "rotate(0)",
                              transition: "transform 0.3s",
                            }}
                          />
                        </IconButton>
                      </Box>
                    }
                  />

                  <Collapse in={expandedModuleId === modulo.id}>
                    <CardContent>
                      {modulo.aulas && modulo.aulas.length > 0 ? (
                        modulo.aulas.map((aula, aIdx) => (
                          <Card
                            key={aula.id}
                            variant="outlined"
                            style={{ marginBottom: 16 }}
                          >
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                <EditableField
                                  label="Título da Aula"
                                  value={aula.titulo}
                                  onSave={(value) => {
                                    const updatedModulos = [
                                      ...(course.modulos || []),
                                    ];
                                    const updatedAulas = [
                                      ...(modulo.aulas || []),
                                    ];
                                    updatedAulas[aIdx] = {
                                      ...aula,
                                      titulo: value,
                                    };
                                    updatedModulos[mIdx] = {
                                      ...modulo,
                                      aulas: updatedAulas,
                                    };
                                    setCourse({
                                      ...course,
                                      modulos: updatedModulos,
                                    });
                                    setUnsavedChanges(true);
                                  }}
                                  fieldKey={`lesson-${aula.id}`}
                                />
                              </Typography>

                              <VideoUploadArea
                                currentVideo={aula.urlVideo}
                                onVideoUpload={(file) =>
                                  handleVideoUpload(file, mIdx, aIdx)
                                }
                                onUrlChange={(url) => {
                                  const updatedModulos = [
                                    ...(course.modulos || []),
                                  ];
                                  const updatedAulas = [
                                    ...(modulo.aulas || []),
                                  ];
                                  updatedAulas[aIdx] = {
                                    ...aula,
                                    urlVideo: url,
                                  };
                                  updatedModulos[mIdx] = {
                                    ...modulo,
                                    aulas: updatedAulas,
                                  };
                                  setCourse({
                                    ...course,
                                    modulos: updatedModulos,
                                  });
                                  setUnsavedChanges(true);
                                }}
                                isUploading={
                                  uploadingVideo.moduleIdx === mIdx &&
                                  uploadingVideo.lessonIdx === aIdx
                                }
                                lessonTitle={aula.titulo}
                              />

                              <Divider style={{ margin: "16px 0" }} />

                              <Typography variant="h6" gutterBottom>
                                <DescriptionIcon
                                  style={{ marginRight: 8, color: "#2A4B8D" }}
                                />
                                Materiais Complementares
                              </Typography>

                              <DocumentUpload
                                aulaId={aula.id}
                                onUploadComplete={() =>
                                  setRefreshDocuments((prev) => ({
                                    ...prev,
                                    [aula.id]: (prev[aula.id] || 0) + 1,
                                  }))
                                }
                              />

                              <Box mt={2}>
                                <DocumentList
                                  aulaId={aula.id}
                                  isTeacher={true}
                                  onUpdateList={() =>
                                    setRefreshDocuments((prev) => ({
                                      ...prev,
                                      [aula.id]: (prev[aula.id] || 0) + 1,
                                    }))
                                  }
                                  key={`docs-${aula.id}-${
                                    refreshDocuments[aula.id] || 0
                                  }`}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Não há aulas cadastradas neste módulo.
                        </Typography>
                      )}
                    </CardContent>
                  </Collapse>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    py={4}
                  >
                    <InfoIcon
                      style={{
                        fontSize: 48,
                        color: "#2A4B8D",
                        marginBottom: 16,
                      }}
                    />
                    <Typography variant="h6" gutterBottom>
                      Nenhum módulo cadastrado
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      align="center"
                    >
                      Este curso ainda não possui módulos ou aulas.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddModule}
                      style={{ marginTop: 16 }}
                    >
                      Criar Primeiro Módulo
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case "students":
        return (
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <GroupIcon style={{ marginRight: 12, color: "#2A4B8D" }} />
                <Typography variant="h5">
                  Alunos Matriculados ({students.length})
                </Typography>
              </Box>

              {students.length > 0 ? (
                <Grid container spacing={2}>
                  {students.map((student) => (
                    <Grid item xs={12} sm={6} md={4} key={student.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              style={{
                                marginRight: 12,
                                backgroundColor: "#2A4B8D",
                              }}
                            >
                              {student.aluno.nome.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1">
                                {student.aluno.nome}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Progresso: {student.courseProgress}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box mt={2}>
                            <LinearProgress
                              value={student.courseProgress}
                              variant="determinate"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  py={4}
                >
                  <InfoIcon
                    style={{ fontSize: 48, color: "#2A4B8D", marginBottom: 16 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Nenhum aluno matriculado
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                  >
                    Este curso ainda não possui alunos matriculados.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Grid container spacing={3}>
        {/* Sidebar de Navegação */}
        <Grid item xs={12} md={3}>
          <NavigationSidebar />
        </Grid>

        {/* Conteúdo Principal */}
        <Grid item xs={12} md={9}>
          {renderActiveSection()}
        </Grid>
      </Grid>

      {/* Botão flutuante para ações rápidas */}
      {activeSection === "modules" && (
        <Fab
          color="primary"
          aria-label="add"
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={handleAddModule}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Excluir Curso</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o curso "{course.nome}"? Esta ação
            não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="secondary" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação de exclusão de módulo */}
      <Dialog
        open={deleteModuleDialogOpen.open}
        onClose={() =>
          setDeleteModuleDialogOpen({ open: false, moduleId: null })
        }
      >
        <DialogTitle>Excluir Módulo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este módulo? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setDeleteModuleDialogOpen({ open: false, moduleId: null })
            }
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleDeleteModule(deleteModuleDialogOpen.moduleId!)}
            color="secondary"
            variant="contained"
          >
            Excluir Módulo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de sucesso */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        message={
          <Box display="flex" alignItems="center">
            <CheckIcon style={{ marginRight: 8 }} />
            {successMessage}
          </Box>
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      />

      {/* Diálogo para adicionar novo módulo com aulas */}
      <NewModuleDialog
        open={newModuleDialogOpen}
        onClose={() => setNewModuleDialogOpen(false)}
        onSave={handleSaveNewModule}
        courseId={course.id}
      />
    </Container>
  );
};

export default CourseEdit;
