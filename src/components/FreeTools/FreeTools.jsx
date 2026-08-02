import React, { useEffect, useMemo, useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

// Static tool definitions
const TOOLS = [
  { id: "resume", title: "AI Resume / CV Maker", description: "Build a polished resume structure, preview it instantly, and export a downloadable PDF.", badge: "New" },
  { id: "background-remover", title: "Background Remover", description: "Remove a solid background from an image and export a transparent result.", badge: "Advanced" },
  { id: "image-compressor", title: "Image Compressor", description: "Resize and compress images while keeping them web-ready and lightweight.", badge: "Advanced" },
  { id: "gradient-generator", title: "Gradient Generator", description: "Design beautiful CSS gradients with instant preview and copyable output.", badge: "Design" },
  { id: "shadow-generator", title: "Box Shadow Generator", description: "Generate modern shadow styling for cards, buttons, and panels.", badge: "Design" },
  { id: "flexbox-playground", title: "Flexbox Playground", description: "Experiment with flex layouts in real time without leaving the page.", badge: "Layout" },
  { id: "jwt-decoder", title: "JWT Decoder", description: "Decode JWT headers and payloads instantly for debugging and inspection.", badge: "Developer" },
  { id: "regex-tester", title: "Regex Tester", description: "Test and debug complex regular expressions with live match results.", badge: "Developer" },
  { id: "word-counter", title: "Word Counter", description: "Measure words, characters, and reading density in one place.", badge: "Content" },
  { id: "image-cropper", title: "Image Cropper", description: "Crop images into a focused composition and export them quickly.", badge: "Advanced" },
  { id: "qr-generator", title: "QR Code Generator", description: "Generate QR codes instantly for links, text, or contact details.", badge: "Live" },
  { id: "password-generator", title: "Password Generator", description: "Create high-strength passwords in one click with a strength hint.", badge: "Live" },
  { id: "json-formatter", title: "JSON Formatter", description: "Format and validate JSON structures with clear status feedback.", badge: "Live" },
  { id: "markdown-preview", title: "Markdown Preview", description: "Preview markdown content as you write with proper formatting.", badge: "Live" },
  { id: "todo", title: "Todo App", description: "Manage projects and tasks with persistent local storage and completion states.", badge: "Live" },
];

const INITIAL_RESUME = {
  name: "Ahsan Ali",
  role: "Full-Stack Developer",
  email: "ahsan@example.com",
  phone: "+92 300 0000000",
  location: "Lahore, Pakistan",
  summary: "I build polished web experiences with React, Node.js, and modern UI systems.",
  skills: "React, Vite, Tailwind CSS, Laravel, Node.js, MongoDB",
  experience: "Senior Frontend Developer · Built high-converting React interfaces and scalable product flows.",
};

// Helper Utilities
const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((p) => p + p).join("") : normalized;
  const intValue = Number.parseInt(value, 16) || 0;
  return [(intValue >> 16) & 255, (intValue >> 8) & 255, intValue & 255];
};

const normalizeTodos = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string") return { text: item, done: false };
    return { text: item?.text || "", done: Boolean(item?.done) };
  });
};

