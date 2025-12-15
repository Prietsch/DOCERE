import axios from "axios";

// Create axios instance with base URL from environment variable
const API = axios.create({
  // baseURL: process.env.REACT_APP_TEST || "http://localhost:3000",
  baseURL:
    process.env.REACT_APP_BASE_URL ||
    "https://plataforma-de-cursos-1.onrender.com",
});

// Add request interceptor to add auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    API.post("/login", { email, password }),

  register: (name: string, email: string, password: string, role: string) => {
    const endpoint = role === "teacher" ? "/professores" : "/alunos";
    return API.post(endpoint, {
      nome: name,
      email,
      senha: password,
    });
  },

  verifyToken: () => API.get("/verify-token"),
};

// User Profile APIs
export const userAPI = {
  updateProfile: (userId: number, role: string, data: { nome?: string; email?: string; senha?: string }) => {
    const endpoint = role === "teacher" ? `/professores/${userId}` : `/alunos/${userId}`;
    return API.put(endpoint, data);
  },
  getProfile: (userId: number, role: string) => {
    const endpoint = role === "teacher" ? `/professores/${userId}` : `/alunos/${userId}`;
    return API.get(endpoint);
  },
};

// Course APIs
export const courseAPI = {
  getAllCourses: () => API.get("/cursos"),
  getTeacherCourses: (professorId: number) =>
    API.get(`/cursos?professorId=${professorId}`),
  getCourseById: (courseId: number | string) => API.get(`/cursos/${courseId}`),
  createCourse: (courseData: any) => API.post("/cursos", courseData),
  updateCourse: (courseId: number, courseData: any) =>
    API.put(`/cursos/${courseId}`, courseData),
  deleteCourse: (courseId: number) => API.delete(`/cursos/${courseId}`),
  getCourseProgress: (courseId: number, studentId: number) =>
    API.get(`/cursos/${courseId}/alunos/${studentId}/progress`),
  updateCourseProgress: (courseId: number, studentId: number, data: any) =>
    API.put(`/cursos/${courseId}/alunos/${studentId}/progress`, data),
  enrollStudent: (courseId: number, studentId: number) =>
    API.post(`/cursos/${courseId}/alunos`, { alunoId: studentId }),
  getCourseStudents: (courseId: number) =>
    API.get(`/cursos/${courseId}/alunos`),
};

// Module APIs
export const moduleAPI = {
  createModule: (courseId: number, moduleData: any) =>
    API.post(`/cursos/${courseId}/modulos`, moduleData),
  updateModule: (moduleId: number, moduleData: any) =>
    API.put(`/modulos/${moduleId}`, moduleData),
  deleteModule: (moduleId: number) => API.delete(`/modulos/${moduleId}`),
};

// Lesson API
export const lessonAPI = {
  createLesson: async (lessonData: FormData) => {
    console.log("Sending lesson creation request with FormData");
    try {
      return await API.post("/aulas", lessonData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000, // 60 seconds timeout
      });
    } catch (error: any) {
      console.error("Error in lessonAPI.createLesson:", error.message);
      if (error.message === "Network Error") {
        // Log additional details for network errors
        console.error("Network error details:", {
          online: navigator.onLine,
          readyState: error.request ? error.request.readyState : "N/A",
        });
      }
      throw error;
    }
  },
  updateLesson: (lessonId: number, lessonData: any) =>
    API.put(`/aulas/${lessonId}`, lessonData),
  createLessonWithVideo: (
    courseId: number,
    moduleId: number,
    formData: FormData
  ) =>
    API.post(`/cursos/${courseId}/modulos/${moduleId}/aulas`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateLessonVideo: async (lessonId: number, formData: FormData) => {
    try {
      return await API.post(`/aulas/${lessonId}/video`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Increased timeout for video uploads
        timeout: 300000, // 5 minutes
      });
    } catch (error: any) {
      console.error("Error in updateLessonVideo:", error);
      throw error;
    }
  },
  uploadVideoPreview: (formData: FormData) =>
    API.post("/aulas/upload-preview", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, // 5 minutes
    }),
};

