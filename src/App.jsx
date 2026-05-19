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
  Plus,
  ArrowRight,
  Lock,
  Zap,
  Globe
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
    error: "エラーが発生しました。",
    tryDemo: "デモ動画で試す",

    // Hero
    heroTagline: "ブラウザ完結型 動画プライバシーツール",
    heroTitle: "動画を加工する、\nサーバーに送らずに。",
    heroSubtitle: "モザイク・弾幕・サイズ圧縮。すべての処理はあなたのブラウザの中だけで完結します。データは外に出ません。",
    heroUpload: "動画ファイルをドロップ、またはクリックして選択",
    heroDemoBtnLabel: "デモ動画で機能を試す",
    heroPrivacy: "ファイルはサーバーに送信されません",
    featuresHeading: "できること",
    feat1Title: "モザイクシールド",
    feat1Desc: "動画内の顔や車のナンバーにキーフレーム付きの滑らかなぼかしをかけます。オブジェクトが動いても追従します。",
    feat1Before: "処理前",
    feat1After: "処理後",
    feat2Title: "弾幕ジェネレーター",
    feat2Desc: "ニコニコ動画スタイルのコメントを動画に焼き込みます。フォントサイズや速度を自由に調整できます。",
    feat3Title: "サイズ圧縮",
    feat3Desc: "LINEやDiscordのファイルサイズ制限に収まるよう2パスエンコードで高品質に圧縮します。",
    feat3Original: "元のファイル",
    feat3Compressed: "圧縮後",
    feat3Savings: "約72%削減",
    trust1: "完全無料・制限なし",
    trust2: "サーバー送信なし",
    trust3: "日本語 / EN / RU 対応"
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
    error: "An error occurred during encoding.",
    tryDemo: "Try with Demo Video",

    // Hero
    heroTagline: "Browser-Based Video Privacy Tool",
    heroTitle: "Edit your video.\nNever upload it.",
    heroSubtitle: "Mosaic blur, danmaku comments, and size compression — all processed 100% inside your browser. Nothing leaves your device.",
    heroUpload: "Drop a video file here, or click to browse",
    heroDemoBtnLabel: "Try with demo video",
    heroPrivacy: "Files are never sent to any server",
    featuresHeading: "What you can do",
    feat1Title: "Mosaic Shield",
    feat1Desc: "Add smooth keyframed blur to faces, license plates or any moving object. The blur follows the subject automatically.",
    feat1Before: "Before",
    feat1After: "After",
    feat2Title: "Danmaku Generator",
    feat2Desc: "Burn in NicoNico-style flying comments onto your video. Customize font size, speed and content freely.",
    feat3Title: "Size Compressor",
    feat3Desc: "Smart 2-pass encoding to hit exact file size targets for LINE, Discord and other platforms.",
    feat3Original: "Original",
    feat3Compressed: "Compressed",
    feat3Savings: "~72% smaller",
    trust1: "Completely free",
    trust2: "No server uploads",
    trust3: "JA / EN / RU"
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
    error: "Произошла ошибка при кодировании.",
    tryDemo: "Попробовать с демо-видео",

    // Hero
    heroTagline: "Приватный видеоредактор в браузере",
    heroTitle: "Обработай видео.\nБез загрузки на сервер.",
    heroSubtitle: "Мозаика, данмаку-субтитры и сжатие под лимит — всё работает прямо в вашем браузере. Файлы никуда не отправляются.",
    heroUpload: "Перетащите видео сюда или нажмите для выбора",
    heroDemoBtnLabel: "Попробовать на демо-видео",
    heroPrivacy: "Файлы не покидают ваш компьютер",
    featuresHeading: "Что умеет Moya Lab",
    feat1Title: "Мозаика и цензура",
    feat1Desc: "Плавное размытие с интерполяцией ключевых кадров на лицах, номерах и других объектах. Мозаика следует за движением.",
    feat1Before: "До",
    feat1After: "После",
    feat2Title: "Данмаку-субтитры",
    feat2Desc: "Летящие справа налево комментарии в стиле NicoNico. Настройте размер шрифта, скорость и текст.",
    feat3Title: "Сжатие под лимит",
    feat3Desc: "2-pass кодирование для точного попадания в лимиты LINE, Discord и других платформ.",
    feat3Original: "Оригинал",
    feat3Compressed: "Сжато",
    feat3Savings: "~72% меньше",
    trust1: "Полностью бесплатно",
    trust2: "Без загрузки на серверы",
    trust3: "JA / EN / RU"
  }
};

