import { getAudioMimeByExt } from "@/lib/utils";

interface SynthesisParams {
  token: string;
  appid: string;
  text: string;
  voiceType: string;
  resourceId?: string;
  volume?: number;
  speed?: number;
  pitch?: number;
  customUrl?: string;
  customHeaders?: string;
  customBody?: string;
  enableCustom?: boolean;
  pollLimit?: number;
}

interface SynthesisTaskResponse {
  task_status: number;
  task_id: string;
  message: string;
}

interface SynthesisResult {
  audio_url: string;
  task_status: number;
  audio_ext?: string;
}

export async function longTextSynthesis(
  params: SynthesisParams,
): Promise<SynthesisResult> {
  const {
    customUrl,
    customHeaders,
    customBody,
    enableCustom
  } = params;

  // 只要配置了 enableCustom 且有 customUrl 就走自定义逻辑
  if (enableCustom && customUrl) {
    return customSynthesis(params);
  }

  const {
    text,
    voiceType,
    volume,
    speed,
    pitch,
    token,
    appid,
    resourceId = "volc.tts_async.default",
    pollLimit = 10,
  } = params;
  const timeoutDuration = 5 * 60 * 1000;
  const startTime = Date.now();
  const createTaskResponse = await createSynthesisTask({
    text,
    voiceType,
    volume,
    speed,
    pitch,
    token,
    appid,
    resourceId,
  });

  if (!createTaskResponse.task_id) {
    throw new Error(
      `创建合成任务失败，错误信息: ${createTaskResponse.message}`,
    );
  }

  if (createTaskResponse.task_status === 2) {
    throw new Error(
      `创建合成任务失败，错误信息: ${JSON.stringify(createTaskResponse)}`,
    );
  }
  const taskId = createTaskResponse.task_id;
  let result: SynthesisResult;
  let pollCount = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() - startTime > timeoutDuration) {
      throw new Error("合成任务超时，请检查服务状态。");
    }

    if (pollCount >= pollLimit) {
      throw new Error(`合成任务超过轮询次数上限 (${pollLimit})，请检查服务状态或增加上限。`);
    }
    pollCount++;

    const queryResponse = await querySynthesisResult({
      taskId,
      token,
      appid,
      resourceId,
    });
    if (queryResponse.task_status === 1) {
      result = queryResponse;
      break;
    } else if (queryResponse.task_status === 2) {
      throw new Error(
        `合成任务失败，错误信息: ${JSON.stringify(queryResponse)}`,
      );
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  return result;
}

