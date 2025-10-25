// !!!!-----------------TEXT EXTRACTION CODE---------------------!!!!


const AUTO_SAVE_INTERVAL = 10000; // 10 seconds. Has to be a factor of the total duration

let tab;
let text;
async function setTabAndPageText() {
  console.log("Setting tab and page text for sidebar...");
  try {
    tab = await getStudyTab();
    text = await getTextFrom(tab);
    console.log("Extracted text:", text);
  } catch (error) {
    console.error("Error:", error);
  }
}

setTabAndPageText();

function getStudyTab() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["currentTabId"]).then((storage) => {
      const tabId = parseInt(storage.currentTabId);
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tab);
        }
      });
    }).catch(reject);
  });
};

function getTextFrom(tab) {
  return new Promise((resolve, reject) => {
    const url = tab.url;
    const isPDF = url.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      const allText = getAllPDFText(url);
      resolve(allText);
    } else {
      // WEBPAGE Extraction
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      chrome.runtime.onMessage.addListener(function listener(message, sender, sendResponse) {
          chrome.runtime.onMessage.removeListener(listener);
          resolve(message.text);
      });
    };
  });
};

// PDF EXTRACTION!! Global objects sets up directory for pdf.js, the pdf handler
pdfjsLib.GlobalWorkerOptions.workerSrc = 'PDFLibrary/pdf.worker.min.js';
async function getAllPDFText(url) {
  const pdf = await pdfjsLib.getDocument(url).promise;
  let textContent = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    textContent += strings.join(' ') + '\n';
  }

  console.log(textContent); // All text from the PDF
  return textContent;
};

// !!!!-----------------END OF TEXT EXTRACTION---------------------!!!!
// !!!!-----------------TIMER CODE---------------------!!!!

updateTimer();

