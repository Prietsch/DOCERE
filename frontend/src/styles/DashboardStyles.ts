import { makeStyles, Theme } from "@material-ui/core";

export interface StyleProps {
  index: number;
  progress?: number;
  category?: string;
}

export const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    minHeight: "100vh",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(8),
  },
  // Hero Section
  heroSection: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    marginBottom: theme.spacing(3),
    color: theme.palette.primary.contrastText,
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: -50,
      right: -50,
      width: 200,
      height: 200,
      borderRadius: "50%",
      backgroundColor: "rgba(255,255,255,0.1)",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -30,
      left: "30%",
      width: 100,
      height: 100,
      borderRadius: "50%",
      backgroundColor: "rgba(255,255,255,0.05)",
    },
  },
  heroContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(3),
    position: "relative",
    zIndex: 1,
  },
  heroText: {
    flex: 1,
    minWidth: 280,
  },
  heroTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(1),
  },
  heroSubtitle: {
    opacity: 0.9,
    marginBottom: theme.spacing(2),
  },
  quoteBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    borderLeft: "4px solid rgba(255,255,255,0.5)",
  },
  quoteText: {
    fontStyle: "italic",
    lineHeight: 1.6,
    fontSize: "0.95rem",
  },
  quoteAuthor: {
    display: "block",
    marginTop: theme.spacing(1),
    opacity: 0.8,
  },
  // Stats
  statsContainer: {
    display: "flex",
    gap: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      justifyContent: "space-around",
    },
  },
  statItem: {
    textAlign: "center",
    padding: theme.spacing(2),
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: theme.spacing(1.5),
    minWidth: 90,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    marginBottom: theme.spacing(1),
    "& svg": {
      color: "white",
      fontSize: 20,
    },
  },
  statNumber: {
    fontWeight: 700,
    color: "white",
  },
  statLabel: {
    opacity: 0.8,
    display: "block",
  },
  // Continue Section
  continueSection: {
    background: theme.palette.type === "dark" 
      ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
      : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
  },
  continueIcon: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  continueLabel: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    letterSpacing: 1,
  },
  continueTitle: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  continueProgress: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.type === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
  },
  continuePercent: {
    marginLeft: theme.spacing(2),
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  continueButton: {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1.5, 4),
    fontWeight: 600,
    textTransform: "none",
    marginTop: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      marginTop: 0,
    },
  },
  // Tip Section
  tipSection: {
    background: theme.palette.type === "dark"
      ? "rgba(245, 158, 11, 0.1)"
      : "rgba(245, 158, 11, 0.08)",
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(2),
    marginBottom: theme.spacing(4),
    border: "1px solid rgba(245, 158, 11, 0.2)",
  },
  tipIcon: {
    color: "#f59e0b",
    marginRight: theme.spacing(1.5),
    marginTop: 2,
  },
  tipLabel: {
    color: "#d97706",
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  },
  tipText: {
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
  },
  // Teacher Header
  teacherHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  teacherTitle: {
    fontWeight: 700,
  },
  // Legacy styles
  header: {
    marginBottom: theme.spacing(6),
    "& h4": {
      position: "relative",
      "&:after": {
        content: '""',
        position: "absolute",
        bottom: -8,
        left: 0,
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  courseCardsContainer: {
    position: "relative",
  },
  dashboardSection: {
    marginBottom: theme.spacing(5),
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginLeft: theme.spacing(1),
  },
  sectionIcon: {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(0.5),
  },
  sectionChip: {
    marginLeft: theme.spacing(1.5),
    backgroundColor: theme.palette.primary.main,
    color: "white",
    fontWeight: 600,
  },
  addButton: {
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.spacing(3),
    boxShadow: theme.shadows[2],
    textTransform: "none",
    fontWeight: 600,
    "&:hover": {
      boxShadow: theme.shadows[4],
    },
  },
  // Empty State
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  emptyIcon: {
    fontSize: 64,
    color: theme.palette.text.disabled,
    marginBottom: theme.spacing(2),
  },
}));

export const useCardStyles = makeStyles<Theme, StyleProps>((theme) => ({
  courseCard: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    borderRadius: theme.shape.borderRadius * 2,
    overflow: "hidden",
    position: "relative",
    animation: "fadeIn 0.6s ease-out forwards",
    animationDelay: (props) => `${props.index * 0.1}s`,
    opacity: 0,
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 12px 28px rgba(0, 0, 0, 0.1)",
      "& $cardIcon": {
        transform: "scale(1.1) rotate(5deg)",
      },
    },
  },
  cardHeader: {
    padding: theme.spacing(3, 3, 1.5),
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginBottom: theme.spacing(2),
    fontSize: 28,
  },
  cardContent: {
    flexGrow: 1,
    padding: theme.spacing(0, 3, 2),
  },
  courseInfoItem: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
    "& svg": {
      color: theme.palette.text.secondary,
      fontSize: 18,
    },
  },
  progress: {
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  cardActions: {
    padding: theme.spacing(2, 3),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  ctaButton: {
    borderRadius: 20,
    textTransform: "none",
    padding: theme.spacing(0.75, 2),
    fontWeight: 600,
  },
  statusRibbon: {
    position: "absolute",
    top: 15,
    right: -30,
    transform: "rotate(45deg)",
    width: 120,
    textAlign: "center",
    padding: "5px 0",
    fontSize: "0.7rem",
    fontWeight: "bold",
    color: "white",
    backgroundColor: (props) => {
      if (props.progress && props.progress >= 100)
        return theme.palette.success.main;
      if (props.progress && props.progress > 0) return theme.palette.info.main;
      return theme.palette.warning.main;
    },
    zIndex: 1,
  },
  courseTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    lineHeight: 1.3,
  },
  courseDescription: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
  },
}));
