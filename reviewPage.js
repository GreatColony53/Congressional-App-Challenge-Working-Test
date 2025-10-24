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
chrome.storage.local.get(["FlashcardStorage"]).then(async (storage) => {
  let numFlashcards = storage.FlashcardStorage[0 "supposed to be current session num"].cards.length;
  for (let i = 0; i < numFlashcards; i++) {
    parentDiv.innerHTML += `<div id="${i}" class="flashcard"> </div>';
    adding to html div that was created(question portion) = storage.FlashcardStorage[0].cards[i].question;
    adding to html div that was created(answer portion) = storage.FlashcardStorage[0].cards[i].answer;
  }
});
*/

const parentDiv = document.getElementById("test");

function prevCard() {
    //change card div block to none
    //change previous card div none to block
    //if div id = 0, dont do anything
}

function flipCard() {
    //change card text content from showing one to not showing one
}

function nextCard() {
    //change card div block to none
    //change next card div none to block
    //if div id = card.length - 1, dont do anything
}