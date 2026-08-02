import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { TOOLS } from "../data/toolsData";

// Utility Functions
const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((p) => p + p).join("") : normalized;
  const intValue = Number.parseInt(value, 16) || 0;
  return [(intValue >> 16) & 255, (intValue >> 8) & 255, intValue & 255];
};

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function ToolDetailPage() {
  const { toolId } = useParams();
  const tool = TOOLS.find((t) => t.id === toolId);

  // ----------------------------------------------------
  // 1. AI RESUME / CV MAKER STATES
  // ----------------------------------------------------
  const [resumeData, setResumeData] = useState({
    name: "Alex Morgan",
    role: "Senior Full-Stack Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    website: "https://alexmorgan.dev",
    summary: "Versatile Full-Stack Engineer with 6+ years of experience building high-performance web applications, scalable APIs, and modern user interfaces. Dedicated to clean architecture and user-centric design.",
    experience: [
      {
        id: "exp-1",
        title: "Senior Frontend Engineer",
        company: "TechNova Systems",
        period: "2023 - Present",
        details: "Architected modern micro-frontend architecture using React and Vite. Improved application load times by 42% and mentored 5 junior engineers."
      },
      {
        id: "exp-2",
        title: "Full-Stack Developer",
        company: "Apex Digital Solutions",
        period: "2020 - 2023",
        details: "Developed REST and GraphQL APIs with Node.js & Laravel. Engineered responsive interfaces serving over 200,000 active monthly users."
      }
    ],
    education: [
      {
        id: "edu-1",
        degree: "B.S. in Computer Science",
        institution: "University of California, Berkeley",
        period: "2016 - 2020",
        details: "Graduated with Honors. Focused on Distributed Systems, Software Engineering, and Database Design."
      }
    ],
    projects: [
      {
        id: "proj-1",
        name: "CloudFlow Dashboard",
        link: "github.com/alex/cloudflow",
        description: "Real-time infrastructure monitoring platform built with React, Tailwind CSS, and WebSocket integration."
      }
    ],
    skills: "React, TypeScript, Node.js, Express, Tailwind CSS, Next.js, PostgreSQL, Docker, Git, REST APIs, GraphQL"
  });
  const [resumePhoto, setResumePhoto] = useState("");
  const [resumeStatus, setResumeStatus] = useState("Fill in your details and click Export PDF CV.");

  // Resume State Handlers
  const handleExpChange = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: `exp-${Date.now()}`, title: "", company: "", period: "", details: "" }
      ]
    }));
  };

  const removeExperience = (id) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id)
    }));
  };

  const handleEduChange = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: `edu-${Date.now()}`, degree: "", institution: "", period: "", details: "" }
      ]
    }));
  };

  const removeEducation = (id) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id)
    }));
  };

  const handleProjChange = (id, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    }));
  };

  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: `proj-${Date.now()}`, name: "", link: "", description: "" }
      ]
    }));
  };

  const removeProject = (id) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id)
    }));
  };

  const exportResumePDF = async () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = 40;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 130, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(resumeData.name || "Your Name", margin, 45);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(192, 132, 252); // purple-400
      doc.text(resumeData.role || "Professional Title", margin, 65);

      doc.setTextColor(226, 232, 240);
      doc.setFontSize(9.5);
      const contactInfo = [resumeData.email, resumeData.phone, resumeData.location, resumeData.website].filter(Boolean).join("  |  ");
      doc.text(contactInfo, margin, 85);

      // Render Photo if uploaded
      if (resumePhoto) {
        try {
          const photoType = resumePhoto.startsWith("data:image/png") ? "PNG" : "JPEG";
          doc.addImage(resumePhoto, photoType, pageWidth - margin - 70, 25, 70, 80);
        } catch (err) {
          console.error("Photo render error:", err);
        }
      }

      y = 155;

      const renderSectionHeading = (title) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);
        doc.text(title.toUpperCase(), margin, y);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(1);
        doc.line(margin, y + 4, pageWidth - margin, y + 4);
        y += 18;
      };

      // Summary
      if (resumeData.summary) {
        renderSectionHeading("Professional Summary");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const sumLines = doc.splitTextToSize(resumeData.summary, contentWidth);
        doc.text(sumLines, margin, y);
        y += sumLines.length * 13 + 12;
      }

      // Experience
      if (resumeData.experience.length > 0) {
        renderSectionHeading("Work Experience");
        resumeData.experience.forEach((exp) => {
          if (y > pageHeight - 60) { doc.addPage(); y = 40; }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
          doc.text(exp.title || "Job Title", margin, y);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(100, 116, 139);
          doc.text(exp.period || "", pageWidth - margin, y, { align: "right" });

          y += 13;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9.5);
          doc.setTextColor(71, 85, 105);
          doc.text(exp.company || "Company", margin, y);

          y += 12;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          const expLines = doc.splitTextToSize(exp.details || "", contentWidth);
          doc.text(expLines, margin, y);
          y += expLines.length * 12 + 10;
        });
      }

      // Education
      if (resumeData.education.length > 0) {
        if (y > pageHeight - 80) { doc.addPage(); y = 40; }
        renderSectionHeading("Education");
        resumeData.education.forEach((edu) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(edu.degree || "Degree", margin, y);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(edu.period || "", pageWidth - margin, y, { align: "right" });

          y += 12;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(71, 85, 105);
          doc.text(edu.institution || "Institution", margin, y);

          if (edu.details) {
            y += 11;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85);
            const eduLines = doc.splitTextToSize(edu.details, contentWidth);
            doc.text(eduLines, margin, y);
            y += eduLines.length * 11;
          }
          y += 10;
        });
      }

      // Projects
      if (resumeData.projects.length > 0) {
        if (y > pageHeight - 80) { doc.addPage(); y = 40; }
        renderSectionHeading("Projects");
        resumeData.projects.forEach((proj) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(proj.name || "Project Name", margin, y);

          if (proj.link) {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(124, 58, 237);
            doc.text(proj.link, pageWidth - margin, y, { align: "right" });
          }

          y += 12;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          const projLines = doc.splitTextToSize(proj.description || "", contentWidth);
          doc.text(projLines, margin, y);
          y += projLines.length * 11 + 8;
        });
      }

      // Skills
      if (resumeData.skills) {
        if (y > pageHeight - 60) { doc.addPage(); y = 40; }
        renderSectionHeading("Skills & Expertise");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const skillLines = doc.splitTextToSize(resumeData.skills, contentWidth);
        doc.text(skillLines, margin, y);
      }

      doc.save(`${(resumeData.name || "Resume").toLowerCase().replace(/\s+/g, "-")}-cv.pdf`);
      setResumeStatus("PDF CV successfully generated and downloaded!");
    } catch (error) {
      console.error(error);
      setResumeStatus("Failed to generate PDF. Please try again.");
    }
  };

  // ----------------------------------------------------
  // 2. BACKGROUND REMOVER STATES & HANDLERS
  // ----------------------------------------------------
  const [bgImageSrc, setBgImageSrc] = useState("");
  const [bgResultSrc, setBgResultSrc] = useState("");
  const [bgTargetColor, setBgTargetColor] = useState("#ffffff");
  const [bgTolerance, setBgTolerance] = useState(35);
  const [bgFillType, setBgFillType] = useState("transparent"); // "transparent" | "color"
  const [bgReplaceColor, setBgReplaceColor] = useState("#000000");
  const [bgStatus, setBgStatus] = useState("Upload an image to remove background.");

  const processBackgroundRemoval = () => {
    if (!bgImageSrc) return;
    setBgStatus("Processing image pixels...");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const [tr, tg, tb] = hexToRgb(bgTargetColor);
      const [rr, rg, rb] = hexToRgb(bgReplaceColor);
      const tol = Number(bgTolerance) * 2.55;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);
        if (dist <= tol) {
          if (bgFillType === "transparent") {
            data[i + 3] = 0; // Alpha 0
          } else {
            data[i] = rr;
            data[i + 1] = rg;
            data[i + 2] = rb;
            data[i + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setBgResultSrc(canvas.toDataURL("image/png"));
      setBgStatus("Background removal complete!");
    };
    img.src = bgImageSrc;
  };

  // ----------------------------------------------------
  // 3. IMAGE COMPRESSOR STATES & HANDLERS
  // ----------------------------------------------------
  const [compOriginalSrc, setCompOriginalSrc] = useState("");
  const [compResultSrc, setCompResultSrc] = useState("");
  const [compOriginalSize, setCompOriginalSize] = useState(0);
  const [compResultSize, setCompResultSize] = useState(0);
  const [compQuality, setCompQuality] = useState(0.75);
  const [compMaxWidth, setCompMaxWidth] = useState(1200);
  const [compFormat, setCompFormat] = useState("image/jpeg");
  const [compStatus, setCompStatus] = useState("Upload an image to start compression.");

  const handleCompressImage = () => {
    if (!compOriginalSrc) return;
    setCompStatus("Compressing image...");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > compMaxWidth) {
        height = Math.round((height * compMaxWidth) / width);
        width = compMaxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          if (compResultSrc) URL.revokeObjectURL(compResultSrc);
          const url = URL.createObjectURL(blob);
          setCompResultSrc(url);
          setCompResultSize(blob.size);
          const savedPct = (((compOriginalSize - blob.size) / compOriginalSize) * 100).toFixed(1);
          setCompStatus(`Done! Reduced size by ${savedPct > 0 ? savedPct : 0}%.`);
        },
        compFormat,
        Number(compQuality)
      );
    };
    img.src = compOriginalSrc;
  };

  // ----------------------------------------------------
  // 4. GRADIENT GENERATOR STATES & HANDLERS
  // ----------------------------------------------------
  const [gradType, setGradType] = useState("linear");
  const [gradAngle, setGradAngle] = useState(135);
  const [gradStops, setGradStops] = useState([
    { id: 1, color: "#8b5cf6", stop: 0 },
    { id: 2, color: "#06b6d4", stop: 100 }
  ]);

  const addGradStop = () => {
    if (gradStops.length >= 4) return;
    setGradStops((prev) => [
      ...prev,
      { id: Date.now(), color: "#ec4899", stop: 50 }
    ]);
  };

  const removeGradStop = (id) => {
    if (gradStops.length <= 2) return;
    setGradStops((prev) => prev.filter((s) => s.id !== id));
  };

  const updateGradStop = (id, field, val) => {
    setGradStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const gradientCss = useMemo(() => {
    const sorted = [...gradStops].sort((a, b) => a.stop - b.stop);
    const stopString = sorted.map((s) => `${s.color} ${s.stop}%`).join(", ");
    return gradType === "linear"
      ? `linear-gradient(${gradAngle}deg, ${stopString})`
      : `radial-gradient(circle at center, ${stopString})`;
  }, [gradType, gradAngle, gradStops]);

  // ----------------------------------------------------
  // 5. BOX SHADOW GENERATOR STATES
  // ----------------------------------------------------
  const [shX, setShX] = useState(0);
  const [shY, setShY] = useState(20);
  const [shBlur, setShBlur] = useState(35);
  const [shSpread, setShSpread] = useState(-5);
  const [shColor, setShColor] = useState("#0f172a");
  const [shOpacity, setShOpacity] = useState(0.4);
  const [shInset, setShInset] = useState(false);

  const shadowCssValue = useMemo(() => {
    const [r, g, b] = hexToRgb(shColor);
    const rgba = `rgba(${r}, ${g}, ${b}, ${shOpacity})`;
    return `${shInset ? "inset " : ""}${shX}px ${shY}px ${shBlur}px ${shSpread}px ${rgba}`;
  }, [shX, shY, shBlur, shSpread, shColor, shOpacity, shInset]);

  // ----------------------------------------------------
  // 6. FLEXBOX PLAYGROUND STATES
  // ----------------------------------------------------
  const [flexDir, setFlexDir] = useState("row");
  const [flexJustify, setFlexJustify] = useState("center");
  const [flexAlign, setFlexAlign] = useState("center");
  const [flexWrapVal, setFlexWrapVal] = useState("wrap");
  const [flexGapVal, setFlexGapVal] = useState(16);
  const [flexItemCount, setFlexItemCount] = useState(4);

  // ----------------------------------------------------
  // 7. JWT DECODER STATES
  // ----------------------------------------------------
  const [jwtInput, setJwtInput] = useState("");
  const [jwtHeader, setJwtHeader] = useState(null);
  const [jwtPayload, setJwtPayload] = useState(null);
  const [jwtError, setJwtError] = useState("");

  const decodeJwtToken = () => {
    setJwtError("");
    setJwtHeader(null);
    setJwtPayload(null);
    if (!jwtInput.trim()) return;

    const parts = jwtInput.trim().split(".");
    if (parts.length !== 3) {
      setJwtError("Invalid JWT structure. A valid JWT consists of 3 dot-separated parts.");
      return;
    }

    try {
      const base64UrlDecode = (str) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) base64 += "=";
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      };

      const headerObj = JSON.parse(base64UrlDecode(parts[0]));
      const payloadObj = JSON.parse(base64UrlDecode(parts[1]));

      setJwtHeader(headerObj);
      setJwtPayload(payloadObj);
    } catch (err) {
      setJwtError("Failed to decode token JSON: " + err.message);
    }
  };

  // ----------------------------------------------------
  // 8. REGEX TESTER STATES
  // ----------------------------------------------------
  const [regexPattern, setRegexPattern] = useState("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})");
  const [regexFlags, setRegexFlags] = useState({ g: true, i: true, m: false, s: false });
  const [regexText, setRegexText] = useState("Contact us at support@example.com or sales.dept@company.org for assistance.");
  const [regexReplaceText, setRegexReplaceText] = useState("[REDACTED EMAIL]");

  const flagString = useMemo(() => {
    return Object.keys(regexFlags).filter((f) => regexFlags[f]).join("");
  }, [regexFlags]);

  const regexResults = useMemo(() => {
    if (!regexPattern) return { matches: [], replaced: regexText, error: "" };
    try {
      const re = new RegExp(regexPattern, flagString);
      const matches = [];
      let match;

      if (flagString.includes("g")) {
        while ((match = re.exec(regexText)) !== null) {
          matches.push({ index: match.index, value: match[0], groups: match.slice(1) });
          if (match.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        match = re.exec(regexText);
        if (match) matches.push({ index: match.index, value: match[0], groups: match.slice(1) });
      }

      const replaced = regexText.replace(re, regexReplaceText);
      return { matches, replaced, error: "" };
    } catch (e) {
      return { matches: [], replaced: "", error: e.message };
    }
  }, [regexPattern, flagString, regexText, regexReplaceText]);

  // ----------------------------------------------------
  // 9. WORD COUNTER STATES
  // ----------------------------------------------------
  const [wordText, setWordText] = useState("The quick brown fox jumps over the lazy dog. Continuous learning and practice are essential for modern software craftsmanship!");

  const wordMetrics = useMemo(() => {
    const text = wordText;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0;
    const readTime = Math.ceil(words / 200);
    const speakTime = Math.ceil(words / 130);

    // Keyword Frequency
    const freqMap = {};
    const cleanWords = text.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
    cleanWords.forEach((w) => {
      if (w.length > 2) freqMap[w] = (freqMap[w] || 0) + 1;
    });

    const topKeywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { chars, charsNoSpace, words, sentences, paragraphs, readTime, speakTime, topKeywords };
  }, [wordText]);

  // ----------------------------------------------------
  // 10. IMAGE CROPPER STATES & HANDLERS
  // ----------------------------------------------------
  const [cropSrc, setCropSrc] = useState("");
  const [cropResult, setCropResult] = useState("");
  const [cropAspect, setCropAspect] = useState("1:1"); // "1:1" | "16:9" | "4:3" | "free"
  const [cropWidth, setCropWidth] = useState(400);
  const [cropHeight, setCropHeight] = useState(400);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropStatus, setCropStatus] = useState("Upload an image to crop.");

  const processCropImage = () => {
    if (!cropSrc) return;
    setCropStatus("Cropping image...");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Number(cropWidth);
      canvas.height = Number(cropHeight);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scaledW = img.width * cropZoom;
      const scaledH = img.height * cropZoom;
      const startX = (canvas.width - scaledW) / 2;
      const startY = (canvas.height - scaledH) / 2;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, startX, startY, scaledW, scaledH);

      setCropResult(canvas.toDataURL("image/png"));
      setCropStatus("Crop complete!");
    };
    img.src = cropSrc;
  };

  // ----------------------------------------------------
  // 11. QR CODE GENERATOR STATES & HANDLERS
  // ----------------------------------------------------
  const [qrText, setQrText] = useState("https://portfolio.example.com");
  const [qrFgColor, setQrFgColor] = useState("#0f172a");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (!qrText.trim()) { setQrDataUrl(""); return; }
    QRCode.toDataURL(qrText, {
      width: 320,
      margin: 2,
      color: { dark: qrFgColor, light: qrBgColor }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [qrText, qrFgColor, qrBgColor]);

  // ----------------------------------------------------
  // 12. PASSWORD GENERATOR STATES
  // ----------------------------------------------------
  const [pwdLength, setPwdLength] = useState(16);
  const [pwdUpper, setPwdUpper] = useState(true);
  const [pwdLower, setPwdLower] = useState(true);
  const [pwdNum, setPwdNum] = useState(true);
  const [pwdSym, setPwdSym] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const generatePassword = useCallback(() => {
    let chars = "";
    if (pwdUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (pwdLower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (pwdNum) chars += "0123456789";
    if (pwdSym) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!chars) {
      setGeneratedPassword("");
      return;
    }

    let result = "";
    const arr = new Uint32Array(pwdLength);
    window.crypto.getRandomValues(arr);
    for (let i = 0; i < pwdLength; i++) {
      result += chars[arr[i] % chars.length];
    }
    setGeneratedPassword(result);
  }, [pwdLength, pwdUpper, pwdLower, pwdNum, pwdSym]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // ----------------------------------------------------
  // 13. JSON FORMATTER STATES
  // ----------------------------------------------------
  const [jsonInput, setJsonInput] = useState('{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "user": "Alex",\n    "roles": ["admin", "developer"]\n  }\n}');
  const [jsonStatus, setJsonStatus] = useState("Valid JSON Structure");
  const [jsonIsError, setJsonIsError] = useState(false);

  const formatJson = (indent = 2) => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, indent));
      setJsonStatus("Valid JSON Formatted");
      setJsonIsError(false);
    } catch (e) {
      setJsonStatus("Error: " + e.message);
      setJsonIsError(true);
    }
  };

  const minifyJson = () => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setJsonStatus("JSON Minified Successfully");
      setJsonIsError(false);
    } catch (e) {
      setJsonStatus("Error: " + e.message);
      setJsonIsError(true);
    }
  };

  // ----------------------------------------------------
  // 14. MARKDOWN PREVIEW STATES
  // ----------------------------------------------------
  const [mdInput, setMdInput] = useState(`# Welcome to Markdown Editor\n\nBuild rich documentation with **bold text**, *italics*, and inline \`code\`.\n\n### Key Features:\n- Live Side-by-side Preview\n- Fast Client-side Parsing\n- Formatted Headers & Lists\n\n\`\`\`javascript\nconst greet = (name) => {\n  console.log(\`Hello, \${name}!\`);\n};\ngreet("Developer");\n\`\`\``);

  const parsedMarkdownHtml = useMemo(() => {
    const lines = mdInput.split("\n");
    let inCode = false;
    let html = [];

    lines.forEach((line) => {
      if (line.startsWith("```")) {
        inCode = !inCode;
        html.push(inCode ? "<pre class='bg-slate-900 text-purple-300 p-4 rounded-xl text-sm overflow-x-auto my-2 font-mono'><code>" : "</code></pre>");
        return;
      }
      if (inCode) {
        html.push(line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\n");
        return;
      }

      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code class='bg-slate-800 text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono'>$1</code>");

      if (/^#{3}\s/.test(line)) {
        html.push(`<h3 class="text-lg font-bold text-white mt-4 mb-2">${formatted.replace(/^#{3}\s/, "")}</h3>`);
      } else if (/^#{2}\s/.test(line)) {
        html.push(`<h2 class="text-xl font-bold text-white mt-5 mb-2">${formatted.replace(/^#{2}\s/, "")}</h2>`);
      } else if (/^#{1}\s/.test(line)) {
        html.push(`<h1 class="text-2xl font-extrabold text-white mt-6 mb-3 border-b border-slate-700 pb-2">${formatted.replace(/^#{1}\s/, "")}</h1>`);
      } else if (/^-\s/.test(line)) {
        html.push(`<li class="ml-5 list-disc text-slate-300 my-1">${formatted.replace(/^-\s/, "")}</li>`);
      } else if (line.trim() === "") {
        html.push("<div class='h-2'></div>");
      } else {
        html.push(`<p class="text-slate-300 my-1 leading-relaxed">${formatted}</p>`);
      }
    });

    return html.join("");
  }, [mdInput]);

  // ----------------------------------------------------
  // 15. TODO APP STATES
  // ----------------------------------------------------
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("free_tools_todo_list");
      return saved
        ? JSON.parse(saved)
        : [
            { id: 1, text: "Design modern landing page hero section", priority: "High", completed: true },
            { id: 2, text: "Integrate client-side PDF CV generator", priority: "Medium", completed: false },
            { id: 3, text: "Optimize bundle size for production release", priority: "Low", completed: false }
          ];
    } catch {
      return [];
    }
  });
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("Medium");
  const [todoFilter, setTodoFilter] = useState("all"); // "all" | "active" | "completed"

  useEffect(() => {
    localStorage.setItem("free_tools_todo_list", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: newTodoText.trim(), priority: newTodoPriority, completed: false }
    ]);
    setNewTodoText("");
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = useMemo(() => {
    if (todoFilter === "active") return todos.filter((t) => !t.completed);
    if (todoFilter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, todoFilter]);

  // General Helpers
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch {
      alert("Copy failed.");
    }
  };

  const downloadDataUrl = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!tool) {
    return (
      <div className="min-h-screen bg-[#050811] text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold">Tool Not Found</h2>
        <p className="text-slate-400 mt-2">The requested utility does not exist in the collection.</p>
        <Link className="mt-6 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition" to="/free-tools">
          ← Back to All Tools
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans px-[5vw] py-10 md:px-[8vw] lg:px-[14vw]">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <Link className="inline-flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 transition" to="/free-tools">
          ← Back to All Tools
        </Link>
        <span className="text-xs font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
          100% Client-Side Workflow
        </span>
      </div>

      {/* Main Container */}
      <div className="rounded-3xl border border-white/10 bg-[#0b0f19] p-6 md:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white">{tool.title}</h1>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-medium text-purple-300">
                {tool.badge}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">{tool.description}</p>
          </div>
        </div>

        {/* ----------------------------------------------------
            1. AI RESUME / CV MAKER TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "resume" && (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  value={resumeData.name}
                  onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2.5 text-sm text-white focus:border-purple-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Professional Title</label>
                <input
                  value={resumeData.role}
                  onChange={(e) => setResumeData({ ...resumeData, role: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2.5 text-sm text-white focus:border-purple-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  value={resumeData.email}
                  onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2.5 text-sm text-white focus:border-purple-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                <input
                  value={resumeData.phone}
                  onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2.5 text-sm text-white focus:border-purple-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
                <input
                  value={resumeData.location}
                  onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2.5 text-sm text-white focus:border-purple-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Website / Portfolio</label>
                <input
                  value={resumeData.website}
                  onChange={(e) => setResumeData({ ...resumeData, website: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2.5 text-sm text-white focus:border-purple-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Professional Summary</label>
              <textarea
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-[#131025] p-3 text-sm text-white focus:border-purple-400 outline-none"
              />
            </div>

            {/* Experience Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Work Experience</h3>
                <button onClick={addExperience} className="text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg transition">
                  + Add Position
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => handleExpChange(exp.id, "title", e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#131025] px-3 py-1.5 text-sm text-white outline-none"
                      />
                      <input
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => handleExpChange(exp.id, "company", e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#131025] px-3 py-1.5 text-sm text-white outline-none"
                      />
                      <input
                        placeholder="Period (e.g. 2021 - Present)"
                        value={exp.period}
                        onChange={(e) => handleExpChange(exp.id, "period", e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#131025] px-3 py-1.5 text-sm text-white outline-none"
                      />
                    </div>
                    <textarea
                      placeholder="Key accomplishments and responsibilities..."
                      value={exp.details}
                      onChange={(e) => handleExpChange(exp.id, "details", e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-white/10 bg-[#131025] p-2.5 text-sm text-white outline-none"
                    />
                    <div className="flex justify-end">
                      <button onClick={() => removeExperience(exp.id)} className="text-xs text-red-400 hover:underline">
                        Remove Position
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white">Education</h3>
                <button onClick={addEducation} className="text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg transition">
                  + Add Education
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-2xl border border-white/10 bg-slate-900/50 space-y-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        placeholder="Degree / Certificate"
                        value={edu.degree}
                        onChange={(e) => handleEduChange(edu.id, "degree", e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#131025] px-3 py-1.5 text-sm text-white outline-none"
                      />
                      <input
                        placeholder="Institution"
                        value={edu.institution}
                        onChange={(e) => handleEduChange(edu.id, "institution", e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#131025] px-3 py-1.5 text-sm text-white outline-none"
                      />
                      <input
                        placeholder="Year / Period"
                        value={edu.period}
                        onChange={(e) => handleEduChange(edu.id, "period", e.target.value)}
                        className="rounded-xl border border-white/10 bg-[#131025] px-3 py-1.5 text-sm text-white outline-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button onClick={() => removeEducation(edu.id)} className="text-xs text-red-400 hover:underline">
                        Remove Education
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects & Skills */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white">Featured Projects</h3>
                  <button onClick={addProject} className="text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg transition">
                    + Add Project
                  </button>
                </div>
                <div className="space-y-3">
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="p-3 rounded-2xl border border-white/10 bg-slate-900/50 space-y-2">
                      <input
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => handleProjChange(proj.id, "name", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#131025] px-3 py-1.5 text-sm text-white outline-none"
                      />
                      <input
                        placeholder="Link (e.g. [github.com/user/repo](https://github.com/user/repo))"
                        value={proj.link}
                        onChange={(e) => handleProjChange(proj.id, "link", e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#131025] px-3 py-1.5 text-sm text-white outline-none"
                      />
                      <textarea
                        placeholder="Brief project description..."
                        value={proj.description}
                        onChange={(e) => handleProjChange(proj.id, "description", e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-white/10 bg-[#131025] p-2 text-sm text-white outline-none"
                      />
                      <button onClick={() => removeProject(proj.id)} className="text-xs text-red-400 hover:underline">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Skills & Profile Photo</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Skills (Comma-separated)</label>
                  <textarea
                    value={resumeData.skills}
                    onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-white/10 bg-[#131025] p-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Profile Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setResumePhoto(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="w-full text-xs text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <span className="text-xs text-purple-300 font-mono">{resumeStatus}</span>
              <button
                onClick={exportResumePDF}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-purple-600/30"
              >
                Export PDF CV
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            2. BACKGROUND REMOVER TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "background-remover" && (
          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-white/20 rounded-2xl text-center bg-slate-900/40">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setBgImageSrc(reader.result);
                    setBgResultSrc("");
                    setBgStatus("Image loaded. Select target background color to extract.");
                  };
                  reader.readAsDataURL(file);
                }}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
              />
            </div>

            {bgImageSrc && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Target Extraction Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Color to Remove</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgTargetColor}
                          onChange={(e) => setBgTargetColor(e.target.value)}
                          className="h-10 w-12 cursor-pointer bg-transparent rounded"
                        />
                        <span className="text-xs font-mono text-slate-300">{bgTargetColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Tolerance ({bgTolerance})</label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={bgTolerance}
                        onChange={(e) => setBgTolerance(e.target.value)}
                        className="w-full mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Output Background</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="radio"
                          name="bgfill"
                          checked={bgFillType === "transparent"}
                          onChange={() => setBgFillType("transparent")}
                        />
                        Transparent
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="radio"
                          name="bgfill"
                          checked={bgFillType === "color"}
                          onChange={() => setBgFillType("color")}
                        />
                        Custom Color
                      </label>
                    </div>
                  </div>

                  {bgFillType === "color" && (
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Replacement Color</label>
                      <input
                        type="color"
                        value={bgReplaceColor}
                        onChange={(e) => setBgReplaceColor(e.target.value)}
                        className="h-10 w-12 cursor-pointer bg-transparent rounded"
                      />
                    </div>
                  )}

                  <button
                    onClick={processBackgroundRemoval}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-sm transition"
                  >
                    Process Extraction
                  </button>
                  <p className="text-xs font-mono text-purple-300">{bgStatus}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-300">Preview Canvas</h4>
                  <div className="h-64 rounded-2xl border border-white/10 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={bgResultSrc || bgImageSrc}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  {bgResultSrc && (
                    <button
                      onClick={() => downloadDataUrl(bgResultSrc, "extracted-image.png")}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Download Translucent PNG
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            3. IMAGE COMPRESSOR TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "image-compressor" && (
          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-white/20 rounded-2xl text-center bg-slate-900/40">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setCompOriginalSize(file.size);
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCompOriginalSrc(reader.result);
                    setCompResultSrc("");
                    setCompStatus(`Loaded original (${formatBytes(file.size)}).`);
                  };
                  reader.readAsDataURL(file);
                }}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
              />
            </div>

            {compOriginalSrc && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Quality ({Math.round(compQuality * 100)}%)</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={compQuality}
                      onChange={(e) => setCompQuality(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Max Bounds Width (px)</label>
                    <input
                      type="number"
                      value={compMaxWidth}
                      onChange={(e) => setCompMaxWidth(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Target Format</label>
                    <select
                      value={compFormat}
                      onChange={(e) => setCompFormat(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none"
                    >
                      <option value="image/jpeg">JPEG (.jpg)</option>
                      <option value="image/webp">WEBP (.webp)</option>
                      <option value="image/png">PNG (.png)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCompressImage}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-sm transition"
                  >
                    Execute Compression
                  </button>
                  <p className="text-xs font-mono text-purple-300">{compStatus}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Original: {formatBytes(compOriginalSize)}</span>
                    {compResultSize > 0 && <span>Compressed: {formatBytes(compResultSize)}</span>}
                  </div>
                  <div className="h-56 rounded-2xl border border-white/10 bg-slate-900 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={compResultSrc || compOriginalSrc}
                      alt="Compressed preview"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  {compResultSrc && (
                    <button
                      onClick={() => downloadDataUrl(compResultSrc, `compressed-image.${compFormat.split("/")[1]}`)}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Download Optimized File
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            4. GRADIENT GENERATOR TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "gradient-generator" && (
          <div className="space-y-6">
            <div
              className="h-56 rounded-2xl border border-white/10 transition-all shadow-inner flex items-end justify-end p-4"
              style={{ background: gradientCss }}
            >
              <button
                onClick={() => copyToClipboard(`background: ${gradientCss};`)}
                className="px-4 py-2 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-mono rounded-xl border border-white/20 transition backdrop-blur-md"
              >
                Copy CSS
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Gradient Type</label>
                <select
                  value={gradType}
                  onChange={(e) => setGradType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none"
                >
                  <option value="linear">Linear Gradient</option>
                  <option value="radial">Radial Gradient</option>
                </select>
              </div>

              {gradType === "linear" && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Angle ({gradAngle}°)</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradAngle}
                    onChange={(e) => setGradAngle(e.target.value)}
                    className="w-full mt-2"
                  />
                </div>
              )}

              <div className="flex items-end">
                <button
                  onClick={addGradStop}
                  disabled={gradStops.length >= 4}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
                >
                  + Add Color Stop ({gradStops.length}/4)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Color Stops</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {gradStops.map((stop) => (
                  <div key={stop.id} className="p-3 rounded-xl border border-white/10 bg-slate-900/60 flex items-center gap-3">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => updateGradStop(stop.id, "color", e.target.value)}
                      className="h-8 w-10 cursor-pointer bg-transparent rounded"
                    />
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.stop}
                        onChange={(e) => updateGradStop(stop.id, "stop", Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-300 w-8">{stop.stop}%</span>
                    {gradStops.length > 2 && (
                      <button onClick={() => removeGradStop(stop.id)} className="text-xs text-red-400 hover:underline">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-purple-300 overflow-x-auto">
              background: {gradientCss};
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            5. BOX SHADOW GENERATOR TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "shadow-generator" && (
          <div className="space-y-6">
            <div className="h-64 rounded-2xl border border-white/10 bg-[#131025] flex items-center justify-center p-6">
              <div
                className="h-32 w-64 rounded-2xl bg-purple-600 transition-all flex items-center justify-center text-xs font-mono text-white"
                style={{ boxShadow: shadowCssValue }}
              >
                Shadow Target Box
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Offset X ({shX}px)</label>
                <input type="range" min="-50" max="50" value={shX} onChange={(e) => setShX(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Offset Y ({shY}px)</label>
                <input type="range" min="-50" max="50" value={shY} onChange={(e) => setShY(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Blur Radius ({shBlur}px)</label>
                <input type="range" min="0" max="100" value={shBlur} onChange={(e) => setShBlur(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Spread Radius ({shSpread}px)</label>
                <input type="range" min="-30" max="50" value={shSpread} onChange={(e) => setShSpread(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Opacity ({Math.round(shOpacity * 100)}%)</label>
                <input type="range" min="0" max="1" step="0.05" value={shOpacity} onChange={(e) => setShOpacity(e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Shadow Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={shColor} onChange={(e) => setShColor(e.target.value)} className="h-8 w-10 cursor-pointer bg-transparent" />
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input type="checkbox" checked={shInset} onChange={(e) => setShInset(e.target.checked)} />
                    Inset Shadow
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-purple-300">
              <span>box-shadow: {shadowCssValue};</span>
              <button
                onClick={() => copyToClipboard(`box-shadow: ${shadowCssValue};`)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            6. FLEXBOX PLAYGROUND TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "flexbox-playground" && (
          <div className="space-y-6">
            <div
              className="min-h-64 rounded-2xl border border-white/10 bg-[#131025] p-6 transition-all flex"
              style={{
                flexDirection: flexDir,
                justifyContent: flexJustify,
                alignItems: flexAlign,
                flexWrap: flexWrapVal,
                gap: `${flexGapVal}px`
              }}
            >
              {Array.from({ length: flexItemCount }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-16 w-16 rounded-xl bg-purple-600 border border-purple-400/40 flex items-center justify-center font-bold text-white shadow-lg"
                >
                  {idx + 1}
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">flex-direction</label>
                <select value={flexDir} onChange={(e) => setFlexDir(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none">
                  <option value="row">row</option>
                  <option value="row-reverse">row-reverse</option>
                  <option value="column">column</option>
                  <option value="column-reverse">column-reverse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">justify-content</label>
                <select value={flexJustify} onChange={(e) => setFlexJustify(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none">
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="space-between">space-between</option>
                  <option value="space-around">space-around</option>
                  <option value="space-evenly">space-evenly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">align-items</label>
                <select value={flexAlign} onChange={(e) => setFlexAlign(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none">
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="stretch">stretch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">flex-wrap</label>
                <select value={flexWrapVal} onChange={(e) => setFlexWrapVal(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none">
                  <option value="nowrap">nowrap</option>
                  <option value="wrap">wrap</option>
                  <option value="wrap-reverse">wrap-reverse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">gap ({flexGapVal}px)</label>
                <input type="range" min="0" max="48" value={flexGapVal} onChange={(e) => setFlexGapVal(e.target.value)} className="w-full mt-2" />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Item Count ({flexItemCount})</label>
                <input type="range" min="1" max="12" value={flexItemCount} onChange={(e) => setFlexItemCount(Number(e.target.value))} className="w-full mt-2" />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-slate-950 font-mono text-xs text-purple-300">
              display: flex;<br />
              flex-direction: {flexDir};<br />
              justify-content: {flexJustify};<br />
              align-items: {flexAlign};<br />
              flex-wrap: {flexWrapVal};<br />
              gap: {flexGapVal}px;
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            7. JWT DECODER TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "jwt-decoder" && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Paste JWT Token</label>
              <textarea
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-[#131025] p-3 text-xs font-mono text-white outline-none focus:border-purple-400"
              />
            </div>

            <button onClick={decodeJwtToken} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition">
              Decode Token
            </button>

            {jwtError && <p className="text-xs font-mono text-red-400">{jwtError}</p>}

            {(jwtHeader || jwtPayload) && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">HEADER (Algorithm & Type)</h4>
                  <pre className="p-4 rounded-xl border border-white/10 bg-slate-950 text-xs font-mono text-purple-300 overflow-x-auto">
                    {JSON.stringify(jwtHeader, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">PAYLOAD (Data Claims)</h4>
                  <pre className="p-4 rounded-xl border border-white/10 bg-slate-950 text-xs font-mono text-cyan-300 overflow-x-auto">
                    {JSON.stringify(jwtPayload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            8. REGEX TESTER TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "regex-tester" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Regex Pattern</label>
                <input
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm font-mono text-purple-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Flags ({flagString})</label>
                <div className="flex gap-3 mt-2">
                  {["g", "i", "m", "s"].map((f) => (
                    <label key={f} className="flex items-center gap-1 text-xs text-slate-300 font-mono">
                      <input
                        type="checkbox"
                        checked={regexFlags[f]}
                        onChange={(e) => setRegexFlags({ ...regexFlags, [f]: e.target.checked })}
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Test Text String</label>
                <textarea
                  value={regexText}
                  onChange={(e) => setRegexText(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] p-3 text-xs font-mono text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Replace String</label>
                <input
                  value={regexReplaceText}
                  onChange={(e) => setRegexReplaceText(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-xs font-mono text-white outline-none mb-3"
                />
                <label className="block text-xs font-semibold text-slate-400 mb-1">Replaced Output Result</label>
                <div className="p-3 rounded-xl border border-white/10 bg-slate-950 text-xs font-mono text-green-300 min-h-24">
                  {regexResults.replaced}
                </div>
              </div>
            </div>

            {regexResults.error ? (
              <p className="text-xs font-mono text-red-400">{regexResults.error}</p>
            ) : (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Matches Found ({regexResults.matches.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {regexResults.matches.map((m, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-200 text-xs font-mono">
                      Index {m.index}: "{m.value}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            9. WORD COUNTER TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "word-counter" && (
          <div className="space-y-6">
            <textarea
              value={wordText}
              onChange={(e) => setWordText(e.target.value)}
              rows={6}
              placeholder="Paste or type content here..."
              className="w-full rounded-xl border border-white/10 bg-[#131025] p-4 text-sm text-white outline-none focus:border-purple-400"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900 text-center">
                <span className="text-2xl font-extrabold text-purple-400">{wordMetrics.words}</span>
                <p className="text-xs text-slate-400 mt-1">Words</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900 text-center">
                <span className="text-2xl font-extrabold text-purple-400">{wordMetrics.chars}</span>
                <p className="text-xs text-slate-400 mt-1">Characters</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900 text-center">
                <span className="text-2xl font-extrabold text-purple-400">{wordMetrics.sentences}</span>
                <p className="text-xs text-slate-400 mt-1">Sentences</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900 text-center">
                <span className="text-2xl font-extrabold text-purple-400">{wordMetrics.paragraphs}</span>
                <p className="text-xs text-slate-400 mt-1">Paragraphs</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 flex items-center justify-around">
                <div className="text-center">
                  <span className="text-base font-bold text-white">{wordMetrics.readTime} min</span>
                  <p className="text-xs text-slate-400">Est. Reading Time</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center">
                  <span className="text-base font-bold text-white">{wordMetrics.speakTime} min</span>
                  <p className="text-xs text-slate-400">Est. Speaking Time</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Top Keyword Frequency</h4>
                <div className="flex flex-wrap gap-2">
                  {wordMetrics.topKeywords.map(([kw, cnt]) => (
                    <span key={kw} className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-purple-300 font-mono">
                      {kw} ({cnt})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            10. IMAGE CROPPER TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "image-cropper" && (
          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-white/20 rounded-2xl text-center bg-slate-900/40">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCropSrc(reader.result);
                    setCropResult("");
                    setCropStatus("Image loaded. Adjust bounds and execute crop.");
                  };
                  reader.readAsDataURL(file);
                }}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
              />
            </div>

            {cropSrc && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Target Width (px)</label>
                      <input
                        type="number"
                        value={cropWidth}
                        onChange={(e) => setCropWidth(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Target Height (px)</label>
                      <input
                        type="number"
                        value={cropHeight}
                        onChange={(e) => setCropHeight(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Zoom Scale ({cropZoom}x)</label>
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.1"
                      value={cropZoom}
                      onChange={(e) => setCropZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={processCropImage}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold text-sm transition"
                  >
                    Execute Crop
                  </button>
                  <p className="text-xs font-mono text-purple-300">{cropStatus}</p>
                </div>

                <div className="space-y-3">
                  <div className="h-64 rounded-2xl border border-white/10 bg-slate-900 flex items-center justify-center p-2 overflow-hidden">
                    <img
                      src={cropResult || cropSrc}
                      alt="Cropped preview"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                  {cropResult && (
                    <button
                      onClick={() => downloadDataUrl(cropResult, "cropped-image.png")}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Download Cropped PNG
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            11. QR CODE GENERATOR TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "qr-code" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">URL or Text Payload</label>
                  <input
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="[https://example.com](https://example.com)"
                    className="w-full rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Foreground Color</label>
                    <input
                      type="color"
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      className="h-10 w-full cursor-pointer bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Background Color</label>
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="h-10 w-full cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                {qrDataUrl ? (
                  <>
                    <div className="p-4 rounded-2xl bg-white shadow-xl">
                      <img src={qrDataUrl} alt="Generated QR Code" className="w-48 h-48" />
                    </div>
                    <button
                      onClick={() => downloadDataUrl(qrDataUrl, "qrcode.png")}
                      className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Download QR Code
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Enter text payload to generate QR.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            12. PASSWORD GENERATOR TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "password-generator" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl border border-white/10 bg-slate-950 flex items-center justify-between">
              <span className="text-lg font-mono font-bold text-purple-300 break-all">
                {generatedPassword || "Select options..."}
              </span>
              <button
                onClick={() => copyToClipboard(generatedPassword)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition shrink-0 ml-4"
              >
                Copy
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Length ({pwdLength} chars)</label>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={pwdLength}
                  onChange={(e) => setPwdLength(Number(e.target.value))}
                  className="w-full mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={pwdUpper} onChange={(e) => setPwdUpper(e.target.checked)} />
                  Uppercase (A-Z)
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={pwdLower} onChange={(e) => setPwdLower(e.target.checked)} />
                  Lowercase (a-z)
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={pwdNum} onChange={(e) => setPwdNum(e.target.checked)} />
                  Numbers (0-9)
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={pwdSym} onChange={(e) => setPwdSym(e.target.checked)} />
                  Symbols (!@#$)
                </label>
              </div>
            </div>

            <button
              onClick={generatePassword}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
            >
              Generate Password
            </button>
          </div>
        )}

        {/* ----------------------------------------------------
            13. JSON FORMATTER TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "json-formatter" && (
          <div className="space-y-6">
            <div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={10}
                className="w-full rounded-xl border border-white/10 bg-[#131025] p-4 text-xs font-mono text-white outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3">
                <button
                  onClick={() => formatJson(2)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Prettify (2 Spaces)
                </button>
                <button
                  onClick={() => formatJson(4)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Prettify (4 Spaces)
                </button>
                <button
                  onClick={minifyJson}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Minify
                </button>
              </div>

              <span className={`text-xs font-mono ${jsonIsError ? "text-red-400" : "text-green-400"}`}>
                {jsonStatus}
              </span>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            14. MARKDOWN PREVIEW TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "markdown-previewer" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Markdown Editor</label>
              <textarea
                value={mdInput}
                onChange={(e) => setMdInput(e.target.value)}
                rows={14}
                className="w-full rounded-xl border border-white/10 bg-[#131025] p-4 text-xs font-mono text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Live Preview Output</label>
              <div
                className="h-[340px] rounded-xl border border-white/10 bg-slate-900/80 p-5 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: parsedMarkdownHtml }}
              />
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            15. TODO APP TOOL UI
           ---------------------------------------------------- */}
        {tool.id === "todo-list" && (
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-4">
              <input
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTodo()}
                placeholder="Task description..."
                className="md:col-span-2 rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none"
              />
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#131025] px-3.5 py-2 text-sm text-white outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <button
                onClick={addTodo}
                className="py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition"
              >
                Add Task
              </button>
            </div>

            <div className="flex gap-3 border-b border-white/10 pb-3 text-xs">
              {["all", "active", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTodoFilter(f)}
                  className={`capitalize font-semibold ${todoFilter === f ? "text-purple-400 border-b-2 border-purple-400 pb-1" : "text-slate-400"}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="p-3.5 rounded-xl border border-white/10 bg-slate-900/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="h-4 w-4 rounded"
                    />
                    <span className={`text-sm ${todo.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                      {todo.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        todo.priority === "High"
                          ? "border-red-500/30 bg-red-500/10 text-red-300"
                          : todo.priority === "Medium"
                          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                          : "border-green-500/30 bg-green-500/10 text-green-300"
                      }`}
                    >
                      {todo.priority}
                    </span>
                    <button onClick={() => deleteTodo(todo.id)} className="text-xs text-red-400 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}