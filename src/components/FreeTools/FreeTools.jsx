import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

const tools = [
  { id: "resume", title: "AI Resume / CV Maker", description: "Build a polished resume structure, preview it instantly, and export a downloadable version.", badge: "New" },
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

const initialResume = {
  name: "Ahsan Ali",
  role: "Full-Stack Developer",
  email: "ahsan@example.com",
  phone: "+92 300 0000000",
  location: "Lahore, Pakistan",
  summary: "I build polished web experiences with React, Node.js, and modern UI systems.",
  skills: "React, Vite, Tailwind CSS, Laravel, Node.js, MongoDB",
  experience: "Senior Frontend Developer · Built high-converting React interfaces and scalable product flows.",
};

const normalizeTodos = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string") return { text: item, done: false };
    return { text: item?.text || "", done: Boolean(item?.done) };
  });
};

const parseMarkdown = (markdown) => {
  const escapeHtml = (value) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = markdown.split(/\n/);
  const html = [];
  let inCodeBlock = false;
  let codeBuffer = [];

  const flushCodeBlock = () => {
    if (codeBuffer.length) {
      html.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
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
      html.push("<div class='spacer'></div>");
      return;
    }

    if (/^#{1,3}\s/.test(trimmed)) {
      flushCodeBlock();
      const level = trimmed.match(/^#+/)[0].length;
      const content = trimmed.replace(/^#{1,3}\s/, "");
      const tag = `h${Math.min(level, 3)}`;
      html.push(`<${tag}>${content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code>$1</code>")}</${tag}>`);
      return;
    }

    if (/^-\s/.test(trimmed)) {
      flushCodeBlock();
      html.push(`<li>${trimmed.replace(/^-\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code>$1</code>")}</li>`);
      return;
    }

    flushCodeBlock();
    html.push(`<p>${trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, "<code>$1</code>")}</p>`);
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

const downloadTextFile = (content, filename) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const createResumePdf = async (resumeData, photoData) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  const fullName = (resumeData.name || "Your Name").trim();
  const role = (resumeData.role || "Professional Title").trim();
  const contactLine = ((resumeData.email || "") + (resumeData.email && resumeData.phone ? " • " : "") + (resumeData.phone || "")).trim();
  const location = (resumeData.location || "").trim();
  const fileNameBase = (fullName || "resume").toLowerCase().replace(/\s+/g, "-");

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 140, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(fullName || "Your Name", margin, 58);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(role || "Professional Title", margin, 84);
  doc.text(contactLine, margin, 106);
  doc.text(location, margin, 128);

  if (photoData) {
    const photoType = photoData.startsWith("data:image/png") ? "PNG" : "JPEG";
    doc.addImage(photoData, photoType, pageWidth - 132, 24, 70, 88);
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

  y += 70;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Skills", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  const skills = (resumeData.skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
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

  doc.save(fileNameBase + "-cv.pdf");
};

const FreeTools = () => {
  const [activeTool, setActiveTool] = useState("resume");
  const [resumeData, setResumeData] = useState(initialResume);
  const [qrText, setQrText] = useState("https://example.com");
  const [qrImage, setQrImage] = useState("");
  const [password, setPassword] = useState("");
  const [jsonInput, setJsonInput] = useState('{"name":"Ahsan","skills":["React","Laravel"]}');
  const [jsonStatus, setJsonStatus] = useState("Format to validate and prettify JSON.");
  const [markdownInput, setMarkdownInput] = useState("# Hello\n\nThis is **markdown**.\n\n- One\n- Two");
  const [todos, setTodos] = useState(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("free-tools-todos") : null;
    return normalizeTodos(saved ? JSON.parse(saved) : ["Build portfolio", "Ship project", "Practice coding"]);
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
  const [resumePhotoPreview, setResumePhotoPreview] = useState("");
  const [resumePhotoName, setResumePhotoName] = useState("");
  const [resumeStatus, setResumeStatus] = useState("Add a photo and download a polished PDF CV.");

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

  useEffect(() => {
    if (!qrText) {
      setQrImage("");
      return;
    }

    let active = true;
    QRCode.toDataURL(qrText, { width: 220, margin: 1 })
      .then((url) => {
        if (active) setQrImage(url);
      })
      .catch(() => {
        if (active) setQrImage("");
      });

    return () => {
      active = false;
    };
  }, [qrText]);

  const scrollToTool = (id) => {
    setActiveTool(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let result = "";
    for (let i = 0; i < 18; i += 1) result += chars[Math.floor(Math.random() * chars.length)];
    setPassword(result);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonStatus("JSON formatted successfully.");
    } catch {
      setJsonStatus("Invalid JSON. Please fix the syntax.");
    }
  };

  const addTodo = (event) => {
    event.preventDefault();
    if (!todoInput.trim()) return;
    const nextTodos = [...todos, { text: todoInput.trim(), done: false }];
    setTodos(nextTodos);
    localStorage.setItem("free-tools-todos", JSON.stringify(nextTodos));
    setTodoInput("");
  };

  const toggleTodo = (index) => {
    const nextTodos = todos.map((todo, itemIndex) => (itemIndex === index ? { ...todo, done: !todo.done } : todo));
    setTodos(nextTodos);
    localStorage.setItem("free-tools-todos", JSON.stringify(nextTodos));
  };

  const removeTodo = (index) => {
    const nextTodos = todos.filter((_, itemIndex) => itemIndex !== index);
    setTodos(nextTodos);
    localStorage.setItem("free-tools-todos", JSON.stringify(nextTodos));
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        window.alert("Copied to clipboard.");
      } else {
        window.prompt("Copy this value", text);
      }
    } catch {
      window.alert("Clipboard access is not available.");
    }
  };

  const handleBackgroundImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBgImagePreview(reader.result);
      setBgRemovedImage("");
      setBgStatus(`Loaded ${file.name}. Pick a color and remove the background.`);
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = () => {
    if (!bgImagePreview) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const [targetR, targetG, targetB] = hexToRgb(bgColor);
      const tolerance = Number(bgTolerance);
      const threshold = Math.max(10, tolerance * 0.8);

      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + 3];
        const diff = Math.sqrt((red - targetR) ** 2 + (green - targetG) ** 2 + (blue - targetB) ** 2);
        const isBackground = diff <= threshold && alpha > 80;
        if (isBackground) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setBgRemovedImage(canvas.toDataURL("image/png"));
      setBgStatus(`Background removed using a tolerance of ${tolerance}.`);
    };
    img.src = bgImagePreview;
  };

  const handleCompressUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCompressPreview(reader.result);
      setCompressedImage("");
      setCompressStatus(`Loaded ${file.name}. Adjust quality and size, then compress.`);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = () => {
    if (!compressPreview) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, Number(compressWidth) / img.width);
      const width = Math.max(240, Math.round(img.width * scale));
      const height = Math.max(240, Math.round(img.height * scale));
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const mimeType = compressFormat === "png" ? "image/png" : "image/jpeg";
      canvas.toBlob((blob) => {
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          setCompressedImage(objectUrl);
          setCompressStatus(`Compressed to ${(blob.size / 1024).toFixed(1)} KB from ${Math.round((img.width * img.height) / 1000000)} MP using ${Number(compressQuality).toFixed(1)} quality.`);
        }
      }, mimeType, Number(compressQuality));
    };
    img.src = compressPreview;
  };

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

  const decodeJwt = () => {
    if (!jwtInput.trim()) return;
    const parts = jwtInput.split(".");
    if (parts.length < 2) {
      window.alert("Please enter a valid JWT token.");
      return;
    }
    const decodePart = (part) => {
      const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      return JSON.parse(atob(padded));
    };
    setJwtPayload(JSON.stringify(decodePart(parts[1]), null, 2));
    setJwtHeader(JSON.stringify(decodePart(parts[0]), null, 2));
  };

  const handleCropUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropImagePreview(reader.result);
      setCropStatus(`Loaded ${file.name}. Choose your crop dimensions and export.`);
    };
    reader.readAsDataURL(file);
  };

  const cropImage = () => {
    if (!cropImagePreview) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const targetWidth = Number(cropWidth);
      const targetHeight = Number(cropHeight);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      const sourceWidth = Math.min(img.width, targetWidth);
      const sourceHeight = Math.min(img.height, targetHeight);
      let sx = 0;
      let sy = 0;
      if (cropMode === "center") {
        sx = (img.width - sourceWidth) / 2;
        sy = (img.height - sourceHeight) / 2;
      } else if (cropMode === "top-left") {
        sx = 0;
        sy = 0;
      } else if (cropMode === "bottom-right") {
        sx = img.width - sourceWidth;
        sy = img.height - sourceHeight;
      }
      ctx.drawImage(img, sx, sy, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
      setCropImagePreview(canvas.toDataURL("image/jpeg"));
      setCropStatus(`Cropped to ${targetWidth} × ${targetHeight}.`);
    };
    img.src = cropImagePreview;
  };

  const handleResumePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setResumePhotoPreview(reader.result);
      setResumePhotoName(file.name);
      setResumeStatus(`Photo loaded: ${file.name}. Ready to export PDF.`);
    };
    reader.readAsDataURL(file);
  };

  const handleResumePdfDownload = async () => {
    try {
      await createResumePdf(resumeData, resumePhotoPreview);
      setResumeStatus("PDF CV downloaded successfully.");
    } catch {
      setResumeStatus("PDF export failed. Please try again.");
    }
  };

  const downloadUrl = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <section className="px-[7vw] py-24 md:px-[7vw] lg:px-[18vw]">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-purple-300">Free Tools</p>
        <h2 className="section-title mt-3">Advanced creator and developer utilities</h2>
        <p className="section-subtitle">A polished toolbox for portfolio work, design iteration, and everyday developer tasks.</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[["15+", "Live utilities"], ["100%", "Client-side workflows"], ["Instant", "Copy-ready output"]].map(([value, label]) => (
          <div key={label} className="glass-card rounded-3xl p-5 text-center">
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              id={tool.id}
              onClick={() => scrollToTool(tool.id)}
              className={`group rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/60 hover:bg-white/10 ${isActive ? "border-purple-400/70 bg-purple-500/15 shadow-lg shadow-purple-500/10" : "border-white/10 bg-white/5 text-slate-300"}`}
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
                Open tool
                <span aria-hidden="true">→</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-1">
        {tools.filter((tool) => tool.id === activeTool).map((tool) => (
          <div key={tool.id} className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">{tool.badge}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">{tool.description}</p>
            <div className="mt-5">
              {tool.id === "resume" && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(resumeData).slice(0, 4).map(([key, value]) => (
                      <label key={key} className="text-sm text-slate-300">
                        <span className="mb-2 block capitalize text-slate-400">{key}</span>
                        <input value={value} onChange={(e) => setResumeData((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                      </label>
                    ))}
                  </div>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Summary</span>
                    <textarea value={resumeData.summary} onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))} rows="3" className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Experience</span>
                    <textarea value={resumeData.experience} onChange={(e) => setResumeData((prev) => ({ ...prev, experience: e.target.value }))} rows="3" className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Upload profile photo</span>
                    <input type="file" accept="image/*" onChange={handleResumePhotoUpload} className="w-full text-sm text-slate-400" />
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
                    <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Profile</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{resumeData.summary}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Skills</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{resumeData.skills}</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Experience</h4>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{resumeData.experience}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{resumeStatus}</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleResumePdfDownload} className="btn-primary">Download PDF CV</button>
                    <button onClick={() => copyToClipboard(resumePreview)} className="btn-secondary">Copy text</button>
                  </div>
                </div>
              )}

              {tool.id === "background-remover" && (
                <div className="space-y-4">
                  <input type="file" accept="image/*" onChange={handleBackgroundImageUpload} className="w-full text-sm text-slate-400" />
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Background color</span>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full rounded-2xl border border-white/10 bg-[#131025] p-1" />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Tolerance: {bgTolerance}</span>
                    <input type="range" min="1" max="100" value={bgTolerance} onChange={(e) => setBgTolerance(e.target.value)} className="w-full" />
                  </label>
                  <button onClick={removeBackground} className="btn-primary">Remove background</button>
                  <p className="text-sm text-slate-400">{bgStatus}</p>
                  {bgImagePreview && <img src={bgImagePreview} alt="Upload preview" className="w-full rounded-2xl border border-white/10" />}
                  {bgRemovedImage && <img src={bgRemovedImage} alt="Background removed" className="w-full rounded-2xl border border-white/10" />}
                  {bgRemovedImage && <button onClick={() => downloadUrl(bgRemovedImage, "background-removed.png")} className="btn-secondary">Download PNG</button>}
                </div>
              )}

              {tool.id === "image-compressor" && (
                <div className="space-y-4">
                  <input type="file" accept="image/*" onChange={handleCompressUpload} className="w-full text-sm text-slate-400" />
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Maximum width: {compressWidth}px</span>
                    <input type="range" min="400" max="2000" step="50" value={compressWidth} onChange={(e) => setCompressWidth(e.target.value)} className="w-full" />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Quality: {compressQuality}</span>
                    <input type="range" min="0.2" max="1" step="0.1" value={compressQuality} onChange={(e) => setCompressQuality(e.target.value)} className="w-full" />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Output format</span>
                    <select value={compressFormat} onChange={(e) => setCompressFormat(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                    </select>
                  </label>
                  <button onClick={compressImage} className="btn-primary">Compress image</button>
                  <p className="text-sm text-slate-400">{compressStatus}</p>
                  {compressPreview && <img src={compressPreview} alt="Original" className="w-full rounded-2xl border border-white/10" />}
                  {compressedImage && <img src={compressedImage} alt="Compressed" className="w-full rounded-2xl border border-white/10" />}
                  {compressedImage && <button onClick={() => downloadUrl(compressedImage, "compressed-image" + (compressFormat === "png" ? ".png" : ".jpg"))} className="btn-secondary">Download</button>}
                </div>
              )}

              {tool.id === "gradient-generator" && (
                <div className="space-y-4">
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Type</span>
                    <select value={gradientType} onChange={(e) => setGradientType(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Angle: {gradientAngle}°</span>
                    <input type="range" min="0" max="360" value={gradientAngle} onChange={(e) => setGradientAngle(e.target.value)} className="w-full" />
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Color A</span>
                      <input type="color" value={gradientA} onChange={(e) => setGradientA(e.target.value)} className="h-10 w-full rounded-2xl border border-white/10 bg-[#131025] p-1" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Color B</span>
                      <input type="color" value={gradientB} onChange={(e) => setGradientB(e.target.value)} className="h-10 w-full rounded-2xl border border-white/10 bg-[#131025] p-1" />
                    </label>
                  </div>
                  <div className="h-36 rounded-3xl border border-white/10" style={{ background: gradientType === "radial" ? `radial-gradient(circle, ${gradientA}, ${gradientB})` : `linear-gradient(${gradientAngle}deg, ${gradientA}, ${gradientB})` }} />
                  <pre className="rounded-2xl border border-white/10 bg-[#131025] p-4 text-sm text-slate-300">{gradientCss}</pre>
                  <button onClick={() => copyToClipboard(gradientCss)} className="btn-secondary">Copy CSS</button>
                </div>
              )}

              {tool.id === "shadow-generator" && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">X: {shadowX}px</span>
                      <input type="range" min="-50" max="50" value={shadowX} onChange={(e) => setShadowX(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Y: {shadowY}px</span>
                      <input type="range" min="-50" max="50" value={shadowY} onChange={(e) => setShadowY(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Blur: {shadowBlur}px</span>
                      <input type="range" min="0" max="60" value={shadowBlur} onChange={(e) => setShadowBlur(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Spread: {shadowSpread}px</span>
                      <input type="range" min="-20" max="30" value={shadowSpread} onChange={(e) => setShadowSpread(e.target.value)} className="w-full" />
                    </label>
                  </div>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Color</span>
                    <input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="h-10 w-full rounded-2xl border border-white/10 bg-[#131025] p-1" />
                  </label>
                  <label className="text-sm text-slate-300 flex items-center gap-2">
                    <input type="checkbox" checked={shadowInset} onChange={(e) => setShadowInset(e.target.checked)} />
                    Inset
                  </label>
                  <div className="flex h-36 items-center justify-center rounded-3xl border border-white/10 bg-white/10" style={{ boxShadow: `${shadowInset ? "inset " : ""}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}` }}>
                    <div className="h-16 w-24 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400" />
                  </div>
                  <pre className="rounded-2xl border border-white/10 bg-[#131025] p-4 text-sm text-slate-300">{shadowCss}</pre>
                  <button onClick={() => copyToClipboard(shadowCss)} className="btn-secondary">Copy CSS</button>
                </div>
              )}

              {tool.id === "flexbox-playground" && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Direction</span>
                      <select value={flexDirection} onChange={(e) => setFlexDirection(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="row">Row</option>
                        <option value="column">Column</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Justify</span>
                      <select value={justifyContent} onChange={(e) => setJustifyContent(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                        <option value="space-between">Space between</option>
                        <option value="space-around">Space around</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Align</span>
                      <select value={alignItems} onChange={(e) => setAlignItems(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="flex-start">Start</option>
                        <option value="center">Center</option>
                        <option value="flex-end">End</option>
                      </select>
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Wrap</span>
                      <select value={flexWrap} onChange={(e) => setFlexWrap(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                        <option value="nowrap">No wrap</option>
                        <option value="wrap">Wrap</option>
                        <option value="wrap-reverse">Wrap reverse</option>
                      </select>
                    </label>
                  </div>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Gap: {flexGap}px</span>
                    <input type="range" min="0" max="40" value={flexGap} onChange={(e) => setFlexGap(e.target.value)} className="w-full" />
                  </label>
                  <div className="h-48 rounded-3xl border border-white/10 bg-[#0f172a] p-4" style={{ display: "flex", flexDirection, justifyContent, alignItems, flexWrap, gap: `${flexGap}px` }}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-14 w-14 rounded-2xl border border-purple-400/40 bg-purple-500/20" />
                    ))}
                  </div>
                  <pre className="rounded-2xl border border-white/10 bg-[#131025] p-4 text-sm text-slate-300">{`display: flex; flex-direction: ${flexDirection}; justify-content: ${justifyContent}; align-items: ${alignItems}; flex-wrap: ${flexWrap}; gap: ${flexGap}px;`}</pre>
                </div>
              )}

              {tool.id === "jwt-decoder" && (
                <div className="space-y-4">
                  <input value={jwtInput} onChange={(e) => setJwtInput(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" placeholder="Paste a JWT token" />
                  <button onClick={decodeJwt} className="btn-primary">Decode token</button>
                  {jwtHeader && <div><p className="mb-2 text-sm text-slate-400">Header</p><pre className="rounded-2xl border border-white/10 bg-[#131025] p-4 text-sm text-slate-300">{jwtHeader}</pre></div>}
                  {jwtPayload && <div><p className="mb-2 text-sm text-slate-400">Payload</p><pre className="rounded-2xl border border-white/10 bg-[#131025] p-4 text-sm text-slate-300">{jwtPayload}</pre></div>}
                </div>
              )}

              {tool.id === "regex-tester" && (
                <div className="space-y-4">
                  <input value={regexPattern} onChange={(e) => setRegexPattern(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" placeholder="Regex pattern" />
                  <input value={regexFlags} onChange={(e) => setRegexFlags(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" placeholder="Flags" />
                  <textarea value={regexText} onChange={(e) => setRegexText(e.target.value)} rows="6" className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    <p className="mb-2">Matches: {regexMatches.length}</p>
                    {regexMatches.length ? regexMatches.map((match, index) => <p key={`${match.value}-${index}`}>• {match.value}</p>) : <p>No matches found.</p>}
                  </div>
                </div>
              )}

              {tool.id === "word-counter" && (
                <div className="space-y-4">
                  <textarea value={wordText} onChange={(e) => setWordText(e.target.value)} rows="8" className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Words: {wordStats.words}</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Characters: {wordStats.chars}</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Characters without spaces: {wordStats.charsNoSpace}</div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Reading time: {wordStats.readingTime} min</div>
                  </div>
                  <button onClick={() => downloadTextFile(`Words: ${wordStats.words}\nCharacters: ${wordStats.chars}\nChars without spaces: ${wordStats.charsNoSpace}\nReading time: ${wordStats.readingTime} min\n\n${wordText}`, "word-count-report.txt")} className="btn-secondary">Download report</button>
                </div>
              )}

              {tool.id === "image-cropper" && (
                <div className="space-y-4">
                  <input type="file" accept="image/*" onChange={handleCropUpload} className="w-full text-sm text-slate-400" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Width: {cropWidth}px</span>
                      <input type="range" min="200" max="1200" step="50" value={cropWidth} onChange={(e) => setCropWidth(e.target.value)} className="w-full" />
                    </label>
                    <label className="text-sm text-slate-300">
                      <span className="mb-2 block">Height: {cropHeight}px</span>
                      <input type="range" min="200" max="800" step="50" value={cropHeight} onChange={(e) => setCropHeight(e.target.value)} className="w-full" />
                    </label>
                  </div>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Crop anchor</span>
                    <select value={cropMode} onChange={(e) => setCropMode(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none">
                      <option value="center">Center</option>
                      <option value="top-left">Top Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </label>
                  <button onClick={cropImage} className="btn-primary">Crop image</button>
                  <p className="text-sm text-slate-400">{cropStatus}</p>
                  {cropImagePreview && <img src={cropImagePreview} alt="Cropped preview" className="w-full rounded-2xl border border-white/10" />}
                  {cropImagePreview && <button onClick={() => downloadUrl(cropImagePreview, "cropped-image.jpg")} className="btn-secondary">Download</button>}
                </div>
              )}

              {tool.id === "qr-generator" && (
                <div className="space-y-4">
                  <input value={qrText} onChange={(e) => setQrText(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" placeholder="Enter text or URL" />
                  {qrImage && <img src={qrImage} alt="Generated QR" className="mx-auto h-48 w-48 rounded-2xl bg-white p-4" />}
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => copyToClipboard(qrText)} className="btn-secondary">Copy text</button>
                    {qrImage && <button onClick={() => downloadUrl(qrImage, "qr-code.png")} className="btn-primary">Download QR</button>}
                  </div>
                </div>
              )}

              {tool.id === "password-generator" && (
                <div className="space-y-4">
                  <button onClick={generatePassword} className="btn-primary">Generate password</button>
                  <input value={password} readOnly className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                  {password && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      <p>Strength: {passwordStrength.label}</p>
                      <p className="mt-2 text-slate-400">Length {password.length} • Uppercase • Numbers • Symbols</p>
                    </div>
                  )}
                  {password && <button onClick={() => copyToClipboard(password)} className="btn-secondary">Copy password</button>}
                </div>
              )}

              {tool.id === "json-formatter" && (
                <div className="space-y-4">
                  <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows="8" className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                  <div className="flex flex-wrap gap-3">
                    <button onClick={formatJson} className="btn-primary">Format JSON</button>
                    <button onClick={() => downloadTextFile(jsonInput, "formatted.json")} className="btn-secondary">Download JSON</button>
                  </div>
                  <p className="text-sm text-slate-400">{jsonStatus}</p>
                </div>
              )}

              {tool.id === "markdown-preview" && (
                <div className="space-y-4">
                  <textarea value={markdownInput} onChange={(e) => setMarkdownInput(e.target.value)} rows="8" className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" />
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: markdownHtml }} />
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => copyToClipboard(markdownInput)} className="btn-secondary">Copy markdown</button>
                    <button onClick={() => downloadTextFile(markdownInput, "document.md")} className="btn-primary">Download markdown</button>
                  </div>
                </div>
              )}

              {tool.id === "todo" && (
                <div className="space-y-4">
                  <form onSubmit={addTodo} className="flex flex-col gap-3 sm:flex-row">
                    <input value={todoInput} onChange={(e) => setTodoInput(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#131025] px-3 py-2 text-white outline-none" placeholder="Add a task" />
                    <button type="submit" className="btn-primary">Add task</button>
                  </form>
                  <ul className="space-y-3">
                    {todos.map((todo, index) => (
                      <li key={`${todo.text}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300">
                        <button onClick={() => toggleTodo(index)} className={`text-left ${todo.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                          {todo.text}
                        </button>
                        <button onClick={() => removeTodo(index)} className="text-sm text-purple-300 hover:text-white">Remove</button>
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

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((part) => part + part).join("") : normalized;
  const intValue = Number.parseInt(value, 16);
  return [intValue >> 16, (intValue >> 8) & 255, intValue & 255];
}

export default FreeTools;
