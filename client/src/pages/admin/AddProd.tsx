import { useCallback, useEffect, useRef, useState } from "react";
import ProductForm from "../../Components/admin/ProductForm";
import escarapelaImage from "../../escarapela/escarapela.jpg";
import relocoImage from "../../escarapela/reloco.jpg";
import sustoAudio from "../../escarapela/susto.mp3";

export default function AddProd() {
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const closeExperience = useCallback(() => {
    setExperienceOpen(false);
    stopAudio();
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  }, [stopAudio]);

  function openExperience() {
    setAudioUnavailable(false);
    setExperienceOpen(true);

    // Play from the click handler so the browser recognizes the user's gesture.
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => setAudioUnavailable(true));
    }

    // The overlay remains full viewport if the browser refuses fullscreen mode.
    void document.documentElement.requestFullscreen?.().catch(() => {});
  }

  useEffect(() => {
    if (!experienceOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeExperience();
    };
    const closeWhenFullscreenEnds = () => {
      if (!document.fullscreenElement) {
        setExperienceOpen(false);
        stopAudio();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("fullscreenchange", closeWhenFullscreenEnds);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("fullscreenchange", closeWhenFullscreenEnds);
    };
  }, [closeExperience, experienceOpen, stopAudio]);

  return (
    <main className="h-svh overflow-y-auto overscroll-y-contain bg-bg-dark px-6 py-5 text-black font-Manrope">
      <div className="relative w-full max-w-[86.4rem]">
        <button
          type="button"
          onClick={openExperience}
          aria-label="Abrir una sorpresa"
          title="Una sorpresa"
          className="absolute right-0 top-0 z-10 size-11 overflow-hidden rounded-full border border-alt-dark/30 bg-bg-light shadow-sm transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alt-dark"
        >
          <img
            src={escarapelaImage}
            alt=""
            draggable={false}
            className="h-full w-full object-cover"
          />
        </button>
        <ProductForm />
      </div>

      <audio
        ref={audioRef}
        src={sustoAudio}
        preload="auto"
        onError={() => setAudioUnavailable(true)}
        className="sr-only"
      />

      {experienceOpen && (
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Sorpresa a pantalla completa"
          className="fixed inset-0 z-[100] flex h-svh w-screen items-center justify-center overflow-hidden bg-black text-white"
        >
          <img
            src={relocoImage}
            alt="Un perro mirando de cerca"
            className="h-full w-full object-contain"
          />

          {audioUnavailable && (
            <p role="alert" className="absolute bottom-5 inset-x-5 text-center text-sm">
              No se pudo iniciar el audio.
            </p>
          )}

          <button
            type="button"
            onClick={closeExperience}
            aria-label="Cerrar sorpresa y detener audio"
            className="absolute right-4 top-4 min-h-11 rounded-md bg-black/70 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/50 transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6"
          >
            Cerrar
          </button>
        </section>
      )}
    </main>
  );
}
