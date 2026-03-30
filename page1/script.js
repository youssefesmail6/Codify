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
textarea.addEventListener("input", () => {
  if (textarea.value.trim() === "") {
    resetBtn();
  }
});
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

textarea.addEventListener("input", () => {
  const code = textarea.value;
  if (!code.trim()) return;
  const detectedLang = detectLanguageKeyword(code);

  if (detectedLang) {
    fromLang.value = detectedLang;
  } else {
    fromLang.value = "";
  }
});
function detectLanguageKeyword(code) {
  const lowerCode = code.toLowerCase();

  if (lowerCode.includes("console.log") || lowerCode.includes("function") || lowerCode.includes("=>") || lowerCode.includes("var ") || lowerCode.includes("let ") || lowerCode.includes("const ")) {
    return "JavaScript";
  }
  if (lowerCode.includes("def ") || lowerCode.includes("print(") || lowerCode.includes("import ") || lowerCode.includes("elif") || lowerCode.includes("none")) {
    return "Python";
  }
  if (lowerCode.includes("#include") || lowerCode.includes("cout") || lowerCode.includes("std::")) {
    return "C++";
  }
  if (lowerCode.includes("public static void main") || lowerCode.includes("system.out.println")) {
    return "Java";
  }
  if (lowerCode.includes("using system;") || lowerCode.includes("console.writeline")) {
    return "C#";
  }

  return "Unknown";
}


convertBtn.addEventListener("click", async () => {
  const code = textarea.value.trim();
  const fromLang = fromLangSelect.value;
  const toLang = toLangSelect.value;

  if (!code) {
    setStatusError("Please enter or upload code first");
    return;
  }
  if (!validateCode(code, fromLang)) {
    setStatusError("Invalid code!");
    return;
  }
  // console.log("From Language:", fromLang);
  // console.log("To Language:", toLang);
  // console.log("Code:", code);
  // console.log(toLangSelect.value )
  // console.log(fromLangSelect.value);
    if(toLangSelect.value === fromLangSelect.value)  {
      setStatusError("Please select different languages");
      return;
    }

  try {
    setStatusLoading();
    const convertedCode = await convertCodeAI(code, fromLang, toLang);
    localStorage.setItem("originalCode", code);
    localStorage.setItem("convertedCode", convertedCode);
    localStorage.setItem("fromLang", fromLang);
    localStorage.setItem("toLang", toLang);

    window.location.href = "../page2/PageTwo.html";
  } catch (error) {
    console.error(error);
    setStatusError("AI conversion failed. Try again.");
  }
});

function validateCode(code, lang) {
  if (!code || !code.trim()) return false;

  const languageRules = {
    "C++": ["#include", "std::", "cout", "int main","return 0",";"],
    "Java": ["class", "public static void main", "System.out",";"],
    "C#": ["using System", "class", "static void Main", "Console.WriteLine",";"],
    "Python": ["def ", "print(", "import ", "if __name__"],
    "JavaScript": ["function", "=>", "console.log", "let ", "const ", "var "]
  };

  const rules = languageRules[lang];
  if (!rules) return false;


  return rules.some(keyword => code.includes(keyword));
}

