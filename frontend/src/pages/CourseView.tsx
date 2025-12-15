import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  LinearProgress,
  Modal,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import AssignmentIcon from "@material-ui/icons/Assignment";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import DescriptionIcon from "@material-ui/icons/Description"; // Ícone para documentos
import EmojiEventsIcon from "@material-ui/icons/EmojiEvents";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LockIcon from "@material-ui/icons/Lock";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import VideocamIcon from "@material-ui/icons/Videocam"; // Ícone para vídeos
import confetti from "canvas-confetti";
import React, { useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Aula,
  Curso,
  Modulo,
  TabPanelProps,
} from "../../interfaces/interfaces";
import DocumentList from "../components/DocumentList";
import DocumentUpload from "../components/DocumentUpload";
import VideoPlayer from "../components/VideoPlayer";
import { useAuth } from "../contexts/AuthContext";
import { courseAPI, essayAPI, lessonAPI, moduleAPI } from "../contexts/api";
import { useStyles } from "../styles/CourseViewStyles";

// Função para verificar se um URL é do YouTube
const isYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
  return youtubeRegex.test(url);
};

// Componente para renderizar vídeos do YouTube
const YouTubePlayer: React.FC<{ url: string; title?: string; onPlay?: () => void }> = ({
  url,
  title,
  onPlay,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<any>(null);
  const hasCalledOnPlay = React.useRef(false);

  // Extrai o ID do vídeo do YouTube da URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(url);

  // Carrega a API do YouTube e inicializa o player
  React.useEffect(() => {
    if (!videoId) return;

    hasCalledOnPlay.current = false;

    // Carrega a API do YouTube se ainda não foi carregada
    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) {
          resolve();
          return;
        }

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
          resolve();
        };
      });
    };

    const initPlayer = async () => {
      await loadYouTubeAPI();

      // Destroi o player anterior se existir
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      // Cria um ID único para o container
      const playerId = `youtube-player-${videoId}`;
      if (containerRef.current) {
        containerRef.current.id = playerId;
      }

      playerRef.current = new (window as any).YT.Player(playerId, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event: any) => {
            // State 1 = playing
            if (event.data === 1 && !hasCalledOnPlay.current && onPlay) {
              hasCalledOnPlay.current = true;
              onPlay();
            }
          },
        },
      });
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, onPlay]);

  if (!videoId)
    return <Typography color="error">Link do YouTube inválido</Typography>;

  return (
    <Box
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: "56.25%" /* 16:9 aspect ratio */,
        height: 0,
        overflow: "hidden",
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </Box>
  );
};

// Interface TabPanel para funcionalidade de abas
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && <Box className="tabPanel">{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `course-tab-${index}`,
    "aria-controls": `course-tabpanel-${index}`,
  };
}

