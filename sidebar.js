function updateTimer(endTime) {
    const now = new Date().getTime();  
    const remaining = endTime - now;

    if (remaining <= 0) {
        document.getElementById("hoursCount").textContent = "00:";
        document.getElementById("minutesCount").textContent = "00:";
        document.getElementById("secondsCount").textContent = "00";
        return;
    } 

    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById("hoursCount").textContent = `${String(hours).padStart(2, '0')}:`;
    document.getElementById("minutesCount").textContent = `${String(minutes).padStart(2, '0')}:`;
    document.getElementById("secondsCount").textContent = String(seconds).padStart(2, '0');


    setTimeout(() => updateTimer(endTime), 1000);
}

const endTime = localStorage.getItem("studyEndTime");
if (endTime) {
  updateTimer(endTime);
} else {
  // Optional: handle when no timer is set
  document.getElementById("hoursCount").textContent = "00:";
  document.getElementById("minutesCount").textContent = "00:";
  document.getElementById("secondsCount").textContent = "00";
}

const wizard = document.getElementById("wizardGif");

function changeGifEvery40Secs() {
  wizard.src = "assets/Test Gif.gif";
  setTimeout(() => {
    wizard.src = "assets/Wizard Gif.gif";
  }, 2250);

  const endTime = localStorage.getItem("studyEndTime");
  if (endTime > 10000) { //change to 60000 after testing
    setTimeout(() => changeGifEvery40Secs(), 5000); //change back to 40000 after testing
  }
  else {
    //once end gif is added, change to gif, timeout for gif duration, then change to still image
  }

}

setTimeout(() => changeGifEvery40Secs(), 5000); //change back to 40000 after testing
//maybe do something about onclick for startBtn
