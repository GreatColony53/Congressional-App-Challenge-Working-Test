const Middles = [
    "assets/Middle1.png",
    "assets/Middle2.png",
    "assets/Middle3.png",
    "assets/Middle4.png",
    "assets/Middle5.png",
    "assets/Middle6.png",
]

function addImageBlock(imageUrl, desc, sessionID) {
  // Create outer div
  const middleDiv = document.createElement('div');
  middleDiv.className = "Middle";

  // Create image element
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = "Tower Part";
  img.onclick = () => {
    chrome.storage.local.set({ "currentReviewSessionID": sessionID }).then(() => {
        console.log("Stored currentSessionID:", sessionID);
        chrome.tabs.create({ url: "reviewPage.html" });
    });
  };
  // must set session id in sotrage for use on review page

  // Create a title for the image
  const title = document.createElement('h2');
  title.textContent = "Session Name: " + desc;

  // Append image to wrapper
  middleDiv.appendChild(img);
  middleDiv.appendChild(title);

  // Append wrapper to vertical column
  const castle = document.getElementById('castle');
  const Floor = document.getElementById("Floor");
  castle.insertBefore(middleDiv, Floor);
}

chrome.storage.local.get(["FlashcardStorage"]).then((storage) => {
    console.log("Retrieved FlashcardStorage for tower building:", storage.FlashcardStorage);
    let flashcards = storage.FlashcardStorage || [];
    const numFloors = flashcards.length;
    console.log("Number of floors to build:", numFloors);

    const max = Middles.length - 1;
    for (let i = 0; i < numFloors; i++) {
        let rand = Math.floor(Math.random() * max);
        addImageBlock(Middles[rand], flashcards[i].session, i);
    };
});