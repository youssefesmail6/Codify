const downloadBtn = document.getElementById("downloadBtn");
const originalCodeEl = document.getElementById("originalCode");
const convertedCodeEl = document.getElementById("convertedCode");
const conversionPathEl = document.getElementById("conversionPath");
const outputLangEl = document.getElementById("outputLang");
const backBtn = document.querySelector(".Back");

const originalCode = localStorage.getItem("originalCode") || "";
const convertedCode = localStorage.getItem("convertedCode") || "";
const fromLang = localStorage.getItem("fromLang") || "Unknown";
const toLang = localStorage.getItem("toLang") || "Unknown";

originalCodeEl.textContent = originalCode;
convertedCodeEl.textContent = convertedCode;
conversionPathEl.textContent = `${fromLang} → ${toLang}`;
outputLangEl.textContent = toLang;

backBtn.addEventListener("click", () => {
  window.location.href = "../page1/index.html";
});
function getFileExtension(lang) {
  const map = {
    "JavaScript": "js",
    "Python": "py",
    "C++": "cpp",
    "Java": "java",
    "C#": "cs"
  };
  return map[lang] || "txt";
}

downloadBtn.addEventListener("click", function () {
  const code = convertedCodeEl.textContent;       
  const lang = outputLangEl.textContent.trim();   
  const extension = getFileExtension(lang);
  const filename = `converted_code.${extension}`;
  
  const blob = new Blob([code], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  localStorage.clear();
});

