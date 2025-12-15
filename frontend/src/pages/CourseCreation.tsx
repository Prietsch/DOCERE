import {
  Backdrop,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
} from "@material-ui/icons";
import { DropzoneArea } from "material-ui-dropzone";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Essay, Quiz } from "../../interfaces/interfaces";
import RedacaoForm from "../components/RedacaoForm";
import API, {
  courseAPI,
  documentAPI,
  essayAPI,
  lessonAPI,
  moduleAPI,
} from "../contexts/api";
import { useAuth } from "../contexts/AuthContext";
import { useStyles } from "../styles/CourseCreationStyles";

interface Module {
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  videoFile: any;
  title: string;
  videoUrl: string;
  isExternalVideo?: boolean;
  documents: {
    file: File;
    title: string;
  }[];
  quizzes: Quiz[];
  essays: Essay[];
}

const CourseCreation: React.FC = () => {
  const classes = useStyles();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [videoFiles, setVideoFiles] = useState<{ [key: string]: File }>({});
  const [documentFiles, setDocumentFiles] = useState<{ [key: string]: File }>(
    {}
  );
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showEssayModal, setShowEssayModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<{
    moduleIndex: number;
    lessonIndex: number;
  } | null>(null);
  const [essayForm, setEssayForm] = useState({
    title: "",
    description: "",
    nota: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const { user } = useAuth();
  const addModule = () => {
    setModules([...modules, { title: "", lessons: [] }]);
  };

  const updateModule = (index: number, title: string) => {
    if (index < 0 || index >= modules.length) return;
    const updatedModules = [...modules];
    updatedModules[index] = {
      ...updatedModules[index],
      title,
      lessons: updatedModules[index]?.lessons || [],
    };
    setModules(updatedModules);
  };

  const removeModule = (index: number) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    setModules(updatedModules);
  };

  const addLesson = (moduleIndex: number) => {
    if (moduleIndex < 0 || moduleIndex >= modules.length) return;
    const updatedModules = [...modules];
    const currentModule = updatedModules[moduleIndex];
    if (!currentModule.lessons) {
      currentModule.lessons = [];
    }
    currentModule.lessons.push({
      title: "",
      videoUrl: "",
      videoFile: undefined,
      isExternalVideo: false,
      documents: [],
      quizzes: [],
      essays: [],
    });
    setModules(updatedModules);
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: keyof Lesson,
    value: string
  ) => {
    if (moduleIndex < 0 || moduleIndex >= modules.length) return;
    const updatedModules = [...modules];
    const currentModule = updatedModules[moduleIndex];
    if (!currentModule.lessons) return;
    if (lessonIndex < 0 || lessonIndex >= currentModule.lessons.length) return;

    currentModule.lessons[lessonIndex] = {
      ...currentModule.lessons[lessonIndex],
      [field]: value,
    };
    setModules(updatedModules);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons = updatedModules[
      moduleIndex
    ].lessons.filter((_, i) => i !== lessonIndex);
    setModules(updatedModules);
  };

  // Use useCallback to memoize the file change handler
  const handleVideoFileChange = useCallback(
    async (moduleIndex: number, lessonIndex: number, files: File[]) => {
      // Se já existe um vídeo para esta aula, mostrar mensagem e não permitir novo upload
      const lesson = modules[moduleIndex]?.lessons[lessonIndex];
      if (
        lesson &&
        lesson.videoUrl &&
        lesson.videoUrl !== "Enviando vídeo para o Google Drive..." &&
        lesson.videoUrl !== "Erro no upload. Tente novamente."
      ) {
        alert(
          "Esta aula já possui um vídeo. Para substituí-lo, remova o atual primeiro."
        );
        return;
      }

      if (files.length > 0) {
        // Atualizar o estado com o arquivo selecionado
        const key = `${moduleIndex}-${lessonIndex}`;
        setVideoFiles((prev) => ({ ...prev, [key]: files[0] }));

        // Mostrar ao usuário que o upload está em andamento
        updateLesson(
          moduleIndex,
          lessonIndex,
          "videoUrl",
          "Enviando vídeo para o Google Drive..."
        );

        try {
          // Criar um FormData para enviar o arquivo
          const formData = new FormData();
          formData.append("videoFile", files[0]);
          formData.append("titulo", "upload-temporário"); // Título temporário
          formData.append("moduloId", "1"); // Valor temporário, será substituído durante a criação real
          formData.append("ordem", "1"); // Valor temporário, será substituído durante a criação real

          // Fazer o upload do vídeo diretamente para o Google Drive
          const response = await API.post("/aulas/upload-preview", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            // Adicionar timeout mais longo para permitir uploads grandes
            timeout: 300000, // 5 minutos
          });

          console.log("Upload response:", response.data);

          // Verificar se a resposta foi recebida corretamente
          if (!response || !response.data) {
            throw new Error("Resposta vazia do servidor");
          }

          // Extrair URL do vídeo da resposta
          let videoUrl = null;

          // Verificar se a resposta contém a URL do vídeo diretamente
          if (response.data && response.data.urlVideo) {
            videoUrl = response.data.urlVideo;
          }
          // Se não tem urlVideo mas tem success=true
          else if (response.data && response.data.success === true) {
            // Pode ser que a urlVideo esteja em outro formato ou campo
            videoUrl =
              response.data.url ||
              response.data.fileUrl ||
              response.data.videoUrl ||
              "https://drive.google.com/file/uploaded";
          } else {
            throw new Error("URL do vídeo não encontrada na resposta");
          }

          // Se conseguimos obter uma URL de vídeo, atualizar o estado
          if (videoUrl) {
            console.log("Video URL encontrada:", videoUrl);
            // Garantir que o componente ainda está montado antes de atualizar o estado
            updateLesson(moduleIndex, lessonIndex, "videoUrl", videoUrl);

            // Mostrar confirmação visual de sucesso
            const successMessage = document.createElement("div");
            successMessage.textContent = "Vídeo enviado com sucesso!";
            successMessage.style.position = "fixed";
            successMessage.style.bottom = "20px";
            successMessage.style.right = "20px";
            successMessage.style.padding = "10px 20px";
            successMessage.style.backgroundColor = "#4CAF50";
            successMessage.style.color = "white";
            successMessage.style.borderRadius = "4px";
            successMessage.style.zIndex = "9999";

            document.body.appendChild(successMessage);
            setTimeout(() => {
              document.body.removeChild(successMessage);
            }, 3000);
          } else {
            throw new Error(
              "URL do vídeo não encontrada na resposta do servidor"
            );
          }
        } catch (error: any) {
          // Especificar 'any' para acessar propriedades do erro
          console.error("Erro detalhado ao fazer upload do vídeo:", error);

          // Mensagem de erro mais específica baseada no tipo de erro
          let errorMessage = "Erro no upload. Tente novamente.";

          if (error.response) {
            // Erro de resposta do Axios (ex: 4xx, 5xx)
            console.error("Dados da resposta do erro:", error.response.data);
            console.error("Status da resposta do erro:", error.response.status);
            console.error(
              "Headers da resposta do erro:",
              error.response.headers
            );

            // Verificar se o servidor retornou uma mensagem de erro específica
            if (error.response.data && error.response.data.error) {
              errorMessage = `Erro: ${error.response.data.error}`;
            } else if (error.response.status === 413) {
              errorMessage = "Arquivo muito grande. O limite é de 250MB.";
            } else if (error.response.status === 500) {
              errorMessage = "Erro no servidor. Tente novamente mais tarde.";
            }
          } else if (error.request) {
            // A requisição foi feita mas não houve resposta
            console.error("Nenhuma resposta recebida:", error.request);
            errorMessage = "Servidor não respondeu. Verifique sua conexão.";
          } else if (error.message) {
            // Erros de configuração da requisição
            console.error("Erro na configuração da requisição:", error.message);
            errorMessage = `Erro: ${error.message}`;
          }

          // Atualizar o estado para mostrar o erro
          updateLesson(moduleIndex, lessonIndex, "videoUrl", errorMessage);

          // Exibir alerta visual de erro
          const errorAlert = document.createElement("div");
          errorAlert.textContent = "Falha ao enviar o vídeo. " + errorMessage;
          errorAlert.style.position = "fixed";
          errorAlert.style.bottom = "20px";
          errorAlert.style.right = "20px";
          errorAlert.style.padding = "10px 20px";
          errorAlert.style.backgroundColor = "#f44336";
          errorAlert.style.color = "white";
          errorAlert.style.borderRadius = "4px";
          errorAlert.style.zIndex = "9999";

          document.body.appendChild(errorAlert);
          setTimeout(() => {
            document.body.removeChild(errorAlert);
          }, 5000);
        }
      }
    },
    [modules, updateLesson]
  );

  const handleDocumentFileChange = useCallback(
    (moduleIndex: number, lessonIndex: number, files: File[]) => {
      if (files.length > 0) {
        const updatedModules = [...modules];
        const lesson = updatedModules[moduleIndex].lessons[lessonIndex];

        // Criar uma nova lista de documentos em vez de adicionar aos existentes
        const newDocuments = files.map((file) => ({
          file: file,
          title: file.name.split(".")[0] || "Material complementar",
        }));

        // Substituir a lista de documentos existente pela nova lista
        lesson.documents = newDocuments;

        setModules(updatedModules);

        // Mostrar confirmação visual de sucesso
        const successMessage = document.createElement("div");
        successMessage.textContent = `${files.length} documento(s) selecionado(s) com sucesso!`;
        successMessage.style.position = "fixed";
        successMessage.style.bottom = "20px";
        successMessage.style.right = "20px";
        successMessage.style.padding = "10px 20px";
        successMessage.style.backgroundColor = "#4CAF50";
        successMessage.style.color = "white";
        successMessage.style.borderRadius = "4px";
        successMessage.style.zIndex = "9999";

        document.body.appendChild(successMessage);

        // Remover a mensagem após 3 segundos
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
      }
    },
    [modules]
  );

  const removeDocument = (
    moduleIndex: number,
    lessonIndex: number,
    documentIndex: number
  ) => {
    const updatedModules = [...modules];
    const documents =
      updatedModules[moduleIndex].lessons[lessonIndex].documents;
    updatedModules[moduleIndex].lessons[lessonIndex].documents =
      documents.filter((_, i) => i !== documentIndex);
    setModules(updatedModules);
  };

  const cleanupResizeObservers = () => {
    if (window.ResizeObserver) {
      const observers = (window as any).__resizeObservers__ || [];
      observers.forEach((observer: any) => {
        try {
          observer.disconnect();
        } catch (e) {
          console.warn("Failed to disconnect observer:", e);
        }
      });
    }
  };

  // Add a cleanup effect to handle any lingering resize observers
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
      cleanupResizeObservers();
    };
  }, []);

  const handleAddEssay = (moduleIndex: number, lessonIndex: number) => {
    cleanupResizeObservers(); // Cleanup before opening modal
    setCurrentLesson({ moduleIndex, lessonIndex });
    setShowEssayModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!title.trim()) {
      alert("Por favor, insira um título para o curso.");
      setIsLoading(false);
      return;
    }

    if (modules.length === 0) {
      alert("Por favor, adicione pelo menos um módulo.");
      setIsLoading(false);
      return;
    }

    // Check if all modules have titles and lessons
    for (const [moduleIndex, module] of modules.entries()) {
      if (!module.title.trim()) {
        alert(`Por favor, insira um título para o módulo ${moduleIndex + 1}.`);
        setIsLoading(false);
        return;
      }

      if (module.lessons.length === 0) {
        alert(`O módulo "${module.title}" deve ter pelo menos uma aula.`);
        setIsLoading(false);
        return;
      }

      for (const [lessonIndex, lesson] of module.lessons.entries()) {
        if (!lesson.title.trim()) {
          alert(
            `Por favor, insira um título para a aula ${
              lessonIndex + 1
            } do módulo "${module.title}".`
          );
          setIsLoading(false);
          return;
        }

        // Validate external video URLs
        if (
          lesson.isExternalVideo &&
          lesson.videoUrl &&
          lesson.videoUrl.trim() !== ""
        ) {
          const url = lesson.videoUrl.trim();
          try {
            new URL(url);
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              alert(
                `URL inválida na aula "${lesson.title}". Por favor, use uma URL completa (começando com http:// ou https://).`
              );
              setIsLoading(false);
              return;
            }
          } catch {
            alert(
              `URL inválida na aula "${lesson.title}". Por favor, insira uma URL válida.`
            );
            setIsLoading(false);
            return;
          }
        }
      }
    }

    try {
      console.log("Starting course creation process...");
      // Create course
      const courseResponse = await courseAPI.createCourse({
        nome: title,
        descricao: description,
        professorId: user?.id, // Make sure to get the correct professor ID
      });

      console.log("Course created successfully:", courseResponse.data);
      const cursoId = courseResponse.data.id;

      // Create modules sequentially
      for (const [moduleIndex, module] of modules.entries()) {
        console.log(`Creating module ${moduleIndex + 1}: ${module.title}`);
        const moduleResponse = await moduleAPI.createModule(cursoId, {
          nome: module.title,
          ordem: moduleIndex + 1,
        });

        console.log("Module created successfully:", moduleResponse.data);
        const moduloId = moduleResponse.data.id;

        // Create lessons with video and document uploads
        for (const [lessonIndex, lesson] of module.lessons.entries()) {
          try {
            console.log(`Creating lesson ${lessonIndex + 1}: ${lesson.title}`);
            const formData = new FormData();
            formData.append("titulo", lesson.title);
            formData.append("moduloId", moduloId.toString());
            formData.append("ordem", (lessonIndex + 1).toString());

            const key = `${moduleIndex}-${lessonIndex}`;

            console.log(`Processing lesson ${lessonIndex}: ${lesson.title}`);
            console.log(
              `isExternalVideo: ${lesson.isExternalVideo}, videoUrl: ${lesson.videoUrl}`
            );

            // Check if this is an external video URL or a file upload
            if (
              lesson.isExternalVideo &&
              lesson.videoUrl &&
              lesson.videoUrl.trim() !== ""
            ) {
              // It's an external URL, don't upload to Google Drive, pass directly
              console.log(
                `Using external video URL for lesson: ${lesson.videoUrl}`
              );
              formData.append("urlVideo", lesson.videoUrl.trim());
            } else if (videoFiles[key]) {
              // It's a file that needs uploading
              console.log(
                `Attaching video file for upload: ${videoFiles[key].name}`
              );
              formData.append("videoFile", videoFiles[key]);
            } else if (
              lesson.videoUrl &&
              lesson.videoUrl.trim() !== "" &&
              !lesson.isExternalVideo &&
              !lesson.videoUrl.includes("Erro no upload") &&
              !lesson.videoUrl.includes("Enviando vídeo")
            ) {
              // If somehow we have a URL but no isExternalVideo flag, still use it
              console.log(`Using fallback video URL: ${lesson.videoUrl}`);
              formData.append("urlVideo", lesson.videoUrl.trim());
            } else {
              // No video provided - this should be allowed
              console.log("No video provided for this lesson");
            }

            console.log("FormData contents for lesson creation:");
            for (let [key, value] of formData.entries()) {
              console.log(
                `${key}: ${typeof value === "object" ? "File object" : value}`
              );
            }

            console.log("Sending lesson creation request to backend...");
            // Create the lesson first
            try {
              const lessonResponse = await lessonAPI.createLesson(formData);
              console.log("Lesson response received:", lessonResponse);

              // Validate the lesson creation response
              if (
                !lessonResponse ||
                !lessonResponse.data ||
                !lessonResponse.data.id
              ) {
                console.error("Invalid lesson response:", lessonResponse);
                throw new Error(
                  "Failed to create lesson: Invalid response from server"
                );
              }

              console.log("Lesson created successfully:", lessonResponse.data);
              const aulaId = lessonResponse.data.id;

              // Upload all documents for this lesson
              if (lesson.documents && lesson.documents.length > 0) {
                console.log(
                  `Uploading ${lesson.documents.length} documents for lesson ${aulaId}`
                );

                // Process documents one by one instead of in parallel to avoid network issues
                for (const [docIndex, document] of lesson.documents.entries()) {
                  try {
                    console.log(
                      `Preparing to upload document ${docIndex + 1}/${
                        lesson.documents.length
                      }: ${document.title} (${Math.round(
                        document.file.size / 1024
                      )} KB)`
                    );

                    // Create a new FormData for each document
                    const docFormData = new FormData();

                    // Make sure we're using the correct field names expected by the backend
                    docFormData.append("documento", document.file);
                    docFormData.append("titulo", document.title);
                    docFormData.append("aulaId", aulaId.toString());

                    console.log(
                      "Document form data prepared for:",
                      document.title
                    );

                    // Track upload progress and success
                    console.log(
                      `Starting upload for document: ${document.title}`
                    );

                    // Add delay between requests to prevent network congestion
                    if (docIndex > 0) {
                      console.log(
                        "Waiting briefly before next document upload..."
                      );
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                    }

                    const docResponse = await documentAPI.uploadDocument(
                      docFormData
                    );

                    console.log(
                      `Document ${docIndex + 1}/${lesson.documents.length} (${
                        document.title
                      }) uploaded successfully:`,
                      docResponse.data
                    );
                  } catch (docError: any) {
                    console.error(
                      `Error uploading document ${document.title}:`,
                      docError
                    );

                    // Additional error diagnostics
                    if (docError.response) {
                      console.error(
                        "Response status:",
                        docError.response.status
                      );
                      console.error("Response data:", docError.response.data);
                    } else if (docError.request) {
                      console.error("Request made but no response received");
                    } else {
                      console.error(
                        "Error setting up request:",
                        docError.message
                      );
                    }

                    // Continue with next document instead of stopping all uploads
                    continue;
                  }
                }

                console.log("All document uploads completed for this lesson");
              }

              // For each essay in the lesson, send it to the backend
              if (lesson.essays?.length) {
                for (const essay of lesson.essays) {
                  try {
                    if (!user?.id) {
                      throw new Error("User ID is required to create an essay");
                    }

                    const essayData = {
                      tema: essay.title,
                      descricao: essay.description || null,
                      id_curso: Number(cursoId),
                      id_professor: user.id,
                      id_aula: Number(aulaId),
                    };
                    console.log("Sending essay data:", essayData);

                    const response = await essayAPI.createEssay(essayData);
                    console.log("Essay created:", response);
                  } catch (essayError) {
                    console.error("Failed to create essay:", essayError);
                    // Continue with other essays instead of throwing
                    continue;
                  }
                }
              }
            } catch (networkError: any) {
              console.error(
                "Network error during lesson creation:",
                networkError
              );

              // Enhanced error handling for network errors
              if (
                networkError.message &&
                networkError.message.includes("Network Error")
              ) {
                console.error("Network connection issue detected");

                // Wait briefly and retry once
                console.log("Retrying lesson creation after brief delay...");
                try {
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                  const retryResponse = await lessonAPI.createLesson(formData);

                  if (
                    retryResponse &&
                    retryResponse.data &&
                    retryResponse.data.id
                  ) {
                    console.log(
                      "Lesson created successfully on retry:",
                      retryResponse.data
                    );
                    const aulaId = retryResponse.data.id;

                    // Continue with document uploads and essays using aulaId
                    // (We'll skip this implementation for brevity in this example)
                    console.log(
                      "Skipping document uploads after retry to prevent further issues"
                    );
                  } else {
                    throw new Error("Failed to create lesson on retry attempt");
                  }
                } catch (retryError) {
                  console.error("Failed on retry attempt as well:", retryError);
                  throw retryError; // Let outer catch handle it
                }
              } else {
                // For other types of errors, just rethrow
                throw networkError;
              }
            }
          } catch (lessonError: any) {
            console.error(
              `Failed to create lesson ${lessonIndex + 1}:`,
              lessonError
            );
            console.error(
              "Error details:",
              lessonError.response
                ? lessonError.response.data
                : "No response data"
            );
            // Continue creating other lessons
            continue;
          }
        }
      }

      console.log("Course creation completed successfully!");
      history.push("/painel");
    } catch (error: any) {
      console.error("Failed to create course:", error);
      console.error(
        "Error details:",
        error.response ? error.response.data : "No response data"
      );
      alert(
        `Failed to create course: ${
          error.message || "Unknown error"
        }. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB para vídeos
  const MAX_DOC_SIZE = 50 * 1024 * 1024; // 50MB para documentos
  const VIDEO_FILES = ["video/mp4"];
  const DOCUMENT_FILES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];

  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <Box className={classes.header}>
          <SchoolIcon className={classes.headerIcon} />
          <Typography variant="h4" gutterBottom>
            Criar Novo Curso
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Preencha as informações abaixo para criar seu curso
          </Typography>
        </Box>

        <Paper className={classes.formContainer}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="title"
                  label="Título do Curso"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  multiline
                  minRows={4}
                  id="description"
                  label="Descrição do Curso"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText="Descreva o que os alunos irão aprender"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider style={{ margin: "20px 0" }} />
                <Typography variant="h6" gutterBottom>
                  Módulos do Curso
                </Typography>

                {modules.map((module, moduleIndex) => (
                  <Card key={moduleIndex} className={classes.moduleCard}>
                    <Grid container spacing={2}>
                      <Grid item xs={11}>
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          label="Nome do Módulo"
                          value={module.title}
                          onChange={(e) =>
                            updateModule(moduleIndex, e.target.value)
                          }
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <IconButton
                          color="secondary"
                          onClick={() => removeModule(moduleIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>

                    <List>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <ListItem
                          key={lessonIndex}
                          className={classes.lessonItem}
                        >
                          <ListItemText>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  variant="outlined"
                                  required
                                  fullWidth
                                  label="Título da Aula"
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(
                                      moduleIndex,
                                      lessonIndex,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Vídeo da Aula
                                </Typography>
                                <Box mb={2}>
                                  <Grid
                                    container
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    <Grid item>
                                      <Typography variant="body2">
                                        Escolha uma opção:
                                      </Typography>
                                    </Grid>
                                    <Grid item>
                                      <Button
                                        variant={
                                          !lesson.isExternalVideo
                                            ? "contained"
                                            : "outlined"
                                        }
                                        size="small"
                                        color="primary"
                                        onClick={() => {
                                          const updatedModules = [...modules];
                                          updatedModules[moduleIndex].lessons[
                                            lessonIndex
                                          ].isExternalVideo = false;
                                          setModules(updatedModules);
                                        }}
                                      >
                                        Upload de arquivo
                                      </Button>
                                    </Grid>
                                    <Grid item>
                                      <Button
                                        variant={
                                          lesson.isExternalVideo
                                            ? "contained"
                                            : "outlined"
                                        }
                                        size="small"
                                        color="primary"
                                        onClick={() => {
                                          const updatedModules = [...modules];
                                          updatedModules[moduleIndex].lessons[
                                            lessonIndex
                                          ].isExternalVideo = true;
                                          setModules(updatedModules);
                                        }}
                                      >
                                        Link externo
                                      </Button>
                                    </Grid>
                                  </Grid>
                                </Box>

                                {lesson.isExternalVideo ? (
                                  <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="URL do vídeo (YouTube, Vimeo, Google Drive, etc)"
                                    placeholder="https://"
                                    value={lesson.videoUrl || ""}
                                    onChange={(e) => {
                                      // Atualiza diretamente o estado com a URL fornecida
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        "videoUrl",
                                        e.target.value
                                      );

                                      // Remover entrada correspondente de videoFiles se existir
                                      const key = `${moduleIndex}-${lessonIndex}`;
                                      if (videoFiles[key]) {
                                        const newVideoFiles = { ...videoFiles };
                                        delete newVideoFiles[key];
                                        setVideoFiles(newVideoFiles);
                                      }
                                    }}
                                    helperText="Cole o link de um vídeo já hospedado em plataformas como YouTube, Vimeo, Google Drive, etc."
                                  />
                                ) : lesson.videoUrl &&
                                  lesson.videoUrl !==
                                    "Enviando vídeo para o Google Drive..." &&
                                  lesson.videoUrl !==
                                    "Erro no upload. Tente novamente." ? (
                                  // Vídeo já enviado - não mostra dropzone
                                  null
                                ) : (
                                  <DropzoneArea
                                    acceptedFiles={VIDEO_FILES}
                                    filesLimit={1}
                                    maxFileSize={MAX_VIDEO_SIZE}
                                    dropzoneText="Arraste e solte um vídeo MP4 aqui ou clique (máx. 500MB)"
                                    onChange={(files) =>
                                      handleVideoFileChange(
                                        moduleIndex,
                                        lessonIndex,
                                        files
                                      )
                                    }
                                    classes={{ root: classes.dropzone }}
                                    showFileNames={true}
                                    showPreviewsInDropzone={false}
                                    key={`video-${moduleIndex}-${lessonIndex}`}
                                    useChipsForPreview={true}
                                    inputProps={{
                                      id: `video-${moduleIndex}-${lessonIndex}`,
                                    }}
                                  />
                                )}

                                {lesson.videoUrl &&
                                  lesson.videoUrl !==
                                    "Enviando vídeo para o Google Drive..." &&
                                  lesson.videoUrl !==
                                    "Erro no upload. Tente novamente." && (
                                    <Box
                                      mt={1}
                                      p={1}
                                      bgcolor="rgba(0,255,0,0.1)"
                                      borderRadius={1}
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="space-between"
                                    >
                                      <Typography
                                        variant="body2"
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <CheckCircleIcon
                                          color="primary"
                                          style={{ marginRight: "8px" }}
                                        />
                                        <strong>
                                          Vídeo enviado com sucesso!
                                        </strong>
                                      </Typography>
                                      <Button
                                        size="small"
                                        color="secondary"
                                        onClick={() => {
                                          // Remove o vídeo
                                          updateLesson(
                                            moduleIndex,
                                            lessonIndex,
                                            "videoUrl",
                                            ""
                                          );
                                          // Remove da lista de arquivos se estiver lá
                                          const key = `${moduleIndex}-${lessonIndex}`;
                                          if (videoFiles[key]) {
                                            const newVideoFiles = {
                                              ...videoFiles,
                                            };
                                            delete newVideoFiles[key];
                                            setVideoFiles(newVideoFiles);
                                          }
                                        }}
                                      >
                                        Remover
                                      </Button>
                                    </Box>
                                  )}
                                {lesson.videoUrl ===
                                  "Enviando vídeo para o Google Drive..." && (
                                  <Box
                                    mt={1}
                                    p={1}
                                    bgcolor="rgba(0,0,255,0.1)"
                                    borderRadius={1}
                                    display="flex"
                                    alignItems="center"
                                  >
                                    <CircularProgress
                                      size={20}
                                      style={{ marginRight: 10 }}
                                    />
                                    <Typography variant="body2">
                                      Processando vídeo...
                                    </Typography>
                                  </Box>
                                )}
                                {lesson.videoUrl ===
                                  "Erro no upload. Tente novamente." && (
                                  <Box
                                    mt={1}
                                    p={1}
                                    bgcolor="rgba(255,0,0,0.1)"
                                    borderRadius={1}
                                  >
                                    <Typography variant="body2" color="error">
                                      Erro no upload. Tente novamente.
                                    </Typography>
                                  </Box>
                                )}
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Material Complementar
                                </Typography>
                                <DropzoneArea
                                  acceptedFiles={DOCUMENT_FILES}
                                  filesLimit={10}
                                  maxFileSize={MAX_DOC_SIZE}
                                  dropzoneText="Arraste e solte arquivos aqui ou clique (PDF, JPEG, PNG - máx. 50MB)"
                                  onChange={(files) =>
                                    handleDocumentFileChange(
                                      moduleIndex,
                                      lessonIndex,
                                      files
                                    )
                                  }
                                  classes={{ root: classes.dropzone }}
                                  showFileNames={true}
                                  showPreviewsInDropzone={false}
                                  previewText="Arquivos selecionados:"
                                  key={`doc-${moduleIndex}-${lessonIndex}`}
                                  useChipsForPreview={true}
                                  inputProps={{
                                    id: `doc-${moduleIndex}-${lessonIndex}`,
                                  }}
                                />
                                {lesson.documents &&
                                  lesson.documents.length > 0 && (
                                    <Box mt={2}>
                                      <Typography variant="subtitle2">
                                        Documentos ({lesson.documents.length}):
                                      </Typography>
                                      <List dense>
                                        {lesson.documents.map(
                                          (doc, docIndex) => (
                                            <ListItem key={docIndex} dense>
                                              <ListItemText
                                                primary={doc.title}
                                                secondary={`${
                                                  doc.file.name
                                                } (${Math.round(
                                                  doc.file.size / 1024
                                                )} KB)`}
                                              />
                                              <ListItemSecondaryAction>
                                                <IconButton
                                                  edge="end"
                                                  aria-label="delete"
                                                  onClick={() =>
                                                    removeDocument(
                                                      moduleIndex,
                                                      lessonIndex,
                                                      docIndex
                                                    )
                                                  }
                                                >
                                                  <DeleteIcon fontSize="small" />
                                                </IconButton>
                                              </ListItemSecondaryAction>
                                            </ListItem>
                                          )
                                        )}
                                      </List>
                                    </Box>
                                  )}
                              </Grid>
                              <Grid item xs={12}>
                                <Box display="flex" mt={2}>
                                  {/* <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => handleAddQuiz(moduleIndex, lessonIndex)}
                                    className={classes.addButton}
                                  >
                                    Adicionar Quiz
                                  </Button> */}
                                  <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() =>
                                      handleAddEssay(moduleIndex, lessonIndex)
                                    }
                                    className={classes.addButton}
                                  >
                                    Adicionar Redação
                                  </Button>
                                </Box>
                                {/* {lesson.quizzes?.map((quiz, index) => (
                                  <Box key={`quiz-${index}`} mt={1} p={1} bgcolor="rgba(0,0,0,0.05)" borderRadius={1}>
                                    <Typography variant="subtitle2">Quiz: {quiz.title}</Typography>
                                  </Box>
                                ))} */}
                                {lesson.essays?.map((essay, index) => (
                                  <Box
                                    key={`essay-${index}`}
                                    mt={1}
                                    p={1}
                                    bgcolor="rgba(0,0,0,0.05)"
                                    borderRadius={1}
                                  >
                                    <Typography variant="subtitle2">
                                      Redação: {essay.title}
                                    </Typography>
                                  </Box>
                                ))}
                              </Grid>
                            </Grid>
                          </ListItemText>
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() =>
                                removeLesson(moduleIndex, lessonIndex)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>

                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => addLesson(moduleIndex)}
                      className={classes.addButton}
                    >
                      Adicionar Aula
                    </Button>
                  </Card>
                ))}

                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={addModule}
                  fullWidth
                  className={classes.addButton}
                >
                  Adicionar Módulo
                </Button>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Salvar Curso"
              )}
            </Button>
          </form>
        </Paper>

        {/* <Box mt={4} textAlign="center">
          <Link to="/teacher-activity-creation" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="secondary">
              Criar Atividade
            </Button>
          </Link>
        </Box> */}
      </Container>
      {/* 
      <Dialog open={showQuizModal} onClose={() => setShowQuizModal(false)}>
        <DialogTitle>Criar Novo Quiz</DialogTitle>
        <DialogContent>
          Add your quiz creation form here 
           <QuizForm onSave={handleSaveActivity} onCancel={() => setShowQuizModal(false)} /> 
        </DialogContent>
      </Dialog> */}
      <RedacaoForm
        open={showEssayModal}
        onClose={() => {
          cleanupResizeObservers(); // Cleanup before closing
          setShowEssayModal(false);
        }}
        onSubmit={(data) => {
          cleanupResizeObservers(); // Cleanup before processing submission
          if (currentLesson) {
            const updatedModules = [...modules];
            const lesson =
              updatedModules[currentLesson.moduleIndex].lessons[
                currentLesson.lessonIndex
              ];
            if (!lesson.essays) {
              lesson.essays = [];
            }
            lesson.essays.push({
              title: data.title,
              description: data.description,
              nota: "",
            });
            setModules(updatedModules);
          }
          setShowEssayModal(false);
        }}
      />
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default CourseCreation;
