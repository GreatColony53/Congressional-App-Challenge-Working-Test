const libraryBtn = document.getElementById("libraryBtn");
libraryBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "library.html" });
});


// !!!!-----------------TEXT EXTRACTION CODE---------------------!!!!

let tab;
let text;
async function setTabAndPageText() {
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

// Starts everything when sidebar is opened
chrome.storage.local.get(["timerDuration"]).then((timerStorage) => {
  console.log("End Time inside Storage is " + timerStorage.timerDuration);
  
  let storedDuration = timerStorage.timerDuration || 0;
  updateTimer(storedDuration);
  
  const interval = 10000; // 10 seconds
  setTimeout(() => autoSave(interval), interval) // previosuly called changeGifEvery40Secs
});

function updateTimer(durationLeft) {
  console.log("This much time (ms) is left " + durationLeft);

  const hoursCt = document.getElementById("hoursCount");
  const minutesCt = document.getElementById("minutesCount");
  const secondsCt = document.getElementById("secondsCount");

  if (durationLeft <= 0) {
    hoursCt.textContent = "00:";
    minutesCt.textContent = "00:";
    secondsCt.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(durationLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  hoursCt.textContent = String(hours).padStart(2, "0") + ":";
  minutesCt.textContent = String(minutes).padStart(2, "0") + ":";
  secondsCt.textContent = String(seconds).padStart(2, "0");

  durationLeft -= 1000;
  chrome.storage.local.set({ timerDuration: durationLeft });
  setTimeout(() => updateTimer(durationLeft), 1000);
}

// Plays the wizard save animation and creates a flashcard at regular intervals
function autoSave(interval) {
  console.log("Wizard-saving... ");
  playSaveAnimation();

  console.log("Auto-saving card...");
  saveFlashcard();

  chrome.storage.local.get(["timerDuration"]).then((storage) => {
    timerDuration = storage.timerDuration;
    console.log("Time left (ms): ", timerDuration);
    console.log("Interval (ms): ", interval);
    if (timerDuration <= 0) {
      console.log("Timer has already ended.");
      // START Prompt to view questions
      return;
    } else if (timerDuration <= interval) {
      console.log("Last interval, setting final auto-save.");
      setTimeout(() => autoSave(interval), timerDuration);
      return;
    }
    setTimeout(() => autoSave(interval), interval);
      
  });
  
  

  // NEED TO CHANGE GIF AT END OF TIMER. Set timeout for remaining time and change wizard to still image
}

// Plays the save animation called by autoSave then resets to idle gif
const wizard = document.getElementById("wizardGif");
function playSaveAnimation () {
  wizard.src = "assets/Save.gif";
  setTimeout(() => {
    wizard.src = "assets/Make.gif";
    console.log("Wizard Finished Saving");
  }, 2250);
};

//!!!!-----------------END OF TIMER---------------------!!!!
//!!!!-----------------START OF SAVE---------------------!!!!

function saveFlashcard() {
  chrome.storage.local.get(["FlashcardStorage"]).then(async (storage) => {
    console.log("Retrieved FlashcardStorage:", storage.FlashcardStorage);
    let flashcards = storage.FlashcardStorage || [{
      session: tab.title,
      cards: [],
      id: tab.id,
    }];
    await chrome.storage.local.set({ FlashcardStorage: flashcards }); // check if i need this
    console.log("Initialized new flashcard session for tab:", tab.id);
    for (let i = 0; i < flashcards.length; i++) {
      console.log("Checking session index:", i);
      if (i === flashcards.length - 1 && flashcards[i].id !== tab.id) {
        console.log("Must create new session. No matching session found for tab id:", tab.id);
        // New session for this tab if the last index does not equal what we are seaching for
        flashcards.push({
          session: tab.title,
          cards: [],
          id: tab.id,
        });
        console.log("Created new session in flashcards:", flashcards);
        // Recheck this index after adding a new index
        // see if i can do this: i += 1;
      }
      if (flashcards[i].id === tab.id) {
        console.log("Found matching session for tab id:", tab.id);
        
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