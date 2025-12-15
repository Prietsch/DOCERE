import { Box, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";

interface VideoPlayerProps {
  url: string;
  title?: string;
  onProgress?: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  onProgress,
}) => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isGoogleDriveUrl, setIsGoogleDriveUrl] = useState<boolean>(false);

  useEffect(() => {
    // Garante que temos uma URL válida mesmo se recebemos undefined ou null
    if (!url) {
      console.warn("VideoPlayer recebeu uma URL vazia ou inválida");
      setVideoUrl("");
      setIsGoogleDriveUrl(false);
      return;
    }

    // Verifica se é uma URL do Google Drive
    const isDriveUrl = url.includes("drive.google.com");
    setIsGoogleDriveUrl(isDriveUrl);

    if (isDriveUrl) {
      // Para URLs do Google Drive, transforma o link de visualização em link direto para o arquivo
      // Extraindo o ID do arquivo
      let fileId = "";

      // Tenta extrair o ID do arquivo do Google Drive a partir da URL
      // Padrão: https://drive.google.com/file/d/{FILE_ID}/view ou https://drive.google.com/open?id={FILE_ID}
      const fileIdMatch = url.match(/[-\w]{25,}/);
      if (fileIdMatch) {
        fileId = fileIdMatch[0];
      } else if (url.includes("id=")) {
        const params = new URLSearchParams(url.split("?")[1]);
        fileId = params.get("id") || "";
      }

      if (fileId) {
        // Criar um link direto para o arquivo usando o ID extraído
        setVideoUrl(`https://drive.google.com/uc?export=download&id=${fileId}`);
      } else {
        console.warn(
          "Não foi possível extrair o ID do arquivo do Google Drive:",
          url
        );
        setVideoUrl(url); // Fallback para a URL original
      }
    } else {
      // Para URLs normais ou locais
      const fullUrl = url.startsWith("http")
        ? url
        : `${process.env.REACT_APP_TEST}${url}`;

      setVideoUrl(fullUrl);
    }
  }, [url]);

  // Verifica se é uma URL do Google Drive para exibir iframe em vez de vídeo nativo
  return (
    <Box mb={2}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      {videoUrl && isGoogleDriveUrl ? (
        // Para vídeos do Google Drive, usamos um iframe
        <iframe
          src={`https://drive.google.com/file/d/${
            videoUrl.match(/[-\w]{25,}/)?.[0]
          }/preview`}
          width="100%"
          height="480"
          style={{ maxHeight: "600px", border: "none" }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      ) : videoUrl ? (
        // Para vídeos locais ou outras fontes, usamos o player nativo
        <video
          controls
          width="100%"
          style={{ maxHeight: "600px", backgroundColor: "#000" }}
          controlsList="nodownload"
          onTimeUpdate={onProgress}
          key={videoUrl} // Adicionando key para garantir remontagem do elemento quando a URL muda
        >
          <source src={videoUrl} type="video/mp4" />
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      ) : null}
    </Box>
  );
};

export default VideoPlayer;
