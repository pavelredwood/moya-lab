import { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  MessageSquare, 
  Download, 
  Upload, 
  X, 
  Terminal, 
  Settings, 
  RefreshCw, 
  FileVideo, 
  HelpCircle,
  Minimize2,
  Trash2,
  Plus
} from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import './App.css';

// Localized strings
const TRANSLATIONS = {
  ja: {
    title: "モヤラボ",
    subtitle: "Moya Lab - 肖像権・弾幕・圧縮メディアスタジオ",
    dragDrop: "動画ファイルをここにドラッグ＆ドロップ",
    browse: "またはファイルを選択",
    noServer: "※ ファイルはサーバーに送信されず、ブラウザ内で安全に処理されます（100%プライベート）",
    loadingFfmpeg: "FFmpeg WASM コアをロード中...",
    ffmpegLoaded: "FFmpegコアのロード完了。準備ができました。",
    tabShield: "🛡️ モザイクシールド",
    tabDanmaku: "💬 弾幕ジェネレーター",
    tabSqueezer: "📉 サイズ圧縮",
    
    // Shield
    shieldTitle: "肖像権保護モザイク",
    shieldDesc: "動画内の被写体（顔や車のナンバー等）にキーフレーム（動き）付きのぼかしをかけます。",
    addMask: "モザイク枠を追加",
    editStart: "開始位置を記録 (キー 1)",
    editEnd: "終了位置を記録 (キー 2)",
    recordPoint: "現在フレームにマーク",
    blurAmount: "ぼかしの強さ",
    maskList: "モザイク一覧",
    startT: "開始時間",
    endT: "終了時間",
    hintShield: "【使い方】動画を一時停止し、「枠を追加」後に画面上をドラッグして範囲を選択。時間を進めて「終了位置」もドラッグで記録すると、モザイクが自動で移動します。",

    // Danmaku
    danmakuTitle: "弾幕オーバーレイ",
    danmakuDesc: "ニコニコ動画風にコメントが右から左へ流れるエフェクトを焼き込みます。",
    commentsLabel: "流すコメント一覧 (1行に1コメント)",
    loadPresetMemes: "日本語ネットミームを追加",
    fontSize: "文字サイズ (px)",
    speed: "スクロール速度",
    fontLoading: "フォント読み込み中...",

    // Squeezer
    squeezerTitle: "ターゲットサイズ圧縮",
    squeezerDesc: "動画を指定したサイズ（MB）以下に美しく2パス圧縮します。",
    targetSize: "目標ファイルサイズ",
    presets: "プラットフォーム制限",
    discordFree: "Discord Free (9.9 MB)",
    discordNitro: "Discord Nitro (24.9 MB)",
    lineSend: "LINE 送信上限 (19.9 MB)",
    customSize: "カスタムサイズ設定",

    // Common
    process: "FFmpeg処理を開始",
    processing: "ビデオ処理中...",
    download: "完成ビデオを保存",
    terminal: "FFmpeg ログターミナル",
    closeFile: "ファイルを閉じる",
    clearLogs: "ログ消去",
    videoInfo: "ビデオ情報",
    duration: "再生時間",
    size: "ファイルサイズ",
    success: "処理が完了しました！",
    error: "エラーが発生しました。"
  },
  en: {
    title: "Moya Lab",
    subtitle: "Moya Lab - Privacy, Danmaku & Compression Suite",
    dragDrop: "Drag & drop video file here",
    browse: "or browse file",
    noServer: "* Files never upload to any server. Processed 100% locally in your browser.",
    loadingFfmpeg: "Loading FFmpeg WASM Core...",
    ffmpegLoaded: "FFmpeg Core loaded successfully. Ready.",
    tabShield: "🛡️ Mosaic Shield",
    tabDanmaku: "💬 Danmaku Gen",
    tabSqueezer: "📉 Size Squeezer",
    
    // Shield
    shieldTitle: "Privacy Mosaic Shield",
    shieldDesc: "Add keyframed (moving) blur overlay on faces, license plates or objects.",
    addMask: "Add Mosaic Mask",
    editStart: "Set Start Frame (Key 1)",
    editEnd: "Set End Frame (Key 2)",
    recordPoint: "Mark current frame",
    blurAmount: "Blur Amount",
    maskList: "Mosaics List",
    startT: "Start time",
    endT: "End time",
    hintShield: "How to use: Pause the video, click 'Add Mask', then click & drag on the video to draw a box. Move time forward, select 'Key 2', and drag to trace. The blur will slide smoothly between them.",

    // Danmaku
    danmakuTitle: "Danmaku Overlay",
    danmakuDesc: "Burn in Japanese NicoNico-style flying text comments across the video screen.",
    commentsLabel: "Comments list (one per line)",
    loadPresetMemes: "Load Japanese Memes",
    fontSize: "Font Size (px)",
    speed: "Scroll Speed",
    fontLoading: "Loading font...",

    // Squeezer
    squeezerTitle: "Target Size Compressor",
    squeezerDesc: "2-pass encodes the video to fit exactly under target file size limits.",
    targetSize: "Target File Size",
    presets: "Platform Limits",
    discordFree: "Discord Free (9.9 MB)",
    discordNitro: "Discord Nitro (24.9 MB)",
    lineSend: "LINE Limit (19.9 MB)",
    customSize: "Custom size",

    // Common
    process: "Start FFmpeg Process",
    processing: "Processing video...",
    download: "Save Processed Video",
    terminal: "FFmpeg Log Terminal",
    closeFile: "Close Video",
    clearLogs: "Clear Logs",
    videoInfo: "Video Info",
    duration: "Duration",
    size: "Size",
    success: "Video rendered successfully!",
    error: "An error occurred during encoding."
  },
  ru: {
    title: "Moya Lab",
    subtitle: "Moya Lab - Медиа-комбайн цензуры, данмаку и сжатия",
    dragDrop: "Перетащите видеофайл сюда",
    browse: "или выберите файл",
    noServer: "* Видео не загружается на сервер. Всё обрабатывается на 100% приватно в браузере.",
    loadingFfmpeg: "Загрузка ядра FFmpeg WASM...",
    ffmpegLoaded: "Ядро FFmpeg загружено. Готово к работе.",
    tabShield: "🛡️ Мозаика лиц",
    tabDanmaku: "💬 Данмаку титры",
    tabSqueezer: "📉 Сжатие в лимит",
    
    // Shield
    shieldTitle: "Цензура и Мозаика лиц",
    shieldDesc: "Накладывайте движущуюся мозаику на лица прохожих или автомобильные номера.",
    addMask: "Добавить маску",
    editStart: "Начальная точка (Ключ 1)",
    editEnd: "Конечная точка (Ключ 2)",
    recordPoint: "Отметить кадр",
    blurAmount: "Сила размытия",
    maskList: "Список масок",
    startT: "Старт",
    endT: "Конец",
    hintShield: "Инструкция: поставьте видео на паузу, нажмите «Добавить маску» и растяните рамку на видео. Промотайте время вперед, выберите «Ключ 2» и нарисуйте рамку там. Мозаика будет двигаться плавно.",

    // Danmaku
    danmakuTitle: "Генератор Данмаку",
    danmakuDesc: "Накладывайте летящие справа налево комментарии в стиле Nico Nico Douga.",
    commentsLabel: "Список комментариев (по одному в строке)",
    loadPresetMemes: "Добавить японские мемы",
    fontSize: "Размер шрифта (px)",
    speed: "Скорость прокрутки",
    fontLoading: "Загрузка шрифта...",

    // Squeezer
    squeezerTitle: "Сжатие под размер",
    squeezerDesc: "Двухпроходное кодирование видео точно под заданный размер файла.",
    targetSize: "Целевой размер файла",
    presets: "Лимиты платформ",
    discordFree: "Discord Free (9.9 МБ)",
    discordNitro: "Discord Nitro (24.9 МБ)",
    lineSend: "Лимит LINE (19.9 МБ)",
    customSize: "Кастомный размер",

    // Common
    process: "Запустить обработку",
    processing: "Кодирование видео...",
    download: "Скачать готовое видео",
    terminal: "Терминал логов FFmpeg",
    closeFile: "Закрыть видео",
    clearLogs: "Очистить логи",
    videoInfo: "Информация о видео",
    duration: "Длительность",
    size: "Размер",
    success: "Видео успешно закодировано!",
    error: "Произошла ошибка при кодировании."
  }
};

