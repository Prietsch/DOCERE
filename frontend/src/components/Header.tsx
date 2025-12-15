import {
  AppBar,
  Button,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.primary.main,
    boxShadow: theme.shadows[2],
  },
  brand: {
    fontFamily: '"Georgia", serif',
    fontWeight: "bold",
    fontSize: "1.5rem",
    color: "#ffffff",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -3,
      left: 0,
      width: "100%",
      height: 2,
      background: theme.palette.secondary.main,
    },
  },
  navButton: {
    marginLeft: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
  },
  loginButton: {
    color: theme.palette.secondary.main,
    borderColor: theme.palette.secondary.main,
  },
  profileButton: {
    marginLeft: theme.spacing(1),
  },
}));

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    history.push("/");
  };

  const handleProfile = () => {
    handleMenuClose();
    history.push("/perfil");
  };

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span className={classes.brand}>Docere</span>
          </Link>
        </Typography>
        {user ? (
          <>
            <Button color="inherit" component={Link} to="/painel">
              Menu
            </Button>
            <Button color="inherit" component={Link} to="/redacoes">
              Redações
            </Button>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              aria-controls="user-menu"
              aria-haspopup="true"
              className={classes.profileButton}
            >
              <AccountCircle />
            </IconButton>
            <Menu
                id="user-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                getContentAnchorEl={null}
              >
                <MenuItem onClick={handleProfile}>Meu Perfil</MenuItem>
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </Menu>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/entrar">
              Login
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
