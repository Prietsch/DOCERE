import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  Cancel as CancelIcon,
  DeleteOutline as DeleteIcon,
  Description as DocumentIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
} from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { documentAPI } from "../contexts/api";

interface Documento {
  id: number;
  titulo: string;
  urlDocumento: string;
  aulaId: number;
  tipo: string;
}

interface DocumentListProps {
  aulaId: number;
  isTeacher?: boolean;
  onUpdateList?: () => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  aulaId,
  isTeacher = false,
  onUpdateList = () => {},
}) => {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [aulaId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentAPI.getDocumentosByAula(aulaId);
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar documentos:", err);
      setError("Não foi possível carregar os documentos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este documento?")) {
      return;
    }

    try {
      await documentAPI.deleteDocumento(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      onUpdateList();
    } catch (err) {
      console.error("Erro ao excluir documento:", err);
      setError("Não foi possível excluir o documento.");
    }
  };

  const startEditing = (doc: Documento) => {
    setEditingDocId(doc.id);
    setEditingTitle(doc.titulo);
  };

  const cancelEditing = () => {
    setEditingDocId(null);
    setEditingTitle("");
  };

  const saveEditing = async (id: number) => {
    if (!editingTitle.trim()) {
      return;
    }

    try {
      await documentAPI.updateDocumento(id, editingTitle);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, titulo: editingTitle } : doc
        )
      );
      setEditingDocId(null);
      setEditingTitle("");
      onUpdateList();
    } catch (err) {
      console.error("Erro ao atualizar documento:", err);
      setError("Não foi possível atualizar o documento.");
    }
  };

  const getDocumentIcon = (tipo: string) => {
    if (tipo.includes("pdf")) {
      return <PdfIcon color="error" />;
    } else if (tipo.includes("image")) {
      return <ImageIcon color="primary" />;
    } else {
      return <DocumentIcon />;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={4}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper>
        <Box p={3} textAlign="center">
          <Typography color="error">{error}</Typography>
        </Box>
      </Paper>
    );
  }

  if (documents.length === 0) {
    return (
      <Paper>
        <Box p={3} textAlign="center">
          <Typography>
            Não há materiais complementares disponíveis para esta aula.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper>
      <List>
        {documents.map((doc) => (
          <React.Fragment key={doc.id}>
            <ListItem>
              <ListItemIcon>{getDocumentIcon(doc.tipo || "")}</ListItemIcon>

              {editingDocId === doc.id ? (
                <TextField
                  fullWidth
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <ListItemText
                  primary={doc.titulo}
                  secondary={`Tipo: ${
                    doc.tipo ? doc.tipo.split("/")[1] : "Documento"
                  }`}
                />
              )}

              <ListItemSecondaryAction>
                {editingDocId === doc.id ? (
                  <>
                    <IconButton
                      edge="end"
                      aria-label="salvar"
                      onClick={() => saveEditing(doc.id)}
                    >
                      <SaveIcon color="primary" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="cancelar"
                      onClick={cancelEditing}
                    >
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Tooltip title="Baixar">
                      <IconButton
                        edge="end"
                        aria-label="baixar"
                        onClick={() => window.open(doc.urlDocumento, "_blank")}
                      >
                        <DownloadIcon color="primary" />
                      </IconButton>
                    </Tooltip>

                    {isTeacher && (
                      <>
                        <Tooltip title="Editar">
                          <IconButton
                            edge="end"
                            aria-label="editar"
                            onClick={() => startEditing(doc)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            edge="end"
                            aria-label="excluir"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <DeleteIcon color="secondary" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default DocumentList;
