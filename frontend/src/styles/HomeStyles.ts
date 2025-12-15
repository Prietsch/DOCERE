import { makeStyles, Theme } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: "100vh",
    background: "#ffffff",
  },
  hero: {
    padding: theme.spacing(4, 0, 4),
    position: "relative",
    backgroundColor: "#2A4B8D",
    color: "#ffffff",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(42, 75, 141, 0.95)",
      zIndex: 1,
    },
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
  },
  highlightText: {
    color: "#D4AF37", // Gold color for excellence
    fontWeight: "bold",
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: theme.shadows[4],
    },
  },
  cardIcon: {
    fontSize: 40,
    margin: theme.spacing(2),
    color: "#2A4B8D", // Royal blue for trust and authority
  },
  ctaSection: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    padding: theme.spacing(5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#F5F7FA",
    textAlign: "center",
  },
  statsSection: {
    background: "#2A4B8D", // Royal blue background
    color: "white",
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
  statValue: {
    fontWeight: "bold",
    fontSize: "2.5rem",
    color: "#D4AF37", // Gold color for stats
  },
  studentIcon: {
    fontSize: "15rem",
    color: "#2A4B8D", // Royal blue for the icon
    opacity: 0.9,
    [theme.breakpoints.down("sm")]: {
      fontSize: "10rem",
    },
  },
  brandLogo: {
    fontFamily: '"Georgia", serif',
    fontSize: "4rem",
    fontWeight: "bold",
    background: "linear-gradient(45deg, #ffffff 30%, #D4AF37 90%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: theme.spacing(3),
  },
  slogan: {
    fontStyle: "italic",
    color: "#555",
    marginBottom: theme.spacing(3),
  },
  goldButton: {
    background: "linear-gradient(45deg, #D4AF37 30%, #F7E98D 90%)",
    color: "#2A4B8D",
    fontWeight: "bold",
    "&:hover": {
      background: "linear-gradient(45deg, #C79D26 30%, #E6D87C 90%)",
    },
  },
  featureCard: {
    padding: theme.spacing(4),
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 20px rgba(42, 75, 141, 0.1)",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 8px 25px rgba(42, 75, 141, 0.15)",
    },
  },
  featureIcon: {
    fontSize: 48,
    color: "#2A4B8D",
    marginBottom: theme.spacing(2),
  },
  processSection: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
  },
  processStepCard: {
    padding: theme.spacing(4),
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 4px 15px rgba(42, 75, 141, 0.1)",
    transition: "all 0.3s ease",
    border: "1px solid #eaeaea",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 12px 30px rgba(42, 75, 141, 0.12)",
      borderColor: "#D4AF37",
    },
  },
  processStepNumber: {
    display: "inline-block",
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#2A4B8D",
    color: "white",
    textAlign: "center",
    lineHeight: "36px",
    marginBottom: theme.spacing(2),
    fontWeight: "bold",
  },
  quoteSection: {
    padding: theme.spacing(6),
    backgroundColor: "#F5F7FA",
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(8),
  },
  quote: {
    fontStyle: "italic",
    fontSize: "1.2rem",
    marginBottom: theme.spacing(2),
    color: "#555",
  },
  quoteAuthor: {
    fontWeight: "bold",
  },
}));
