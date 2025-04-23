//Server part of script
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "sql3.freesqldatabase.com",
    user: "sql3764497",
    password: "DLw6Hfya4L",
    database: "sql3764497"
});



const { randomInt } = require('crypto');

const express = require('express');
const path = require('path');
const { hostname } = require('os');
const app = express();


const clients = [];
const allMessages = [];
let Host = null;
var portNum = randomInt(0, 60000);
const Server = require('http').createServer(app); 
var ServerName = "";
var HostName = "";
const io = require("socket.io")(Server);
io.on('connection', socket => {
    socket.data.isHost = false;
    socket.data.isReady = false;
    socket.data.userName = "";
    socket.data.cardsLeft = 0;
    socket.data.playedCards = [];
    console.log(socket.data);
    clients.push(socket);
    console.log("Client connected");

    socket.on("MakeServer", (newServerName, uri, userName) =>{
        if(newServerName.trim() == "")
        {
            return;
        }

        if(socket.data.isHost && ServerName != "")
        {
            RemoveServer();
        }

       socket.data.isHost = true;
       Host = socket;
       /*
        console.log("Connected to sql");
        var insertData = `INSERT INTO sql3764497.ServerInfo (ServerName, ServerID, PortNum, HostName) VALUES ('${newServerName}', '${uri}', ${portNum}, '${HostName}')`;
            con.query(insertData, function(err, results) {
                if(err)
                {
                    throw err;
                }
                ServerName = newServerName;
                HostName = userName;
                console.log("Added to sql");
            });
            */
   });

   /*
    socket.on("ChangeServer", (newServerName) => {
            var selectData = `SELECT * FROM sql3764497.ServerInfo WHERE ServerName = ` + mysql.escape(newServerName) ;
            con.query(selectData, function(err, results){

                if(err)
                {
                    throw err;
                }

                socket.emit("ConnectToNewServer", results[0].ServerID);
                ServerName = newServerName;
            });

    });
    */

    socket.on("GetMessageReady", (message) => {
        if(socket.data.userName == "")
        {
            console.log("No username");
            return;
        }
        let senderUserName = socket.data.userName;
        var finalMessagae = `${senderUserName}: ${message}`;
        allMessages.push(finalMessagae);
        clients.forEach(client =>{
                finalMessagae = `${senderUserName}: ${message}`;
                if(client.data.userName == socket.data.userName)
                {
                    finalMessagae = `You: ${message}`;
                }
                if(client.data.userName != "")
                    client.emit("Message", finalMessagae, socket.id);
            
        });
    });

    socket.on("ShowPastMessages", () =>{
        allMessages.forEach(message =>{
            socket.emit("Message", message, "None");
        })
    });

    socket.on("SetCardsLeft", (cardsLeft) => {
        socket.data.cardsLeft = cardsLeft;
        console.log(socket.data.cardsLeft);
        UpdatePlayerCardText();
    });

    socket.on("AddPlayedCard", (cardNum) =>{
        socket.data.playedCards.push(cardNum);
    });

    socket.on("SetUserName", (userName) => {
        clients.forEach(client => {
            if(client.data.userName.trim().toLowerCase() == userName.trim().toLowerCase())
            {
                socket.emit("UserNameTaken");
                return;
            }
        });
        let isChangingName = false;
        let prevUserName = "";
        if(socket.data.userName != "")
        {
            isChangingName = true;
            prevUserName = socket.data.userName
        }
        socket.data.userName = userName;
        if(socket.data.isHost)
        {
            HostName = userName;
        }
        console.log(socket.data);
        let hasHost = ServerName != "";
        socket.emit('UserNameFree', hasHost);
    });

    socket.on("GetSocketData", () => {
        socket.emit("RecieveSocketData", socket.data);     
    });

    socket.on("ChangeReadyStatus", () => {
        socket.data.isReady = !socket.data.isReady;
        console.log(`${socket.data.userName} is ${socket.data.isReady}`)
    });
    
    socket.on("disconnect", () => {
        userLeaving = socket.data.userName;
        

        allMessages.push(`${userLeaving} left`);
        clients.forEach(client =>{
            client.emit("Message", `${userLeaving} left`, socket.io);
        });
        console.log("Connection Lost");
        RemoveClient(socket.id);
        PrintClients();
        if (clients.length == 0 || socket.data.isHost)
        {   
            Server.close();
            console.log("Removing Server");
            RemoveServer();
        }
    });

});



