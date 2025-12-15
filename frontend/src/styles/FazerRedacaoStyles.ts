import { makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  stepContainer: {
    marginBottom: theme.spacing(4),
  },
  tabPanel: {
    padding: theme.spacing(3),
  },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  stepIcon: {
    fontSize: 28,
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  stepContent: {
    padding: theme.spacing(2),
    backgroundColor: "#f9f9f9",
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  tabs: {
    marginBottom: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  completedMarker: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: theme.palette.success.main,
  },
}));
