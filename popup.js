pdfjsLib.GlobalWorkerOptions.workerSrc = 'PDFLibrary/pdf.worker.min.js';

const setStudyTabBtn = document.getElementById("setStudyTabBtn");
const setNoteTabBtn = document.getElementById("setNoteTabBtn");

chrome.runtime.sendMessage({type: "POPUP_OPENED"}, (response) => {
  console.log("Response from service worker:", response);
  response.tabs.forEach(tab => {
    console.log(tab.title + " - " + tab.url);
    const option = document.createElement("option");
    option.value = tab.id;
    option.textContent = tab.title;
    setStudyTabBtn.appendChild(option);
    setNoteTabBtn.appendChild(option.cloneNode(true));
  });
});

const startBtn = document.getElementById("startBtn");
/*
openLibraryBtn.addEventListener("click", () => {
    console.log('Library button clicked');
    chrome.tabs.query({ active: true}, (tabs) => {
      const tabId = tabs[0].id;
      chrome.sidePanel.open({tabId});
    });
});
*/



//open sidebar as sidebar.html when startBtn is clicked
startBtn.addEventListener('click', () => {
  const hours = parseInt(document.getElementById("hourSelect").value, 10);
  const minutes = parseInt(document.getElementById("minuteSelect").value, 10);
  
  const durationMs = (hours * 60 + minutes) * 60 * 1000; // Convert to ms
  const endTime = new Date().getTime() + durationMs; // Absolute timestamp

  // Store in chrome.storage so study.js can access it
  //localStorage.setItem(studyEndTime, endTime);
  chrome.storage.local.set({ studyEndTime: endTime }).then(() => {
    console.log("Value is set");
  });

  chrome.storage.local.get(["studyEndTime"]).then((result) => {
    console.log("Value is " + result.studyEndTime);
  });
  const now = new Date().getTime();
  //localStorage.setItem(programStart, now);

  //open sidebar to study.html
  console.log('start button clicked');
  chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
    const currentTabId = tabs[0].id;
    chrome.sidePanel.open({currentTabId});
    
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
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        files: ['content.js']
      });
    }
    
  });





/*
  const desc = document.getElementById("desc");
  console.log("Trying to change description text");
  const n = "Tell me a joke about computers";

  fetch("http://localhost:5000/api/sum", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ n: n })
  })
  .then(res => res.json())
  .then(data => {
    desc.innerText = "Result: " + data.result;
  })
  .catch(err => {
    console.error("Error:", err);
  });
*/
});


// Listen for message from content.js
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
  const n = text;
  desc.innerText = "Analyzing...";
/*
  fetch("http://localhost:5000/api/sum", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ n: n })
  })
  .then(res => res.json())
  .then(data => {
    desc.innerText = "Result: " + data.result;
  })
  .catch(err => {
    console.error("Error:", err);
  });
  */
 desc.innerText = "Result: " + text;
}


