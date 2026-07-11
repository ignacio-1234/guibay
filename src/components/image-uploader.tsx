"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadKind = "avatar" | "hero" | "free";

type ImageUploaderProps = {
  /** URL actual de la imagen (o null si no hay). */
  value: string | null;
  /** Se llama con la nueva URL al subir, o null al quitar. */
  onChange: (url: string | null) => void;
  /** Preset de optimización en el servidor. */
  kind?: UploadKind;
  /** "circle" para avatar, "wide" para portada. */
  shape?: "circle" | "wide";
  /** Texto de ayuda debajo del área. */
  hint?: string;
};

export function ImageUploader({
  value,
  onChange,
  kind = "free",
  shape = "wide",
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Ese archivo no es una imagen.");
      return;
    }
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la imagen.");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  const isCircle = shape === "circle";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isUploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "group relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 bg-surface-muted transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30",
          isCircle ? "mx-auto h-28 w-28 rounded-full" : "h-36 w-full rounded-2xl",
          isDragging && "border-primary bg-primary/5"
        )}
      >
        {value && !isUploading && (
          <img src={value} alt="Vista previa" className="h-full w-full object-cover" />
        )}

        {isUploading ? (
          <div className="flex flex-col items-center gap-1 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs font-medium">Subiendo...</span>
          </div>
        ) : !value ? (
          <div className="flex flex-col items-center gap-1.5 px-3 text-center text-gray-400 group-hover:text-primary">
            {isCircle ? <ImagePlus className="h-6 w-6" /> : <UploadCloud className="h-7 w-7" />}
            <span className="text-xs font-medium">
              {isCircle ? "Subir foto" : "Arrastra una imagen o haz clic"}
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
            <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800">
              Cambiar
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-400">{error ? "" : hint}</p>
        {value && !isUploading && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError("");
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Quitar
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
