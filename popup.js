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

  // open sidebar.html in side panel
  chrome.tabs.query({ active: true}, (tabs) => {
    const tabId = tabs[0].id;
    chrome.sidePanel.open({tabId});
  });

  
  console.log('start button clicked');
  function getAllPDFText(url) {
    pdfjsLib.getDocument(url).promise.then(pdf => {
      let textContent = '';

      const numPages = pdf.numPages;
      const loadPageText = pageNum => {
        return pdf.getPage(pageNum).then(page => {
          return page.getTextContent().then(content => {
            const strings = content.items.map(item => item.str);
            textContent += strings.join(' ') + '\n';
          });
        });
      };

      const loadAllPages = async () => {
        for (let i = 1; i <= numPages; i++) {
          await loadPageText(i);
        }
        console.log(textContent); // All text from the PDF
        return textContent;
      };

      return loadAllPages();
    });
  };

  chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
    const currentTabId = tabs[0].id;
    //chrome.sidePanel.open({currentTabId});
    console.log("Tab url is: " + tabs[0].url);
    let url = tabs[0].url;
    let isPDF = false;
    if (url.toLowerCase().endsWith(".pdf")) {
        console.log("It's a PDF!");
        isPDF = true;
    }
    // LOGIC for extracting text from PDF vs regular webpage. works
    if (isPDF) {
      /*
       pdfjsLib.getDocument(url).promise.then(pdf => {
        pdf.getPage(9).then(page => {
          page.getTextContent().then(textContent => {
            const text = textContent.items.map(item => item.str).join(' ');
            console.log("Extracted text from PDF:", text);
            //document.getElementById("desc").textContent = text;
            analyzeTheText(text);
          });
        });
      });*/
      const allText = getAllPDFText(url);
      analyzeTheText(allText);
    } else {
      // calls content.js to extract text from webpage
      chrome.scripting.executeScript({
        target: { tabId: currentTabId },
        files: ['content.js']
      });
    }
    
  });
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
  desc.innerText = "Analyzing...";

  /* Working Code for APPFLASK execution. Uncomment for use.
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
  */


  // when a focus session is started an empty session is created in storage based on session name
  const flashcardStorageKey = "FlashCardStorage";
  const sessionName = document.getElementById("sessionNameInput").value;

  function addSession (flashcards, sessionName) {
    flashcards.push({
      session: sessionName,
      cards: {},
    });
    return flashcards;
  }

  chrome.storage.local.get([flashcardStorageKey]).then((FlashCardStorage) => {
    console.log("Retrieved FlashCardStorage:", FlashCardStorage);
    let flashcards = FlashCardStorage[flashcardStorageKey] || [];
    console.log("Current flashcards:", flashcards);
    flashcards = addSession(flashcards, sessionName);

    chrome.storage.local.set({ [flashcardStorageKey]: flashcards }).then(() => {
      console.log("Updated FlashCardStorage:", flashcards);
    });

    /*
    if (FlashCardStorage[flashcardStorageKey]) {
      console.log("FlashCardStorage found:", result[flashcardStorageKey]);
    } else {
      console.log("FlashCardStorage not found, creating new key-value pair.");
      chrome.storage.local.set({ [flashcardStorageKey]: {} }).then(() => {
        console.log("FlashCardStorage initialized.");
      });
    };*/
  });
 //desc.innerText = "Result: " + text;
}


