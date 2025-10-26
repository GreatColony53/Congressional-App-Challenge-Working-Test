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
const sessionNameTitle = document.getElementById("sessionNameTitle");
const reviewSet = document.getElementById("reviewSet");
let currentFlashcardID = 0;
let displayCard;
const left = document.getElementById("left");
const right = document.getElementById("right");

const cardNumber = document.getElementById("cardNumber");

chrome.storage.local.get(["FlashcardStorage", "currentReviewSessionID"]).then((storage) => {
  const currentReviewSessionID = storage.currentReviewSessionID
  const currentSession = storage.FlashcardStorage[currentReviewSessionID];
  let flashcardsForReview = currentSession.cards;
  sessionNameTitle.textContent = "Session Name: " + currentSession.session;
  let numFlashcards = flashcardsForReview.length

  for (let i = 0; i < numFlashcards; i++) {
    const storedCard = flashcardsForReview[i];
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    
    const question = document.createElement("p");
    question.textContent = "Q: " + storedCard.question
    question.class = "question";
    question.style.display = "block"

    const answer = document.createElement("p");
    answer.textContent = "A: " + storedCard.answer;
    answer.class = "answer";
    answer.style.display = "none"

    cardDiv.appendChild(question);
    cardDiv.appendChild(answer);
    cardDiv.onclick = () => {
      console.log("Card has been flipped!")
      if (question.style.display === "none") {
        question.style.display = "block";
        answer.style.display = "none";
      } else {
        question.style.display = "none";
        answer.style.display = "block";
      };
    }
    reviewSet.insertBefore(cardDiv, cardNumber);
  }
  updateDisplayCard() // Initializes with the index 0 card
  left.style.display = "none";
  if (reviewSet.getElementsByClassName("card").length <= 1) {
    right.style.display = "none";
  }
});

function updateDisplayCard () {
  const cards = reviewSet.getElementsByClassName("card");

  if (displayCard) {displayCard.id = null}; // Removes the display card id hence returning it to the css class 'card' making it not visible
  displayCard = cards[currentFlashcardID];
  displayCard.id = "displayCard";

  cardNumber.textContent = currentFlashcardID;

  // Set the correct visibility for left and right buttons
  if (currentFlashcardID <= 1) {
    left.style.display = "none";
  } else if (currentFlashcardID >= cards.length - 1) {
    right.style.display = "none";
  } else {
    right.style.display = "block";
    left.style.display = "block";
  }
}

right.addEventListener("click", () => {
  currentFlashcardID += 1;
  updateDisplayCard();
});

left.addEventListener("click", () => {
  currentFlashcardID -= 1;
  updateDisplayCard();
});

/*
let totalFlashCards;
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
      answerP.style.display = "none";
      newFlashcardDiv.appendChild(answerP);

      if (i !== 0) {
        newFlashcardDiv.style.display = "none";
      }
      else {
        newFlashcardDiv.style.display = "block";
      }
    }
    totalFlashcards = parentDiv.children.length;
    console.log("totalFlashCards in set: " + totalFlashcards);
  });
}


const parentDiv = document.getElementById("reviewSet");
let currentFlashcardID = 0;



const forw = document.getElementById("forw");
const back = document.getElementById("back");
forw.addEventListener("click", async () => {
  console.log("Start button clicked");
  nextCard();
});

back.addEventListener("click", async () => {
  console.log("Bakc button clicked");
  prevCard();
});

function prevCard() {
  console.log("currentFlashCardId: " + currentFlashcardID);
    if (currentFlashcardID > 0) {
      document.getElementById(currentFlashcardID).style.display = "none";
      currentFlashcardID -= 1;
      document.getElementById(currentFlashcardID).style.display = "block";
    }
}

function flipCard() {
  console.log("currentFlashCardId: " + currentFlashcardID);
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
  console.log("currentFlashCardId: " + currentFlashcardID);
    if (currentFlashcardID < totalFlashcards - 1) {
      document.getElementById(currentFlashcardID).style.display = "none";
      currentFlashcardID += 1;
      document.getElementById(currentFlashcardID).style.display = "block";
    }
}
    */