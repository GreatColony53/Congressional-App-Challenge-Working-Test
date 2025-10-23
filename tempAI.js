// global must be in this file and in the html file
pdfjsLib.GlobalWorkerOptions.workerSrc = 'PDFLibrary/pdf.worker.min.js';

chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
    const currentTabId = tabs[0].id;
    
    // LOGIC for extracting text from PDF vs regular webpage. works maybe
    const isPDF = false; // Placeholder for actual PDF detection logic
    if (isPDF) {
      const url = 'https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/romeo-and-juliet_PDF_FolgerShakespeare.pdf'; // Replace with your PDF file path
      pdfjsLib.getDocument(url).promise.then(pdf => {
        pdf.getPage(9).then(page => {
          page.getTextContent().then(textContent => {
            const text = textContent.items.map(item => item.str).join(' ');
            console.log("Extracted text from PDF:", text);
            //document.getElementById("desc").textContent = text;
            analyzeTheText(text);
          });
        });
      });
    } else {
      // calls content.js to extract text from webpage
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        files: ['content.js']
      });
    }
    
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Extracted text from web page:", message.text);
  //document.getElementById("desc").textContent = message.text;
  analyzeTheText(message.text);
});

function analyzeTheText(text) {
  // Placeholder function to analyze text
  //document.getElementById("desc").textContent = text;
  console.log("Analyzing text:", text);

  const desc = document.getElementById("desc");
  desc.innerText = "Analyzing...";

  // Working Code for APPFLASK execution. Uncomment for use.
  fetch("http://localhost:5000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: text })
  })
  .then(res => res.json())
  .then(data => {
    desc.innerText = "Result: " + data.result;
  })
  .catch(err => {
    console.error("Error:", err);
  });
  //
}
