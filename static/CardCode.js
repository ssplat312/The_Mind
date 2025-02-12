let avalibleCards = [];
let selectedCards = [];
let cardsinHand = [];
let cardsInOrder = [];
let hand = document.getElementById("Hand");
let pile = document.getElementById("Pile");
var canSelect = true;
function ResetCards()
{
    avalibleCards = [];
    for(var i = 1; i <= 100; i++)
    {
        avalibleCards.push(String(i));
    }
}


function SetHand(handSize)
{
    ResetCards();
    hand.replaceChildren();
    var cardList = [];
    for(var i = 0; i < handSize; i++)
    {
        if(i >= 100)
        {
            break;
        }
        selectedCardPos = Math.floor(Math.random() * avalibleCards.length);
        cardVal = avalibleCards[selectedCardPos];
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
    console.log(avalibleCards);
}

function SetCardsPosition()
{
    let hand = document.getElementById("Hand");
    var cards = hand.getElementsByClassName("Card");
    lMargin = 0;

    for(var i = 0; i < cards.length; i++)
    {   
        cards[i].style.marginLeft = String(lMargin) + "px";
        lMargin += 90;
       
    }
}

hand.addEventListener("click", function(event){

    if(FindIndex(event.target.classList, "Card") != -1 && canSelect)
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

        console.log(selectedCards);
    }
});


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
    var isFirst = true
    ReomveSelectedCardsFromHand();
    var waitAmount = 0;
     selectedCards.forEach(card => {
        AddCardMoveAnimation(card, waitAmount, isFirst);
        isFirst = false
        waitAmount += 1000;
        //Wait till card moves in place to do this
    });

    selectedCards = [];
    await wait(waitAmount);
    canSelect = true;


}

async function AddCardMoveAnimation(card, waitAmount, isFirst)
{
    await wait(waitAmount);
    var lMarginSize = parseInt(card.style.marginLeft.replace("px", ""));
    if(!isFirst)
    {
        lMarginSize -= 90;
    }
    card.classList.remove("active");
    card.classList.add("currentlyPlayed");
    card.style.transform = "translate(" + String(-lMarginSize) + "px, -300px)";

    await wait(1000);
   SetCardInPile(card);
   SetCardsPosition();
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
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

ResetCards();
SetHand(12);
SetCardsPosition();