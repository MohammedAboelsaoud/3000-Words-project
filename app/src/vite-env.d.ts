/// <reference types="vite/client" />
interface ImportMetaEnv {
  /** Set when building the single-page version hosted as a claude.ai artifact. */
  readonly VITE_ARTIFACT?: string;
}