const JAPANESE_MEMES = [
  "草", "wwww", "88888888", "神動画きたー！", "おつかれ", 
  "ここ好き", "！？", "すごすぎるｗｗ", "神曲", "ニコニコ",
  "かわいい", "天才現る", "おおお", "ブラボー", "初見です"
];

// Instantiating the WebAssembly wrapper
const ffmpeg = new FFmpeg();

const getBrowserLanguage = () => {
  try {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('ru')) return 'ru';
  } catch (e) {
    console.warn("Language detection failed", e);
  }
  return 'en';
};

function App() {
  const [lang, setLang] = useState(getBrowserLanguage());
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

  const handleLoadDemo = () => {
    setProcessing(false);
    setOutputUrl(null);
    setProgress(0);
    const mockFile = {
      name: "demo_blazes_sample.mp4",
      size: 1258291
    };
    setFile(mockFile);
    const demoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    setVideoUrl(demoUrl);
    setVideoMeta({
      duration: 15.02,
      width: 640,
      height: 360,
      sizeText: "1.2 MB"
    });
    setMasks([]);
    setActiveMaskId(null);
    setLogs((prev) => [...prev, "Loaded demo video: ForBiggerBlazes.mp4"]);
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
      {/* HEADER — compact when file loaded, full when on landing */}
      <header className={`app-header ${file ? 'app-header--editor' : ''}`}>
        <div className="header-logo-container">
          <Shield size={file ? 22 : 32} className="logo-glow" style={{ transition: 'all 0.3s' }} />
          <span className="logo-text" style={{ fontSize: file ? '1.1rem' : '1.6rem', transition: 'all 0.3s' }}>{t.title}</span>
          {file && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </span>
          )}
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
            <button className="btn-neon-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={handleCloseFile}>
              <X size={14} />
              {t.closeFile}
            </button>
          )}
        </div>
      </header>

      {/* CORE WORKSPACE */}
      {!file ? (
        // ===== LANDING PAGE =====
        <div className="landing-page flex-1">

          {/* HERO */}
          <section className="hero-section">
            <div className="hero-tagline">{t.heroTagline}</div>
            <h1 className="hero-title">{t.heroTitle}</h1>
            <p className="hero-subtitle">{t.heroSubtitle}</p>

            <div className="hero-actions">
              {/* Upload zone */}
              <div
                className={`hero-upload-zone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
              >
                <Upload size={28} className="upload-icon" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.heroUpload}</span>
                <input
                  id="file-input"
                  type="file"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </div>

              <div className="hero-or-divider">or</div>

              <button type="button" className="hero-demo-btn" onClick={handleLoadDemo}>
                <FileVideo size={16} />
                {t.heroDemoBtnLabel}
              </button>

              <div className="hero-privacy-note">
                <span className="lock-dot"></span>
                {t.heroPrivacy}
              </div>

              {/* FFmpeg status pill */}
              <div className="ffmpeg-pill">
                {ffmpegLoading ? (
                  <><RefreshCw size={12} className="animate-spin" style={{ color: 'var(--color-cyan)' }} /><span>{t.loadingFfmpeg}</span></>
                ) : (
                  <><span className="status-dot" style={{ background: ffmpegReady ? '#10b981' : '#ef4444' }}></span><span>{ffmpegReady ? t.ffmpegLoaded : 'FFmpeg offline'}</span></>
                )}
              </div>
            </div>
          </section>

          {/* FEATURE CARDS */}
          <section className="features-section">
            <div className="features-heading">{t.featuresHeading}</div>

            {/* Feature 1: Mosaic */}
            <div className="feature-card">
              <div className="feature-card-info">
                <div className="feature-card-icon violet"><Shield size={20} /></div>
                <div className="feature-card-title">{t.feat1Title}</div>
                <p className="feature-card-desc">{t.feat1Desc}</p>
              </div>
              <div className="feature-card-visual" style={{ background: 'rgba(139,92,246,0.03)' }}>
                <div className="mosaic-demo">
                  <div className="mosaic-demo-side mosaic-before">
                    <div className="mosaic-before-face"></div>
                    <div className="mosaic-before-body"></div>
                    <span className="mosaic-label">{t.feat1Before}</span>
                  </div>
                  <ArrowRight size={18} className="mosaic-arrow" />
                  <div className="mosaic-demo-side mosaic-after">
                    <div className="mosaic-blur-box"></div>
                    <div className="mosaic-after-body"></div>
                    <span className="mosaic-label">{t.feat1After}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Danmaku */}
            <div className="feature-card">
              <div className="feature-card-visual" style={{ background: 'rgba(236,72,153,0.03)' }}>
                <div className="danmaku-demo">
                  <span className="danmaku-demo-text">神動画きたー！</span>
                  <span className="danmaku-demo-text">wwww</span>
                  <span className="danmaku-demo-text">ここ好き❤️</span>
                  <span className="danmaku-demo-text">88888888</span>
                </div>
              </div>
              <div className="feature-card-info">
                <div className="feature-card-icon pink"><MessageSquare size={20} /></div>
                <div className="feature-card-title">{t.feat2Title}</div>
                <p className="feature-card-desc">{t.feat2Desc}</p>
              </div>
            </div>

            {/* Feature 3: Squeezer */}
            <div className="feature-card">
              <div className="feature-card-info">
                <div className="feature-card-icon cyan"><FileVideo size={20} /></div>
                <div className="feature-card-title">{t.feat3Title}</div>
                <p className="feature-card-desc">{t.feat3Desc}</p>
              </div>
              <div className="feature-card-visual" style={{ background: 'rgba(6,182,212,0.03)' }}>
                <div className="squeezer-demo">
                  <div className="squeezer-bar-row">
                    <span className="squeezer-bar-label">{t.feat3Original}</span>
                    <div className="squeezer-bar-track">
                      <div className="squeezer-bar-fill original"></div>
                    </div>
                    <span className="squeezer-bar-size">120 MB</span>
                  </div>
                  <div className="squeezer-bar-row">
                    <span className="squeezer-bar-label">{t.feat3Compressed}</span>
                    <div className="squeezer-bar-track">
                      <div className="squeezer-bar-fill compressed"></div>
                    </div>
                    <span className="squeezer-bar-size">9.9 MB</span>
                  </div>
                  <div className="squeezer-bar-savings">{t.feat3Savings}</div>
                </div>
              </div>
            </div>
          </section>

          {/* TRUST STRIP */}
          <div className="trust-section">
            <div className="trust-badge">
              <div className="trust-badge-icon"><Zap size={14} /></div>
              {t.trust1}
            </div>
            <div className="trust-badge">
              <div className="trust-badge-icon"><Lock size={14} /></div>
              {t.trust2}
            </div>
            <div className="trust-badge">
              <div className="trust-badge-icon"><Globe size={14} /></div>
              {t.trust3}
            </div>
          </div>

        </div>
      ) : (
        // ===== ACTIVE WORKSPACE (EDITOR) =====
        <main className="app-workspace">

          {/* ── SIDEBAR ── */}
          <div className="sidebar-nav">

            {/* Tab buttons */}
            <button
              className={`tab-btn shield-tab ${activeTab === 'shield' ? 'active' : ''}`}
              onClick={() => setActiveTab('shield')}
            >
              <Shield size={20} />
              <span>{t.tabShield}</span>
            </button>
            <button
              className={`tab-btn danmaku-tab ${activeTab === 'danmaku' ? 'active' : ''}`}
              onClick={() => setActiveTab('danmaku')}
            >
              <MessageSquare size={20} />
              <span>{t.tabDanmaku}</span>
            </button>
            <button
              className={`tab-btn squeezer-tab ${activeTab === 'squeezer' ? 'active' : ''}`}
              onClick={() => setActiveTab('squeezer')}
            >
              <FileVideo size={20} />
              <span>{t.tabSqueezer}</span>
            </button>

            {/* File info card */}
            <div className="sidebar-file-card glass-panel">
              <div className="sidebar-file-name">{file?.name}</div>
              <div className="sidebar-file-meta">
                <span>{videoMeta?.width}×{videoMeta?.height}</span>
                <span>{videoMeta?.duration?.toFixed(1)}s</span>
                <span>{videoMeta?.sizeText}</span>
              </div>
            </div>

            {/* FFmpeg status */}
            <div className="sidebar-engine-status">
              <span className="status-dot" style={{ background: ffmpegReady ? '#10b981' : ffmpegLoading ? '#f59e0b' : '#ef4444' }}></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {ffmpegLoading ? t.loadingFfmpeg : ffmpegReady ? 'FFmpeg ready' : 'FFmpeg offline'}
              </span>
              {ffmpegLoading && <RefreshCw size={11} className="animate-spin" style={{ color: 'var(--color-cyan)', marginLeft: 'auto' }} />}
            </div>
          </div>

          {/* ── CONTROL PANEL + VIDEO ── */}
          <div className="workspace-panel">

            {/* LEFT: Controls */}
            <div className="control-panel glass-panel">

              {/* TAB 1: SHIELD (MOSAIC) */}
              {activeTab === 'shield' && (
                <>
                  <div className="panel-header">
                    <Shield size={18} style={{ color: 'var(--color-violet)' }} />
                    <h3 className="panel-title">{t.shieldTitle}</h3>
                  </div>
                  <p className="panel-desc">{t.shieldDesc}</p>

                  <div className="step-hint">
                    <span className="step-num">1</span>
                    <span>{t.hintShield}</span>
                  </div>

                  <button className="btn-neon btn-block" onClick={handleAddMask}>
                    <Plus size={16} />
                    {t.addMask}
                  </button>

                  {masks.length > 0 && (
                    <div className="panel-section">
                      <span className="section-label">{t.maskList}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                        {masks.map((mask) => (
                          <div
                            key={mask.id}
                            onClick={() => setActiveMaskId(mask.id)}
                            className="mask-item glass-panel"
                            style={{
                              borderColor: mask.id === activeMaskId ? 'var(--color-violet)' : 'rgba(255,255,255,0.06)',
                              background: mask.id === activeMaskId ? 'rgba(139, 92, 246, 0.06)' : 'rgba(255,255,255,0.01)'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>Mask {mask.id.substring(0, 4)}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.startT}: {mask.keyframe1?.t?.toFixed(2) ?? '–'}s → {t.endT}: {mask.keyframe2?.t?.toFixed(2) ?? '–'}s</div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setMasks(prev => prev.filter(m => m.id !== mask.id)); }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMaskId && (
                    <div className="panel-section">
                      <span className="section-label">{t.blurAmount}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="range" min="5" max="50" value={blurAmount}
                          onChange={(e) => setBlurAmount(Number(e.target.value))}
                          style={{ flex: 1, accentColor: 'var(--color-violet)' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--color-violet)', width: '28px' }}>{blurAmount}</span>
                      </div>
                    </div>
                  )}

                  {activeMaskId && (
                    <div className="panel-section">
                      <span className="section-label">{t.maskList} — Keyframes</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-neon-secondary" style={{ flex: 1, fontSize: '0.78rem', padding: '7px' }} onClick={() => handleRecordKeyframe('start')}>
                          {t.editStart}
                        </button>
                        <button className="btn-neon-secondary" style={{ flex: 1, fontSize: '0.78rem', padding: '7px' }} onClick={() => handleRecordKeyframe('end')}>
                          {t.editEnd}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: DANMAKU */}
              {activeTab === 'danmaku' && (
                <>
                  <div className="panel-header">
                    <MessageSquare size={18} style={{ color: 'var(--color-pink)' }} />
                    <h3 className="panel-title">{t.danmakuTitle}</h3>
                  </div>
                  <p className="panel-desc">{t.danmakuDesc}</p>

                  <div className="panel-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="section-label">{t.commentsLabel}</span>
                      <button
                        className="btn-neon-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => setCommentsText(prev => (prev ? prev + '\n' : '') + JAPANESE_MEMES.join('\n'))}
                      >
                        {t.loadPresetMemes}
                      </button>
                    </div>
                    <textarea
                      className="textarea-styled"
                      rows={6}
                      value={commentsText}
                      onChange={(e) => setCommentsText(e.target.value)}
                      placeholder="草&#10;wwww&#10;神動画&#10;88888888"
                    />
                  </div>

                  <div className="panel-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span className="section-label">{t.fontSize}</span>
                      <input type="number" className="input-styled" value={danmakuFontSize} min="16" max="80"
                        onChange={(e) => setDanmakuFontSize(Number(e.target.value))} />
                    </div>
                    <div>
                      <span className="section-label">{t.speed}</span>
                      <input type="number" className="input-styled" value={danmakuSpeed} min="50" max="600"
                        onChange={(e) => setDanmakuSpeed(Number(e.target.value))} />
                    </div>
                  </div>
                </>
              )}

              {/* TAB 3: SQUEEZER */}
              {activeTab === 'squeezer' && (
                <>
                  <div className="panel-header">
                    <FileVideo size={18} style={{ color: 'var(--color-cyan)' }} />
                    <h3 className="panel-title">{t.squeezerTitle}</h3>
                  </div>
                  <p className="panel-desc">{t.squeezerDesc}</p>

                  <div className="panel-section">
                    <span className="section-label">{t.presets}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { label: t.lineSend, value: 19.9 },
                        { label: t.discordFree, value: 9.9 },
                        { label: t.discordNitro, value: 24.9 },
                      ].map(({ label, value }) => (
                        <button
                          key={value}
                          onClick={() => setTargetSizeMb(value)}
                          className="btn-neon-secondary"
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontSize: '0.85rem',
                            borderColor: targetSizeMb === value ? 'var(--color-cyan)' : 'rgba(255,255,255,0.07)',
                            background: targetSizeMb === value ? 'rgba(6,182,212,0.08)' : 'transparent',
                            color: targetSizeMb === value ? 'var(--color-cyan)' : 'var(--text-secondary)',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="panel-section">
                    <span className="section-label">{t.customSize} (MB)</span>
                    <input
                      type="number" className="input-styled"
                      value={targetSizeMb} min="1" max="500" step="0.1"
                      onChange={(e) => setTargetSizeMb(parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="target-size-display">
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.targetSize}</span>
                    <span className="target-size-value">{targetSizeMb} MB</span>
                  </div>
                </>
              )}

              {/* ── RUN BUTTON (always at bottom) ── */}
              <div className="run-section">
                {outputUrl && (
                  <a
                    href={outputUrl}
                    download={`moyalab_${activeTab}_${Date.now()}.mp4`}
                    className="btn-download"
                  >
                    <Download size={18} />
                    {t.download}
                  </a>
                )}
                <button
                  className={`btn-run ${processing ? 'btn-run--processing' : ''}`}
                  disabled={!ffmpegReady || processing || (activeTab === 'shield' && masks.length === 0)}
                  onClick={runFFmpegProcess}
                >
                  {processing ? (
                    <><RefreshCw className="animate-spin" size={18} />{t.processing} {progress}%</>
                  ) : (
                    <><Settings size={18} />{t.process}</>
                  )}
                </button>
              </div>

            </div>{/* end control-panel */}

            {/* RIGHT: Video + Terminal */}
            <div className="editor-column">

              {/* Download success banner */}
              {outputUrl && (
                <div className="download-banner">
                  <Download size={16} />
                  <span>{t.success}</span>
                  <a
                    href={outputUrl}
                    download={`moyalab_${activeTab}_${Date.now()}.mp4`}
                    className="download-banner-btn"
                  >
                    {t.download}
                  </a>
                </div>
              )}

              {/* Video player + canvas */}
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
                  {activeTab === 'danmaku' && (
                    <div className="danmaku-container"></div>
                  )}
                </div>

                {/* Progress bar */}
                {processing && (
                  <div className="progress-wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>{t.processing}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-cyan)' }}>{progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Collapsible terminal */}
              <details className="terminal-collapsible">
                <summary className="terminal-summary">
                  <Terminal size={13} />
                  <span>{t.terminal}</span>
                  <span className="terminal-log-count">{logs.length}</span>
                  <button
                    className="terminal-clear"
                    onClick={(e) => { e.preventDefault(); setLogs([]); }}
                  >
                    {t.clearLogs}
                  </button>
                </summary>
                <div className="console-logs">
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
                  <div ref={terminalEndRef} />
                </div>
              </details>

            </div>{/* end editor-column */}

          </div>{/* end workspace-panel */}
        </main>
      )}
    </div>
  );
}

export default App;

