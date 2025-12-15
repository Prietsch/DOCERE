import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useStyles } from "../styles/RegisterStyles";

const Register: React.FC = () => {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const history = useHistory();

  // Determina o role baseado no email
  const getRoleFromEmail = (email: string): string => {
    return email.toLowerCase().includes("aluno") ? "student" : "teacher";
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name || !email || !password) {
        setError("Por favor, preencha todos os campos");
        setLoading(false);
        return;
      }

      const role = getRoleFromEmail(email);
      await register(name, email, password, role);
      history.push("/painel");
    } catch (error: any) {
      setError(
        error.message || "Falha ao registrar. Por favor tente novamente."
      );
      console.error("Failed to register", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" className={classes.container}>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h4" align="center" gutterBottom>
          Registro
        </Typography>

        {error && (
          <Typography color="error" align="center" className={classes.error}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit} className={classes.form}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Nome completo"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Senha"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={classes.passwordField}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                💡 Emails com "aluno" serão registrados como estudante, demais como professor.
              </Typography>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar"}
          </Button>

          <Divider style={{ margin: "16px 0" }} />

          <Box className={classes.loginPrompt}>
            <Typography variant="body2">Já tem uma conta?</Typography>
            <Button
              component={Link}
              to="/entrar"
              color="secondary"
              fullWidth
              variant="outlined"
              className={classes.loginLink}
            >
              Fazer login
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Register;
