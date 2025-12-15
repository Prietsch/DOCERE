import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import AutoStoriesIcon from "@material-ui/icons/MenuBook";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CreateIcon from "@material-ui/icons/Create";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import GroupIcon from "@material-ui/icons/Group";
import HistoryEduIcon from "@material-ui/icons/Edit";
import LocalLibraryIcon from "@material-ui/icons/LocalLibrary";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SchoolIcon from "@material-ui/icons/School";
import StarIcon from "@material-ui/icons/Star";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { courseAPI } from "../contexts/api";
import { useCardStyles, useStyles } from "../styles/DashboardStyles";

// Constantes e tipos
interface Course {
  id: number;
  nome: string;
  descricao: string;
  progresso?: number;
  duracao?: string;
  professor: {
    nome: string;
  };
  alunosAcessaram?: number;
  categoria?: string;
}

// Frases inspiradoras sobre escrita
const writingQuotes = [
  { quote: "Escrever é a arte de descobrir o que você acredita.", author: "Gustave Flaubert" },
  { quote: "A primeira versão de qualquer coisa é sempre horrível.", author: "Ernest Hemingway" },
  { quote: "Você pode sempre editar uma página ruim. Não pode editar uma página em branco.", author: "Jodi Picoult" },
  { quote: "Escreva com a porta fechada, reescreva com a porta aberta.", author: "Stephen King" },
  { quote: "A escrita é fácil. Tudo que você tem que fazer é riscar as palavras erradas.", author: "Mark Twain" },
  { quote: "Se você quer ser escritor, você precisa fazer duas coisas: ler muito e escrever muito.", author: "Stephen King" },
  { quote: "Não há nada para escrever. Tudo que você faz é sentar na máquina de escrever e sangrar.", author: "Ernest Hemingway" },
  { quote: "A imaginação é o começo da criação.", author: "George Bernard Shaw" },
];

// Dicas de escrita criativa
const writingTips = [
  "Tente escrever por 15 minutos sem parar. Não edite, apenas deixe as palavras fluírem.",
  "Leia seus textos em voz alta para identificar problemas de ritmo e fluidez.",
  "Mantenha um diário de ideias. Inspiração pode surgir a qualquer momento!",
  "Experimente escrever do ponto de vista de um personagem completamente diferente de você.",
  "Use todos os cinco sentidos ao descrever uma cena para torná-la mais vívida.",
  "Não tenha medo de deletar. Às vezes, menos é mais.",
  "Estabeleça uma rotina de escrita. Consistência é mais importante que inspiração.",
  "Leia autores fora da sua zona de conforto para expandir seu estilo.",
];

// Helper Functions
const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "narrativa":
      return <AutoStoriesIcon fontSize="large" />;
    case "poesia":
      return <HistoryEduIcon fontSize="large" />;
    case "roteiro":
      return <CreateIcon fontSize="large" />;
    default:
      return <LocalLibraryIcon fontSize="large" />;
  }
};

const getCourseColor = (category: string, index: number) => {
  const colors = [
    "#6366f1", // indigo
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#10b981", // emerald
  ];

  if (category === "narrativa") return "#6366f1";
  if (category === "poesia") return "#ec4899";
  if (category === "roteiro") return "#14b8a6";
  if (category === "técnicas") return "#f59e0b";

  return colors[index % colors.length];
};

