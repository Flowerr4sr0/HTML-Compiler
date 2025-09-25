// script.js

const editor = document.getElementById("editor");
const tabs = document.querySelectorAll(".tab");
const preview = document.getElementById("preview");
const resetBtn = document.getElementById("reset");
const downloadFileBtn = document.getElementById("downloadFile");
const downloadAllBtn = document.getElementById("downloadAll");
const previewTitle = document.getElementById("previewPageTitle");
const previewFavicon = document.getElementById("previewFavicon");

const defaultFiles = {
  "index.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Hello Preview</title>
  <link rel="icon" href="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f338.png">
</head>
<body>
  <p>Hello, World!</p>
</body>
</html>`,
  "styles.css": `body {
  background: #fff;
  color: #333;
  font-family: system-ui, sans-serif;
}
p {
  color: darkblue;
  font-weight: bold;
}`,
  "script.js": `document.addEventListener("DOMContentLoaded", () => {
  console.log("Hello from script.js!");
});`
};

let files = { ...defaultFiles };
let currentFile = "index.html";

// Load initial editor content
editor.value = files[currentFile];

// Update preview
function updatePreview() {
  const fullDoc = `
<html>
<head>
<style>${files["styles.css"]}</style>
<script>${files["script.js"]}<\/script>
</head>
<body>
${files["index.html"]}
</body>
</html>
  `;
  preview.srcdoc = fullDoc;

  // Extract title & favicon
  const parser = new DOMParser();
  const doc = parser.parseFromString(files["index.html"], "text/html");

  const title = doc.querySelector("title");
  previewTitle.textContent = title ? title.textContent : "Live Preview";

  const icon = doc.querySelector("link[rel='icon']");
  previewFavicon.src = icon ? icon.href : "https://via.placeholder.com/16";
}
updatePreview();

// Handle tab switching
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");

    currentFile = tab.dataset.file;
    editor.value = files[currentFile];
  });
});

// Update file on typing
editor.addEventListener("input", () => {
  files[currentFile] = editor.value;
  updatePreview();
});

// Reset defaults
resetBtn.addEventListener("click", () => {
  files = { ...defaultFiles };
  editor.value = files[currentFile];
  updatePreview();
});

// Download current file
downloadFileBtn.addEventListener("click", () => {
  const blob = new Blob([files[currentFile]], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentFile;
  a.click();
});

// Download all files (fallback: individual downloads)
downloadAllBtn.addEventListener("click", () => {
  Object.keys(files).forEach(name => {
    const blob = new Blob([files[name]], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  });
});

// Keyboard shortcut: Ctrl/Cmd+S to download current file
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    downloadFileBtn.click();
  }
});
