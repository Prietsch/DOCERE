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
  radioGroup: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  roleHeading: {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  passwordField: {
    "& .MuiInputBase-root": {
      paddingRight: 0,
    },
  },
  loginPrompt: {
    textAlign: "center",
    marginTop: theme.spacing(2),
  },
  loginLink: {
    marginTop: theme.spacing(1),
  },
  "@keyframes shake": {
    "0%": { transform: "translateX(0)" },
    "25%": { transform: "translateX(5px)" },
    "50%": { transform: "translateX(-5px)" },
    "75%": { transform: "translateX(5px)" },
    "100%": { transform: "translateX(0)" },
  },
}));
