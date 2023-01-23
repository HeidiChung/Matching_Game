const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


const Symbols = [
 'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃(index=0)
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心(index=1)
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊(index=2)
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花(index=3)
] 

const view = {
  getCardElement(index){
    return `<div data-index="${index}" class="card back"></div>`
  },

  getCardContent(index){
    const number = this.transformNumber(index % 13  + 1)  //卡牌數字
    const symbol = Symbols[Math.floor (index / 13)] //卡牌花色 
    return `  
      <p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>
    `
  },

  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes){
  const rootElement = document.querySelector('#cards')
   rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("");
  },

 //新增翻牌函式
 flipCards(...cards){
  cards.map(card =>{
    if(card.classList.contains('back')){
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
     }
      card.classList.add('back')
      card.innerHTML = null
  })
  },
  pairCards(...cards){
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score){
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  renderTriedTimes(times){
    document.querySelector('.tried').textContent = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...cards){
    cards.map(card => {
    card.classList.add('wrong')
    card.addEventListener('animationend',event=> event.target.classList.remove('wrong'),{once:true})  
    })
  },

// 遊戲結束畫面
showGameFinished(){
const div = document.createElement('div')
div.classList.add('completed')
div.innerHTML=`
<p>Complete!</p>
<p>Score: ${model.score}</p>
<p>You've tried: ${model.triedTimes} times</p>
`
const header = document.querySelector('#header')
header.before(div)
  }

}

//隨機外掛程式
const utility ={
  getRandomNumberArray(count){
    const number = Array.from(Array(count).keys())
    for (let index = number.length-1 ; index > 0 ; index-- ){
      let randomIndex = Math.floor(Math.random() * (index + 1 ))
      ;[number[index],number[randomIndex]] = [number[randomIndex],number[index]]
    }
    return number
  }

}


// model : 資料管理
const model = {
  revealedCards:[],

  isRevealedCardsMatched(){
    return  this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
  },
  score: 0,

  triedTimes: 0
}

// controller ：控制遊戲流程
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

 // 產生卡片：
  generateCards(){
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card){
    if(!card.classList.contains('back')){
      return
    }

    switch(this.currentState){
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card) //翻牌
        model.revealedCards.push(card) //將翻牌後的資料暫存進model.revealCard
        this.currentState = GAME_STATE.SecondCardAwaits
        break 

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes((++model.triedTimes))

        view.flipCards(card) //翻牌
        model.revealedCards.push(card) //將翻牌後的資料暫存進model.revealCard

        if(model.isRevealedCardsMatched()){
          //配對正確->改變樣式
          view.renderScore((model.score +=10))
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          //遊戲結束畫面達到260分遊戲結束
          if(model.score===260){
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        }else{
          //配對失敗-> 1. 給User時間記憶 2.將牌面翻回背面
         this.currentState = GAME_STATE.CardsMatchFailed
         view.appendWrongAnimation(...model.revealedCards)
         setTimeout(this.resetCards,1000) 
        }
        break 
    }

    console.log('current state:' , this.currentState)
    console.log('revealed cards:' , model.revealedCards)
  },
  
resetCards(){
  view.flipCards(...model.revealedCards)  
  model.revealedCards = []
  controller.currentState = GAME_STATE.FirstCardAwaits
}

}
controller.generateCards()

// Node List
document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('click' , event => {
  controller.dispatchCardAction(card) //原為：view.flipCard(card)
  })
})

