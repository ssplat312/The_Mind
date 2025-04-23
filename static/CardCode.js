let avalibleCards = [];
let selectedCards = [];
let cardsinHand = [];
let cardsInOrder = [];
var hand = null;
var pile = null;
var playerInfoElement = null;
var canSelect = true;
var roundOver = false;
var fullRun = false;
var cardsLeft = 0;
var totalCards = 0;

function SetCardElements()
{
    hand = document.getElementById("Hand");
    pile = document.getElementById("Pile"); 
    playerInfoElement = document.getElementById("OtherPlayersText");
    SetElementListeners();
}

function SetElementListeners()
{
    hand.addEventListener("click", function(event){

        if(FindIndex(event.target.classList, "Card") != -1 && canSelect && roundOver == false)
        {
            let curCard = event.target;
            cardIndex = FindIndex(selectedCards, curCard);
            if(cardIndex != -1)
            {
                curCard.classList.remove("active");
                selectedCards.splice(cardIndex, 1);
            }else
            {
                curCard.classList.add("active");
                selectedCards.push(curCard);
            }
    
        }
    });
}

function ShowOtherPlayerInfo()
{
    fetch("/GetOtherCardInfo").then(response => response.json()).then(CardsInfoJson => {
        playerInfoElement.innerText = CardsInfoJson.GameInfoText;
    });
}

async function UpdateEveryoneCardInfo()
{
    await fetch("/UpdatePlayerCardText", {
        method: "post"
    });
}

async function GetAvalibleCards()
{
    await fetch("GetAvaliableCards").then(response => response.json()).then(AvalibleCardsJson => {
        console.log(AvalibleCardsJson.AvaliableCards);
        avalibleCards = AvalibleCardsJson.AvaliableCards;
    });

}


async function SetHand(handSize, gameName)
{
    document.getElementsByClassName("StickTop")[0].innerText = gameName;
    await GetAvalibleCards();
    cardsLeft = handSize;
    UpdateCardsLeft();
    UpdateEveryoneCardInfo();
    console.log(avalibleCards);
    hand.replaceChildren();
    pile.replaceChildren();
    var cardList = [];
    var cardsVal = [];
    for(let i = 0; i < handSize; i++)
    {
        if(i >= 100)
        {
            break;
        }
        let selectedCardPos = Math.floor(Math.random() * avalibleCards.length);
        let cardVal = avalibleCards[selectedCardPos];
        cardsVal.push(cardVal);
        avalibleCards.splice(selectedCardPos, 1);
        const card = document.createElement("p");
        card.innerText = cardVal;
        card.className = "Card";
        cardList.push(card);
    }
    cardList = SortCards(cardList);
    cardList.forEach(card => {
        hand.append(card);
        cardsinHand.push(card);
    });

    cardData = {CardsUsed: cardsVal};

    fetch("/removeUsedCards", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cardData)
    });

    fetch("/setCardsInOrder", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify(cardData)
    });
    SetCardsPosition();
}

function SetCardsPosition()
{
    var cards = hand.getElementsByClassName("Card");
    lMargin = 0;

    for(var i = 0; i < cards.length; i++)
    {   
        cards[i].style.marginLeft = String(lMargin) + "px";
        lMargin += 90;
    }
    console.log("Setting Deck");
    //Add code here to center deck
}


function FindIndex(array, value)
{
    for(var i = 0; i < array.length; i++)
    {
        if(array[i] == value)
        {
            return i;
        }
    }

    return -1;
}


function ReomveSelectedCardsFromHand()
{
    selectedCards.forEach(card => {
        cardsinHand.splice(FindIndex(cardsinHand, card), 1);
    });

}

async function PlayCards()
{
    if(canSelect == false)
    {
        return;
    }else
    {
        canSelect = false;
    }
    selectedCards = SortCards(selectedCards);
    let isFirst = true;
    ReomveSelectedCardsFromHand();
    let waitAmount = 0;
    let cardsText = [];
    selectedCards.forEach(card => {
        cardsText.push(card.innerText);
    });
    //The fetch request will send the card data to the other clients so they can use the data to make the cards on thier side.
    fetch("AnimateCardServerSide", {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"cards":cardsText, "player":GetUserNameClientSide()})

    });
     selectedCards.forEach(card => {
        AddCardMoveAnimation(card, waitAmount, isFirst);
        cardsLeft--;
        isFirst = false
        waitAmount += 500;
        UpdateCardsLeft();
        AddPlayedCard(card.innerText);
        ShowOtherPlayerInfo();
        //Wait till card moves in place to do this
    });

    selectedCards = [];
    await wait(waitAmount);
    canSelect = true;


}


