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
const clientsReady = {};
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
    socket.data.PeronsalInfo = {};
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

    socket.on("ReadyClient", ()=> {
        socket.data.isReady = true;
        if(IsEveryOneReady())
        {
            Host.emit("ShowPlayButton");
        }
    });

    socket.on("UnreadyClient", ()=> {
        socket.data.isReady = false;
        Host.emit("HidePlayButton");
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
 
    for(let i = 0; i <= clients.length; i++)
    {
        if(clients[i].data.isReady == false)
        {
            return false;
        }
    }

    return true;
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

function ReadyClient(clientID)
{
    
}


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

app.post("/SetServerName", (req, res) => {
    ServerName = req.body.ServerN;
});

app.post("/SetHostName", (req, res) => {
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
    cardsLeft = parseInt(req.body.cardAmount);
    gameName = "Level " + req.body.cardAmount + " (Custom Game)";
    isfullRun = false;
    ChangeWebsiteForEveryone();
});

app.post("/startCustomGame", (req, res) =>
    {
        cardsLeft = parseInt(req.body.cardAmount);
        gameName = "Custom Game";
        isfullRun = false;
        ChangeWebsiteForEveryone();
    });

app.post("/startFullGame", (req, res) =>
    {
        
        cardsLeft = parseInt(req.body.cardAmount);
        gameName = "Level " + req.body.cardAmount;
        isfullRun = true;
        ChangeWebsiteForEveryone();
    });

function ChangeWebsiteForEveryone()
{
    clients.forEach(client => {
        client.emit("ChangeWebiste");
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