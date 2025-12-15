import { makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  sectionDescription: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  contentBox: {
    marginBottom: theme.spacing(4),
  },
  textDisplay: {
    padding: theme.spacing(2),
    backgroundColor: "#f5f5f5",
    borderRadius: theme.shape.borderRadius * 2,
    whiteSpace: "pre-wrap",
  },
  divider: {
    margin: theme.spacing(4, 0),
  },
  implementationSection: {
    marginTop: theme.spacing(4),
  },
  highlighterContainer: {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2),
    backgroundColor: "#f5f5f5",
    borderRadius: theme.shape.borderRadius * 2,
  },
  feedbackPaper: {
    padding: theme.spacing(3),
  },
  feedbackHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    "& .MuiChip-root": {
      marginLeft: theme.spacing(1),
    },
  },
  saveButton: {
    marginTop: theme.spacing(3),
  },
  legendPaper: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(3),
  },
  legendHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  colorBox: {
    width: 16,
    height: 16,
    marginRight: theme.spacing(1),
    borderRadius: theme.shape.borderRadius / 2,
  },
  colorInput: {
    width: "100%",
    height: 40,
    marginTop: theme.spacing(1),
  },
  dialogActions: {
    padding: theme.spacing(2),
  },
  chip: {
    marginLeft: theme.spacing(1),
  },
}));
