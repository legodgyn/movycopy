export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Não foi possível converter o arquivo."));
        return;
      }

      const base64 = result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Erro ao ler arquivo."));
    reader.readAsDataURL(file);
  });
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export async function extractVideoFrame(file: File): Promise<{
  base64: string;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    video.onloadeddata = async () => {
      try {
        const seekTo = Math.min(1, video.duration || 1);

        video.currentTime = seekTo;
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(new Error("Não foi possível preparar o vídeo."));
      }
    };

    video.onseeked = () => {
      try {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Não foi possível processar o frame do vídeo."));
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        const base64 = dataUrl.split(",")[1];

        URL.revokeObjectURL(url);

        resolve({
          base64,
          mimeType: "image/jpeg",
        });
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(new Error("Erro ao extrair frame do vídeo."));
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler o vídeo enviado."));
    };
  });
}