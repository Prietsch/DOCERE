import { makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    backgroundColor: "white",
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      bottom: 0,
      height: 4,
      width: "100%",
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      borderRadius: "0 0 8px 8px",
    },
  },
  headerActions: {
    display: "flex",
    gap: theme.spacing(1),
  },
  mainCard: {
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    marginBottom: theme.spacing(4),
    backgroundColor: "white",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    },
  },
  accordionHeader: {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      bottom: -8,
      width: 40,
      height: 3,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 1.5,
    },
  },
  moduleCard: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3),
    transition: "all 0.3s ease",
    overflow: "hidden",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },
  moduleHeader: {
    padding: theme.spacing(2),
    background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: "relative",
  },
  moduleContent: {
    padding: theme.spacing(2),
  },
  lessonCard: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
    },
  },
  lessonCardEditing: {
    padding: theme.spacing(2),
  },
  lessonCardContent: {
    padding: theme.spacing(2),
  },
  videoSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  uploadSection: {
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[50],
    border: `1px dashed ${theme.palette.primary.main}`,
  },
  editIcon: {
    color: theme.palette.primary.main,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "rotate(15deg)",
    },
  },
  saveIcon: {
    color: theme.palette.success.main,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  deleteIcon: {
    color: theme.palette.error.main,
  },
  redacoesSection: {
    marginTop: theme.spacing(3),
  },
  redacaoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  redacoesGrid: {
    marginTop: theme.spacing(1),
  },
  redacaoCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-4px)",
    },
  },
  feedbackIcon: {
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  redacaoContentPreview: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
  },
  studentsAccordion: {
    marginTop: theme.spacing(4),
  },
  studentsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: theme.spacing(2),
  },
  studentChip: {
    margin: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    fontWeight: 500,
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
  orderField: {
    width: "30%",
  },
  noContent: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    textAlign: "center",
  },
  tabBar: {
    marginBottom: theme.spacing(2),
  },
  tabRoot: {
    minWidth: 0,
    padding: theme.spacing(1, 2),
    transition: "all 0.2s ease",
    fontWeight: 500,
    textTransform: "none",
  },
  tabPanel: {
    padding: theme.spacing(2, 0),
  },
  youtubeContainer: {
    position: "relative",
    paddingBottom: "56.25%" /* 16:9 aspect ratio */,
    height: 0,
    overflow: "hidden",
    width: "100%",
    "& iframe": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
  },
}));
