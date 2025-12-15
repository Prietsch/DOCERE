import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";

interface RedacaoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => void;
  initialData?: { title: string; description: string };
}

const RedacaoForm: React.FC<RedacaoFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  useEffect(() => {
    // Hack to prevent ResizeObserver error
    const resizeObserverError = console.error;
    console.error = (...args: any) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes(
          "ResizeObserver loop completed with undelivered notifications"
        )
      ) {
        return;
      }
      resizeObserverError(...args);
    };
    return () => {
      console.error = resizeObserverError;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description });
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Criar Nova Redação</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tema da Redação"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                multiline
                minRows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição/Instruções"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                multiline
                minRows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Button onClick={onClose} color="secondary">
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                style={{ marginLeft: "8px" }}
              >
                Enviar
              </Button>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RedacaoForm;
