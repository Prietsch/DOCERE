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
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useStyles } from "../styles/LoginStyles";

const Login: React.FC = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const history = useHistory();

  // Redirecionar para dashboard se o usuário já estiver logado
  useEffect(() => {
    if (user) {
      history.push("/painel");
    }
  }, [user, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error messages

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true); // Start loading after validation passes

    try {
      await login(email, password);
      // Auth context handles token storage
      history.push("/painel");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container maxWidth="xs" className={classes.container}>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
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
                autoComplete="current-password"
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
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Divider className={classes.divider} />

          <Box className={classes.registerPrompt}>
            <Typography variant="body2" gutterBottom>
              Não tem uma conta ainda?
            </Typography>
            <Button
              component={Link}
              to="/cadastro"
              variant="outlined"
              color="secondary"
              fullWidth
              className={classes.registerButton}
            >
              Crie sua conta agora
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
