(() => {
  const pageText = document.body?.innerText || "";
  console.log("Extracted text:", pageText);
  chrome.runtime.sendMessage({ text: pageText });
})();