function IsEveryOneReady()
{
    let everyoneReady = true;
    clients.forEach(client => {
        if(client.data.isReady == false)
        {
            everyoneReady = false;
        }
    });
   
    return everyoneReady;
}

function RemoveServer()
{
    
    /*
        var deleteData = "DELETE FROM sql3764497.ServerInfo Where ServerName = " + mysql.escape(ServerName);
        con.query(deleteData, function(err, results){
            if(err)
            {
                throw err;
            }
        });
        ServerName = "";
        */

}

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

function UpdatePlayerCardText()
{
    clients.forEach(client => {
        client.emit("UpdatePlayerInfoText");
    });
}



function ShowReadyButton()
{
    clients.forEach(client => {
        client.emit("ShowReadyButton");
    });
}

function PrintClients()
{
    clients.forEach(client => {
        console.log(client.data.userName);
    })
}


app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static("/workspaces/The_Mind/static"));

//Basic functions/variables of website
var cardsLeft = 0;
var gameName = "";
var isfullRun = false;
var winStatus = "";
var cardsInOrder = [];
let totalCards = 100;
let avaliableCards = [];

//For moving and getting server data and going to new parts of website
app.get("/", (req,res) =>{
    ipAdress = req.ip;
    res.sendFile(path.join(__dirname, 'MenuScreen.html'));
});


app.post("/SetPersonalInfo", (req, res) => {
    const newPersonalInfo = `Email = ${req.body.Email}\nPassword = ${req.body.Password}\n`;
    for(let i = 0; i < clients.length(); i++)
    {
        if(clients[i].data.userName == req.body.Username)
        {  
            clients[i].data.PeronsalInfo = {Email: req.body.Email, Password: req.body.Password};
            break;
        }

    }
});

app.get("/IsEveryoneReady", (req, res) => {
    return res.json({EveryoneReady:IsEveryOneReady()});
});

app.post("/UpdatePlayerCardText", (req, res) => {
    UpdatePlayerCardText();
});

app.get("/GetPersonalInfo",(req, res) => {
    for(let i = 0; i < clients.length; i++)
    {
        if(clients[i].data.userName == req.body.Username)
        {
            res.json(clients[i].data.PeronsalInfo);
            break;
        }
    }
});

app.get("/GetOtherCardInfo", (req, res) =>{
    let otherInfoText = "Player Cards Left\n";
    let totalCardsLeft = 0;
    clients.forEach(client => {
        let playedCardsText = "has played a ";
        if(client.data.playedCards.length == 0)
        {
            playedCardsText = "has played nothing.";
        }
        for(let i = 0; i < client.data.playedCards.length; i++)
        {
            if(i == client.data.playedCards.length - 1)
            {
                playedCardsText += `and ${client.data.playedCards[i]}.`;
            }else
            {
                playedCardsText += `${client.data.playedCards[i]}, `;
            }
        }
       
        if(client.data.cardsLeft > 1)
        {
            otherInfoText += `${client.data.userName}: ${client.data.cardsLeft} cards left and ${playedCardsText}\n`;
        }else if(client.data.cardsLeft == 1)
        {
            otherInfoText += `${client.data.userName}: ${client.data.cardsLeft} card left and ${playedCardsText}!\n`;
        }else
        {
            otherInfoText += `${client.data.userName} has played his whole hand and ${playedCardsText}!\n`;
        }
        totalCardsLeft += client.data.cardsLeft;
    });
    
    if(totalCardsLeft > 1)
    {
        otherInfoText += `There are ${totalCardsLeft} cards left`;
    }else if(totalCardsLeft == 1)
    {
        otherInfoText += `There is only ${totalCardsLeft} card left!`;
    }else
    {
        otherInfoText += "All cards have been played!";
    }

    res.json({GameInfoText: otherInfoText});
});

