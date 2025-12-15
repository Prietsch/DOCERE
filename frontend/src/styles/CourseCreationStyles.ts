import { makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  header: {
    marginBottom: theme.spacing(6),
    textAlign: "center",
  },
  headerIcon: {
    fontSize: 48,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
  },
  moduleCard: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    backgroundColor: "#f8f9fa",
    border: "1px solid #e0e0e0",
    borderRadius: theme.spacing(1),
  },
  lessonItem: {
    backgroundColor: "#ffffff",
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  addButton: {
    margin: theme.spacing(2, 0),
  },
  submitButton: {
    padding: theme.spacing(1.5, 4),
    marginTop: theme.spacing(4),
    fontSize: "1.1rem",
  },
  dropzone: {
    marginTop: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  documentSection: {
    marginTop: theme.spacing(2),
  },
  documentList: {
    marginTop: theme.spacing(2),
  },
  moduleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  videoStatusSuccess: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "rgba(0,255,0,0.1)",
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  videoStatusLoading: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "rgba(0,0,255,0.1)",
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    alignItems: "center",
  },
  videoStatusError: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "rgba(255,0,0,0.1)",
    borderRadius: theme.shape.borderRadius,
  },
  successIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  loadingProgress: {
    marginRight: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  activityItem: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: theme.shape.borderRadius,
  },
  actionButtons: {
    display: "flex",
    marginTop: theme.spacing(2),
    gap: theme.spacing(2),
  },
}));
