
function SetWinText()
{
    console.log("here");
    fetch("/getWinData").then(response => response.json()).then(winData => {
        let winText = document.getElementById("WinStatus");
        console.log(winData);
        console.log("Got data");
        var winStatus = winData.WinStatus;
        console.log(winStatus);
        winText.innerHTML = winStatus;
    });
}

SetWinText();