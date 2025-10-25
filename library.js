/*//add new pieces of tower after each succesful session, floor is already there
let sessions = localStorage.getItem("timesStudied") || 0; //|| localStorage.setItem("timesStudied", 0);
const thirtySecs = 30000;
const checkTime = new Date().getTime();
const studyendTime = localStorage.getItem("studyEndTime");
const start = localStorage.getItem("programStart");

function buildTower() {
    if (sessions < 9) {
        for (let i = 1; i <= sessions; i++) {
           document.getElementById(i).style.display = "block";
        }
    }   
    else {
        for (let i = 1; i <= 9; i++) {
            document.getElementById(i).style.display = "block";     
        }
    }
    if (checkTime - thirtySecs >= start) {
        sessions++;
        localStorage.setItem("timesStudied", sessions);
        document.getElementById(sessions).style.display = "block";
    }
};
buildTower();
*/

const floor = "assets/Floor.png"
const floors = [
    "assets/Middle1.png",
    "assets/Middle2.png",
    "assets/Middle3.png",
    "assets/Middle4.png",
    "assets/Middle5.png",
    "assets/Middle6.png",
]
const roof = "assets/Roof.png"

function addImageBlock(imageUrl, desc, sessionID) {
  // Create outer div
  const wrapperDiv = document.createElement('div');
  wrapperDiv.style.width = "100%";
  wrapperDiv.style.display = "flex";
  wrapperDiv.style.flexDirection = "row";
  wrapperDiv.style.justifyContent = "right"; // centers horizontally
  wrapperDiv.style.alignItems = "center"; // centers vertically
  // wrapperDiv.style.border = "1px dashed red";

  // Create image element
  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = "Tower Part";
  //so onClick we can store the sessionID and in reviewPage
  //retrieve to use the appropriate flashcard
  img.onclick = openReviewPage(sessionID);

  img.style.flex = "1";
  // img.style.border = "1px dashed purple";

  // Create a title for the image
  if (desc) {
    const title = document.createElement('p');
    title.textContent = desc;
    title.style.textAlign = "center";
    title.style.flex = "0.8";
    // title.style.border = "1x dashed orange";
    title.style.fontWeight = "bold";
    wrapperDiv.appendChild(title);
  } else {
    img.style.flex = "0.55";
  };

  // Append image to wrapper
  wrapperDiv.appendChild(img);

  // Append wrapper to vertical column
  const castle = document.getElementById('castle');
  castle.appendChild(wrapperDiv);
}

chrome.storage.local.get(["FlashcardStorage"]).then((storage) => {
    console.log("Retrieved FlashcardStorage for tower building:", storage.FlashcardStorage);
    let flashcards = storage.FlashcardStorage || [];
    const numFloors = flashcards.length;
    console.log("Number of floors to build:", numFloors);

    addImageBlock(roof, "", -1);
    const max = floors.length - 1;
    for (let i = 0; i < numFloors; i++) {
        let rand = Math.floor(Math.random() * max);
        addImageBlock(floors[rand], flashcards[i].session, i);
    };
    addImageBlock(floor, "", -1);
});

function openReviewPage(sessionID) {
    if (sesionId != -1) {
        chrome.tabs.create({ url: "reviewPage.html" });
        chrome.storage.local.set({ "currentSessionID": sessionID }).then(() => {
            console.log("Stored currentSessionID:", sessionID);
        });
    }
}
