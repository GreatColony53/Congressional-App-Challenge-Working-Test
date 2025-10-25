/*
cards is 2d array, each index has a length of 2 array | 0 index is question, 1 index is answer
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
chrome.storage.local.get(["currentSessionID"]).then((storage) => {
  createFlashcards(storage.currentSessionID);
});

function createFlashcards(currentSession) {
  chrome.storage.local.get(["FlashcardStorage"]).then(async (storage) => {
    let numFlashcards = storage.FlashcardStorage[currentSession].cards.length;
    for (let i = 0; i < numFlashcards; i++) {
      const newFlashcardDiv = document.createElement("div");
      newFlashcardDiv.id = i;
      newFlashcardDiv.className = "flashcard";
      newFlashcardDiv.onclick = flipCard;
      parentDiv.appendChild(newFlashcardDiv);

      const questionP = document.createElement("p");
      questionP.className = "TextElement";
      questionP.textContent = storage.FlashcardStorage[currentSession].cards[i].question;
      newFlashcardDiv.appendChild(questionP);

      const answerP = document.createElement("p");
      answerP.className = "TextElement";
      answerP.textContent = storage.FlashcardStorage[currentSession].cards[i].answer;
      newFlashcardDiv.appendChild(answerP);

      if (i !== 0) {
        newFlashcardDiv.style.display = "none";
      }
      else {
        newFlashcardDiv.style.display = "block";
      }
    }
  });
}


const parentDiv = document.getElementById("reviewSet");
let currentFlashcardID = 0;
const totalFlashcards = parentDiv.childElementCount;

function prevCard() {
    if (currentFlashcardID > 0) {
      document.getElementById(currentFlashcardID).style.display = "none";
      currentFlashcardID -= 1;
      document.getElementById(currentFlashcardID).style.display = "block";
    }
}

function flipCard() {
  if (document.getElementById(currentFlashcardID).children[0].style.display === "block") {
    document.getElementById(currentFlashcardID).children[0].style.display = "none";
    document.getElementById(currentFlashcardID).children[1].style.display = "block";
  }
  else {
    document.getElementById(currentFlashcardID).children[0].style.display = "block";
    document.getElementById(currentFlashcardID).children[1].style.display = "none";
  }
}

function nextCard() {
    if (currentFlashcardID < totalFlashcards - 1) {
      document.getElementById(currentFlashcardID).style.display = "none";
      currentFlashcardID += 1;
      document.getElementById(currentFlashcardID).style.display = "block";
    }
}