async function AnimateCardFromOtherPlayer(cardNum, waitTime)
{
    await wait(waitTime);
    const tempCard = CreateCard(cardNum);
    SetCardInPileForOtherPlayer(tempCard);
}

function CreateCard(cardVal)
{
    const card = document.createElement("p");
    card.innerText = cardVal;
    card.className = "Card";
    return card;
}

async function AddCardMoveAnimation(card, waitAmount, isFirst)
{
    await wait(waitAmount);
    if(roundOver)
    {
        card.classList.remove("active");
        SetCardsPosition();
        return;
    }
    let lMarginSize = parseInt(card.style.marginLeft.replace("px", ""));
    if(!isFirst)
    {
        lMarginSize -= 90;
    }
    card.classList.remove("active");
    card.classList.add("currentlyPlayed");
    card.style.transform = "translate(" + String(-lMarginSize) + "px, -300px)";

    await wait(500);
   SetCardInPile(card);
   SetCardsPosition();
   CheckCard(card.innerText);
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }


async function CheckCard(cardText)
{
    var isInOrder = false;
    var isLastCard = false;
    let cardData = {CurCard: cardText};
    await fetch("/checkCardsInOrder",{
        method:"post",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cardData)

    }).then(response => {return response.json()}).then(cardData =>{
        isInOrder = cardData.CardsInOrder;
        isLastCard = cardData.LastCard;
    })

    if(isInOrder)
    {
        if(isLastCard)
        {
            roundOver = true;
            console.log("You won this round");
            if(fullRun && totalCards < 10)
            {
                document.getElementById("NextLevelButton").hidden = false;
            }else
            {
                var winText = "You won ";
                if(fullRun)
                {
                    winText += "10/10 levels!";
                }else
                {
                    winText += "with " + totalCards + " cards in total";
                }

                winData = {WinData: winText};
                
                fetch("/setWinStatus", {
                    method: "post",
                    headers: {
                        'Content-Type': 'application/json'
                        },
                    body: JSON.stringify(winData)
                });

                document.getElementById("PlayButton").hidden = true;
                document.getElementById("EndButton").hidden = false;
            }
        }
    }else
    {
        roundOver = true;
        console.log("User is incorrect");
        var winText = "You lost ";
        if(fullRun)
        {
            winText += "at " + gameName + " out of 10";
        }else
        {
            winText += "with " + totalCards + " cards in total";
        }

        winData = {WinData: winText};
        fetch("/setWinStatus", {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(winData)
        });
        document.getElementById("PlayButton").hidden = true;
        document.getElementById("EndButton").hidden = false;
    }
}

function GetCardsLeft()
{
    return cardsLeft;
}

function SetCardInPile(card)
{
  
    card.style.transform = "translate(0,0)";
    card.style.marginLeft = "0px";
    card.classList.remove("currentlyPlayed");
    card.classList.add("played"); 
    hand.removeChild(card);
    pile.append(card);
    
}

function SetCardInPileForOtherPlayer(card)
{
    card.style.transform = "translate(0,0)";
    card.style.marginLeft = "0px";
    card.classList.add("played"); 
    pile.append(card);
}

function SortCards(cardList)
{
    for(var i = 1; i < cardList.length; i++)
    {
        var j = i;
        while(j > 0)
        {
            if(parseInt(cardList[j - 1].innerText) > parseInt(cardList[j].innerText))
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

function StartGame()
{
    document.getElementById("StartButton").hidden = true;
    fetch("/getGameData")
    .then(response =>{return response.json();}
        )
    .then(gameData =>
        { 
            fullRun = gameData.FullRun;
            totalCards = gameData.CardsLeft;
            SetHand(gameData.CardsLeft, gameData.GameName);
        });

}

function SendEveryToNextLevel()
{
    fetch("/sendToNextLevel", {
        method: "post"
    });
}

function NextLevel()
{
    roundOver = false;
    document.getElementById("NextLevelButton").hidden = true;
    totalCards++;
    gameName = "Level " + String(totalCards);
    SetHand(totalCards, gameName);
}

