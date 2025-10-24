// content.js
console.log("Content script loaded");
let  pageText = document.body.innerText;
console.log("Extracted text:", pageText);

// Optionally send it to the background or popup
chrome.runtime.sendMessage({ text: pageText });

/* code from manifest that runs the content sccript on every webpage. Might need to implement into an array of stored tabs so that
we can use the study tab set and get it related to the tab
"content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
    */