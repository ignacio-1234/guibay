import type { Metadata } from "next";
import { NewMicrositeForm } from "./new-microsite-form";

export const metadata: Metadata = {
  title: "Nuevo micrositio",
};

export default function NewMicrositePage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium text-accent">Nuevo micrositio</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          Crea tu primer enlace publico
        </h1>
        <p className="text-gray-500 mt-1">
          Elige una plantilla, reserva tu slug y despues ajusta el contenido en el editor.
        </p>
      </div>

      <NewMicrositeForm />
    </div>
  );
}
