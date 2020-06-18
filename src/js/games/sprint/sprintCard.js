export default class SprintCard {
  constructor(counter, statistic, timer, wordList) {
    this.timer = timer;
    this.intervalId = null;
    this.wordList = wordList;
    this.wordListRangeStart = 0;
    this.wordListRangeEnd = wordList.length - 1;
    this.counter = counter;
    this.statistic = statistic;
    this.wordListMessage = 'Слова закончились( Добавьте больше слов из словаря';
    this.answers = 0;
    this.correctAnswers = 0;
    this.allCorrectAnswers = 0;
    this.allWrongAnswers = 0;
    this.points = 0;
    this.cur = 10;
    this.multiplier = 2;
    this.isSame = null;
    this.element = this.getCard();
    this.info = this.element.querySelector('.j-info');
    this.word = this.element.querySelector('.j-word');
    this.translation = this.element.querySelector('.j-translation');
    this.addWordAndTranslateToCard();
    this.addClickEventsToCardButtons();
    this.addKeyDownEventToCardButtons();
    return this.element;
  }

  getCard() {
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="sprint__card">
        <div class="sprint__card-main">
            <ul class="sprint__card-main-indicator j-indicator">
              <li class="sprint__card-main-indicator-item"></li>
              <li class="sprint__card-main-indicator-item"></li>
              <li class="sprint__card-main-indicator-item"></li>
              <li class="sprint__card-main-indicator-item"></li>
            </ul>
            <p class="sprint__card-main-info j-info"></p>
            <img class="sprint__card-main-icon" src="#" alt="icon">
            <p class="sprint__card-main-word j-word"></p>
            <p class="sprint__card-main-translation j-translation"></p>
        </div>
        <div class="sprint__card-btn">
            <button class="sprint__card-btn-item button j-falseBtn">Неверно</button>
            <button class="sprint__card-btn-item button j-trueBtn">Верно</button>
        </div>
      </div>
    `;
    return template.content;
  }

  addWordAndTranslateToCard() {
    if (this.wordList.length === this.answers) {
      this.statistic.message = this.wordListMessage;
      this.timer.destroy();
    } else {
      this.word.innerHTML = this.wordList[this.answers].word;
      this.isSame = Boolean(Math.random() < 0.5);
      if (this.isSame === true) {
        this.translation.innerHTML = this.wordList[this.answers].wordTranslate;
      } else {
        // eslint-disable-next-line max-len
        let rand = Math.floor(this.wordListRangeStart + Math.random() * (this.wordListRangeEnd + 1 - this.wordListRangeStart));
        console.log(rand);
        this.translation.innerHTML = this.wordList[rand].wordTranslate;
        if (rand === this.answers) {
          this.isSame = true;
        }
      }
      this.answers++;
    }
  }

  addClickEventsToCardButtons() {
    const btnGroup = this.element.querySelector('.sprint__card-btn');
    btnGroup.addEventListener('click', (event) => {
      const target = event.target;
      if ((target.classList.contains('j-falseBtn') && this.isSame === false) || (target.classList.contains('j-trueBtn') && this.isSame === true)) {
        this.updateAnswersAndStatistic();
        this.counter.setCounter(this.points);
      } else if (target.classList.contains('j-falseBtn') || target.classList.contains('j-trueBtn')) {
        this.resetAnswers();
      }
      this.addWordAndTranslateToCard();
    });
  }

  addKeyDownEventToCardButtons() {
    document.addEventListener('keydown', (event) => {
      if ((event.code === 'ArrowLeft' && this.isSame === false) || (event.code === 'ArrowRight' && this.isSame === true)) {
        this.updateAnswersAndStatistic();
        this.counter.setCounter(this.points);
        this.addWordAndTranslateToCard();
      } else if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        this.resetAnswers();
        this.addWordAndTranslateToCard();
      }
    });
  }

  resetAnswers() {
    this.correctAnswers = 0;
    this.cur = 10;
    this.toggleIndicatorAndInfo();
    this.allWrongAnswers++;
    this.statistic.allWrongAnswers = this.allWrongAnswers;
  }

  updateAnswersAndStatistic() {
    if (this.correctAnswers === 4) {
      this.cur *= this.multiplier;
      this.correctAnswers = 0;
      this.toggleIndicatorAndInfo();
    }
    this.toggleIndicatorAndInfo(this.correctAnswers);
    this.correctAnswers++;
    this.allCorrectAnswers++;
    this.points += this.cur;
    this.statistic.allCorrectAnswers = this.allCorrectAnswers;
    this.statistic.points = this.points;
  }

  toggleIndicatorAndInfo(childNumber) {
    const indicator = document.querySelector('.j-indicator');
    if (childNumber === undefined) {
      Array.from(indicator.children).forEach(child => child.classList.remove('indicator-item-highlight'));
      this.info.innerHTML = '';
    } else {
      indicator.children[childNumber].classList.add('indicator-item-highlight');
      if (this.cur > 10) {
        this.info.innerHTML = `+${this.cur} очков за слово`;
      }
    }
  }
}