// Separate CourseCard component
const CourseCard: React.FC<{
  course: Course;
  index: number;
  user: any;
  registeredCourses: number[];
  onEnterCourse: (courseId: number) => Promise<void>;
}> = ({ course, index, user, registeredCourses, onEnterCourse }) => {
  // Define specific styles for the course card component
  const classes = useCardStyles({
    index,
    progress: course.progresso || 0,
    category: course.categoria,
  });

  const courseColor = getCourseColor(course.categoria || "", index);
  const CardIconComponent = getCategoryIcon(course.categoria || "");
  const hasStarted = (course.progresso || 0) > 0;
  const isCompleted = (course.progresso || 0) >= 100;

  const getStatusLabel = () => {
    if (isCompleted) return "Concluído";
    if (hasStarted) return "Em progresso";
    return "Novo";
  };

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={4}
      key={course.id}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Card
        className={classes.courseCard}
        style={{ borderTop: `4px solid ${courseColor}` }}
      >
        {user?.role === "student" && (
          <div className={classes.statusRibbon}>{getStatusLabel()}</div>
        )}

        <div className={classes.cardHeader}>
          <div
            className={classes.cardIcon}
            style={{ backgroundColor: courseColor }}
          >
            {CardIconComponent}
          </div>
        </div>

        <CardContent className={classes.cardContent}>
          <Typography variant="h6" className={classes.courseTitle}>
            {course.nome}
          </Typography>

          <Typography variant="body2" className={classes.courseDescription}>
            {course.descricao}
          </Typography>

          <Divider />

          <Box mt={2}>
            {user?.role === "student" && (
              <Box
                display="flex"
                alignItems="center"
                mb={1}
                className={classes.courseInfoItem}
              >
                <SchoolIcon fontSize="small" />
                <Box ml={1}>
                  <Typography variant="body2" color="textSecondary">
                    Professor: {course.professor?.nome}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box
              display="flex"
              alignItems="center"
              className={classes.courseInfoItem}
            >
              <GroupIcon fontSize="small" />
              <Box ml={1}>
                <Typography variant="body2" color="textSecondary">
                  {course.alunosAcessaram || 0}{" "}
                  {course.alunosAcessaram === 1 ? "aluno" : "alunos"}
                </Typography>
              </Box>
            </Box>

            {user?.role === "student" && (
              <Box mt={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="textSecondary">
                    Progresso
                  </Typography>
                  <Typography variant="body2" style={{ fontWeight: "bold" }}>
                    {course.progresso || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={course.progresso || 0}
                  className={classes.progress}
                />
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions className={classes.cardActions}>
          {user?.role === "teacher" ? (
            <Button
              size="medium"
              variant="contained"
              color="primary"
              component={Link}
              to={`/curso-editar/${course.id}`}
              startIcon={<PlayArrowIcon />}
              className={classes.ctaButton}
              fullWidth
            >
              Gerenciar Curso
            </Button>
          ) : (
            <Button
              size="medium"
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              className={classes.ctaButton}
              fullWidth
              onClick={() => onEnterCourse(course.id)}
            >
              {isCompleted
                ? "Revisar Curso"
                : hasStarted
                ? "Continuar Curso"
                : "Começar Agora"}
            </Button>
          )}
        </CardActions>
      </Card>
    </Grid>
  );
};

const Dashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<number[]>([]);
  const { user } = useAuth();
  const history = useHistory();
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  // Use default styles for the main component
  const classes = useStyles({ index: 0, progress: 0 });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const url =
          user?.role === "teacher"
            ? await courseAPI.getTeacherCourses(user.id)
            : await courseAPI.getAllCourses();

        const coursesWithProgress = url.data;

        if (user?.role === "student") {
          const updatedCourses = await Promise.all(
            coursesWithProgress.map(async (course: any) => {
              try {
                const progressResponse = await courseAPI.getCourseProgress(
                  course.id,
                  user.id
                );
                return {
                  ...course,
                  progresso: progressResponse.data.courseProgress || 0,
                };
              } catch (error) {
                console.error(
                  `Error fetching progress for course ${course.id}:`,
                  error
                );
                return { ...course, progresso: 0 };
              }
            })
          );
          coursesWithProgress.length = 0;
          coursesWithProgress.push(...updatedCourses);
        }

        // Get students for each course
        await Promise.all(
          coursesWithProgress.map(async (course: any) => {
            try {
              const progressRecords = await courseAPI.getCourseStudents(
                course.id
              );
              const uniqueStudentIds = new Set(
                progressRecords.data.map((record: any) => record.alunoId)
              );
              course.alunosAcessaram = uniqueStudentIds.size;
            } catch (error) {
              console.error(
                `Error fetching students for course ${course.id}:`,
                error
              );
              course.alunosAcessaram = 0;
            }
          })
        );

        setCourses(coursesWithProgress);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [user]);

  // Group courses by status for student view
  const inProgressCourses = courses.filter(
    (course) => (course.progresso || 0) > 0 && (course.progresso || 0) < 100
  );
  const completedCourses = courses.filter(
    (course) => (course.progresso || 0) >= 100
  );
  const notStartedCourses = courses.filter(
    (course) => !course.progresso || course.progresso === 0
  );

  // Estatísticas do aluno
  const totalProgress = courses.length > 0 
    ? Math.round(courses.reduce((acc, c) => acc + (c.progresso || 0), 0) / courses.length)
    : 0;

  // Selecionar citação e dica do dia baseado na data
  const today = new Date().getDate();
  const dailyQuote = writingQuotes[today % writingQuotes.length];
  const dailyTip = writingTips[today % writingTips.length];

  // Function to handle entering a course
  const handleEnterCourse = async (courseId: number) => {
    if (!registeredCourses.includes(courseId)) {
      try {
        await courseAPI.enrollStudent(courseId, user?.id || 0);
        setRegisteredCourses([...registeredCourses, courseId]);
      } catch (error) {
        console.error(error);
      }
    }
    history.push(`/curso/${courseId}`);
  };

  // Encontrar o curso mais recente em progresso
  const mostRecentCourse = inProgressCourses.length > 0 
    ? inProgressCourses.reduce((prev, current) => 
        (prev.progresso || 0) > (current.progresso || 0) ? prev : current
      )
    : null;

  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        {/* Hero Section para Estudantes */}
        {user?.role === "student" && (
          <Paper className={classes.heroSection} elevation={0}>
            <Box className={classes.heroContent}>
              <Box className={classes.heroText}>
                <Typography variant="h4" className={classes.heroTitle}>
                  Olá, {user?.nome?.split(' ')[0]}! ✍️
                </Typography>
                <Typography variant="body1" className={classes.heroSubtitle}>
                  Pronto para continuar sua jornada na escrita criativa?
                </Typography>
                
                {/* Citação inspiradora */}
                <Box className={classes.quoteBox}>
                  <Typography variant="body1" className={classes.quoteText}>
                    "{dailyQuote.quote}"
                  </Typography>
                  <Typography variant="caption" className={classes.quoteAuthor}>
                    — {dailyQuote.author}
                  </Typography>
                </Box>
              </Box>

              {/* Estatísticas rápidas */}
              <Box className={classes.statsContainer}>
                <Box className={classes.statItem}>
                  <Box className={classes.statIcon} style={{ backgroundColor: '#6366f1' }}>
                    <AutoStoriesIcon />
                  </Box>
                  <Typography variant="h5" className={classes.statNumber}>
                    {courses.length}
                  </Typography>
                  <Typography variant="caption" className={classes.statLabel}>
                    Cursos
                  </Typography>
                </Box>
                <Box className={classes.statItem}>
                  <Box className={classes.statIcon} style={{ backgroundColor: '#10b981' }}>
                    <CheckCircleIcon />
                  </Box>
                  <Typography variant="h5" className={classes.statNumber}>
                    {completedCourses.length}
                  </Typography>
                  <Typography variant="caption" className={classes.statLabel}>
                    Concluídos
                  </Typography>
                </Box>
                <Box className={classes.statItem}>
                  <Box className={classes.statIcon} style={{ backgroundColor: '#f59e0b' }}>
                    <TrendingUpIcon />
                  </Box>
                  <Typography variant="h5" className={classes.statNumber}>
                    {totalProgress}%
                  </Typography>
                  <Typography variant="caption" className={classes.statLabel}>
                    Progresso
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Continuar de onde parou - Destaque */}
        {user?.role === "student" && mostRecentCourse && (
          <Paper className={classes.continueSection} elevation={0}>
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
              <Box flex={1} minWidth={280}>
                <Box display="flex" alignItems="center" mb={1}>
                  <PlayArrowIcon className={classes.continueIcon} />
                  <Typography variant="overline" className={classes.continueLabel}>
                    Continue de onde parou
                  </Typography>
                </Box>
                <Typography variant="h6" className={classes.continueTitle}>
                  {mostRecentCourse.nome}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={mostRecentCourse.progresso || 0} 
                    className={classes.continueProgress}
                  />
                  <Typography variant="body2" className={classes.continuePercent}>
                    {mostRecentCourse.progresso}%
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PlayArrowIcon />}
                className={classes.continueButton}
                onClick={() => handleEnterCourse(mostRecentCourse.id)}
              >
                Continuar Escrevendo
              </Button>
            </Box>
          </Paper>
        )}

        {/* Dica do dia */}
        {user?.role === "student" && (
          <Paper className={classes.tipSection} elevation={0}>
            <Box display="flex" alignItems="flex-start">
              <EmojiObjectsIcon className={classes.tipIcon} />
              <Box>
                <Typography variant="subtitle2" className={classes.tipLabel}>
                  💡 Dica do dia
                </Typography>
                <Typography variant="body2" className={classes.tipText}>
                  {dailyTip}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {user?.role === "teacher" && (
          <Box className={classes.teacherHeader}>
            <Typography variant="h4" className={classes.teacherTitle}>
              Seus Cursos
            </Typography>
            <Button
              variant="contained"
              color="primary"
              className={classes.addButton}
              startIcon={<AddIcon />}
              component={Link}
              to="/curso/criar"
              size="large"
            >
              Criar Novo Curso
            </Button>
          </Box>
        )}

        {user?.role === "student" && inProgressCourses.length > 1 && (
          <Box className={classes.dashboardSection}>
            <Box display="flex" alignItems="center" mb={2}>
              <CreateIcon className={classes.sectionIcon} />
              <Typography className={classes.sectionTitle}>
                Em Progresso
              </Typography>
              <Chip 
                label={inProgressCourses.length} 
                size="small" 
                className={classes.sectionChip}
              />
            </Box>
            <Grid
              container
              spacing={3}
              className={classes.courseCardsContainer}
            >
              {inProgressCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  user={user}
                  registeredCourses={registeredCourses}
                  onEnterCourse={handleEnterCourse}
                />
              ))}
            </Grid>
          </Box>
        )}

        {user?.role === "student" && notStartedCourses.length > 0 && (
          <Box className={classes.dashboardSection}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocalLibraryIcon className={classes.sectionIcon} />
              <Typography className={classes.sectionTitle}>
                Descubra Novos Cursos
              </Typography>
              <Chip 
                label={notStartedCourses.length} 
                size="small" 
                className={classes.sectionChip}
              />
            </Box>
            <Grid
              container
              spacing={3}
              className={classes.courseCardsContainer}
            >
              {notStartedCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  user={user}
                  registeredCourses={registeredCourses}
                  onEnterCourse={handleEnterCourse}
                />
              ))}
            </Grid>
          </Box>
        )}

        {user?.role === "student" && completedCourses.length > 0 && (
          <Box className={classes.dashboardSection}>
            <Box display="flex" alignItems="center" mb={2}>
              <StarIcon className={classes.sectionIcon} style={{ color: '#f59e0b' }} />
              <Typography className={classes.sectionTitle}>
                Conquistas Desbloqueadas
              </Typography>
              <Chip 
                label={completedCourses.length} 
                size="small" 
                className={classes.sectionChip}
                style={{ backgroundColor: '#10b981', color: 'white' }}
              />
            </Box>
            <Grid
              container
              spacing={3}
              className={classes.courseCardsContainer}
            >
              {completedCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  user={user}
                  registeredCourses={registeredCourses}
                  onEnterCourse={handleEnterCourse}
                />
              ))}
            </Grid>
          </Box>
        )}

        {/* Teacher view shows all courses */}
        {user?.role === "teacher" && (
          <Grid container spacing={3} className={classes.courseCardsContainer}>
            {courses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                user={user}
                registeredCourses={registeredCourses}
                onEnterCourse={handleEnterCourse}
              />
            ))}
          </Grid>
        )}

        {/* Estado vazio */}
        {courses.length === 0 && (
          <Paper className={classes.emptyState}>
            <CreateIcon className={classes.emptyIcon} />
            <Typography variant="h6" gutterBottom>
              {user?.role === "teacher" 
                ? "Você ainda não criou nenhum curso"
                : "Nenhum curso disponível no momento"
              }
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {user?.role === "teacher"
                ? "Comece criando seu primeiro curso de escrita criativa!"
                : "Em breve novos cursos estarão disponíveis para você."
              }
            </Typography>
            {user?.role === "teacher" && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                component={Link}
                to="/curso/criar"
                style={{ marginTop: 16 }}
              >
                Criar Primeiro Curso
              </Button>
            )}
          </Paper>
        )}
      </Container>
    </div>
  );
};

const fadeInKeyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const style = document.createElement("style");
style.innerHTML = fadeInKeyframes;
document.head.appendChild(style);

export default Dashboard;
