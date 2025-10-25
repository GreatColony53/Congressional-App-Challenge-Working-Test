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
  } else if (message.type === "SIDEBAR_OPENED") {
    console.log("Sidebar was opened");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        console.log("tabs: ", tabs)
        const tab = tabs[0];
        sendResponse({
          tabId: tab.id,
          title: tab.title
        });
      }
    });
    
    return true;
  };
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log("User switched to tab:", tab.title);
    // You can message your sidebar.js if needed
    chrome.runtime.sendMessage({
      type: "TAB_SWITCHED",
      tabId: activeInfo.tabId,
      title: tab.title
    });
  });
});
