chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
    .catch((error) => console.error("Failed to set panel behavior:", error));
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "POPUP_OPENED") {
    console.log("Popup was opened!");
    // Do something here
    chrome.tabs.query({currentWindow: true }, (tabs) => {
      console.log(tabs);
      sendResponse({tabs});
    });
    return true;
  }
});