const JAPANESE_MEMES = [
  "草", "wwww", "88888888", "神動画きたー！", "おつかれ", 
  "ここ好き", "！？", "すごすぎるｗｗ", "神曲", "ニコニコ",
  "かわいい", "天才現る", "おおお", "ブラボー", "初見です"
];

// Instantiating the WebAssembly wrapper
const ffmpeg = new FFmpeg();

function App() {
  const [lang, setLang] = useState('ja');
  const [activeTab, setActiveTab] = useState('shield');
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoMeta, setVideoMeta] = useState(null);
  
  // Engine states
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [outputUrl, setOutputUrl] = useState(null);
  
  // Localized string helper
  const t = TRANSLATIONS[lang];

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);

  // Tab-specific states: Shield
  const [masks, setMasks] = useState([]);
  const [activeMaskId, setActiveMaskId] = useState(null);
  const [editingPoint, setEditingPoint] = useState('start'); // 'start' or 'end'
  const [currentTime, setCurrentTime] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [blurRadius, setBlurRadius] = useState(25);

  // Tab-specific states: Danmaku
  const [commentsText, setCommentsText] = useState("草\nwwww\n神動画きたー！\n88888888\n！？");
  const [danmakuFontSize, setDanmakuFontSize] = useState(36);
  const [danmakuSpeed, setDanmakuSpeed] = useState(180);

  // Tab-specific states: Squeezer
  const [targetSizeMb, setTargetSizeMb] = useState(9.9);
  const [customSizeText, setCustomSizeText] = useState("");

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const terminalEndRef = useRef(null);

  // 1. Initialize FFmpeg on component mount
  useEffect(() => {
    initFfmpeg();
  }, []);

  const initFfmpeg = async () => {
    if (ffmpegReady || ffmpegLoading) return;
    setFfmpegLoading(true);
    setLogs((prev) => [...prev, "Initializing FFmpeg WebAssembly core..."]);
    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      ffmpeg.on('log', ({ message }) => {
        setLogs((prev) => [...prev.slice(-149), message]); // Keep last 150 lines
      });
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpegReady(true);
      setLogs((prev) => [...prev, "FFmpeg Core initialized successfully."]);
    } catch (err) {
      console.error(err);
      setLogs((prev) => [...prev, `Failed to load FFmpeg: ${err.message}`]);
    } finally {
      setFfmpegLoading(false);
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Read video meta when file uploaded
  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;
    setProcessing(false);
    setOutputUrl(null);
    setProgress(0);
    setFile(uploadedFile);
    
    const url = URL.createObjectURL(uploadedFile);
    setVideoUrl(url);

    // Read metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = url;
    video.onloadedmetadata = () => {
      setVideoMeta({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        sizeText: (uploadedFile.size / (1024 * 1024)).toFixed(2) + " MB"
      });
      // Clear masks
      setMasks([]);
      setActiveMaskId(null);
      URL.revokeObjectURL(video.src);
    };
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Canvas drawing for Mosaic Mask keyframes
  const drawMasksOnCanvas = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    masks.forEach((mask) => {
      const active = mask.id === activeMaskId;
      let x, y, w, h;

      const start = mask.startPoint;
      const end = mask.endPoint;

      if (!start) return;

      if (end && currentTime >= start.t && currentTime <= end.t) {
        // Linear interpolation
        const fraction = (currentTime - start.t) / (end.t - start.t);
        x = start.x + (end.x - start.x) * fraction;
        y = start.y + (end.y - start.y) * fraction;
        w = start.w + (end.w - start.w) * fraction;
        h = start.h + (end.h - start.h) * fraction;
      } else if (currentTime >= start.t && (!end || currentTime < end.t)) {
        // Use start position
        x = start.x;
        y = start.y;
        w = start.w;
        h = start.h;
      } else if (end && currentTime > end.t) {
        // Use end position
        x = end.x;
        y = end.y;
        w = end.w;
        h = end.h;
      } else {
        // Before start, draw start position faded out
        x = start.x;
        y = start.y;
        w = start.w;
        h = start.h;
        ctx.globalAlpha = 0.25;
      }

      // Convert scale from actual video resolution to canvas coordinates
      const scaleX = canvas.width / videoMeta.width;
      const scaleY = canvas.height / videoMeta.height;

      const drawX = x * scaleX;
      const drawY = y * scaleY;
      const drawW = w * scaleX;
      const drawH = h * scaleY;

      // Draw bounding box
      ctx.lineWidth = active ? 3 : 1.5;
      ctx.strokeStyle = active 
        ? (editingPoint === 'start' ? '#8b5cf6' : '#ec4899') 
        : 'rgba(255, 255, 255, 0.4)';
      ctx.strokeRect(drawX, drawY, drawW, drawH);

      // Draw label
      ctx.fillStyle = active ? (editingPoint === 'start' ? '#8b5cf6' : '#ec4899') : 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Mask ${mask.id.substring(0, 4)} (${active ? editingPoint.toUpperCase() : 'Idle'})`, drawX, drawY - 6);
      
      ctx.globalAlpha = 1.0;
    });
  };

  // Sync canvas size with video client height/width on loaded or resize
  const syncCanvasSize = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      drawMasksOnCanvas();
    }
  };

  useEffect(() => {
    if (videoUrl && videoMeta) {
      setTimeout(syncCanvasSize, 200);
      window.addEventListener('resize', syncCanvasSize);
    }
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, [videoUrl, videoMeta, masks, activeMaskId, editingPoint, currentTime]);

  // Video timeupdate listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      drawMasksOnCanvas();
    }
  };

  // Mouse drag to draw bounding boxes
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !activeMaskId) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const startX = Math.min(drawStart.x, currentX);
    const startY = Math.min(drawStart.y, currentY);
    const width = Math.abs(drawStart.x - currentX);
    const height = Math.abs(drawStart.y - currentY);

    // Redraw canvas with temp box
    drawMasksOnCanvas();
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#06b6d4';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(startX, startY, width, height);
    ctx.setLineDash([]);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const startX = Math.min(drawStart.x, currentX);
    const startY = Math.min(drawStart.y, currentY);
    const width = Math.abs(drawStart.x - currentX);
    const height = Math.abs(drawStart.y - currentY);

    if (width < 5 || height < 5) return; // Too small

    // Convert coordinates to actual video resolution
    const scaleX = videoMeta.width / canvas.width;
    const scaleY = videoMeta.height / canvas.height;

    const point = {
      t: currentTime,
      x: startX * scaleX,
      y: startY * scaleY,
      w: width * scaleX,
      h: height * scaleY
    };

    setMasks((prevMasks) =>
      prevMasks.map((mask) => {
        if (mask.id === activeMaskId) {
          if (editingPoint === 'start') {
            return { ...mask, startPoint: point };
          } else {
            return { ...mask, endPoint: point };
          }
        }
        return mask;
      })
    );
  };

  const handleAddMask = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newMask = {
      id: newId,
      startPoint: {
        t: currentTime,
        x: videoMeta.width * 0.25,
        y: videoMeta.height * 0.25,
        w: videoMeta.width * 0.2,
        h: videoMeta.height * 0.2
      },
      endPoint: null,
      blur: blurRadius
    };
    setMasks([...masks, newMask]);
    setActiveMaskId(newId);
    setEditingPoint('start');
  };

  const handleDeleteMask = (id) => {
    setMasks(masks.filter(m => m.id !== id));
    if (activeMaskId === id) {
      setActiveMaskId(null);
    }
  };

  // Add meme presets to Danmaku
  const handleLoadMemes = () => {
    setCommentsText((prev) => {
      const current = prev.trim() ? prev.split('\n') : [];
      const withMemes = [...current, ...JAPANESE_MEMES];
      return withMemes.join('\n');
    });
  };

  // FFmpeg client-side execution processes
  const runFFmpegProcess = async () => {
    if (!file || !ffmpegReady || processing) return;

    setProcessing(true);
    setProgress(0);
    setOutputUrl(null);
    setLogs((prev) => [...prev, `[Moya Lab] Starting process... Tab: ${activeTab}`]);

    try {
      // 1. Write the input file to the WASM file system
      const inputName = 'input_' + file.name;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      setLogs((prev) => [...prev, `Wrote source file: ${inputName}`]);

      const outputName = `moyalab_${Date.now()}.mp4`;
      let command = [];

      if (activeTab === 'squeezer') {
        // --- SQUEEZER (2-PASS ENCODING) ---
        const totalDuration = videoMeta.duration;
        const targetBytes = targetSizeMb * 1024 * 1024;
        
        // Calculate audio & video bitrates
        const audioBitrateBps = 128 * 1024; // 128 kbps
        const totalBitrateBps = (targetBytes * 8) / totalDuration;
        const videoBitrateBps = totalBitrateBps - audioBitrateBps;

        if (videoBitrateBps < 50 * 1024) {
          throw new Error("Target size is too small for this video duration!");
        }

        const videoBitrateKb = Math.floor(videoBitrateBps / 1000);
        setLogs((prev) => [...prev, `Target Video Bitrate: ${videoBitrateKb} kbps, Audio: 128 kbps`]);

        // PASS 1
        setLogs((prev) => [...prev, "Running Pass 1 encoding..."]);
        await ffmpeg.exec([
          '-y', '-i', inputName,
          '-c:v', 'libx264',
          '-b:v', `${videoBitrateKb}k`,
          '-pass', '1',
          '-an',
          '-f', 'null',
          'NUL'
        ]);

        // PASS 2
        setLogs((prev) => [...prev, "Running Pass 2 encoding..."]);
        await ffmpeg.exec([
          '-y', '-i', inputName,
          '-c:v', 'libx264',
          '-b:v', `${videoBitrateKb}k`,
          '-pass', '2',
          '-c:a', 'aac',
          '-b:a', '128k',
          outputName
        ]);

      } else if (activeTab === 'shield') {
        // --- PRIVACY SHIELD (BOXBLUR + CROP + OVERLAY) ---
        if (masks.length === 0) {
          throw new Error("No blur mask added! Add at least one mask.");
        }

        let filterString = "";
        let inputVar = "[0:v]";

        masks.forEach((mask, index) => {
          const start = mask.startPoint;
          const end = mask.endPoint;
          if (!start) return;

          const outVar = `[v_blur_${index}]`;
          const overlayVar = `[v_over_${index}]`;

          // Generate crop coordinate expressions based on time 't'
          let wExpr, hExpr, xExpr, yExpr;
          if (end) {
            const dt = end.t - start.t;
            wExpr = `(${start.w} + (t - ${start.t}) * (${end.w} - ${start.w}) / ${dt})`;
            hExpr = `(${start.h} + (t - ${start.t}) * (${end.h} - ${start.h}) / ${dt})`;
            xExpr = `(${start.x} + (t - ${start.t}) * (${end.x} - ${start.x}) / ${dt})`;
            yExpr = `(${start.y} + (t - ${start.t}) * (${end.y} - ${start.y}) / ${dt})`;
          } else {
            wExpr = `${start.w}`;
            hExpr = `${start.h}`;
            xExpr = `${start.x}`;
            yExpr = `${start.y}`;
          }

          const enableExpr = end 
            ? `between(t,${start.t},${end.t})` 
            : `gte(t,${start.t})`;

          // 1. Crop and blur the sub-area
          filterString += `${inputVar}crop=w='${wExpr}':h='${hExpr}':x='${xExpr}':y='${yExpr}',boxblur=luma_radius=${mask.blur}:luma_power=3${outVar}; `;
          
          // 2. Overlay it back on top of the original video
          filterString += `${inputVar}${outVar}overlay=x='${xExpr}':y='${yExpr}':enable='${enableExpr}'${overlayVar}`;
          
          inputVar = overlayVar;
          if (index < masks.length - 1) {
            filterString += "; ";
          }
        });

        setLogs((prev) => [...prev, `Applying filter: ${filterString}`]);

        await ffmpeg.exec([
          '-i', inputName,
          '-filter_complex', filterString,
          '-map', inputVar,
          '-map', '0:a?', // Map audio if exists
          '-c:a', 'copy',
          outputName
        ]);

      } else if (activeTab === 'danmaku') {
        // --- DANMAKU GENERATOR (DRAWTEXT) ---
        const comments = commentsText.trim().split('\n').filter(c => c.trim().length > 0);
        if (comments.length === 0) {
          throw new Error("No comments found! Enter at least one comment.");
        }

        // Write the custom font file
        setLogs((prev) => [...prev, "Writing font file to Virtual File System..."]);
        const fontData = await fetch('/fonts/KosugiMaru-Regular.ttf').then(res => res.arrayBuffer());
        await ffmpeg.writeFile('font.ttf', new Uint8Array(fontData));

        let filterString = "";
        const duration = videoMeta.duration;

        comments.forEach((comment, index) => {
          // Distribute comments across the video timeline and screen height
          const startTime = (duration / comments.length) * index;
          const lane = index % 10; // 10 lanes of comments
          const yPos = 30 + lane * 45;
          const escapedComment = comment.replace(/[':\\]/g, '\\$&'); // Escape special chars

          // speed pixels per second (danmakuSpeed)
          const textDuration = 8; // Time to traverse from right to left

          if (index > 0) {
            filterString += ",";
          }
          filterString += `drawtext=text='${escapedComment}':fontfile=font.ttf:fontsize=${danmakuFontSize}:fontcolor=white:x='w-(t-${startTime.toFixed(2)})*${danmakuSpeed}':y=${yPos}:enable='between(t,${startTime.toFixed(2)},${(startTime + textDuration).toFixed(2)})'`;
        });

        setLogs((prev) => [...prev, `Rendering comments with filter string...`]);

        await ffmpeg.exec([
          '-i', inputName,
          '-vf', filterString,
          '-c:a', 'copy',
          outputName
        ]);
      }

      // Read output
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
      setOutputUrl(url);

      // Clean up files in virtual system to prevent memory leaks
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      if (activeTab === 'danmaku') {
        await ffmpeg.deleteFile('font.ttf');
      }

      setLogs((prev) => [...prev, "Rendering completed successfully! Output file generated."]);
    } catch (err) {
      console.error(err);
      setLogs((prev) => [...prev, `ERROR: ${err.message}`]);
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseFile = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setFile(null);
    setVideoUrl(null);
    setVideoMeta(null);
    setMasks([]);
    setActiveMaskId(null);
    setOutputUrl(null);
  };

  return (
    <div className="app-container">
      {/* HEADER SECTION */}
      <header className="app-header">
        <div className="header-logo-container">
          <Shield size={32} className="logo-glow" />
          <span className="logo-text">{t.title}</span>
        </div>
        <div className="header-controls">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)} 
            className="language-selector"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
          {file && (
            <button className="btn-neon-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={handleCloseFile}>
              {t.closeFile}
            </button>
          )}
        </div>
      </header>

      {/* CORE WORKSPACE */}
      {!file ? (
        // LANDING PAGE (FILE UPLOAD)
        <div className="landing-container flex-1">
          <div 
            className={`dropzone ${dragActive ? 'drag-active' : ''} glass-panel`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload size={64} className="upload-icon" />
            <h3 className="dropzone-title">{t.dragDrop}</h3>
            <p className="dropzone-sub">{t.browse}</p>
            <input 
              id="file-input" 
              type="file" 
              accept="video/*" 
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
          </div>
          <p className="dropzone-sub" style={{ marginTop: '24px', opacity: 0.6 }}>
            {t.noServer}
          </p>
          
          {/* FFmpeg core loading indicator */}
          <div className="glass-panel" style={{ marginTop: '30px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {ffmpegLoading ? (
              <>
                <RefreshCw className="animate-spin" size={18} style={{ color: 'var(--color-cyan)' }} />
                <span>{t.loadingFfmpeg}</span>
              </>
            ) : (
              <>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ffmpegReady ? '#10b981' : '#ef4444' }}></div>
                <span>{ffmpegReady ? t.ffmpegLoaded : 'FFmpeg Core Offline'}</span>
              </>
            )}
          </div>
        </div>
      ) : (
        // ACTIVE WORKSPACE (EDITOR)
        <main className="app-workspace">
          {/* Sidebar Navigation */}
          <div className="sidebar-nav">
            <button 
              className={`tab-btn shield-tab ${activeTab === 'shield' ? 'active' : ''}`}
              onClick={() => setActiveTab('shield')}
            >
              <Shield size={18} />
              {t.tabShield}
            </button>
            <button 
              className={`tab-btn danmaku-tab ${activeTab === 'danmaku' ? 'active' : ''}`}
              onClick={() => setActiveTab('danmaku')}
            >
              <MessageSquare size={18} />
              {t.tabDanmaku}
            </button>
            <button 
              className={`tab-btn squeezer-tab ${activeTab === 'squeezer' ? 'active' : ''}`}
              onClick={() => setActiveTab('squeezer')}
            >
              <FileVideo size={18} />
              {t.tabSqueezer}
            </button>

            {/* Video metadata overview */}
            <div className="glass-panel" style={{ marginTop: 'auto', padding: '16px', fontSize: '0.85rem' }}>
              <h4 style={{ marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>{t.videoInfo}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                <div>{t.duration}: <strong>{videoMeta?.duration.toFixed(2)}s</strong></div>
                <div>Resolution: <strong>{videoMeta?.width}x{videoMeta?.height}</strong></div>
                <div>{t.size}: <strong>{videoMeta?.sizeText}</strong></div>
              </div>
            </div>
          </div>

          {/* Core Panel splits */}
          <div className="workspace-panel">
            
            {/* LEFT OPTIONS CONTROLS */}
            <div className="control-panel glass-panel">
              
              {/* TAB 1: SHIELD (MOSAIC) */}
              {activeTab === 'shield' && (
                <>
                  <h3 className="panel-title" style={{ color: 'var(--color-violet)' }}><Shield size={20} />{t.shieldTitle}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.shieldDesc}</p>
                  
                  <button className="btn-neon" onClick={handleAddMask}>
                    <Plus size={16} />
                    {t.addMask}
                  </button>

                  {masks.length > 0 && (
                    <div className="panel-section">
                      <span className="section-label">{t.maskList}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                        {masks.map((mask) => (
                          <div 
                            key={mask.id} 
                            onClick={() => setActiveMaskId(mask.id)}
                            className={`glass-panel`}
                            style={{ 
                              padding: '10px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              borderColor: mask.id === activeMaskId ? 'var(--color-violet)' : 'rgba(255,255,255,0.06)',
                              background: mask.id === activeMaskId ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>Mask {mask.id.substring(0, 4)}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {t.startT}: {mask.startPoint?.t.toFixed(1)}s {mask.endPoint && `| ${t.endT}: ${mask.endPoint.t.toFixed(1)}s`}
                              </div>
                            </div>
                            <button 
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              onClick={(e) => { e.stopPropagation(); handleDeleteMask(mask.id); }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMaskId && (
                    <>
                      <div className="panel-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                        <span className="section-label">{t.recordPoint}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className={`preset-btn flex-1 ${editingPoint === 'start' ? 'active' : ''}`}
                            onClick={() => setEditingPoint('start')}
                          >
                            {t.editStart}
                          </button>
                          <button 
                            className={`preset-btn flex-1 ${editingPoint === 'end' ? 'active' : ''}`}
                            onClick={() => setEditingPoint('end')}
                          >
                            {t.editEnd}
                          </button>
                        </div>
                      </div>

                      <div className="panel-section">
                        <span className="section-label">{t.blurAmount}: {blurRadius}</span>
                        <input 
                          type="range" 
                          min="10" 
                          max="80" 
                          value={blurRadius}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setBlurRadius(val);
                            setMasks(masks.map(m => m.id === activeMaskId ? { ...m, blur: val } : m));
                          }}
                        />
                      </div>
                    </>
                  )}

                  <div className="info-banner">
                    <HelpCircle size={16} style={{ flexShrink: 0, color: 'var(--color-cyan)' }} />
                    <p style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>{t.hintShield}</p>
                  </div>
                </>
              )}

              {/* TAB 2: DANMAKU */}
              {activeTab === 'danmaku' && (
                <>
                  <h3 className="panel-title" style={{ color: 'var(--color-pink)' }}><MessageSquare size={20} />{t.danmakuTitle}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.danmakuDesc}</p>

                  <div className="panel-section">
                    <span className="section-label">{t.commentsLabel}</span>
                    <textarea 
                      rows={8}
                      className="textarea-styled"
                      value={commentsText}
                      onChange={(e) => setCommentsText(e.target.value)}
                      placeholder={t.commentsPlaceholder}
                    />
                  </div>

                  <button className="btn-neon-secondary" style={{ width: '100%' }} onClick={handleLoadMemes}>
                    {t.loadPresetMemes}
                  </button>

                  <div className="panel-section">
                    <span className="section-label">{t.fontSize}: {danmakuFontSize}</span>
                    <input 
                      type="range" 
                      min="16" 
                      max="72" 
                      value={danmakuFontSize}
                      onChange={(e) => setDanmakuFontSize(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="panel-section">
                    <span className="section-label">{t.speed}: {danmakuSpeed} px/s</span>
                    <input 
                      type="range" 
                      min="100" 
                      max="300" 
                      value={danmakuSpeed}
                      onChange={(e) => setDanmakuSpeed(parseInt(e.target.value))}
                    />
                  </div>
                </>
              )}

              {/* TAB 3: SQUEEZER */}
              {activeTab === 'squeezer' && (
                <>
                  <h3 className="panel-title" style={{ color: 'var(--color-cyan)' }}><FileVideo size={20} />{t.squeezerTitle}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.squeezerDesc}</p>

                  <div className="panel-section">
                    <span className="section-label">{t.presets}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button 
                        className={`preset-btn ${targetSizeMb === 9.9 ? 'active' : ''}`}
                        onClick={() => { setTargetSizeMb(9.9); setCustomSizeText(""); }}
                      >
                        {t.discordFree}
                      </button>
                      <button 
                        className={`preset-btn ${targetSizeMb === 19.9 ? 'active' : ''}`}
                        onClick={() => { setTargetSizeMb(19.9); setCustomSizeText(""); }}
                      >
                        {t.lineSend}
                      </button>
                      <button 
                        className={`preset-btn ${targetSizeMb === 24.9 ? 'active' : ''}`}
                        onClick={() => { setTargetSizeMb(24.9); setCustomSizeText(""); }}
                      >
                        {t.discordNitro}
                      </button>
                    </div>
                  </div>

                  <div className="panel-section" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <span className="section-label">{t.customSize} (MB)</span>
                    <input 
                      type="number" 
                      step="0.1"
                      className="input-styled" 
                      placeholder="e.g. 15"
                      value={customSizeText}
                      onChange={(e) => {
                        setCustomSizeText(e.target.value);
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setTargetSizeMb(val);
                      }}
                    />
                  </div>

                  <div className="glass-panel" style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.targetSize}</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-cyan)', marginTop: '4px' }}>
                      {targetSizeMb} MB
                    </div>
                  </div>
                </>
              )}

              {/* CORE RENDERING PROCESS TRIGGERS */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {outputUrl && (
                  <a href={outputUrl} download={`moyalab_export_${Date.now()}.mp4`} className="btn-neon" style={{ textDecoration: 'none', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                    <Download size={18} />
                    {t.download}
                  </a>
                )}
                <button 
                  className="btn-neon" 
                  disabled={!ffmpegReady || processing || (activeTab === 'shield' && masks.length === 0)}
                  onClick={runFFmpegProcess}
                  style={{ justifyContent: 'center' }}
                >
                  {processing ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      {t.processing} ({progress}%)
                    </>
                  ) : (
                    <>
                      <Settings size={18} />
                      {t.process}
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* RIGHT SIDE VIDEO VIEWPORT & TERMINAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', minHeight: 0 }}>
              
              {/* VIDEO PLAYER & CANVAS PREVIEW WORKSPACE */}
              <div className="editor-panel glass-panel flex-1">
                <div className="player-wrapper">
                  <video 
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="video-element"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={syncCanvasSize}
                  />
                  {activeTab === 'shield' && (
                    <canvas 
                      ref={canvasRef}
                      className="canvas-overlay"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    />
                  )}

                  {/* HTML5 Overlay simulation of flying danmaku inside preview just for visual fun */}
                  {activeTab === 'danmaku' && (
                    <div className="danmaku-container">
                      {/* Danmaku comments preview is simulated natively using simple canvas/DOM or overlays */}
                    </div>
                  )}
                </div>

                {/* Progress bar overlay during processing */}
                {processing && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>{t.processing}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* LOG TERMINAL FOOTER */}
              <div className="console-panel glass-panel">
                <div className="console-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={14} />
                    <span>{t.terminal}</span>
                  </div>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}
                    onClick={() => setLogs([])}
                  >
                    {t.clearLogs}
                  </button>
                </div>
                <div className="console-logs">
                  {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>

            </div>

          </div>
        </main>
      )}
    </div>
  );
}

export default App;
