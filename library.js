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

function addImageBlock(imageUrl, desc) {
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

    addImageBlock(roof, "");
    const max = floors.length - 1;
    for (let i = 0; i < numFloors; i++) {
        let rand = Math.floor(Math.random() * max);
        addImageBlock(floors[rand], flashcards[i].session);
    };
    addImageBlock(floor, "");
});