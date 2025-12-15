import { createMuiTheme, Theme } from "@material-ui/core/styles";
import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  theme: Theme;
}

const baseTheme = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Georgia", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Georgia", serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Georgia", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Georgia", serif',
      fontWeight: 600,
    },
    button: {
      textTransform: "none" as const,
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
};

const lightPalette = {
  type: "light" as const,
  primary: {
    main: "#2A4B8D",
    light: "#4267A9",
    dark: "#1A3366",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#D4AF37",
    light: "#F7E98D",
    dark: "#C79D26",
    contrastText: "#2A4B8D",
  },
  background: {
    default: "#f8f9fa",
    paper: "#ffffff",
  },
  text: {
    primary: "#2A4B8D",
    secondary: "#666666",
  },
};

const darkPalette = {
  type: "dark" as const,
  primary: {
    main: "#4A7FD4",
    light: "#6B9BE8",
    dark: "#2A5BA8",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#D4AF37",
    light: "#F7E98D",
    dark: "#C79D26",
    contrastText: "#1a1a2e",
  },
  background: {
    default: "#1a1a2e",
    paper: "#16213e",
  },
  text: {
    primary: "#e8e8e8",
    secondary: "#b0b0b0",
  },
};

const createAppTheme = (mode: ThemeMode): Theme => {
  return createMuiTheme({
    ...baseTheme,
    palette: mode === "light" ? lightPalette : darkPalette,
    overrides: {
      MuiCssBaseline: {
        "@global": {
          body: {
            backgroundColor: mode === "light" ? "#f8f9fa" : "#1a1a2e",
            transition: "background-color 0.3s ease",
          },
        },
      },
      MuiPaper: {
        root: {
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
      },
      MuiCard: {
        root: {
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
      },
    },
  });
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

export const CustomThemeProvider: React.FC = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem("themeMode");
    return (savedTheme as ThemeMode) || "light";
  });

  const [theme, setTheme] = useState<Theme>(() => createAppTheme(themeMode));

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode);
    setTheme(createAppTheme(themeMode));
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
