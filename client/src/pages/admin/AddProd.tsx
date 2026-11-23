import { useCallback, useEffect, useRef, useState } from "react";
import ProductForm from "../../Components/admin/ProductForm";
import escarapelaImage from "../../escarapela/escarapela.jpg";
import relocoImage from "../../escarapela/reloco.jpg";
import sustoAudio from "../../escarapela/susto.mp3";

export default function AddProd() {
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const transitionTimer = useRef<number | null>(null);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const closeExperience = useCallback(() => {
    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
      transitionTimer.current = null;
    }
    setNoticeOpen(false);
    setExperienceOpen(false);
    stopAudio();
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  }, [stopAudio]);

  function openExperience() {
    setAudioUnavailable(false);
    setNoticeOpen(true);
    setExperienceOpen(false);

    // Start muted on the click so playback is allowed after the short fake wait.
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.muted = true;
      void audio.play().catch(() => setAudioUnavailable(true));
    }

    // Request fullscreen during the click; the overlay remains viewport-sized if denied.
    void document.documentElement.requestFullscreen?.().catch(() => {});

    if (transitionTimer.current !== null) {
      window.clearTimeout(transitionTimer.current);
    }
    transitionTimer.current = window.setTimeout(() => {
      transitionTimer.current = null;
      setNoticeOpen(false);
      setExperienceOpen(true);

      const delayedAudio = audioRef.current;
      if (delayedAudio) {
        delayedAudio.currentTime = 0;
        delayedAudio.muted = false;
        void delayedAudio.play().catch(() => setAudioUnavailable(true));
      }
    }, 2000);
  }

  useEffect(() => {
    if (!noticeOpen && !experienceOpen) return;

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
    if (experienceOpen) {
      document.addEventListener("fullscreenchange", closeWhenFullscreenEnds);
    }
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("fullscreenchange", closeWhenFullscreenEnds);
    };
  }, [closeExperience, experienceOpen, noticeOpen, stopAudio]);

  useEffect(
    () => () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    },
    [],
  );

  return (
    <main className="h-svh overflow-y-auto overscroll-y-contain bg-bg-dark px-6 py-5 text-black font-Manrope">
      <div className="relative w-full max-w-[86.4rem]">
        <button
          type="button"
          onClick={openExperience}
          aria-label="Abrir una sorpresa"
          title="Una sorpresa"
          className="absolute right-0 top-0 z-10 size-11 overflow-hidden rounded-full border border-alt-dark/30 bg-bg-light opacity-0 shadow-sm transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alt-dark"
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

      {noticeOpen && (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-validation-title"
          className="fixed inset-0 z-[100] flex h-svh w-screen items-center justify-center bg-black/45 p-5 text-black"
        >
          <div className="w-full max-w-sm rounded-lg border border-alt-dark/30 bg-bg-light p-5 shadow-xl sm:p-6">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 animate-spin rounded-full border-2 border-alt-dark/25 border-t-alt-dark"
              />
              <div>
                <h2 id="product-validation-title" className="font-Outfit text-lg font-medium">
                  Validando datos del producto
                </h2>
                <p className="mt-1 text-sm text-black/65">
                  Estamos comprobando la información antes de continuar.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

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
