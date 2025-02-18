
const { randomInt } = require('crypto');
const clients = [];
const express = require('express');
const path = require('path');
const app = express();
var portNum = randomInt(1000,9999);
const Server = require('http').createServer(app); 
const io = require("socket.io")(Server);
io.on('connection', socket => {
    clients.push(socket);
    console.log("Client connected");
    PrintClients();
    socket.on("disconnect", () => {
        console.log("Connection Lost");
        RemoveClient(socket.id);
        PrintClients();
    });
});

function RemoveClient(clientId)
{
    for(var i = 0; i < clients.length; i++)
    {
        if(clients[i].id == clientId)
        {
            clients.splice(i, 1);
            console.log("Client removed");
            return;
        }
    }

    console.log("Client does not exist");
}

function PrintClients()
{
    clients.forEach(client => {
        console.log(client.id);
    })
}
var ServerName = "";
var newServer = false;
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static("/workspaces/The_Mind/static"));

var cardsLeft = 0;
var gameName = "";
var isfullRun = false;
var winStatus = "";
var cardsInOrder = [];
app.get("/", (req,res) =>{
    if(newServer)
    {
        return;
    }
    ipAdress = req.ip;
    console.log("Your ip is " + ipAdress);
    res.sendFile(path.join(__dirname, 'MenuScreen.html'));
});


app.post("/connectToServer", (req,res) =>{
   
});



app.post("/startGameFromLevel", (req, res) =>
{
    cardsLeft = parseInt(req.body.cardAmount);
    gameName = "Level " + req.body.cardAmount + " (Custom Game)";
    isfullRun = false;
    res.sendFile(path.join(__dirname, 'MainPage.html'));
});

app.post("/startCustomGame", (req, res) =>
    {
        cardsLeft = parseInt(req.body.cardAmount);
        gameName = "Custom Game";
        isfullRun = false;
        res.sendFile(path.join(__dirname, 'MainPage.html'));
    });
    
app.post("/startFullGame", (req, res) =>
    {
        cardsLeft = parseInt(req.body.cardAmount);
        gameName = "Level " + req.body.cardAmount;
        isfullRun = true;
        res.sendFile(path.join(__dirname, 'MainPage.html'));
    });



app.get("/getGameData", (req, res) => {
    data = {CardsLeft: cardsLeft, GameName: gameName, FullRun: isfullRun};
    res.json(data);
});

app.get("/getWinData", (req, res) => {
    data = {WinStatus: winStatus};
    res.json(data);
});

app.post("/setWinStatus", (req, res) => {
    winStatus = req.body.WinData;
});

app.get("/returnToMenu", (req, res) =>{
    res.sendFile(path.join(__dirname, 'MenuScreen.html'));
});

app.post("/setCardsInOrder", (req, res) =>{
    req.body.CardsUsed.forEach(card => {
        cardsInOrder.push(card);
    });
    cardsInOrder = SortCards(cardsInOrder);

});

app.post("/checkCardsInOrder", (req, res) =>{
    cardData = {CardsInOrder: false, LastCard: false};
    if(req.body.CurCard == cardsInOrder[0])
    {
        cardData.CardsInOrder = true;
        cardsInOrder.splice(0, 1);
    }

    if(cardsInOrder.length == 0)
    {
        cardData.LastCard = true;
    }
    res.json(cardData);
});

function SortCards(cardList)
{
    for(var i = 1; i < cardList.length; i++)
    {
        var j = i;
        while(j > 0)
        {
            if(parseInt(cardList[j - 1]) > parseInt(cardList[j]))
            {
                let tempCard = cardList[j];
                cardList[j] = cardList[j - 1];
                cardList[j - 1] = tempCard;
                j--;
            }else
            {
                break;
            }
        }
    }

    return cardList;

}


Server.listen(portNum, ()=>{
    console.log(`Server listening to port ${portNum}`);
})