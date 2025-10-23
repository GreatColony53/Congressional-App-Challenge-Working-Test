// content.js
console.log("Content script loaded");
let  pageText = document.body.innerText;
console.log("Extracted text:", pageText);

// Optionally send it to the background or popup
chrome.runtime.sendMessage({ text: pageText });

/*
"content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
    */