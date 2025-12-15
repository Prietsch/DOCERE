import { makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  paper: {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
  },
  error: {
    marginBottom: "1rem",
    animation: "$shake 0.5s",
    animationIterationCount: 1,
  },
  divider: {
    margin: theme.spacing(3, 0, 1),
    width: "100%",
  },
  registerPrompt: {
    textAlign: "center",
    marginTop: theme.spacing(2),
  },
  registerButton: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
  },
  passwordField: {
    "& .MuiInputBase-root": {
      paddingRight: 0,
    },
  },
  loadingIndicator: {
    marginRight: theme.spacing(1),
  },
  "@keyframes shake": {
    "0%": { transform: "translateX(0)" },
    "25%": { transform: "translateX(5px)" },
    "50%": { transform: "translateX(-5px)" },
    "75%": { transform: "translateX(5px)" },
    "100%": { transform: "translateX(0)" },
  },
}));