app.post("/SetServerNameServerSide", (req, res) => {
    ServerName = req.body.ServerN;
});

app.post("/SetHostNameServerSide", (req, res) => {
    HostName = req.body.hostName;
});

app.get("/GetServerName", (req, res) => {
    let tempServerName = ServerName != "" ? ServerName:""
    serverNameData = {ServerN :tempServerName};
    res.json(serverNameData);
});

app.get("/GetHostName", (req, res) => {
    let tempHostName = HostName != "" ? HostName:""
    hostData = {Host: tempHostName};
    res.json(hostData);
});

app.post("/AnimateCardServerSide", (req, res) => {
    console.log(req.body.cards);
    clients.forEach(client => {
        if(req.body.player != client.data.userName)
        {
            client.emit("AnimateCardClientSide", req.body.cards);
        }
    });
});


app.get("/ShowServers", (req, res) => {
    /*
    let serverQuery = "SELECT * FROM sql3764497.ServerInfo";
    con.query(serverQuery, (err, results) => {
        if(err)
        {
            throw err;
        }
        
        res.json(results);


    });
    */
});



app.post("/startGameFromLevel", (req, res) =>
{
    console.log(req.body.cardAmount);
    SetMaxCards_PlayerCount();
    cardsLeft = parseInt(req.body.cardAmount);
    gameName = "Level " + req.body.cardAmount + " (Custom Game)";
    isfullRun = false;
    ShowReadyButton();
});

app.post("/startCustomGame", (req, res) =>
    {
        cardsLeft = parseInt(req.body.cardAmount);
        gameName = "Custom Game";
        isfullRun = false;
        ShowReadyButton();
    });

app.post("/startFullGame", (req, res) =>
    {
        SetMaxCards_PlayerCount();
        cardsLeft = 1;
        gameName = "Level " + 1;
        isfullRun = true;
        ShowReadyButton();
    });

app.get("/GetAvaliableCards", (req, res) => {
    let avaliableCardsJson = {AvaliableCards: avaliableCards};
    console.log("Avalible cards");
    console.log(avaliableCardsJson);
    res.json(avaliableCardsJson);
});

app.post("/CheckForChangeToGame", (req, res) =>
{
    if(IsEveryOneReady())
    {
        ChangeWebsiteForEveryone();
    }
});

app.post("/removeUsedCards", (req, res) => {
    let usedCards = req.body.CardsUsed;
    console.log(usedCards);
    usedCards.forEach(card => {
        let cardIndex = avaliableCards.indexOf(card);
        console.log(cardIndex);
        avaliableCards.splice(cardIndex, 1);
    });
});

function SetMaxCards_PlayerCount()
{
    playerAmount = clients.length;
    maxCards = 100;
    let addAmount = clients.length - 4;
    if(addAmount > 0)
    {
        maxCards += addAmount * 25;
    }
    totalCards = maxCards;
}

function SetMaxCards_Custom(maxCards)
{
    totalCards = maxCards;   
}


function ResetAvaliableCards()
{
    for(let i = 1; i <= totalCards; i++)
    {
        avaliableCards.push(String(i));
    }
    console.log(avaliableCards);
}

function ChangeWebsiteForEveryone()
{
    ResetAvaliableCards();
    clients.forEach(client => {
        client.data.cardsLeft = cardsLeft;
        client.data.isReady = false;
        client.data.playedCards = [];
        client.emit("ChangeWebsite");
    });
}

app.get("/getGameData", (req, res) => {
    data = {CardsLeft: cardsLeft, GameName: gameName, FullRun: isfullRun};
    res.json(data);
});

app.get("/getHasHost", (req, res) => {
    data = {HasHost: false};
    if(HostName != "")
    {
        data.HasHost = true;
    }
    console.log(HostName);
    console.log(data);
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
    console.log("Sorted Cards");
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

app.post("/sendToNextLevel", (req, res) => {
    ResetAvaliableCards();
    clients.forEach(client => {
        client.data.playedCards = [];
        client.emit("NextLevel");
    });
});

app.post("/returnToMenu", (req, res) => {

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