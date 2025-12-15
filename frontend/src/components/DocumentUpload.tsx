import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  CheckCircle,
  Clear as ClearIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as UploadIcon,
} from "@material-ui/icons";
import { DropzoneArea } from "material-ui-dropzone";
import React, { useCallback, useState } from "react";
import { documentAPI } from "../contexts/api";

interface DocumentUploadProps {
  aulaId: number;
  onUploadComplete?: () => void;
}

interface StyleProps {
  severity?: "error" | "success";
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  root: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    animation: "$fadeIn 0.3s ease-out",
  },
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(10px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    "& svg": {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    },
  },
  dropzoneContainer: {
    marginTop: theme.spacing(2),
  },
  filePreview: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    maxHeight: "200px",
    overflowY: "auto",
    padding: theme.spacing(1),
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
  },
  fileCard: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: "rgba(0,255,0,0.05)",
    animation: "$slideIn 0.2s ease-out",
    "&:last-child": {
      marginBottom: 0,
    },
  },
  "@keyframes slideIn": {
    "0%": {
      opacity: 0,
      transform: "translateX(-10px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
  fileName: {
    flex: 1,
    marginLeft: theme.spacing(1),
    wordBreak: "break-word",
  },
  fileIcon: {
    color: theme.palette.primary.main,
  },
  uploadButton: {
    marginTop: theme.spacing(2),
  },
  uploadSuccess: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1),
    backgroundColor: "rgba(76, 175, 80, 0.08)",
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(1),
    "& svg": {
      color: "#4caf50",
      marginRight: theme.spacing(1),
    },
  },
  snackbarContent: {
    backgroundColor: (props) =>
      props.severity === "error" ? "#f44336" : "#43a047",
  },
  dropzoneText: {
    fontSize: "1.1rem",
    color: theme.palette.text.secondary,
  },
  successIcon: {
    color: green[500],
    marginRight: theme.spacing(1),
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    "& .MuiTypography-root": {
      marginLeft: theme.spacing(0.5),
    },
  },
}));

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  aulaId,
  onUploadComplete = () => {},
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const classes = useStyles({});
  const errorClasses = useStyles({ severity: "error" });

  const handleFileChange = useCallback(
    (uploadedFiles: File[]) => {
      if (uploadedFiles.length > 0) {
        setFiles(uploadedFiles);
        // Auto-set title to filename without extension if no title is set yet
        if (!title && uploadedFiles.length === 1) {
          const fileName = uploadedFiles[0].name.split(".")[0];
          setTitle(fileName);
        }
      } else {
        setFiles([]);
      }
    },
    [title]
  );

  const clearFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0 || !title.trim()) {
      setError("Por favor, selecione um arquivo e forneça um título.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("documento", file);
        formData.append(
          "titulo",
          files.length === 1 ? title : `${title} - ${file.name.split(".")[0]}`
        );
        formData.append("aulaId", aulaId.toString());
        return documentAPI.uploadDocument(formData);
      });

      await Promise.all(uploadPromises);

      // Reset form
      setFiles([]);
      setTitle("");
      setSuccess(true);
      setSuccessMessage(
        `${files.length} ${
          files.length === 1
            ? "material complementar"
            : "materiais complementares"
        } enviado${files.length === 1 ? "" : "s"} com sucesso!`
      );

      // Show success message
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage("");
      }, 3000);

      // Notify parent component
      onUploadComplete();
    } catch (err) {
      console.error("Erro ao fazer upload do documento:", err);
      setError(
        "Não foi possível fazer o upload do documento. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const getFileColor = (extension: string): string => {
    switch (extension) {
      case "pdf":
        return "#f44336"; // Red
      case "doc":
      case "docx":
        return "#2196f3"; // Blue
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "#4caf50"; // Green
      default:
        return "#ff9800"; // Orange
    }
  };

  return (
    <Paper className={classes.root}>
      <Box className={classes.header}>
        <UploadIcon />
        <Typography variant="h6">Adicionar Material Complementar</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Título do Material"
          fullWidth
          variant="outlined"
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          helperText={
            files.length > 1 ? "Este será o prefixo para todos os arquivos" : ""
          }
        />

        <Box className={classes.dropzoneContainer}>
          <DropzoneArea
            acceptedFiles={[
              "application/pdf",
              "image/jpeg",
              "image/png",
              "image/gif",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]}
            filesLimit={10} // Aumentado para permitir múltiplos arquivos
            maxFileSize={50000000} // 50MB
            dropzoneText="Arraste arquivos aqui ou clique para selecionar materiais complementares"
            onChange={handleFileChange}
            showPreviews={false}
            showPreviewsInDropzone={false}
            showFileNames={false}
            useChipsForPreview={false}
            dropzoneClass={classes.dropzoneText}
            showAlerts={false}
          />
        </Box>

        {files.length > 0 && (
          <Box className={classes.filePreview}>
            {files.map((file, index) => {
              const extension = getFileExtension(file.name);
              const color = getFileColor(extension);

              return (
                <Card key={index} className={classes.fileCard}>
                  <FileIcon style={{ color }} />
                  <Box className={classes.fileInfo}>
                    <Typography variant="body2" className={classes.fileName}>
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ({formatFileSize(file.size)})
                    </Typography>
                  </Box>
                  <Tooltip title="Remover arquivo">
                    <IconButton size="small" onClick={() => clearFile(index)}>
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </Card>
              );
            })}
          </Box>
        )}

        {success && (
          <Box className={classes.uploadSuccess}>
            <CheckCircle className={classes.successIcon} />
            <Typography variant="body2">{successMessage}</Typography>
          </Box>
        )}

        <Grid container justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || files.length === 0 || !title.trim()}
            className={classes.uploadButton}
            startIcon={
              loading ? <CircularProgress size={20} /> : <UploadIcon />
            }
          >
            {loading
              ? "Enviando..."
              : `Enviar ${files.length > 0 ? files.length + " " : ""}Material${
                  files.length !== 1 ? "is" : ""
                }`}
          </Button>
        </Grid>
      </form>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        ContentProps={{
          className: errorClasses.snackbarContent,
        }}
      />
    </Paper>
  );
};

export default DocumentUpload;
