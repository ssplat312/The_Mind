let avalibleCards = [];
function ResetCards()
{
    avalibleCards = [];
    for(var i = 1; i <= 100; i++)
    {
            avalibleCards[i - 1] = String(i);
    }
    console.log(avalibleCards);
}


function SetHand(handSize)
{
    let hand = document.getElementById("Hand");
    hand.replaceChildren();
    for(var i = 0; i < handSize; i++)
    {
        selectedCardPos = Math.floor(Math.random() * avalibleCards.length);
        cardVal = avalibleCards[selectedCardPos];
        avalibleCards.splice(selectedCardPos, 1);
        const card = document.createElement("p");
        card.innerText = cardVal;
        card.className = "Card";
        hand.append(card)
    }
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

ResetCards();
SetHand(4);
SetCardsPosition();