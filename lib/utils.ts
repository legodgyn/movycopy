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
  const frames = await extractVideoFrames(file, 1);
  return frames[0];
}

export async function extractVideoFrames(
  file: File,
  frameCount = 6
): Promise<Array<{ base64: string; mimeType: string }>> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);

    const frames: Array<{ base64: string; mimeType: string }> = [];
    let points: number[] = [];

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.onloadedmetadata = null;
      video.onloadeddata = null;
      video.onseeked = null;
      video.onerror = null;
    };

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const safeDuration = Math.max(duration, 1);

        points = Array.from({ length: frameCount }).map((_, index) => {
          if (frameCount === 1) {
            return Math.min(1, Math.max(0.1, safeDuration - 0.1));
          }

          const progress = index / (frameCount - 1);
          const time = safeDuration * progress;
          return Math.min(Math.max(0.1, time), Math.max(0.1, safeDuration - 0.1));
        });

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          cleanup();
          reject(new Error("Não foi possível processar os frames do vídeo."));
          return;
        }

        let currentIndex = 0;

        video.onseeked = () => {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            frames.push({
              base64: dataUrl.split(",")[1],
              mimeType: "image/jpeg",
            });

            currentIndex += 1;

            if (currentIndex >= points.length) {
              cleanup();
              resolve(frames);
              return;
            }

            video.currentTime = points[currentIndex];
          } catch {
            cleanup();
            reject(new Error("Erro ao capturar frame do vídeo."));
          }
        };

        video.currentTime = points[currentIndex];
      } catch {
        cleanup();
        reject(new Error("Não foi possível extrair os frames do vídeo."));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Não foi possível ler o vídeo enviado."));
    };
  });
}
