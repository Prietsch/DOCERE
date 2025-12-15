import { makeStyles, Theme } from "@material-ui/core";

export interface StyleProps {
  isActive?: boolean;
  isCompleted?: boolean;
}

export const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    minHeight: "100vh",
    paddingBottom: theme.spacing(8),
  },
  mainContainer: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
  },
  courseHeader: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius * 2,
    position: "relative",
    overflow: "hidden",
    "&::after": {
      content: '""',
      position: "absolute",
      right: 0,
      top: 0,
      width: "30%",
      height: "100%",
      backgroundImage:
        "linear-gradient(135deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)",
      backgroundSize: "20px 20px",
    },
  },
  contentLayout: {
    display: "flex",
    gap: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  videoContainer: {
    flex: 3,
    minHeight: 200,
    position: "relative",
  },
  sidebar: {
    flex: 2,
    maxHeight: "calc(100vh - 220px)",
    overflow: "auto",
    position: "sticky",
    top: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      maxHeight: "none",
      position: "static",
    },
  },
  sidebarCard: {
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: theme.spacing(3),
  },
  videoPlayer: {
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  moduleGroup: {
    marginBottom: theme.spacing(2),
  },
  moduleHeader: {
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.grey[100],
    },
  },
  moduleName: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
  },
  lessonItem: {
    marginBottom: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5, 2),
    cursor: "pointer",
    backgroundColor: (props) =>
      props.isActive ? theme.palette.primary.main : theme.palette.grey[50],
    color: (props) =>
      props.isActive ? theme.palette.primary.contrastText : "inherit",
    border: (props) =>
      props.isCompleted
        ? `1px solid ${theme.palette.success.main}`
        : "1px solid transparent",
    borderLeft: (props) =>
      props.isCompleted
        ? `4px solid ${theme.palette.success.main}`
        : props.isActive
        ? `4px solid ${theme.palette.primary.dark}`
        : "4px solid transparent",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: (props) =>
        props.isActive ? theme.palette.primary.dark : theme.palette.grey[100],
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lessonIcon: {
    marginRight: theme.spacing(1.5),
  },
  lessonContent: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  currentVideoInfo: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius * 2,
    marginBottom: theme.spacing(3),
  },
  tabsContainer: {
    marginBottom: theme.spacing(3),
  },
  tabRoot: {
    minWidth: 0,
    textTransform: "none",
    fontSize: "0.9rem",
    padding: theme.spacing(1.5, 3),
  },
  tabSelected: {
    fontWeight: 600,
  },
  tabPanel: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius * 2,
    marginBottom: theme.spacing(3),
  },
  courseProgress: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  actionButtons: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  congratsModal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    textAlign: "center",
    maxWidth: 400,
    outline: "none",
  },
  trophy: {
    fontSize: 60,
    color: "#FFD700",
    margin: theme.spacing(2),
    animation: "$bounce 1s ease infinite",
  },
  "@keyframes bounce": {
    "0%, 100%": {
      transform: "translateY(0)",
    },
    "50%": {
      transform: "translateY(-10px)",
    },
  },
  progressCircle: {
    position: "relative",
    display: "inline-flex",
    margin: theme.spacing(2),
  },
  circleText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  navigationButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
  nextPrevButton: {
    borderRadius: 20,
  },
  lockedLesson: {
    cursor: "not-allowed",
    opacity: 0.7,
  },
}));
