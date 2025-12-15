import {
  Box,
  Button,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  Visibility,
  VisibilityOff,
} from "@material-ui/icons";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { userAPI } from "../contexts/api";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(4),
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(3),
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
  avatarIcon: {
    fontSize: 48,
    color: "#fff",
  },
  form: {
    marginTop: theme.spacing(3),
  },
  submitButton: {
    marginTop: theme.spacing(3),
  },
  roleChip: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 16,
    display: "inline-block",
    fontSize: "0.875rem",
  },
  sectionTitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  backButton: {
    marginRight: theme.spacing(2),
  },
  themeSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
  },
  themeInfo: {
    display: "flex",
    alignItems: "center",
  },
  themeIcon: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
}));

const Profile: React.FC = () => {
  const classes = useStyles();
  const { user, logout } = useAuth();
  const { themeMode, toggleTheme } = useThemeContext();
  const history = useHistory();

  const [nome, setNome] = useState(user?.nome || "");
  const [email, setEmail] = useState(user?.email || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [error, setError] = useState("");

  if (!user) {
    history.push("/entrar");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nome.trim()) {
      setError("O nome é obrigatório");
      return;
    }

    if (!email.trim()) {
      setError("O email é obrigatório");
      return;
    }

    try {
      setLoading(true);
      
      const updateData: { nome?: string; email?: string } = {};
      
      if (nome !== user.nome) {
        updateData.nome = nome;
      }
      
      if (email !== user.email) {
        updateData.email = email;
      }

      if (Object.keys(updateData).length === 0) {
        setSnackbar({ open: true, message: "Nenhuma alteração detectada" });
        return;
      }

      await userAPI.updateProfile(user.id, user.role, updateData);

      // Atualizar dados no localStorage
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setSnackbar({ open: true, message: "Perfil atualizado com sucesso!" });
      
      // Recarregar a página para atualizar o contexto
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!novaSenha) {
      setError("A nova senha é obrigatória");
      return;
    }

    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);
      
      await userAPI.updateProfile(user.id, user.role, { senha: novaSenha });

      setSnackbar({ open: true, message: "Senha atualizada com sucesso! Faça login novamente." });
      
      // Fazer logout após alterar senha
      setTimeout(() => {
        logout();
        history.push("/entrar");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" className={classes.container}>
      <Paper className={classes.paper} elevation={3}>
        <Box className={classes.header}>
          <Box className={classes.avatar}>
            <PersonIcon className={classes.avatarIcon} />
          </Box>
          <Box>
            <Typography variant="h4">{user.nome}</Typography>
            <Typography variant="body2" color="textSecondary">
              {user.email}
            </Typography>
            <span className={classes.roleChip}>
              {user.role === "teacher" ? "Professor" : "Aluno"}
            </span>
          </Box>
        </Box>

        <Divider />

        {error && (
          <Box mt={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <Typography variant="h6" className={classes.sectionTitle}>
          Informações Pessoais
        </Typography>

        <form onSubmit={handleUpdateProfile} className={classes.form}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome"
                variant="outlined"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submitButton}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>

        <Typography variant="h6" className={classes.sectionTitle}>
          Alterar Senha
        </Typography>

        <form onSubmit={handleUpdatePassword}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nova Senha"
                variant="outlined"
                type={showNovaSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNovaSenha(!showNovaSenha)}
                        edge="end"
                      >
                        {showNovaSenha ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                variant="outlined"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            className={classes.submitButton}
            disabled={loading}
          >
            {loading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>

        <Typography variant="h6" className={classes.sectionTitle}>
          Aparência
        </Typography>

        <Box className={classes.themeSection}>
          <Box className={classes.themeInfo}>
            {themeMode === "dark" ? (
              <DarkModeIcon className={classes.themeIcon} />
            ) : (
              <LightModeIcon className={classes.themeIcon} />
            )}
            <Box>
              <Typography variant="body1">
                Tema {themeMode === "dark" ? "Escuro" : "Claro"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {themeMode === "dark"
                  ? "Reduz o brilho da tela para ambientes escuros"
                  : "Melhor visibilidade em ambientes claros"}
              </Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={themeMode === "dark"}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label=""
          />
        </Box>

        <Box mt={4}>
          <Button
            variant="outlined"
            onClick={() => history.push("/painel")}
          >
            Voltar ao Painel
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Container>
  );
};

export default Profile;
