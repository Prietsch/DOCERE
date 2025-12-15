import { Box, Button, CircularProgress, Typography } from "@material-ui/core";
import { CloudUpload as UploadIcon } from "@material-ui/icons";
import React, { useRef, useState } from "react";

interface FileUploadAreaProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  label?: string;
  isUploading?: boolean;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFileSelected,
  accept = "video/*",
  label = "Arraste um arquivo de vídeo ou clique para selecionar",
  isUploading = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFileName(file.name);
    onFileSelected(file);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box
      border={2}
      borderRadius={1}
      borderColor={isDragging ? "primary.main" : "grey.300"}
      //   borderStyle="dashed"
      p={3}
      textAlign="center"
      bgcolor={isDragging ? "rgba(63, 81, 181, 0.08)" : "background.paper"}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
      style={{ cursor: "pointer" }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={accept}
        style={{ display: "none" }}
      />

      <UploadIcon fontSize="large" color="primary" />

      {isUploading ? (
        <Box
          mt={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <CircularProgress size={24} />
          <Typography variant="body2" style={{ marginTop: 8 }}>
            Carregando arquivo...
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body1" style={{ marginTop: 8 }}>
            {label}
          </Typography>

          {selectedFileName && (
            <Typography
              variant="caption"
              display="block"
              style={{ marginTop: 8 }}
            >
              Arquivo selecionado: {selectedFileName}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ marginTop: 16 }}
          >
            Selecionar Arquivo
          </Button>
        </>
      )}
    </Box>
  );
};

export default FileUploadArea;