const parseMarkdown = (markdown) => {
  const escapeHtml = (val) => val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = markdown.split(/\n/);
  const html = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  const flushCodeBlock = () => {
    if (codeBuffer.length) {
      html.push(`<pre class="bg-slate-900 p-3 rounded-lg overflow-x-auto"><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
      codeBuffer = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      flushCodeBlock();
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }
    if (!trimmed) {
      flushCodeBlock();
      html.push("<div class='h-2'></div>");
      return;
    }
    if (/^#{1,3}\s/.test(trimmed)) {
      flushCodeBlock();
      const level = Math.min(trimmed.match(/^#+/)[0].length, 3);
      const content = trimmed.replace(/^#{1,3}\s/, "");
      const formatted = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code class='bg-slate-800 px-1 rounded'>$1</code>");
      html.push(`<h${level} class="text-${level === 1 ? 'xl' : level === 2 ? 'lg' : 'base'} font-bold mt-2 mb-1 text-white">${formatted}</h${level}>`);
      return;
    }
    if (/^-\s/.test(trimmed)) {
      flushCodeBlock();
      const content = trimmed.replace(/^-\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code>$1</code>");
      html.push(`<li class="ml-4 list-disc">${content}</li>`);
      return;
    }
    flushCodeBlock();
    html.push(`<p class="my-1">${trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code>$1</code>")}</p>`);
  });

  flushCodeBlock();
  return html.join("");
};

const getPasswordStrength = (password) => {
  if (!password) return { label: "Empty", score: 0 };
  let score = 0;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;
  if (score >= 4) return { label: "Strong", score };
  if (score >= 2) return { label: "Medium", score };
  return { label: "Weak", score };
};

const createResumePdf = async (resumeData, photoData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  const fullName = (resumeData.name || "Your Name").trim();
  const role = (resumeData.role || "Professional Title").trim();
  const contactLine = [resumeData.email, resumeData.phone].filter(Boolean).join(" • ");
  const location = (resumeData.location || "").trim();
  const fileNameBase = (fullName || "resume").toLowerCase().replace(/\s+/g, "-");

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 140, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(fullName, margin, 58);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(role, margin, 84);
  doc.text(contactLine, margin, 106);
  doc.text(location, margin, 128);

  if (photoData) {
    try {
      const photoType = photoData.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(photoData, photoType, pageWidth - 132, 24, 70, 88);
    } catch {
      // Fallback
    }
  }

  doc.setDrawColor(120, 113, 108);
  doc.line(margin, 160, pageWidth - margin, 160);

  let y = 182;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Profile", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const summaryLines = doc.splitTextToSize(resumeData.summary || "", contentWidth);
  doc.text(summaryLines, margin, y + 20);

  y += 70 + (summaryLines.length > 2 ? (summaryLines.length - 2) * 12 : 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Skills", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const skills = (resumeData.skills || "").split(",").map((s) => s.trim()).filter(Boolean);
  doc.text(skills.join(" • "), margin, y + 20);

  y += 50;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Experience", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const experienceLines = doc.splitTextToSize(resumeData.experience || "", contentWidth);
  doc.text(experienceLines, margin, y + 20);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Generated with Free Tools • Professional CV", margin, pageHeight - 26);

  doc.save(`${fileNameBase}-cv.pdf`);
};

const FreeTools = () => {
  const [activeTool, setActiveTool] = useState("resume");
  
  // States
  const [resumeData, setResumeData] = useState(INITIAL_RESUME);
  const [resumePhotoPreview, setResumePhotoPreview] = useState("");
  const [resumePhotoName, setResumePhotoName] = useState("");
  const [resumeStatus, setResumeStatus] = useState("Add a photo and download a polished PDF CV.");

  const [qrText, setQrText] = useState("[https://example.com](https://example.com)");
  const [qrImage, setQrImage] = useState("");

  const [password, setPassword] = useState("");

  const [jsonInput, setJsonInput] = useState('{\n  "name": "Ahsan",\n  "skills": ["React", "Laravel"]\n}');
  const [jsonStatus, setJsonStatus] = useState("Format to validate and prettify JSON.");

  const [markdownInput, setMarkdownInput] = useState("# Hello\n\nThis is **markdown**.\n\n- One\n- Two");

  const [todos, setTodos] = useState(() => {
    if (typeof window === "undefined") return normalizeTodos(["Build portfolio", "Ship project", "Practice coding"]);
    try {
      const saved = window.localStorage.getItem("free-tools-todos");
      return normalizeTodos(saved ? JSON.parse(saved) : ["Build portfolio", "Ship project", "Practice coding"]);
    } catch {
      return normalizeTodos(["Build portfolio", "Ship project", "Practice coding"]);
    }
  });
  const [todoInput, setTodoInput] = useState("");

  const [bgImagePreview, setBgImagePreview] = useState("");
  const [bgRemovedImage, setBgRemovedImage] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgTolerance, setBgTolerance] = useState(30);
  const [bgStatus, setBgStatus] = useState("Upload an image to remove a solid-color background.");

  const [compressPreview, setCompressPreview] = useState("");
  const [compressedImage, setCompressedImage] = useState("");
  const [compressQuality, setCompressQuality] = useState(0.8);
  const [compressWidth, setCompressWidth] = useState(1200);
  const [compressFormat, setCompressFormat] = useState("jpeg");
  const [compressStatus, setCompressStatus] = useState("Upload an image to compress it.");

  const [gradientType, setGradientType] = useState("linear");
  const [gradientAngle, setGradientAngle] = useState(45);
  const [gradientA, setGradientA] = useState("#8b5cf6");
  const [gradientB, setGradientB] = useState("#22d3ee");

  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(16);
  const [shadowBlur, setShadowBlur] = useState(30);
  const [shadowSpread, setShadowSpread] = useState(0);
  const [shadowColor, setShadowColor] = useState("#0f172a");
  const [shadowInset, setShadowInset] = useState(false);

  const [flexDirection, setFlexDirection] = useState("row");
  const [justifyContent, setJustifyContent] = useState("center");
  const [alignItems, setAlignItems] = useState("center");
  const [flexWrap, setFlexWrap] = useState("wrap");
  const [flexGap, setFlexGap] = useState(16);

  const [jwtInput, setJwtInput] = useState("");
  const [jwtHeader, setJwtHeader] = useState("");
  const [jwtPayload, setJwtPayload] = useState("");

  const [regexPattern, setRegexPattern] = useState("\\b\\w{3,}\\b");
  const [regexFlags, setRegexFlags] = useState("g");
  const [regexText, setRegexText] = useState("React, Next.js, Tailwind CSS, Node.js");

  const [wordText, setWordText] = useState("Write your content here to inspect words, characters, and reading density.");

  const [cropImagePreview, setCropImagePreview] = useState("");
  const [cropWidth, setCropWidth] = useState(600);
  const [cropHeight, setCropHeight] = useState(400);
  const [cropMode, setCropMode] = useState("center");
  const [cropStatus, setCropStatus] = useState("Upload an image to crop it.");

  // Cleanup Blob URLs
  useEffect(() => {
    return () => {
      if (compressedImage && compressedImage.startsWith("blob:")) {
        URL.revokeObjectURL(compressedImage);
      }
    };
  }, [compressedImage]);

  // Sync Todos
  useEffect(() => {
    try {
      localStorage.setItem("free-tools-todos", JSON.stringify(todos));
    } catch {
      // Storage fallback
    }
  }, [todos]);

  // QR Code Effect
  useEffect(() => {
    if (!qrText.trim()) {
      setQrImage("");
      return;
    }
    let active = true;
    QRCode.toDataURL(qrText, { width: 220, margin: 1 })
      .then((url) => { if (active) setQrImage(url); })
      .catch(() => { if (active) setQrImage(""); });

    return () => { active = false; };
  }, [qrText]);

  // Memoized values
  const resumePreview = useMemo(() => {
    return [
      resumeData.name,
      resumeData.role,
      `${resumeData.email} • ${resumeData.phone}`,
      resumeData.location,
      "",
      resumeData.summary,
      "",
      `Skills: ${resumeData.skills}`,
      "",
      `Experience: ${resumeData.experience}`,
    ].join("\n");
  }, [resumeData]);

  const markdownHtml = useMemo(() => parseMarkdown(markdownInput), [markdownInput]);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const gradientCss = useMemo(() => {
    return gradientType === "radial"
      ? `background: radial-gradient(circle, ${gradientA}, ${gradientB});`
      : `background: linear-gradient(${gradientAngle}deg, ${gradientA}, ${gradientB});`;
  }, [gradientAngle, gradientA, gradientB, gradientType]);

  const shadowCss = useMemo(() => {
    return `box-shadow: ${shadowInset ? "inset " : ""}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`;
  }, [shadowBlur, shadowColor, shadowInset, shadowSpread, shadowX, shadowY]);

  const regexMatches = useMemo(() => {
    try {
      if (!regexPattern) return [];
      const regex = new RegExp(regexPattern, regexFlags);
      return Array.from(regexText.matchAll(regex)).map((match) => ({ value: match[0] }));
    } catch {
      return [];
    }
  }, [regexFlags, regexPattern, regexText]);

  const wordStats = useMemo(() => {
    const trimmed = wordText.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = wordText.length;
    const charsNoSpace = wordText.replace(/\s/g, "").length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, charsNoSpace, readingTime };
  }, [wordText]);

  // Handlers
  const scrollToTool = (id) => {
    setActiveTool(id);
    document.getElementById(`tool-section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyToClipboard = useCallback(async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard.");
      } else {
        window.prompt("Copy this value", text);
      }
    } catch {
      alert("Clipboard access is not available.");
    }
  }, []);

  const downloadUrl = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let result = "";
    for (let i = 0; i < 18; i += 1) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setPassword(result);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonStatus("JSON formatted successfully.");
    } catch {
      setJsonStatus("Invalid JSON. Please check syntax.");
    }
  };

  const decodeJwt = () => {
    if (!jwtInput.trim()) return;
    const parts = jwtInput.split(".");
    if (parts.length < 2) {
      alert("Please enter a valid JWT token.");
      return;
    }
    const safeDecode = (part) => {
      try {
        const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
        return JSON.parse(decodeURIComponent(escape(atob(padded))));
      } catch {
        return "Invalid payload/header format";
      }
    };
    setJwtHeader(JSON.stringify(safeDecode(parts[0]), null, 2));
    setJwtPayload(JSON.stringify(safeDecode(parts[1]), null, 2));
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (!todoInput.trim()) return;
    setTodos((prev) => [...prev, { text: todoInput.trim(), done: false }]);
    setTodoInput("");
  };

  const removeBackground = () => {
    if (!bgImagePreview) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const [targetR, targetG, targetB] = hexToRgb(bgColor);
      const threshold = Math.max(10, Number(bgTolerance) * 0.8);

      for (let i = 0; i < data.length; i += 4) {
        const diff = Math.sqrt((data[i] - targetR) ** 2 + (data[i + 1] - targetG) ** 2 + (data[i + 2] - targetB) ** 2);
        if (diff <= threshold && data[i + 3] > 80) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setBgRemovedImage(canvas.toDataURL("image/png"));
      setBgStatus(`Background removed with tolerance of ${bgTolerance}.`);
    };
    img.src = bgImagePreview;
  };

  const compressImage = () => {
    if (!compressPreview) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, Number(compressWidth) / img.width);
      const width = Math.max(100, Math.round(img.width * scale));
      const height = Math.max(100, Math.round(img.height * scale));
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = compressFormat === "png" ? "image/png" : "image/jpeg";
      canvas.toBlob((blob) => {
        if (blob) {
          if (compressedImage && compressedImage.startsWith("blob:")) {
            URL.revokeObjectURL(compressedImage);
          }
          const objectUrl = URL.createObjectURL(blob);
          setCompressedImage(objectUrl);
          setCompressStatus(`Compressed to ${(blob.size / 1024).toFixed(1)} KB.`);
        }
      }, mimeType, Number(compressQuality));
    };
    img.src = compressPreview;
  };

  const cropImage = () => {
    if (!cropImagePreview) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const targetWidth = Number(cropWidth);
      const targetHeight = Number(cropHeight);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sourceWidth = Math.min(img.width, targetWidth);
      const sourceHeight = Math.min(img.height, targetHeight);
      let sx = 0;
      let sy = 0;

      if (cropMode === "center") {
        sx = Math.max(0, (img.width - sourceWidth) / 2);
        sy = Math.max(0, (img.height - sourceHeight) / 2);
      } else if (cropMode === "bottom-right") {
        sx = Math.max(0, img.width - sourceWidth);
        sy = Math.max(0, img.height - sourceHeight);
      }

      ctx.drawImage(img, sx, sy, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
      setCropImagePreview(canvas.toDataURL("image/jpeg"));
      setCropStatus(`Cropped to ${targetWidth} × ${targetHeight}px.`);
    };
    img.src = cropImagePreview;
  };

  return (
    <section className="px-[7vw] py-24 md:px-[7vw] lg:px-[18vw] text-slate-100 font-sans">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-purple-400">Free Tools</p>
        <h2 className="text-3xl md:text-4xl font-bold mt-3 text-white">Advanced creator and developer utilities</h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto">A polished toolbox for portfolio work, design iteration, and everyday developer tasks.</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[["15+", "Live utilities"], ["100%", "Client-side workflows"], ["Instant", "Copy-ready output"]].map(([value, label]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-md">
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => scrollToTool(tool.id)}
              className={`group rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                isActive
                  ? "border-purple-400/70 bg-purple-500/15 shadow-lg shadow-purple-500/10"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-purple-400/60 hover:bg-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{tool.description}</p>
                </div>
                <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-purple-200">
                  {tool.badge}
                </span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-300 transition group-hover:translate-x-1">
                Open tool <span aria-hidden="true">→</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-1">
        {TOOLS.filter((tool) => tool.id === activeTool).map((tool) => (
          <div key={tool.id} id={`tool-section-${tool.id}`} className="rounded-3xl border border-white/10 bg-[#0b0f19] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">{tool.badge}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">{tool.description}</p>
            <div className="mt-5">
              
              {/* RESUME MAKER */}
              {tool.id === "resume" && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(resumeData).slice(0, 4).map(([key, value]) => (
                      <label key={key} className="text-sm text-slate-300">
                        <span className="mb-2 block capitalize text-slate-400">{key}</span>
                        <input
                          value={value}
                          onChange={(e) => setResumeData((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none focus:border-purple-400"
                        />
                      </label>
                    ))}
                  </div>
                  <label className="text-sm text-slate-300 block">
                    <span className="mb-2 block text-slate-400">Summary</span>
                    <textarea
                      value={resumeData.summary}
                      onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                      rows={3}
                      className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none focus:border-purple-400"
                    />
                  </label>
                  <label className="text-sm text-slate-300 block">
                    <span className="mb-2 block text-slate-400">Experience</span>
                    <textarea
                      value={resumeData.experience}
                      onChange={(e) => setResumeData((prev) => ({ ...prev, experience: e.target.value }))}
                      rows={3}
                      className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none focus:border-purple-400"
                    />
                  </label>
                  <label className="text-sm text-slate-300 block">
                    <span className="mb-2 block text-slate-400">Upload profile photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setResumePhotoPreview(reader.result);
                          setResumePhotoName(file.name);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full text-sm text-slate-400"
                    />
                    {resumePhotoName && <p className="mt-2 text-xs text-slate-400">Selected: {resumePhotoName}</p>}
                  </label>
                  
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-slate-200 shadow-2xl">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xl font-semibold text-white">{resumeData.name}</p>
                        <p className="mt-1 text-sm text-purple-300">{resumeData.role}</p>
                        <p className="mt-2 text-sm text-slate-400">{resumeData.email} • {resumeData.phone}</p>
                        <p className="text-sm text-slate-400">{resumeData.location}</p>
                      </div>
                      {resumePhotoPreview ? (
                        <img src={resumePhotoPreview} alt="Resume profile" className="h-24 w-24 rounded-full border border-white/10 object-cover" />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-white/20 bg-white/10 text-sm text-slate-400">Photo</div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400">{resumeStatus}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={async () => {
                        try {
                          await createResumePdf(resumeData, resumePhotoPreview);
                          setResumeStatus("PDF CV downloaded successfully.");
                        } catch {
                          setResumeStatus("PDF export failed.");
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition"
                    >
                      Download PDF CV
                    </button>
                    <button onClick={() => copyToClipboard(resumePreview)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition">
                      Copy Text
                    </button>
                  </div>
                </div>
              )}

              {/* BACKGROUND REMOVER */}
              {tool.id === "background-remover" && (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setBgImagePreview(reader.result);
                        setBgRemovedImage("");
                        setBgStatus(`Loaded ${file.name}.`);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-sm text-slate-400"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Background color</span>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-xl bg-transparent" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Tolerance ({bgTolerance})</span>
                      <input type="range" min="5" max="100" value={bgTolerance} onChange={(e) => setBgTolerance(e.target.value)} className="w-full" />
                    </label>
                  </div>
                  <button onClick={removeBackground} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                    Remove Background
                  </button>
                  <p className="text-sm text-slate-400">{bgStatus}</p>
                  {bgRemovedImage && (
                    <div className="space-y-2">
                      <img src={bgRemovedImage} alt="Background removed" className="max-h-64 rounded-xl border border-white/10 object-contain bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
                      <button onClick={() => downloadUrl(bgRemovedImage, "bg-removed.png")} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition">
                        Download Image
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* IMAGE COMPRESSOR */}
              {tool.id === "image-compressor" && (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setCompressPreview(reader.result);
                        setCompressStatus(`Loaded ${file.name}.`);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-sm text-slate-400"
                  />
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Width (px)</span>
                      <input type="number" value={compressWidth} onChange={(e) => setCompressWidth(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Quality ({Math.round(compressQuality * 100)}%)</span>
                      <input type="range" min="0.1" max="1" step="0.05" value={compressQuality} onChange={(e) => setCompressQuality(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Format</span>
                      <select value={compressFormat} onChange={(e) => setCompressFormat(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                      </select>
                    </label>
                  </div>
                  <button onClick={compressImage} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                    Compress Image
                  </button>
                  <p className="text-sm text-slate-400">{compressStatus}</p>
                  {compressedImage && (
                    <div className="space-y-2">
                      <img src={compressedImage} alt="Compressed preview" className="max-h-64 rounded-xl border border-white/10 object-contain" />
                      <button onClick={() => downloadUrl(compressedImage, `compressed.${compressFormat}`)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition">
                        Download Compressed Image
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* GRADIENT GENERATOR */}
              {tool.id === "gradient-generator" && (
                <div className="space-y-4">
                  <div className="h-32 w-full rounded-2xl border border-white/10 transition-all" style={{ background: gradientType === "radial" ? `radial-gradient(circle, ${gradientA}, ${gradientB})` : `linear-gradient(${gradientAngle}deg, ${gradientA}, ${gradientB})` }}></div>
                  <div className="grid gap-3 md:grid-cols-4">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Type</span>
                      <select value={gradientType} onChange={(e) => setGradientType(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="linear">Linear</option>
                        <option value="radial">Radial</option>
                      </select>
                    </label>
                    {gradientType === "linear" && (
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Angle ({gradientAngle}°)</span>
                        <input type="range" min="0" max="360" value={gradientAngle} onChange={(e) => setGradientAngle(e.target.value)} className="w-full" />
                      </label>
                    )}
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Color 1</span>
                      <input type="color" value={gradientA} onChange={(e) => setGradientA(e.target.value)} className="h-10 w-full cursor-pointer rounded-xl bg-transparent" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Color 2</span>
                      <input type="color" value={gradientB} onChange={(e) => setGradientB(e.target.value)} className="h-10 w-full cursor-pointer rounded-xl bg-transparent" />
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <input readOnly value={gradientCss} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-xs font-mono text-white outline-none" />
                    <button onClick={() => copyToClipboard(gradientCss)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* BOX SHADOW GENERATOR */}
              {tool.id === "shadow-generator" && (
                <div className="space-y-4">
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-[#131025]">
                    <div className="h-20 w-40 rounded-xl bg-purple-600 transition-all flex items-center justify-center text-xs text-white" style={{ boxShadow: `${shadowInset ? "inset " : ""}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}` }}>
                      Box Preview
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Offset X ({shadowX}px)</span>
                      <input type="range" min="-50" max="50" value={shadowX} onChange={(e) => setShadowX(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Offset Y ({shadowY}px)</span>
                      <input type="range" min="-50" max="50" value={shadowY} onChange={(e) => setShadowY(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Blur ({shadowBlur}px)</span>
                      <input type="range" min="0" max="100" value={shadowBlur} onChange={(e) => setShadowBlur(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Spread ({shadowSpread}px)</span>
                      <input type="range" min="-20" max="50" value={shadowSpread} onChange={(e) => setShadowSpread(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Color</span>
                      <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-xl bg-transparent" />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mt-6">
                      <input type="checkbox" checked={shadowInset} onChange={(e) => setShadowInset(e.target.checked)} className="rounded" />
                      Inset Shadow
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <input readOnly value={shadowCss} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-xs font-mono text-white outline-none" />
                    <button onClick={() => copyToClipboard(shadowCss)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* FLEXBOX PLAYGROUND */}
              {tool.id === "flexbox-playground" && (
                <div className="space-y-4">
                  <div className="min-h-48 rounded-2xl border border-white/10 bg-[#131025] p-4 flex transition-all" style={{ flexDirection, justifyContent, alignItems, flexWrap, gap: `${flexGap}px` }}>
                    {[1, 2, 3].map((num) => (
                      <div key={num} className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-600 text-white font-bold">
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Flex Direction</span>
                      <select value={flexDirection} onChange={(e) => setFlexDirection(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="row">row</option>
                        <option value="column">column</option>
                        <option value="row-reverse">row-reverse</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Justify Content</span>
                      <select value={justifyContent} onChange={(e) => setJustifyContent(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="flex-start">flex-start</option>
                        <option value="center">center</option>
                        <option value="flex-end">flex-end</option>
                        <option value="space-between">space-between</option>
                        <option value="space-around">space-around</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Align Items</span>
                      <select value={alignItems} onChange={(e) => setAlignItems(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="stretch">stretch</option>
                        <option value="flex-start">flex-start</option>
                        <option value="center">center</option>
                        <option value="flex-end">flex-end</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* JWT DECODER */}
              {tool.id === "jwt-decoder" && (
                <div className="space-y-4">
                  <textarea
                    value={jwtInput}
                    onChange={(e) => setJwtInput(e.target.value)}
                    placeholder="Paste JWT here..."
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 font-mono text-xs text-white outline-none focus:border-purple-400"
                  />
                  <button onClick={decodeJwt} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                    Decode Token
                  </button>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-400">Header</p>
                      <pre className="h-40 overflow-auto rounded-2xl border border-white/10 bg-[#131025] p-3 text-xs text-purple-300">{jwtHeader || "// Decoded Header"}</pre>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-400">Payload</p>
                      <pre className="h-40 overflow-auto rounded-2xl border border-white/10 bg-[#131025] p-3 text-xs text-teal-300">{jwtPayload || "// Decoded Payload"}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* REGEX TESTER */}
              {tool.id === "regex-tester" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      value={regexPattern}
                      onChange={(e) => setRegexPattern(e.target.value)}
                      placeholder="Pattern"
                      className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 font-mono text-sm text-white outline-none focus:border-purple-400"
                    />
                    <input
                      value={regexFlags}
                      onChange={(e) => setRegexFlags(e.target.value)}
                      placeholder="Flags"
                      className="w-20 rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 font-mono text-sm text-white outline-none focus:border-purple-400"
                    />
                  </div>
                  <textarea
                    value={regexText}
                    onChange={(e) => setRegexText(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
                  />
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-400">Matches ({regexMatches.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {regexMatches.map((m, i) => (
                        <span key={i} className="rounded-lg bg-purple-500/20 border border-purple-500/30 px-2 py-1 text-xs text-purple-200">{m.value}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WORD COUNTER */}
              {tool.id === "word-counter" && (
                <div className="space-y-4">
                  <textarea
                    value={wordText}
                    onChange={(e) => setWordText(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
                  />
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-white/10 bg-[#131025] p-3 text-center">
                      <p className="text-xl font-bold text-white">{wordStats.words}</p>
                      <p className="text-xs text-slate-400">Words</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#131025] p-3 text-center">
                      <p className="text-xl font-bold text-white">{wordStats.chars}</p>
                      <p className="text-xs text-slate-400">Characters</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#131025] p-3 text-center">
                      <p className="text-xl font-bold text-white">{wordStats.charsNoSpace}</p>
                      <p className="text-xs text-slate-400">No Spaces</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#131025] p-3 text-center">
                      <p className="text-xl font-bold text-white">~{wordStats.readingTime}m</p>
                      <p className="text-xs text-slate-400">Reading Time</p>
                    </div>
                  </div>
                </div>
              )}

              {/* IMAGE CROPPER */}
              {tool.id === "image-cropper" && (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        setCropImagePreview(reader.result);
                        setCropStatus(`Loaded ${file.name}.`);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-sm text-slate-400"
                  />
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Target Width</span>
                      <input type="number" value={cropWidth} onChange={(e) => setCropWidth(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Target Height</span>
                      <input type="number" value={cropHeight} onChange={(e) => setCropHeight(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Focus Mode</span>
                      <select value={cropMode} onChange={(e) => setCropMode(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="center">Center</option>
                        <option value="bottom-right">Bottom-Right</option>
                      </select>
                    </label>
                  </div>
                  <button onClick={cropImage} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                    Crop Image
                  </button>
                  <p className="text-sm text-slate-400">{cropStatus}</p>
                  {cropImagePreview && (
                    <div className="space-y-2">
                      <img src={cropImagePreview} alt="Crop preview" className="max-h-64 rounded-xl border border-white/10 object-contain" />
                      <button onClick={() => downloadUrl(cropImagePreview, "cropped-image.jpg")} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition">
                        Download Cropped Image
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* QR CODE GENERATOR */}
              {tool.id === "qr-generator" && (
                <div className="space-y-4">
                  <input
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="Enter URL or text..."
                    className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none focus:border-purple-400"
                  />
                  {qrImage && (
                    <div className="space-y-3">
                      <img src={qrImage} alt="QR Code" className="h-48 w-48 rounded-2xl border border-white/10 p-2 bg-white" />
                      <button onClick={() => downloadUrl(qrImage, "qr-code.png")} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                        Download QR Code
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PASSWORD GENERATOR */}
              {tool.id === "password-generator" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input readOnly value={password} placeholder="Click generate..." className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none font-mono" />
                    <button onClick={generatePassword} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                      Generate
                    </button>
                  </div>
                  {password && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Strength: <strong className="text-purple-300">{passwordStrength.label}</strong></span>
                      <button onClick={() => copyToClipboard(password)} className="text-purple-400 hover:underline">Copy password</button>
                    </div>
                  )}
                </div>
              )}

              {/* JSON FORMATTER */}
              {tool.id === "json-formatter" && (
                <div className="space-y-4">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={6}
                    className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 font-mono text-xs text-white outline-none focus:border-purple-400"
                  />
                  <div className="flex items-center justify-between">
                    <button onClick={formatJson} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                      Format JSON
                    </button>
                    <p className="text-xs text-slate-400">{jsonStatus}</p>
                  </div>
                </div>
              )}

              {/* MARKDOWN PREVIEW */}
              {tool.id === "markdown-preview" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <textarea
                    value={markdownInput}
                    onChange={(e) => setMarkdownInput(e.target.value)}
                    rows={8}
                    className="w-full rounded-2xl border border-white/10 bg-[#131025] p-3 text-xs font-mono text-white outline-none focus:border-purple-400"
                  />
                  <div
                    className="h-full min-h-[200px] overflow-auto rounded-2xl border border-white/10 bg-[#131025] p-4 text-sm text-slate-300"
                    dangerouslySetInnerHTML={{ __html: markdownHtml }}
                  />
                </div>
              )}

              {/* TODO APP */}
              {tool.id === "todo" && (
                <div className="space-y-4">
                  <form onSubmit={addTodo} className="flex gap-2">
                    <input
                      value={todoInput}
                      onChange={(e) => setTodoInput(e.target.value)}
                      placeholder="Add a new task..."
                      className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none focus:border-purple-400"
                    />
                    <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition">
                      Add
                    </button>
                  </form>
                  <ul className="space-y-2">
                    {todos.map((todo, idx) => (
                      <li key={idx} className="flex items-center justify-between rounded-xl border border-white/5 bg-[#131025] px-3 py-2">
                        <span
                          onClick={() => setTodos((prev) => prev.map((t, i) => (i === idx ? { ...t, done: !t.done } : t)))}
                          className={`cursor-pointer text-sm ${todo.done ? "line-through text-slate-500" : "text-slate-200"}`}
                        >
                          {todo.text}
                        </span>
                        <button onClick={() => setTodos((prev) => prev.filter((_, i) => i !== idx))} className="text-xs text-red-400 hover:underline">
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FreeTools;