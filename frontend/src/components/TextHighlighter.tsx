import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useRef, useState } from "react";
import { Highlight, HighlightType } from "../../interfaces/interfaces";

interface TextHighlighterProps {
  text?: string;
  highlights?: Highlight[];
  highlightTypes: HighlightType[];
  onAddHighlight?: (highlight: Highlight) => void;
  readOnly?: boolean;
}

interface TextSelection {
  text: string;
  start: number;
  end: number;
}

const TextHighlighter: React.FC<TextHighlighterProps> = ({
  text = "",
  highlights = [],
  highlightTypes,
  onAddHighlight,
  readOnly = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(
    null
  );
  const [activeHighlights, setActiveHighlights] = useState<Highlight[]>([]);
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newHighlight, setNewHighlight] = useState({
    type: "",
    comment: "",
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly || !text) return;
    
    // Pequeno delay para garantir que a seleção foi completada
    setTimeout(() => {
      const windowSelection = window.getSelection();
      if (!windowSelection || windowSelection.rangeCount === 0) return;

      const selectedText = windowSelection.toString();
      if (!selectedText || selectedText.trim() === "") return;

      // Verifica se a seleção está dentro do container
      const range = windowSelection.getRangeAt(0);
      if (!containerRef.current) return;
      
      // Verifica se o container contém a seleção
      const containerElement = containerRef.current;
      let isInsideContainer = false;
      
      try {
        isInsideContainer = containerElement.contains(range.commonAncestorContainer) ||
          containerElement.contains(range.startContainer) ||
          containerElement.contains(range.endContainer);
      } catch {
        return;
      }
      
      if (!isInsideContainer) return;

      // Encontra a posição do texto selecionado no texto original
      const findSelectionPosition = (): { start: number; end: number } | null => {
        try {
          // Pega o texto antes da seleção para ter contexto
          const preSelectionRange = document.createRange();
          preSelectionRange.selectNodeContents(containerElement);
          preSelectionRange.setEnd(range.startContainer, range.startOffset);
          const preSelectionText = preSelectionRange.toString();
          
          // A posição inicial é o tamanho do texto antes da seleção
          const start = preSelectionText.length;
          const end = start + selectedText.length;
          
          // Valida se o texto na posição calculada corresponde ao selecionado
          const textAtPosition = text.substring(start, end);
          if (textAtPosition === selectedText) {
            return { start, end };
          }
          
          // Fallback: busca o texto selecionado no original
          const index = text.indexOf(selectedText);
          if (index !== -1) {
            return { start: index, end: index + selectedText.length };
          }
        } catch (error) {
          console.error("Erro ao calcular posição:", error);
          // Fallback em caso de erro
          const index = text.indexOf(selectedText);
          if (index !== -1) {
            return { start: index, end: index + selectedText.length };
          }
        }
        
        return null;
      };

      const position = findSelectionPosition();
      if (!position) return;

      setSelection({ 
        text: selectedText, 
        start: position.start, 
        end: position.end 
      });
      setIsCreateDialogOpen(true);
      
      // Limpa a seleção do navegador
      windowSelection.removeAllRanges();
    }, 10);
  };

  const handleHighlightClick = (
    event: React.MouseEvent<HTMLSpanElement>,
    highlightsForSegment: Highlight[]
  ) => {
    event.stopPropagation();
    setActiveHighlights(highlightsForSegment);
    setActiveHighlight(highlightsForSegment[0]); // Para compatibilidade
    setAnchorEl(event.currentTarget);
  };

  const handleCreateHighlight = () => {
    if (selection && onAddHighlight) {
      const highlight: Highlight = {
        id: Math.random().toString(36).substr(2, 9),
        start: selection.start,
        end: selection.end,
        type: newHighlight.type,
        comment: newHighlight.comment,
      };

      onAddHighlight(highlight);
      handleCloseDialog();
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setSelection(null);
    setNewHighlight({
      type: "",
      comment: "",
    });
  };
  const getHighlightColor = (typeId: string) => {
    if (!highlightTypes || !typeId) return "#000000";
    const type = highlightTypes.find((t) => t.id === typeId);
    return type ? type.color : "#000000";
  };

  // Função para mesclar cores quando há múltiplos highlights
  const getMergedColor = (highlightsForPosition: Highlight[]) => {
    if (highlightsForPosition.length === 1) {
      return getHighlightColor(highlightsForPosition[0].type);
    }
    // Para múltiplos highlights, usa a cor do primeiro com uma borda para indicar múltiplos
    return getHighlightColor(highlightsForPosition[0].type);
  };

  const renderTextWithHighlights = () => {
    // If text is undefined or null, return empty array
    if (!text) {
      return [""];
    }

    // If highlights array is undefined or null, just return the full text
    if (!highlights || !highlights.length) {
      return [text];
    }

    // Cria um mapa de posições com os highlights que cobrem cada posição
    // Isso resolve o problema de sobreposição
    const positionMap: Map<number, Highlight[]> = new Map();
    
    highlights.forEach((highlight) => {
      for (let i = highlight.start; i < highlight.end; i++) {
        if (!positionMap.has(i)) {
          positionMap.set(i, []);
        }
        positionMap.get(i)!.push(highlight);
      }
    });

    // Agrupa posições consecutivas com os mesmos highlights
    const segments: { start: number; end: number; highlights: Highlight[] }[] = [];
    let currentSegment: { start: number; end: number; highlights: Highlight[] } | null = null;

    for (let i = 0; i < text.length; i++) {
      const highlightsAtPosition = positionMap.get(i) || [];
      const highlightIds = highlightsAtPosition.map(h => h.id).sort().join(',');

      if (currentSegment) {
        const currentIds = currentSegment.highlights.map(h => h.id).sort().join(',');
        
        if (highlightIds === currentIds) {
          // Continua o segmento atual
          currentSegment.end = i + 1;
        } else {
          // Finaliza o segmento atual e começa um novo
          segments.push(currentSegment);
          if (highlightsAtPosition.length > 0) {
            currentSegment = { start: i, end: i + 1, highlights: highlightsAtPosition };
          } else {
            currentSegment = null;
          }
        }
      } else {
        if (highlightsAtPosition.length > 0) {
          currentSegment = { start: i, end: i + 1, highlights: highlightsAtPosition };
        }
      }
    }

    // Não esquecer do último segmento
    if (currentSegment) {
      segments.push(currentSegment);
    }

    // Renderiza o texto com os segmentos destacados
    const result: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    segments.forEach((segment, index) => {
      // Adiciona texto antes do segmento
      if (segment.start > lastIndex) {
        result.push(text.slice(lastIndex, segment.start));
      }

      const hasMultiple = segment.highlights.length > 1;
      const baseColor = getMergedColor(segment.highlights);

      // Adiciona o segmento destacado
      result.push(
        <span
          key={`segment-${index}`}
          style={{
            backgroundColor: baseColor,
            padding: "0 2px",
            cursor: "pointer",
            borderBottom: hasMultiple ? "2px dashed #333" : "none",
            position: "relative",
            display: "inline",
          }}
          title={hasMultiple ? `${segment.highlights.length} comentários` : undefined}
          onClick={(e) => handleHighlightClick(e, segment.highlights)}
        >
          {text.slice(segment.start, segment.end)}
          {hasMultiple && (
            <span style={{ 
              fontSize: "10px", 
              fontWeight: "bold",
              backgroundColor: "#333",
              color: "#fff",
              borderRadius: "50%",
              padding: "1px 4px",
              position: "absolute",
              top: "-10px",
              right: "-8px",
              lineHeight: "1",
              zIndex: 1,
            }}>
              {segment.highlights.length}
            </span>
          )}
        </span>
      );

      lastIndex = segment.end;
    });

    // Adiciona texto restante
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  return (
    <Box>
      <div
        ref={containerRef}
        style={{
          padding: 16,
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          whiteSpace: "pre-wrap",
          lineHeight: "1.8",
          cursor: readOnly ? "default" : "text",
          userSelect: "text",
          WebkitUserSelect: "text",
          MozUserSelect: "text",
          msUserSelect: "text",
        }}
        onMouseUp={handleTextSelection}
        onPointerUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
      >
        {renderTextWithHighlights()}
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
          setActiveHighlight(null);
          setActiveHighlights([]);
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box p={2} maxWidth={350}>
          {activeHighlights.length > 1 ? (
            // Múltiplos comentários
            <>
              <Typography variant="subtitle2" gutterBottom style={{ fontWeight: "bold" }}>
                {activeHighlights.length} Comentários neste trecho:
              </Typography>
              {activeHighlights.map((highlight, index) => (
                <Box 
                  key={highlight.id} 
                  mb={index < activeHighlights.length - 1 ? 2 : 0}
                  pb={index < activeHighlights.length - 1 ? 2 : 0}
                  borderBottom={index < activeHighlights.length - 1 ? "1px solid #e0e0e0" : "none"}
                >
                  <Box display="flex" alignItems="center" mb={0.5}>
                    <Box
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: getHighlightColor(highlight.type),
                        marginRight: 8,
                      }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Comentário {index + 1}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" style={{ color: getHighlightColor(highlight.type) }}>
                    {highlightTypes.find((type) => type.id === highlight.type)?.name}
                  </Typography>
                  <Typography variant="body2">{highlight.comment}</Typography>
                </Box>
              ))}
            </>
          ) : activeHighlights.length === 1 ? (
            // Comentário único
            <>
              <Typography variant="subtitle2" gutterBottom>
                {highlightTypes.find((type) => type.id === activeHighlights[0].type)?.name}
              </Typography>
              <Typography variant="body2">{activeHighlights[0].comment}</Typography>
            </>
          ) : null}
        </Box>
      </Popover>

      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Criar Destaque</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Texto selecionado:
            </Typography>
            <Typography variant="body2" style={{ fontStyle: "italic" }}>
              "{selection?.text}"
            </Typography>
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Destaque</InputLabel>
            <Select
              value={newHighlight.type}
              onChange={(e) =>
                setNewHighlight({
                  ...newHighlight,
                  type: e.target.value as string,
                })
              }
            >
              {highlightTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  <Box display="flex" alignItems="center">
                    <Box
                      width={16}
                      height={16}
                      bgcolor={type.color}
                      mr={1}
                      borderRadius={2}
                    />
                    <Typography>{type.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Comentário"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={newHighlight.comment}
            onChange={(e) =>
              setNewHighlight({ ...newHighlight, comment: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="default">
            Cancelar
          </Button>
          <Button
            onClick={handleCreateHighlight}
            color="primary"
            disabled={!newHighlight.comment.trim()}
          >
            Criar Destaque
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TextHighlighter;