async function customSynthesis(params: SynthesisParams): Promise<SynthesisResult> {
  const { customUrl, customHeaders, customBody, text, voiceType, volume, speed, pitch, token } = params;
  
  let headers: Record<string, string> = {};
  if (customHeaders) {
    try {
      // Simple token replacement
      const headersStr = customHeaders.replace(/\{token\}/g, token);
      headers = JSON.parse(headersStr);
    } catch (e) {
      console.error("Failed to parse custom headers", e);
    }
  }

  let body: any = {};
  if (customBody) {
    try {
      // Escape text for JSON string replacement
      // A safer way is to parse first, but user provides string with placeholders.
      // We'll use simple replacement for now, assuming user knows what they are doing or we can handle it better.
      // Actually, regex replace on JSON string is risky if text contains quotes.
      // Better approach: Parse customBody as JSON first (if it doesn't contain placeholders as keys/values that break JSON),
      // then traverse and replace?
      // Or just replace and hope for best?
      // The prompt says "custom request body", usually templates.
      // Let's try to handle escaping.
      const safeText = text.replace(/["\\]/g, '\\$&').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      
      const bodyStr = customBody
        .replace(/\{text\}/g, safeText)
        .replace(/\{voice\}/g, voiceType)
        .replace(/\{volume\}/g, String(volume ?? 1))
        .replace(/\{speed\}/g, String(speed ?? 1))
        .replace(/\{pitch\}/g, String(pitch ?? 1));
      
      body = JSON.parse(bodyStr);
    } catch (e) {
      console.error("Failed to parse custom body", e);
      // Fallback: try to just use it if it's not a JSON string but maybe form data?
      // But we set Content-Type to application/json usually.
    }
  }

  const isExternal = /^https?:\/\//i.test(customUrl!);
  const backendBase = import.meta.env.DEV ? '/tts-proxy' : 'https://logbackend.fishwhite.top';
  const requestUrl = isExternal
    ? `${backendBase}/api/proxy?target=${encodeURIComponent(customUrl!)}`
    : customUrl!;

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
     throw new Error(`Custom TTS request failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    const getFromJson = (d: any) => {
      let format = d?.format || d?.audio_format || d?.mime?.replace(/^audio\//, "");
      const audioObj = d?.output?.audio || d?.audio;
      if (audioObj && typeof audioObj === 'object') {
        const rawUrl = audioObj.url || audioObj.link || audioObj.href;
        if (rawUrl && typeof rawUrl === 'string') {
          const clean = sanitizeUrl(rawUrl);
          const proxied = /^https?:\/\//i.test(clean) ? `${backendBase}/api/proxy?target=${encodeURIComponent(clean)}` : clean;
          const ext = extFromUrl(clean) || format;
          return { url: proxied, ext };
        }
        const d64 = audioObj.data || audioObj.base64;
        if (d64 && typeof d64 === 'string') {
          const norm = normalizeBase64(d64);
          const bytes = atob(norm);
          const arr = new Uint8Array(bytes.length);
          for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
          const mime = getAudioMimeByExt(format || "mp3");
          const blob = new Blob([arr], { type: mime });
          return { url: URL.createObjectURL(blob), ext: (format || "mp3") };
        }
      }
      if (d?.output?.results && Array.isArray(d.output.results)) {
        const item = d.output.results.find((r: any) => r?.type === "audio" || r?.content?.audio);
        if (item) {
          format = item?.content?.format || item?.content?.mime?.replace(/^audio\//, "") || format;
          const b64 = item?.content?.audio;
          if (b64) {
            const norm = normalizeBase64(b64);
            const bytes = atob(norm);
            const arr = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
            const mime = getAudioMimeByExt(format || "mp3");
            const blob = new Blob([arr], { type: mime });
            return { url: URL.createObjectURL(blob), ext: (format || "mp3") };
          }
        }
      }
      const b64 = d?.audio_base64 || d?.audio;
      if (b64) {
        const norm = normalizeBase64(b64);
        const bytes = atob(norm);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const mime = getAudioMimeByExt(format || "mp3");
        const blob = new Blob([arr], { type: mime });
        return { url: URL.createObjectURL(blob), ext: (format || "mp3") };
      }
      const url = d?.audio_url || d?.url;
      if (url) {
        const clean = sanitizeUrl(url);
        const proxied = /^https?:\/\//i.test(clean) ? `${backendBase}/api/proxy?target=${encodeURIComponent(clean)}` : clean;
        const ext = extFromUrl(clean) || format;
        return { url: proxied, ext };
      }
      return null;
    };
    const r = getFromJson(data);
    if (r) return { audio_url: r.url, task_status: 1, audio_ext: r.ext } as any;
    return data as any;
  } else {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const ext = blob.type?.startsWith("audio/") ? blob.type.replace("audio/", "") : undefined;
    return { audio_url: url, task_status: 1, audio_ext: ext } as any;
  }
}

function normalizeBase64(s: string) {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = t.length % 4;
  if (pad) t += "=".repeat(4 - pad);
  return t;
}

function sanitizeUrl(u: string) {
  let s = (u || "").trim();
  s = s.replace(/^`+|`+$/g, "");
  s = s.replace(/^"+|"+$/g, "");
  s = s.replace(/^'+|'+$/g, "");
  return s.trim();
}

function extFromUrl(u: string) {
  try {
    const p = new URL(u);
    const path = p.pathname;
    const i = path.lastIndexOf('.');
    if (i > -1) {
      let ext = path.slice(i + 1).toLowerCase();
      if (ext === 'm4a') ext = 'mp4';
      return ext;
    }
  } catch {}
  return undefined;
}

function genUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function createSynthesisTask(
  params: SynthesisParams,
): Promise<SynthesisTaskResponse> {
  const { text, voiceType, volume, speed, pitch, token, appid, resourceId } =
    params;
  const apiUrlMap: Record<string, string> = {
    "volc.tts_async.default": "https://openspeech.bytedance.com/api/v1/tts_async/submit",
    "volc.tts_async.emotion":
      "https://openspeech.bytedance.com/api/v1/tts_async_with_emotion/submit",
  };
  const apiUrl = apiUrlMap[resourceId];
  const reqid = genUUID();
  const format = "mp3";

  const headers = {
    "Content-Type": "application/json",
    "Resource-Id": resourceId,
    Authorization: `Bearer; ${token}`,
  };

  const requestData = {
    appid,
    reqid,
    text,
    format,
    voice_type: voiceType,
    volume,
    speed,
    pitch,
  };

  const backendBase = import.meta.env.DEV ? '/tts-proxy' : 'https://logbackend.fishwhite.top';
  const proxyUrl = `${backendBase}/api/proxy?target=${encodeURIComponent(apiUrl)}`;

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(requestData),
  });
  const data: SynthesisTaskResponse = await response.json();
  return data;
}

async function querySynthesisResult(params: {
  taskId: string;
  token: string;
  appid: string;
  resourceId: string;
}): Promise<SynthesisResult> {
  const { taskId, token, appid, resourceId } = params;
  const apiUrlMap: { [key: string]: string } = {
    "volc.tts_async.default": "https://openspeech.bytedance.com/api/v1/tts_async/query",
    "volc.tts_async.emotion":
      "https://openspeech.bytedance.com/api/v1/tts_async_with_emotion/query",
  };
  const apiUrl = apiUrlMap[resourceId];
  const queryParams = `appid=${appid}&task_id=${taskId}`;

  const headers = {
    "Resource-Id": resourceId,
    Authorization: `Bearer; ${token}`,
  };

  const backendBase = import.meta.env.DEV ? '/tts-proxy' : 'https://logbackend.fishwhite.top';
  const targetUrl = `${apiUrl}?${queryParams}`;
  const proxyUrl = `${backendBase}/api/proxy?target=${encodeURIComponent(targetUrl)}`;

  const response = await fetch(proxyUrl, {
    method: "GET",
    headers,
  });
  const data: SynthesisResult = await response.json();
  return data;
}

export const NONE_VOICE = "NONE_VOICE";

export function getVoiceOptions(customModelsJson?: string) {
  if (customModelsJson) {
    try {
      const custom = JSON.parse(customModelsJson);
      if (Array.isArray(custom)) {
         return [{ name: "无", value: NONE_VOICE }, ...custom];
      }
    } catch (e) {
      console.error("Failed to parse custom models", e);
    }
  }
  return VOICE_OPTIONS;
}

// https://www.volcengine.com/docs/6561/97465#%E4%B8%AD%E6%96%87
export const VOICE_OPTIONS = [
  { name: "无", value: NONE_VOICE },
  { name: "灿灿 2.0", value: "BV700_V2_streaming" },
  { name: "炀炀", value: "BV705_streaming" },
  { name: "擎苍 2.0", value: "BV701_V2_streaming" },
  { name: "通用女声 2.0", value: "BV001_V2_streaming" },
  { name: "灿灿", value: "BV700_streaming" },
  { name: "超自然音色-梓梓2.0", value: "BV406_V2_streaming" },
  { name: "超自然音色-梓梓", value: "BV406_streaming" },
  { name: "超自然音色-燃燃2.0", value: "BV407_V2_streaming" },
  { name: "超自然音色-燃燃", value: "BV407_streaming" },
  { name: "通用女声", value: "BV001_streaming" },
  { name: "通用男声", value: "BV002_streaming" },
  { name: "擎苍", value: "BV701_streaming" },
  { name: "阳光青年", value: "BV123_streaming" },
  { name: "反卷青年", value: "BV120_streaming" },
  { name: "通用赘婿", value: "BV119_streaming" },
  { name: "古风少御", value: "BV115_streaming" },
  { name: "霸气青叔", value: "BV107_streaming" },
  { name: "质朴青年", value: "BV100_streaming" },
  { name: "温柔淑女", value: "BV104_streaming" },
  { name: "开朗青年", value: "BV004_streaming" },
  { name: "甜宠少御", value: "BV113_streaming" },
  { name: "儒雅青年", value: "BV102_streaming" },
  { name: "甜美小源", value: "BV405_streaming" },
  { name: "亲切女声", value: "BV007_streaming" },
  { name: "知性女声", value: "BV009_streaming" },
  { name: "诚诚", value: "BV419_streaming" },
  { name: "童童", value: "BV415_streaming" },
  { name: "亲切男声", value: "BV008_streaming" },
  { name: "译制片男声", value: "BV408_streaming" },
  { name: "懒小羊", value: "BV426_streaming" },
  { name: "清新文艺女声", value: "BV428_streaming" },
  { name: "鸡汤女声", value: "BV403_streaming" },
  { name: "智慧老者", value: "BV158_streaming" },
  { name: "慈爱姥姥", value: "BV157_streaming" },
  { name: "说唱小哥", value: "BR001_streaming" },
  { name: "活力解说男", value: "BV410_streaming" },
  { name: "影视解说小帅", value: "BV411_streaming" },
  { name: "解说小帅-多情感", value: "BV437_streaming" },
  { name: "影视解说小美", value: "BV412_streaming" },
  { name: "纨绔青年", value: "BV159_streaming" },
  { name: "直播一姐", value: "BV418_streaming" },
  { name: "沉稳解说男", value: "BV142_streaming" },
  { name: "潇洒青年", value: "BV143_streaming" },
  { name: "阳光男声", value: "BV056_streaming" },
  { name: "活泼女声", value: "BV005_streaming" },
  { name: "小萝莉", value: "BV064_streaming" },
  { name: "奶气萌娃", value: "BV051_streaming" },
  { name: "动漫海绵", value: "BV063_streaming" },
  { name: "动漫海星", value: "BV417_streaming" },
  { name: "动漫小新", value: "BV050_streaming" },
  { name: "天才童声", value: "BV061_streaming" },
  { name: "促销男声", value: "BV401_streaming" },
  { name: "促销女声", value: "BV402_streaming" },
  { name: "磁性男声", value: "BV006_streaming" },
  { name: "新闻女声", value: "BV011_streaming" },
  { name: "新闻男声", value: "BV012_streaming" },
  { name: "知性姐姐-双语", value: "BV034_streaming" },
  { name: "温柔小哥", value: "BV033_streaming" },
];
