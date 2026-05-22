// MiniMax TTS client — Speech 2.8 HD via /v1/t2a_v2.
// Returns MP3 bytes ready to upload to Supabase Storage or stream to the client.

const TTS_ENDPOINT = "https://api.minimax.io/v1/t2a_v2";

export type MinimaxVoice =
  | "English_Graceful_Lady"
  | "English_Insightful_Speaker"
  | "English_radiant_girl"
  | "English_Persuasive_Man";

export type MinimaxEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "fearful"
  | "disgusted"
  | "surprised"
  | "calm"
  | "fluent"
  | "whisper";

export interface GenerateSpeechOptions {
  text: string;
  voiceId?: MinimaxVoice;
  emotion?: MinimaxEmotion;
  speed?: number; // 0.5 – 2.0
  model?: "speech-2.8-hd" | "speech-2.8-turbo";
}

export interface GenerateSpeechResult {
  audio: Buffer;
  mimeType: "audio/mpeg";
  durationMs: number;
  characters: number;
}

export async function generateSpeech(opts: GenerateSpeechOptions): Promise<GenerateSpeechResult> {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) throw new Error("MINIMAX_API_KEY not set");
  if (!opts.text?.trim()) throw new Error("text is required");

  const body = {
    model: opts.model ?? "speech-2.8-hd",
    text: opts.text,
    stream: false,
    voice_setting: {
      voice_id: opts.voiceId ?? "English_Graceful_Lady",
      speed: opts.speed ?? 1.0,
      vol: 1.0,
      pitch: 0,
      emotion: opts.emotion ?? "calm",
    },
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: "mp3",
      channel: 1,
    },
    output_format: "hex",
  };

  const res = await fetch(TTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`MiniMax TTS ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    data?: { audio?: string; status?: number };
    extra_info?: { audio_length?: number; usage_characters?: number };
    base_resp?: { status_code: number; status_msg: string };
  };

  if (json.base_resp && json.base_resp.status_code !== 0) {
    throw new Error(`MiniMax TTS: ${json.base_resp.status_msg}`);
  }

  const hex = json.data?.audio;
  if (!hex) throw new Error("MiniMax TTS: no audio in response");

  return {
    audio: Buffer.from(hex, "hex"),
    mimeType: "audio/mpeg",
    durationMs: json.extra_info?.audio_length ?? 0,
    characters: json.extra_info?.usage_characters ?? opts.text.length,
  };
}
