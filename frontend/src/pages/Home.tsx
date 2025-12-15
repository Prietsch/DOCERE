import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@material-ui/core";
import {
  Create as CreateIcon,
  EmojiObjects as IdeaIcon,
  Brightness7 as IlluminationIcon,
  Build as ImplementIcon,
  Timeline as TimelineIcon,
} from "@material-ui/icons";
import React, { useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useStyles } from "../styles/HomeStyles";

const Home: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { user } = useAuth();
  const history = useHistory();

  // Redirecionar para dashboard se o usuário já estiver logado
  useEffect(() => {
    if (user) {
      history.push("/painel");
    }
  }, [user, history]);

  return (
    <div className={classes.root}>
      <Box className={classes.hero}>
        <Container maxWidth="lg" className={classes.heroContent}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                gutterBottom
                style={{ color: "#D4AF37" }}
              >
                Desperte sua{" "}
                <span className={classes.highlightText}>Escrita Criativa</span>
              </Typography>
              <Typography
                variant="h6"
                style={{ marginBottom: theme.spacing(4) }}
              >
                Liberte seu potencial criativo e transforme suas ideias em
                textos envolventes que cativam, inspiram e transformam.
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    className={classes.goldButton}
                    size="large"
                    component={Link}
                    to="/entrar"
                  >
                    Explorar Cursos de Escrita
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box textAlign="center">
                <CreateIcon className={classes.studentIcon} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* 
      <Container
        maxWidth="lg"
        style={{ marginTop: -40, position: "relative", zIndex: 2 }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper className={classes.featureCard}>
              <MenuBookIcon className={classes.featureIcon} />
              <Typography variant="h6" gutterBottom>
                Técnicas Avançadas
              </Typography>
              <Typography>
                Aprenda metodologias e exercícios práticos para desenvolver sua
                voz autoral e estilo único.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className={classes.featureCard}>
              <TimelineIcon className={classes.featureIcon} />
              <Typography variant="h6" gutterBottom>
                Progresso Constante
              </Typography>
              <Typography>
                Desenvolvimento gradual das habilidades de escrita com feedback
                personalizado dos especialistas.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className={classes.featureCard}>
              <IdeaIcon className={classes.featureIcon} />
              <Typography variant="h6" gutterBottom>
                Desbloqueio Criativo
              </Typography>
              <Typography>
                Supere a síndrome da página em branco e transforme seus
                pensamentos em narrativas cativantes.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container> */}

      <Container maxWidth="lg" className={classes.processSection}>
        <Typography variant="h4" align="center" gutterBottom>
          A Jornada da{" "}
          <span className={classes.highlightText}>Escrita Criativa</span>
        </Typography>
        <Typography
          variant="body1"
          align="center"
          style={{ marginBottom: theme.spacing(6) }}
        >
          Descubra o processo que vai transformar suas ideias em textos
          impactantes
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={3}>
            <Paper className={classes.processStepCard}>
              <div className={classes.processStepNumber}>1</div>
              <TimelineIcon className={classes.featureIcon} />
              <Typography variant="h6" gutterBottom>
                Preparação
              </Typography>
              <Typography variant="body2">
                Explore ideias, pesquise, colete referências e organize seu
                pensamento. Esse é o momento de reunir todas as ferramentas e
                informações necessárias.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper className={classes.processStepCard}>
              <div className={classes.processStepNumber}>2</div>
              <IdeaIcon className={classes.featureIcon} />
              <Typography variant="h6" gutterBottom>
                Incubação
              </Typography>
              <Typography variant="body2">
                Dê tempo ao seu cérebro para processar as informações. Nesta
                fase do ócio criativo, conexões importantes são formadas
                inconscientemente.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper className={classes.processStepCard}>
              <div className={classes.processStepNumber}>3</div>
              <IlluminationIcon className={classes.featureIcon} />
              <Typography variant="h6" gutterBottom>
                Geração
              </Typography>
              <Typography variant="body2">
                O momento "eureka" onde as ideias fluem com clareza e as
                soluções criativas emergem naturalmente após o período de
                incubação.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper className={classes.processStepCard}>
              <div className={classes.processStepNumber}>4</div>
              <ImplementIcon className={classes.featureIcon} />
              <Typography variant="h6" gutterBottom>
                Implementação
              </Typography>
              <Typography variant="body2">
                Coloque suas ideias em prática, escreva, revise e refine seu
                texto até que ele transmita exatamente o que você deseja
                expressar.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* <Container maxWidth="md" className={classes.quoteSection}>
        <Typography variant="h5" align="center" className={classes.quote}>
          "A escrita é a pintura da voz. Uma boa escrita tem o poder de
          transformar perspectivas, tocar corações e mudar o mundo, uma palavra
          de cada vez."
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          className={classes.quoteAuthor}
        >
          — Docere • Inspirando escritores do amanhã
        </Typography>
      </Container> */}

      <Container maxWidth="md" className={classes.ctaSection}>
        <Typography variant="h4" gutterBottom>
          Pronto para Desbloquear seu Potencial Criativo?
        </Typography>
        <Typography variant="body1" style={{ marginBottom: theme.spacing(4) }}>
          Nossos cursos de escrita criativa foram desenvolvidos para guiar você
          por cada etapa do processo, desde a concepção de ideias até a criação
          de textos que verdadeiramente expressam sua visão única.
        </Typography>
        <Button
          variant="contained"
          className={classes.goldButton}
          size="large"
          component={Link}
          to="/entrar"
        >
          Começar Minha Jornada Criativa
        </Button>
      </Container>
    </div>
  );
};

export default Home;
