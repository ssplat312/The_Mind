
const express = require('express')
const path = require('path');
const app = express()

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static("/workspaces/The_Mind/static"));

var cardsLeft = 0;
var gameName = "";

app.get("/", (req,res) =>{
    res.sendFile(path.join(__dirname, 'MenuScreen.html'));
});



app.post("/startGame", (req, res) =>
{
    console.log(req.body);    
    cardsLeft = parseInt(req.body.cardAmount);
    gameName = "Custom Game";
    res.sendFile(path.join(__dirname, 'MainPage.html'));
    console.log(cardsLeft, gameName);
});

function MakeServer(ServerNum)
{
    const port = ServerNum;
    app.listen(port, () => console.log(`Server listening on  port ${port}`)); 
}

app.get("/getGameData", (req, res) => {
    data = {CardsLeft: cardsLeft, GameName: gameName};
    console.log(data);
    res.json(data);
});

MakeServer(1092);
