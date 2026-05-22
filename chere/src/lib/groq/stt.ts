// Groq Whisper client — large-v3-turbo for fast, cheap transcription.
// Uses the OpenAI-compatible /openai/v1/audio/transcriptions endpoint.

const STT_ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions";

export interface TranscribeAudioOptions {
  audio: Buffer;
  mimeType: string;
  filename?: string;
  language?: string; // ISO-639-1 code, e.g. "en". Omit for auto-detect.
}

export interface TranscribeAudioResult {
  text: string;
  language: string | null;
  durationSeconds: number | null;
}

export async function transcribeAudio(opts: TranscribeAudioOptions): Promise<TranscribeAudioResult> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");
  if (!opts.audio?.length) throw new Error("audio is required");

  const form = new FormData();
  const blob = new Blob([new Uint8Array(opts.audio)], { type: opts.mimeType });
  form.append("file", blob, opts.filename ?? "audio.webm");
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "verbose_json");
  if (opts.language) form.append("language", opts.language);

  const res = await fetch(STT_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq STT ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    text?: string;
    language?: string;
    duration?: number;
  };

  return {
    text: (json.text ?? "").trim(),
    language: json.language ?? null,
    durationSeconds: typeof json.duration === "number" ? json.duration : null,
  };
}
