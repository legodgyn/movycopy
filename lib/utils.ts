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
  const firstFrame = frames[0];

  if (!firstFrame) {
    throw new Error("Não foi possível extrair frame do vídeo.");
  }

  return firstFrame;
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

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onseeked = null;
      video.onerror = null;
      URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const safeFrameCount = Math.max(1, frameCount);

        const points = Array.from({ length: safeFrameCount }).map((_, index) => {
          if (safeFrameCount === 1) {
            return Math.min(1, Math.max(0.1, duration - 0.1));
          }

          const progress = index / (safeFrameCount - 1);
          const rawTime = duration * progress;
          return Math.min(Math.max(0.1, rawTime), Math.max(0.1, duration - 0.1));
        });

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          cleanup();
          reject(new Error("Não foi possível processar os frames do vídeo."));
          return;
        }

        const captureAt = (time: number) =>
          new Promise<void>((resolveCapture, rejectCapture) => {
            video.onseeked = () => {
              try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
                frames.push({
                  base64: dataUrl.split(",")[1],
                  mimeType: "image/jpeg",
                });
                resolveCapture();
              } catch {
                rejectCapture(new Error("Erro ao capturar frame."));
              }
            };

            video.currentTime = time;
          });

        for (const point of points) {
          await captureAt(point);
        }

        cleanup();
        resolve(frames);
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
