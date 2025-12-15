// Interfaces comuns usadas em todo o projeto

// Interfaces para aulas e cursos
export interface Aula {
  id: number;
  titulo: string;
  urlVideo: string;
  moduloId: number;
  ordem?: number;
}

export interface Modulo {
  id: number;
  nome: string;
  cursoId: number;
  ordem?: number;
  aulas: Aula[];
}

export interface Curso {
  id: number;
  nome: string;
  descricao: string;
  professorId: number;
  professor?: {
    nome: string;
    email?: string;
  };
  modulos: Modulo[];
  progress?: any[];
}

// Interfaces para redações
export interface Redacao {
  id: number;
  tema: string;
  descricao?: string;
  id_curso: number;
  id_professor: number;
  id_aula: number;
}

export interface CreativeWritingState {
  preparation: string;
  incubation: string;
  illumination: string;
  implementation: string;
}

export interface EssayResponse {
  id: number;
  id_redacao: number;
  text: string;
  preparation?: string;
  incubation?: string;
  illumination?: string;
  implementation?: string;
  id_aluno: number;
  feedback?: string;
  correcao?: {
    id: number;
    descricao: string;
    id_professor: number;
    professor?: {
      id: number;
      nome: string;
    };
  };
}

export interface Highlight {
  id: string;
  start: number;
  end: number;
  type: string;
  comment: string;
}

export interface HighlightType {
  id: string;
  name: string;
  color: string;
}

// Interface para parâmetros de rota
export interface RouteParams {
  id: string;
}

// Interfaces para quiz e ensaios
export interface Quiz {
  title: string;
  questions: Question[];
}

export interface Question {
  text: string;
  type: "multiple_choice" | "open";
  options?: string[];
  correctAnswer?: number;
}

export interface Essay {
  title: string;
  description: string;
  nota: string;
}

// Interface para estilização com props
export interface StyleProps {
  isActive?: boolean;
  isCompleted?: boolean;
}

// Interface para componentes de UI
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
