//add new pieces of tower after each succesful session, floor is already there
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