const CourseView: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [course, setCourse] = useState<Curso | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Aula | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [currentModule, setCurrentModule] = useState<Modulo | null>(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [hasExistingEssay, setHasExistingEssay] = useState(false);
  const [currentEssayId, setCurrentEssayId] = useState<number | null>(null);
  const [existingEssayResponseId, setExistingEssayResponseId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estilos sem props iniciais
  const baseClasses = useStyles({});

  // Estados UI adicionais
  const [moduleForm, setModuleForm] = useState({ nome: "", ordem: 0 });
  const [lessonForm, setLessonForm] = useState({
    titulo: "",
    urlVideo: "",
    ordem: 0,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Modulo | null>(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseAPI.getCourseById(id);
        setCourse(response.data);

        // Fetch current progress for the logged-in student
        if (user?.id) {
          try {
            const progressResponse = await courseAPI.getCourseProgress(
              Number(id),
              user.id
            );

            // Atualizar o progresso geral do curso
            setCourseProgress(progressResponse.data.courseProgress || 0);

            // Carregar as aulas já assistidas
            const completedLessonIds =
              progressResponse.data.completedLessons || [];
            setCompletedLessons(
              Array.isArray(completedLessonIds) ? completedLessonIds : []
            );

            console.log("Aulas já assistidas:", completedLessonIds);
          } catch (progressError) {
            console.error("Erro ao carregar progresso:", progressError);
            // Inicializa com valores padrão em caso de erro
            setCourseProgress(0);
            setCompletedLessons([]);
          }
        }

        // Se houver módulos, expandir o primeiro
        if (response.data.modulos && response.data.modulos.length > 0) {
          // Verificar se existe algum módulo com aulas não assistidas para exibir primeiro
          let moduleToExpand = response.data.modulos[0].id;
          let lessonToSelect = null;

          // Procurar a primeira aula não assistida para sugerir ao usuário
          for (const modulo of response.data.modulos) {
            if (!modulo.aulas || modulo.aulas.length === 0) continue;

            const uncompletedLesson = modulo.aulas.find(
              (aula: any) => !completedLessons.includes(aula.id)
            );

            if (uncompletedLesson) {
              moduleToExpand = modulo.id;
              lessonToSelect = uncompletedLesson;
              break;
            }
          }

          // Expandir o módulo selecionado
          setExpandedModules([moduleToExpand]);

          // Definir o módulo atual
          const currentMod = response.data.modulos.find(
            (m: any) => m.id === moduleToExpand
          );
          setCurrentModule(currentMod || response.data.modulos[0]);

          // Selecionar a aula (não assistida ou a primeira do módulo)
          if (lessonToSelect) {
            setSelectedLesson(lessonToSelect);
            // Verificar se já existe uma escrita criativa para esta aula
            await checkExistingEssay(lessonToSelect.id);
          } else if (currentMod?.aulas && currentMod.aulas.length > 0) {
            setSelectedLesson(currentMod.aulas[0]);
            // Verificar se já existe uma escrita criativa para esta aula
            await checkExistingEssay(currentMod.aulas[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch course or progress", error);
      }
    };

    fetchCourse();
  }, [id, user]);

  const handleLessonSelect = async (aula: Aula, modulo: Modulo) => {
    if (isProgressLocked(aula.id)) {
      setSuccessMessage("Complete a lição anterior primeiro");
      setShowSuccessSnackbar(true);
      return;
    }

    setSelectedLesson(aula);
    setCurrentModule(modulo);

    // Verificar se já existe uma escrita criativa para esta aula
    await checkExistingEssay(aula.id);

    // Se a lição já foi completada, não precisa atualizar o progresso
    if (completedLessons.includes(aula.id)) {
      return;
    }

    // Para vídeos do YouTube, o progresso será marcado quando o vídeo começar a tocar
    // Para outros vídeos ou aulas sem vídeo, marca o progresso imediatamente
    if (aula.urlVideo && isYouTubeUrl(aula.urlVideo)) {
      // Não marca progresso aqui, será marcado no onPlay do YouTube
      return;
    }

    await markLessonAsComplete(aula.id);
  };

  // Função para marcar uma aula como completa
  const markLessonAsComplete = async (aulaId: number) => {
    // Se a lição já foi completada, não faz nada
    if (completedLessons.includes(aulaId)) {
      return;
    }

    try {
      // Calcula o incremento baseado no total de aulas
      const totalAulas =
        course?.modulos?.reduce((acc, m) => acc + m.aulas.length, 0) || 1;
      const incremento = 100 / totalAulas;

      const novoProgresso = Math.min(courseProgress + incremento, 100);

      // Atualiza o estado local
      setCourseProgress(novoProgresso);
      setCompletedLessons((prev) => [...prev, aulaId]);

      // Atualiza o backend
      if (user?.id && course?.id) {
        await courseAPI.updateCourseProgress(course.id, user.id, {
          courseProgress: incremento,
          completedLesson: aulaId,
        });
      }

      if (novoProgresso === 100) {
        triggerCelebration();
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
    }
  };

  // Função para verificar se já existe uma escrita criativa para a aula selecionada
  const checkExistingEssay = async (aulaId: number) => {
    try {
      if (!user?.id) return;

      // Primeiro, buscar se existe uma redação para esta aula
      const redacaoResponse = await essayAPI.getEssaysByLesson(aulaId);

      if (redacaoResponse.data && redacaoResponse.data.length > 0) {
        const redacao = redacaoResponse.data[0];

        // Verificar se o usuário já tem uma resposta para esta redação
        const respostaResponse = await essayAPI.getStudentEssayResponse(
          user.id,
          redacao.id
        );

        if (respostaResponse.data && respostaResponse.data.length > 0) {
          setHasExistingEssay(true);
          setCurrentEssayId(redacao.id);
          setExistingEssayResponseId(respostaResponse.data[0].id);
        } else {
          setHasExistingEssay(false);
          setCurrentEssayId(redacao.id);
          setExistingEssayResponseId(null);
        }
      } else {
        // Não há redação criada para esta aula
        setHasExistingEssay(false);
        setCurrentEssayId(null);
        setExistingEssayResponseId(null);
      }
    } catch (error) {
      console.error("Erro ao verificar escrita criativa existente:", error);
      setHasExistingEssay(false);
      setCurrentEssayId(null);
      setExistingEssayResponseId(null);
    }
  };

  const handleDeleteEssayResponse = async () => {
    if (!existingEssayResponseId) return;
    
    try {
      setIsDeleting(true);
      await essayAPI.deleteEssayResponse(existingEssayResponseId);
      setHasExistingEssay(false);
      setExistingEssayResponseId(null);
      setShowDeleteConfirm(false);
      setSuccessMessage("Redação removida com sucesso!");
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error("Erro ao remover redação:", error);
      alert("Erro ao remover a redação. Por favor, tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    // Removendo a exibição do modal de congratulações
    // setShowCongrats(true);
  };

  const handleModuleToggle = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleVideoProgress = (
    event: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    if (!selectedLesson) return;

    const video = event.currentTarget;
    const progress = Math.round((video.currentTime / video.duration) * 100);

    if (progress >= 90 && !completedLessons.includes(selectedLesson.id)) {
      // Marcar a lição como concluída
      setCompletedLessons((prev) => [...prev, selectedLesson.id]);

      // Atualizar o progresso do curso
      const totalAulas =
        course?.modulos?.reduce((acc, m) => acc + m.aulas.length, 0) || 1;
      const incremento = 100 / totalAulas;
      const novoProgresso = Math.min(courseProgress + incremento, 100);
      setCourseProgress(novoProgresso);

      // Atualizar o backend com a nova aula concluída
      if (user?.id) {
        courseAPI
          .updateCourseProgress(Number(course?.id), user.id, {
            courseProgress: incremento, // Apenas o incremento, não o valor total
            completedLesson: selectedLesson.id, // Incluindo o ID da aula concluída
          })
          .catch((error) =>
            console.error("Erro ao atualizar progresso", error)
          );
      }

      if (novoProgresso === 100) {
        triggerCelebration();
      }
    }
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  // Função para verificar se a lição deve estar bloqueada
  const isProgressLocked = (lessonId: number): boolean => {
    if (user?.role === "teacher") return false; // Professores podem acessar qualquer lição

    // Encontrar todas as aulas em todos os módulos
    const allLessons: Aula[] = [];
    course?.modulos.forEach((module) => {
      module.aulas.forEach((lesson) => {
        allLessons.push(lesson);
      });
    });

    // Ordenar aulas por ID ou ordem
    allLessons.sort((a, b) => a.id - b.id);

    // Encontrar o índice atual da lição
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === lessonId
    );
    if (currentIndex === 0) return false; // Primeira lição nunca está bloqueada

    // Verificar se a lição anterior está concluída
    const previousLesson = allLessons[currentIndex - 1];
    return previousLesson && !completedLessons.includes(previousLesson.id);
  };

  // Funções para navegação entre aulas
  const getNextLesson = (): { lesson: Aula | null; module: Modulo | null } => {
    if (!selectedLesson || !currentModule || !course)
      return { lesson: null, module: null };

    // Encontrar índice atual da aula no módulo atual
    const currentLessonIndex = currentModule.aulas.findIndex(
      (aula) => aula.id === selectedLesson.id
    );

    // Verificar se existe próxima aula no módulo atual
    if (currentLessonIndex < currentModule.aulas.length - 1) {
      return {
        lesson: currentModule.aulas[currentLessonIndex + 1],
        module: currentModule,
      };
    }

    // Verificar se existe próximo módulo
    const currentModuleIndex = course.modulos.findIndex(
      (modulo) => modulo.id === currentModule.id
    );
    if (currentModuleIndex < course.modulos.length - 1) {
      const nextModule = course.modulos[currentModuleIndex + 1];
      if (nextModule.aulas.length > 0) {
        return { lesson: nextModule.aulas[0], module: nextModule };
      }
    }

    return { lesson: null, module: null };
  };

  const getPreviousLesson = (): {
    lesson: Aula | null;
    module: Modulo | null;
  } => {
    if (!selectedLesson || !currentModule || !course)
      return { lesson: null, module: null };

    // Encontrar índice atual da aula no módulo atual
    const currentLessonIndex = currentModule.aulas.findIndex(
      (aula) => aula.id === selectedLesson.id
    );

    // Verificar se existe aula anterior no módulo atual
    if (currentLessonIndex > 0) {
      return {
        lesson: currentModule.aulas[currentLessonIndex - 1],
        module: currentModule,
      };
    }

    // Verificar se existe módulo anterior
    const currentModuleIndex = course.modulos.findIndex(
      (modulo) => modulo.id === currentModule.id
    );
    if (currentModuleIndex > 0) {
      const prevModule = course.modulos[currentModuleIndex - 1];
      if (prevModule.aulas.length > 0) {
        return {
          lesson: prevModule.aulas[prevModule.aulas.length - 1],
          module: prevModule,
        };
      }
    }

    return { lesson: null, module: null };
  };

  const handleNextLesson = () => {
    const { lesson, module } = getNextLesson();
    if (lesson && module) {
      handleLessonSelect(lesson, module);
      // Garantir que o módulo esteja expandido
      if (!expandedModules.includes(module.id)) {
        setExpandedModules((prev) => [...prev, module.id]);
      }
    }
  };

  const handlePreviousLesson = () => {
    const { lesson, module } = getPreviousLesson();
    if (lesson && module) {
      handleLessonSelect(lesson, module);
      // Garantir que o módulo esteja expandido
      if (!expandedModules.includes(module.id)) {
        setExpandedModules((prev) => [...prev, module.id]);
      }
    }
  };

  // Funções existentes de edição para professores
  const handleModuleUpdate = async (
    moduleId: number,
    data: Partial<Modulo>
  ) => {
    try {
      const response = await moduleAPI.updateModule(moduleId, {
        nome: data.nome,
        ordem: 0,
      });

      if (response.status === 200) {
        // Refresh course data
        const courseResponse = await courseAPI.getCourseById(id);
        setCourse(courseResponse.data);
        // setIsEditing(false);
        setEditingModule(null);
        setSuccessMessage("Módulo atualizado com sucesso");
        setShowSuccessSnackbar(true);
      }
    } catch (error) {
      console.error("Failed to update module:", error);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      alert("O arquivo é muito grande. O tamanho máximo permitido é 500MB.");
      return;
    }

    const formData = new FormData();
    formData.append("videoFile", file);
    formData.append("titulo", lessonForm.titulo);
    formData.append("ordem", lessonForm.ordem.toString());
    formData.append("moduloId", editingModule?.id?.toString() || "");

    try {
      const response = await lessonAPI.createLessonWithVideo(
        Number(id),
        Number(editingModule?.id),
        formData
      );

      if (response.status === 201) {
        // Refresh course data
        const courseResponse = await courseAPI.getCourseById(id);
        setCourse(courseResponse.data);
        setShowLessonForm(false);
        setVideoFile(null);
        setUploadProgress(0);
        setSuccessMessage("Aula criada com sucesso");
        setShowSuccessSnackbar(true);
      }
    } catch (error) {
      console.error("Failed to upload video:", error);
    }
  };

  // Renderização dos componentes de diálogo
  const renderLessonFormDialog = () => (
    <Dialog
      open={showLessonForm}
      onClose={() => setShowLessonForm(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Nova Aula</DialogTitle>
      <DialogContent>
        <TextField
          label="Título da Aula"
          value={lessonForm.titulo}
          onChange={(e) =>
            setLessonForm({ ...lessonForm, titulo: e.target.value })
          }
          fullWidth
          margin="normal"
        />
        <input
          type="file"
          accept="video/mp4"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 500 * 1024 * 1024) {
                alert(
                  "O arquivo é muito grande. O tamanho máximo permitido é 500MB."
                );
                return;
              }
              setVideoFile(file);
            }
          }}
        />
        <Button
          variant="contained"
          color="default"
          startIcon={<CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          fullWidth
          style={{ margin: "16px 0" }}
        >
          {videoFile ? videoFile.name : "Selecionar Vídeo MP4"}
        </Button>
        {uploadProgress > 0 && (
          <Box className={baseClasses.uploadProgress}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="body2" color="textSecondary" align="center">
              {uploadProgress}%
            </Typography>
          </Box>
        )}
        <TextField
          label="Ordem"
          type="number"
          value={lessonForm.ordem}
          onChange={(e) =>
            setLessonForm({ ...lessonForm, ordem: parseInt(e.target.value) })
          }
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowLessonForm(false)}>Cancelar</Button>
        <Button
          color="primary"
          disabled={!videoFile || !lessonForm.titulo}
          onClick={() => {
            if (videoFile) {
              handleVideoUpload(videoFile);
            }
          }}
        >
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderModuleFormDialog = () => (
    <Dialog
      open={showModuleForm}
      onClose={() => setShowModuleForm(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Novo Módulo</DialogTitle>
      <DialogContent>
        <TextField
          label="Nome do Módulo"
          value={moduleForm.nome}
          onChange={(e) =>
            setModuleForm({ ...moduleForm, nome: e.target.value })
          }
          fullWidth
          margin="normal"
        />
        <TextField
          label="Ordem"
          type="number"
          value={moduleForm.ordem}
          onChange={(e) =>
            setModuleForm({ ...moduleForm, ordem: parseInt(e.target.value) })
          }
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowModuleForm(false)}>Cancelar</Button>
        <Button
          color="primary"
          onClick={async () => {
            await moduleAPI.createModule(Number(id), moduleForm);
            setShowModuleForm(false);
            // Refresh course data
            const response = await courseAPI.getCourseById(id);
            setCourse(response.data);
            setSuccessMessage("Módulo criado com sucesso");
            setShowSuccessSnackbar(true);
          }}
        >
          Criar
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderCongratsModal = () => (
    <Modal
      open={showCongrats}
      onClose={() => setShowCongrats(false)}
      closeAfterTransition
    >
      <Fade in={showCongrats}>
        <Paper className={baseClasses.congratsModal}>
          <EmojiEventsIcon className={baseClasses.trophy} />
          <Typography variant="h4" gutterBottom>
            Parabéns!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Você concluiu o curso com sucesso!
          </Typography>
          <Box className={baseClasses.progressCircle}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={80}
              thickness={4}
              color="primary"
            />
            <Typography variant="h6" className={baseClasses.circleText}>
              100%
            </Typography>
          </Box>
          <Typography color="textSecondary" paragraph>
            Continue aprendendo com nossos outros cursos!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/painel"
            style={{ marginTop: 16 }}
          >
            Voltar para Dashboard
          </Button>
        </Paper>
      </Fade>
    </Modal>
  );

  // Renderização dos módulos e aulas
  const renderModules = () => (
    <>
      {user?.role === "teacher" && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowModuleForm(true)}
          fullWidth
          style={{ marginBottom: theme.spacing(2) }}
        >
          Novo Módulo
        </Button>
      )}
      {course?.modulos?.map((modulo) => (
        <Card key={modulo.id} className={baseClasses.sidebarCard}>
          <CardContent>
            <div
              className={baseClasses.moduleHeader}
              onClick={() => handleModuleToggle(modulo.id)}
            >
              <div className={baseClasses.moduleName}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                >
                  <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
                    {modulo.nome}
                  </Typography>
                  <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                    <Chip
                      label={`${
                        modulo.aulas?.filter((aula) =>
                          completedLessons.includes(aula.id)
                        ).length || 0
                      }/${modulo.aulas?.length || 0}`}
                      size="small"
                      style={{
                        backgroundColor: "#e8f5e8",
                        color: "#2e7d32",
                        fontSize: "0.7rem",
                        height: "20px",
                      }}
                    />
                    <ExpandMoreIcon
                      style={{
                        transform: expandedModules.includes(modulo.id)
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
              </div>
            </div>
            {expandedModules.includes(modulo.id) && (
              <div className={baseClasses.moduleGroup}>
                {modulo.aulas?.map((aula) => (
                  <div
                    key={aula.id}
                    className={`${baseClasses.lessonItem} ${
                      isProgressLocked(aula.id) ? baseClasses.lockedLesson : ""
                    }`}
                    style={{
                      backgroundColor:
                        selectedLesson?.id === aula.id
                          ? "#e3f2fd"
                          : "transparent",
                      border:
                        selectedLesson?.id === aula.id
                          ? "2px solid #2196f3"
                          : "1px solid transparent",
                      borderRadius: "8px",
                      margin: "4px 0",
                      padding: "8px",
                      position: "relative",
                      cursor: isProgressLocked(aula.id)
                        ? "not-allowed"
                        : "pointer",
                    }}
                    onClick={() =>
                      !isProgressLocked(aula.id) &&
                      handleLessonSelect(aula, modulo)
                    }
                  >
                    <div className={baseClasses.lessonContent}>
                      {completedLessons.includes(aula.id) ? (
                        <CheckCircleIcon
                          className={baseClasses.lessonIcon}
                          style={{ color: "#4caf50" }}
                        />
                      ) : (
                        <PlayCircleOutlineIcon
                          className={baseClasses.lessonIcon}
                          style={{
                            color:
                              selectedLesson?.id === aula.id
                                ? "#2196f3"
                                : "#666",
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        style={{
                          fontWeight:
                            selectedLesson?.id === aula.id ? 600 : 500,
                          color:
                            selectedLesson?.id === aula.id
                              ? "#2196f3"
                              : "inherit",
                        }}
                      >
                        {aula.titulo}
                      </Typography>
                      {selectedLesson?.id === aula.id && (
                        <Typography
                          variant="caption"
                          style={{
                            color: "#2196f3",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            position: "absolute",
                            right: "8px",
                            top: "8px",
                          }}
                        >
                          ▶ ATUAL
                        </Typography>
                      )}
                    </div>
                    {isProgressLocked(aula.id) && (
                      <LockIcon style={{ color: "#999" }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );

  if (!course) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" className={baseClasses.root}>
      <div className={baseClasses.mainContainer}>
        <div className={baseClasses.contentLayout}>
          <div className={baseClasses.videoContainer}>
            {selectedLesson ? (
              <>
                <div className={baseClasses.currentVideoInfo}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Aula Atual:
                      </Typography>
                      <Typography variant="h6">
                        {selectedLesson.titulo}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      {completedLessons.includes(selectedLesson.id) ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Concluída"
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<PlayCircleOutlineIcon />}
                          label="Em Progresso"
                          color="secondary"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  </Box>
                </div>

                {/* Tabs para alternar entre vídeo, materiais e escrita criativa */}
                <Box mb={2}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                  >
                    <Tab
                      label="Vídeo da Aula"
                      icon={<VideocamIcon />}
                      {...a11yProps(0)}
                    />
                    <Tab
                      label="Material Complementar"
                      icon={<DescriptionIcon />}
                      {...a11yProps(1)}
                    />
                    <Tab
                      label="Escrita Criativa"
                      icon={<AssignmentIcon />}
                      {...a11yProps(2)}
                    />
                  </Tabs>
                </Box>

                {/* Conteúdo das abas */}
                <TabPanel value={tabValue} index={0}>
                  {selectedLesson && selectedLesson.urlVideo ? (
                    isYouTubeUrl(selectedLesson.urlVideo) ? (
                      // Renderiza o player do YouTube
                      <YouTubePlayer
                        url={selectedLesson.urlVideo}
                        title={selectedLesson.titulo}
                        onPlay={() => {
                          if (selectedLesson) {
                            markLessonAsComplete(selectedLesson.id);
                          }
                        }}
                      />
                    ) : (
                      // Renderiza o player de vídeo padrão
                      <VideoPlayer
                        url={selectedLesson.urlVideo}
                        onProgress={handleVideoProgress}
                      />
                    )
                  ) : (
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      align="center"
                    >
                      Não há vídeo disponível para esta aula
                    </Typography>
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {user?.role === "teacher" && (
                    <DocumentUpload
                      aulaId={selectedLesson.id}
                      onUploadComplete={() =>
                        setRefreshDocuments((prev) => prev + 1)
                      }
                    />
                  )}
                  <Typography variant="h6" gutterBottom>
                    Material Complementar
                  </Typography>
                  <DocumentList
                    aulaId={selectedLesson.id}
                    isTeacher={user?.role === "teacher"}
                    onUpdateList={() => setRefreshDocuments((prev) => prev + 1)}
                    key={`docs-${selectedLesson.id}-${refreshDocuments}`}
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Card style={{ padding: 24 }}>
                    <Typography variant="h5" gutterBottom>
                      Escrita Criativa
                    </Typography>

                    <Typography variant="body1" color="textSecondary" paragraph>
                      Pratique sua escrita criativa com base no conteúdo da
                      aula: <strong>"{selectedLesson.titulo}"</strong>
                    </Typography>

                    <Box display="flex" justifyContent="center" alignItems="center" mb={3} style={{ gap: 16 }}>
                      {currentEssayId ? (
                        <>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            startIcon={<AssignmentIcon />}
                            onClick={() =>
                              history.push(`/fazer-redacao/${selectedLesson?.id}`)
                            }
                            style={{
                              padding: "12px 32px",
                              fontSize: "1rem",
                              borderRadius: "8px",
                              textTransform: "none",
                            }}
                          >
                            {hasExistingEssay
                              ? "Editar Escrita Criativa"
                              : "Começar a Escrever"}
                          </Button>
                          {hasExistingEssay && (
                            <Button
                              variant="outlined"
                              color="default"
                              size="large"
                              onClick={() => setShowDeleteConfirm(true)}
                              style={{
                                padding: "12px 24px",
                                fontSize: "1rem",
                                borderRadius: "8px",
                                textTransform: "none",
                              }}
                            >
                              Desfazer Envio
                            </Button>
                          )}
                        </>
                      ) : (
                        <Box textAlign="center">
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            paragraph
                          >
                            Nenhuma atividade de escrita criativa disponível
                            para esta aula.
                          </Typography>
                          {user?.role === "teacher" && (
                            <Typography variant="caption" color="textSecondary">
                              Como professor, você pode criar uma atividade de
                              escrita criativa na área de edição do curso.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>

                    <Box
                      p={2}
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                        borderLeft: "4px solid #2196f3",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        style={{ fontWeight: 600, marginBottom: 8 }}
                      >
                        💡 Dicas para uma boa redação:
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="div"
                      >
                        <ul style={{ margin: 0, paddingLeft: "16px" }}>
                          <li>Assista completamente ao vídeo da aula</li>
                          <li>Faça anotações dos pontos principais</li>
                          <li>Organize suas ideias antes de começar</li>
                          <li>Revise seu texto antes de enviar</li>
                        </ul>
                      </Typography>
                    </Box>
                  </Card>
                </TabPanel>

                <div className={baseClasses.navigationButtons}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<NavigateBeforeIcon />}
                    onClick={handlePreviousLesson}
                    className={baseClasses.nextPrevButton}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNextLesson}
                    className={baseClasses.nextPrevButton}
                  >
                    Próximo
                  </Button>
                </div>
              </>
            ) : (
              <Typography>
                Selecione uma aula para começar a aprender
              </Typography>
            )}
          </div>
          <div className={baseClasses.sidebar}>
            {renderModules()}
            <div className={baseClasses.courseProgress}>
              <Typography variant="h6" gutterBottom>
                Progresso do Curso
              </Typography>
              <LinearProgress
                variant="determinate"
                value={courseProgress}
                className={baseClasses.progressBar}
              />
              <Typography variant="body2" color="textSecondary">
                {courseProgress}%
              </Typography>
            </div>
          </div>
        </div>
      </div>
      {renderLessonFormDialog()}
      {renderModuleFormDialog()}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSuccessSnackbar(false)}
        message={successMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
      
      {/* Dialog de confirmação para desfazer envio de redação */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogTitle>Desfazer Envio da Redação</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja desfazer o envio da sua redação? 
            Esta ação não pode ser desfeita e você perderá todo o conteúdo escrito.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteConfirm(false)} 
            color="default"
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteEssayResponse} 
            color="secondary"
            disabled={isDeleting}
          >
            {isDeleting ? "Removendo..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseView;
