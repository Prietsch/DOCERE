import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomThemeProvider, useThemeContext } from "./contexts/ThemeContext";
import AllEssays from "./pages/AllEssays";
import CourseCreation from "./pages/CourseCreation";
import CourseEdit from "./pages/CourseEdit";
import CourseView from "./pages/CourseView";
import Dashboard from "./pages/Dashboard";
import EssayFeedbackPage from "./pages/EssayFeedbackPage";
import EssayViewPage from "./pages/EssayViewPage";
import FazerRedacao from "./pages/FazerRedacao";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import StudentEssays from "./pages/StudantEssay";

const AppContent: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/entrar" component={Login} />
            <Route path="/cadastro" component={Register} />
            <Route path="/painel" component={Dashboard} />
            <Route path="/perfil" component={Profile} />
            <Route path="/redacoes" component={AllEssays} />
            <Route path="/fazer-redacao/:id" component={FazerRedacao} />
            <Route path="/curso/criar" component={CourseCreation} />
            <Route path="/curso/:id" component={CourseView} />
            <Route path="/curso-editar/:id" component={CourseEdit} />
            <Route path="/ver-redacoes/:lessonId" component={StudentEssays} />
            <Route
              path="/feedback-redacao/:essayId/:studentId"
              component={EssayFeedbackPage}
            />
            <Route path="/visualizar-redacao/:essayId" component={EssayViewPage} />
          </Switch>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
};

export default App;
