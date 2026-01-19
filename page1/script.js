let uploadBtn = document.querySelector(".upload-btn");
let fileInput = document.querySelector(".file-input");
let textarea = document.querySelector("textarea");
let fileHint = document.querySelector(".file-hint");
let dropCode = document.querySelector(".drop-code");
let convertBtn = document.querySelector(".convert-btn");
let fromLangSelect = document.getElementById("fromLang");
let toLangSelect = document.getElementById("toLang");
let statusDiv = document.querySelector(".status");
let resetBtnEl = document.querySelector(".reset-btn");

uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  handleFile(fileInput.files[0]);
});

/* ================= Drag & Drop ================= */

textarea.addEventListener("dragover", (e) => {
  e.preventDefault();
  textarea.classList.add("drag-over");
  dropCode.classList.add("active");
});

textarea.addEventListener("dragleave", () => {
  textarea.classList.remove("drag-over");
  dropCode.classList.remove("active");
});

textarea.addEventListener("drop", (e) => {
  e.preventDefault();
  textarea.classList.remove("drag-over");
  dropCode.classList.remove("active");
  handleFile(e.dataTransfer.files[0]);
});
//
function handleFile(file) {
  if (!file) return;

  let allowedExtensions = ["cpp", "py", "js", "java", "cs", "txt"];
  let ext = file.name.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    setStatusError("Please upload a valid code file");
    return;
  }

  let reader = new FileReader();
  reader.onload = () => {
    textarea.value = reader.result;
    fileHint.textContent = file.name;
    setStatusReady("File loaded successfully");
  };

  reader.readAsText(file);
}
function setStatusReady(text = "Ready to convert code") {
  statusDiv.textContent = text;
  statusDiv.className = "status ready";
}

function setStatusLoading() {
  statusDiv.textContent = "Converting...";
  statusDiv.className = "status loading";
}

function setStatusError(text) {
  statusDiv.textContent = text;
  statusDiv.className = "status error";
}

function resetBtn() {
  textarea.value = "";
  fileInput.value = "";
  fileHint.textContent = "No file selected";

  setStatusReady("Ready to convert code");
}

resetBtnEl.addEventListener("click", resetBtn);

async function convertCodeAI(code, fromLang, toLang) {
 const apiKey = "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";

  const prompt = `
Convert the following ${fromLang} code into ${toLang}.
Return ONLY the converted code. No explanation.
Code:
${code}
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Codify Demo Project"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    })
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
convertBtn.addEventListener("click", async () => {
  const code = textarea.value.trim();
  const fromLang = fromLangSelect.value;
  const toLang = toLangSelect.value;

  if (!code) {
    setStatusError("Please enter or upload code first");
    return;
  }

  try {
    setStatusLoading();
    const convertedCode = await convertCodeAI(code, fromLang, toLang);
    localStorage.setItem("originalCode", code);
    localStorage.setItem("convertedCode", convertedCode);
    localStorage.setItem("fromLang", fromLang);
    localStorage.setItem("toLang", toLang);

    // Redirect to Page 2
    window.location.href = "../page2/PageTwo.html";
  } catch (error) {
    console.error(error);
    setStatusError("AI conversion failed. Try again.");
  }
});