function updateTimer() {
  chrome.storage.local.get(["isTimerActive", "isSessionActive", "timerDuration"]).then((storage) => {
    let durationLeft = storage.timerDuration;
    console.log("Time left (ms): ", durationLeft);
    console.log("Interval (ms): ", AUTO_SAVE_INTERVAL);

    const isTimerActive = storage.isTimerActive;
    const isSessionActive = storage.isSessionActive;
    console.log("isSessionActive state:", isSessionActive);
    console.log("isTimerActive state:", isTimerActive);

    if (!isTimerActive) {
      //setTimeout(() => updateTimer(), 1000);
      console.log("Timer is paused, not updating display.");
      //playStopAnimation();
      playAnimation("Stop")
      return;
    };
    

    const hoursCt = document.getElementById("hoursCount");
    const minutesCt = document.getElementById("minutesCount");
    const secondsCt = document.getElementById("secondsCount");

    // Calls autosave at intervals
    if (durationLeft % AUTO_SAVE_INTERVAL === 0) {
      console.log("Triggering autoSave from timer update.");
      saveFlashcard();
    };

    if (durationLeft <= 0) {
      hoursCt.textContent = "00:";
      minutesCt.textContent = "00:";
      secondsCt.textContent = "00";
      playAnimation("Stop")
      return;
    }
    //playAnimation();
    playAnimation("Make")
    
    // Must be after checking timer ended
    if (!isSessionActive) {
      setTimeout(() => {
        durationLeft = 0;
        chrome.storage.local.set({ timerDuration: durationLeft });
        updateTimer();
      });
      return;
    }
    
    // Updates the display
    const totalSeconds = Math.floor(durationLeft / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    hoursCt.textContent = String(hours).padStart(2, "0") + ":";
    minutesCt.textContent = String(minutes).padStart(2, "0") + ":";
    secondsCt.textContent = String(seconds).padStart(2, "0");

    durationLeft -= 1000;
    chrome.storage.local.set({ timerDuration: durationLeft });
    setTimeout(() => updateTimer(), 1000);
  });
}

const wizard = document.getElementById("wizardGif");
function playAnimation (animationName) {
	animationName = "assets/" + animationName + ".gif";
	wizard.src = animationName
}

//!!!!-----------------END OF TIMER---------------------!!!!
//!!!!-----------------START OF SAVE---------------------!!!!
// EXAMPLE SAVE HIERARCHY IN STORAGE
/*
FlashcardStorege: [
  {
    session: tab.title,
    cards: [{question: "", answer: ""}, {...}],
    id: tab.id
  },
  {
    session: tab.title,
    cards: [{question: "", answer: ""}, {...}],
    id: tab.id
  }
]
*/

function saveFlashcard() {
  chrome.storage.local.get(["FlashcardStorage"]).then(async (storage) => {
    console.log("Retrieved FlashcardStorage:", storage.FlashcardStorage);
    let flashcards = storage.FlashcardStorage || [{
      session: tab.title,
      cards: [],
      id: tab.id,
    }];
    
    for (let i = 0; i < flashcards.length; i++) {
      console.log("Checking session index:", i);
      if (i === flashcards.length - 1 && flashcards[i].session !== tab.title) {
        console.log("Must create new session. No matching session found for tab id:", tab.id);
        // New session for this tab if the last index does not equal what we are seaching for
        flashcards.push({
          session: tab.title,
          cards: [],
          id: tab.id,
        });
        console.log("Created new session in flashcards:", flashcards);
        // Recheck this index after adding a new index
        i += 1;
      }
      if (flashcards[i].session === tab.title && text) {
        console.log("Found matching session for tab title:", tab.title);
        
        let cards = flashcards[i].cards;
        const length = cards.length;
        const charactersPerMin = 2500; // Approximate characters that can be processed in one analysis
        const minChars = length * charactersPerMin;
        const maxChars = Math.min(minChars + charactersPerMin, text.length);
        const textSegment = text.slice(minChars, maxChars);
        if (minChars < text.length) {
          console.log(`Analyzing text segment (chars ${minChars} to ${maxChars}):`, textSegment);
          // Analyze text and get a flashcard

          const card = await analyzeTheText(textSegment);
          console.log("Received card in saveflashcard:", card);

          flashcards[i].cards.push(card.result);
          await chrome.storage.local.set({ FlashcardStorage: flashcards });
          console.log("Saved flashcard to session:", flashcards[i]);
          
          console.log("Wizard-saving... ");
          //playSaveAnimation();
          playAnimation("Save")
          setTimeout(() => playAnimation("Make"), 2250)
          break;
        } else {
          console.log("No more text to analyze for flashcards.");
          break;
        };
      };
    };
  });
}

// Analyzes text converted to a string from both PDFs and regular webpages
async function analyzeTheText(text) {
  try {
    const response = await fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text })
    });

    const card = await response.json();
    console.log("Received card in analysis:", card);
    return card;
  } catch (err) {
    console.error("Error analyzing text:", err);
    throw err;
  }
}


//!!!!-----------------END OF SAVE---------------------!!!!
// !!!!-----------------START OF LIBRARY BTN CODE---------------------!!!!
const libraryBtn = document.getElementById("libraryBtn");
libraryBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "library.html" });
});

const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.addEventListener("click", async () => {
  console.log("Pause button clicked");
  await chrome.storage.local.get(["isTimerActive"]).then((storage) => {
    const currentState = storage.isTimerActive;
    console.log("Current isTimerActive state:", currentState);

    if (!currentState) {
      chrome.storage.local.set({isTimerActive: true}).then(() => {
        updateTimer();
        pauseBtn.textContent = "Pause";
      });
    } else {
      chrome.storage.local.set({isTimerActive: false}).then(() => {
        pauseBtn.textContent = "Resume";
      });
    }
  });
});

const endSessionBtn = document.getElementById("endSessionBtn");
endSessionBtn.addEventListener("click", async () => {
  console.log("End Session button clicked");
  await chrome.storage.local.set({ isSessionActive: false, isTimerActive: true});
});


// !!!!-----------------END OF LIBRARY BTN CODE---------------------!!!!