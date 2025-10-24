const setStudyTabBtn = document.getElementById("setStudyTabBtn");
const startBtn = document.getElementById("startBtn");
const libraryBtn = document.getElementById("libraryBtn");

// Navigate to library on button click
libraryBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "library.html" });
});

chrome.runtime.sendMessage({type: "POPUP_OPENED"}, (response) => {
  console.log("Response from service worker:", response);
  response.tabs.forEach(tab => {
    console.log(tab.title + " - " + tab.url);
    if (!tab.url.startsWith("chrome://")) {
      // safe to inject
      const option = document.createElement("option");
      option.value = tab.id;
      option.textContent = tab.title;
      setStudyTabBtn.appendChild(option);
    }
  });
});

setStudyTabBtn.addEventListener("change", async () => {
  startBtn.style.display = "inline-block";
});

// Handles Start Session
startBtn.addEventListener("click", async () => {
  console.log("Start button clicked");

  // Get duration from dropdowns
  const hours = parseInt(document.getElementById("hourSelect").value, 10);
  const minutes = parseInt(document.getElementById("minuteSelect").value, 10);
  const durationMs = (hours * 60 + minutes) * 60 * 1000;

  // Store timer duration and start time
  const now = Date.now();
  await chrome.storage.local.set({
    timerDuration: durationMs,
    startTime: now,
  });

  // Open side panel
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ tabId: tab.id });
    console.log("Side panel opened with tabId:", tab.id);
  } catch (err) {
    console.error("Failed to open side panel:", err);
  }
  
  const studyTabId = parseInt(setStudyTabBtn.value);
  console.log("Study Tab selected is:", studyTabId);

  try {
    const tab = await getTabById(studyTabId);
    await chrome.storage.local.set({
      currentTabId: tab.id,
    });
  } catch (error) {
    console.error("Error setting up flashcard session:", error);
  }

});

// Helper to wrap chrome.tabs.get in a Promise
function getTabById(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, tab => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tab);
      }
    });
  });
};