// Essay APIs
export const essayAPI = {
  getEssaysByLesson: (lessonId: number) => API.get(`/redacao/aula/${lessonId}`),
  createEssay: (data: {
    tema: string;
    descricao: string | null;
    id_curso: number;
    id_professor: number;
    id_aula: number;
  }) => API.post("/redacao", data),
  submitEssayResponse: (responseData: any) =>
    API.post("/redacaoResposta", responseData),
  getStudentEssayResponse: (studentId: number, essayId: number) =>
    API.get(`/redacaoResposta/aluno/${studentId}/redacao/${essayId}`),
  getStudantesAllEssays: (studentId: number) =>
    API.get(`/redacao/aluno/${studentId}`),
  getAllEssaysAwnsersByStudent: (studentId: number) =>
    API.get(`/redacaoResposta/aluno/${studentId}/todas`),
  getAllEssaysByTeacher: (id: number) =>
    API.get(`/redacao/professor/${id}/respostas`),
  updateEssayResponse: (responseId: number, responseData: any) =>
    API.put(`/redacaoResposta/${responseId}`, responseData),
  deleteEssayResponse: (responseId: number) =>
    API.delete(`/redacaoResposta/${responseId}`),
  getEssayCorrection: (essayId: number) =>
    API.get(`/redacaoCorrecao/${essayId}`),
  submitEssayCorrection: (data: {
    id_redacao: number;
    id_redacao_resposta: number;
    id_professor: number;
    descricao: string;
  }) => {
    return API.post(`/redacaoCorrecao`, {
      id_redacao: Number(data.id_redacao),
      id_redacao_resposta: Number(data.id_redacao_resposta),
      id_professor: Number(data.id_professor),
      descricao: String(data.descricao).trim(),
    });
  },
  updateEssayCorrection: (correctionId: number, data: { descricao: string }) =>
    API.put(`/redacaoCorrecao/${correctionId}`, data),
  getLessonById: (id: number) => API.get(`/aulas/${id}`),
  getModuleById: (id: number) => API.get(`/modulos/${id}`),
};

export const tipoComentarioAPI = {
  getByProfessor: (professorId: number) =>
    API.get(`/tipo-comentario/professor/${professorId}`),
  create: (data: { nome: string; cor: string; id_professor: number }) =>
    API.post("/tipo-comentario", data),
  delete: (id: number) => API.delete(`/tipo-comentario/${id}`),
};

export const comentarioRedacaoAPI = {
  getByResposta: (respostaId: number) =>
    API.get(`/comentario-redacao/resposta/${respostaId}`),
  create: (data: {
    id_resposta: number;
    id_tipo_comentario: number;
    texto_comentario: string;
    posicao_inicio: number;
    posicao_fim: number;
  }) => API.post("/comentario-redacao", data),
  delete: (id: number) => API.delete(`/comentario-redacao/${id}`),
};

// Document API
export const documentAPI = {
  uploadDocument: async (formData: FormData) => {
    console.log("Sending document upload request with FormData");

    // Log the FormData contents for debugging
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(
        `${key}: ${typeof value === "object" ? "File object" : value}`
      );
    }

    try {
      return await API.post("/documentos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Reduced timeout for document uploads to detect issues faster
        timeout: 30000, // 30 seconds
      });
    } catch (error: any) {
      console.error("Error in documentAPI.uploadDocument:", error.message);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }

      throw error;
    }
  },
  getDocumentosByAula: (aulaId: number) =>
    API.get(`/documentos/aula/${aulaId}`),
  updateDocumento: (id: number, titulo: string) =>
    API.put(`/documentos/${id}`, { titulo }),
  deleteDocumento: (id: number) => API.delete(`/documentos/${id}`),
};

export default API;
