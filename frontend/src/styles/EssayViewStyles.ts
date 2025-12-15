import { makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  mainPaper: {
    padding: theme.spacing(3),
  },
  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  divider: {
    marginBottom: theme.spacing(3),
  },
  textContainer: {
    marginTop: theme.spacing(3),
  },
  feedbackPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  feedbackTitle: {
    marginBottom: theme.spacing(2),
  },
  commentsPaper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  commentTypeSection: {
    marginBottom: theme.spacing(3),
  },
  commentTypeName: {
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  commentBox: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.grey[200]}`,
    borderRadius: theme.shape.borderRadius,
  },
  commentText: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
  highlightedText: {
    fontStyle: "italic",
    fontWeight: 500,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
  },
  commentsTitle: {
    marginBottom: theme.spacing(2),
  },
  chip: {
    fontWeight: 500,
  },
}));
