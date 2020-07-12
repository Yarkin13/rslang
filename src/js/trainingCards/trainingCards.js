import { usersAppState } from '../../app';
import wordCards from '../wordCards';
import * as utils from '../utils';

export default class TrainingCards {
  constructor() {
    this.mainArea = document.querySelector('.main-area');
    this.trainingCard = null;
    this.cardBody = null;
    this.wordContainer = null;
    this.answerInput = null;
    this.trainingWords = [];
    this.currentWord = null;
    this.audio = null;
    this.dropMenuBtn = null;
    this.dontKnowBtn = null;
    this.nextBtn = null;
    // word parameters for statistics
    this.wordsStatistic = [];
    this.incorrect = 0;
    this.answered = false;
    this.newWordsStatistic = [];
  }

  show() {
    this.wordsStatistic = [];
    this.incorrect = 0;
    this.trainingWords = usersAppState.getTrainingWords();
    this.initCard();
  }

  initCard() {
    setTimeout(() => {
      this.answered = false;
      this.mainArea.append(this.getTemplate());
      this.answerInput.addEventListener('keyup', this.answerHandler.bind(this));
      this.trainingCard.addEventListener('click', this.cardHandler.bind(this));

      let width = document.querySelector('.word-container').offsetWidth;
      this.answerInput.style.width = `${width - 20}px`;
      this.answerInput.focus();
    }, 400);
  }

  cardHandler(e) {
    const btn = e.target.id;
    if (e.target.dataset.audio) {
      this.audio.src = `./assets/${e.target.dataset.src}`;
      this.audio.play();
    }
    switch (btn) {
      case 'dont-know-btn':
        console.log('dont know');
        this.setIncorrect();
        const audio_btn = document.querySelector('[data-audio="play"]');
        this.wordContainer.classList.remove('show-result');
        setTimeout(() => this.wordContainer.classList.add('show-result'));
        audio_btn.click();
        this.answerInput.focus();
        break;
      case 'next-btn':
        if (this.trainingWords.length) {
          this.incorrect = 0;
          utils.destroy();
          this.initCard();
        } else {
          console.log('END!!!!');
          this.wordsStatistic.forEach(el => {
            el.translate = el.wordTranslate;
            el.audioSrc = el.audio;
            if (el.incorrect) {
              el.isLearned = false;
            } else {
              el.isLearned = true;
            }
          });
          utils.getStatistic(this.wordsStatistic);
        }
        break;
      case 'difficult-btn':
        console.log('difficult');
        usersAppState.updateDifficultWord(this.currentWord.id, true);
        this.trainingCard.classList.add('difficult-word');
        setTimeout(() => this.nextBtn.click(), 400);
        break;
      case 'delete-btn':
        console.log('delete');
        usersAppState.updateDeletedWord(this.currentWord.id, true);
        this.wordsStatistic.pop();
        this.trainingCard.classList.add('delete-word');
        setTimeout(() => this.nextBtn.click(), 400);
        break;
      case 'repeat-btn':
        console.log('repeat');
        this.trainingWords.unshift(this.wordsStatistic.pop());
        this.trainingCard.classList.add('repeat-word');
        setTimeout(() => this.nextBtn.click(), 400);
        break;
    }
  }

  answerHandler(e) {
    if (e.keyCode === 13 && this.answered) {
      this.nextBtn.click();
    } else if (e.keyCode === 18) {
      console.log('DON"T KNOW');
      this.dontKnowBtn.click();
    } else if (e.keyCode === 13 && this.answerInput.value.length) {
      // init
      this.wordContainer.classList.remove('show-result');
      [...this.wordContainer.children].forEach(el => el.removeAttribute('style'));

      const word = this.wordContainer.dataset.word.toLowerCase();
      let value = this.answerInput.value.split('').filter(letter => word.includes(letter)).join('').toLowerCase();

      if (word !== value) {
        usersAppState.updateProgressWord(this.currentWord.id, false);
        this.setIncorrect();
        if (word.includes(value) && value.length > 1) {
          let start_index = word.indexOf(value);
          let end_index = start_index + value.length;
          for (let index in word) {
            let letterElement = this.cardBody.querySelector(`[index="${index}"]`);
            if (index < start_index || index > end_index - 1) {
              letterElement.style.color = 'orange';
            } else {
              // letterElement.style.color = 'green';
            }
          }
        } else {
          word.split('').forEach((letter, index) => {
            let letterElement = this.cardBody.querySelector(`[index="${index}"]`);
            if (value.indexOf(letter) !== -1) {
              // letterElement.style.color = 'green';
              value = value.slice(value.indexOf(letter) + 1, value.length);
            } else {
              letterElement.style.color = 'crimson';
            }
          });
        }
        this.answerInput.value = '';
        this.wordContainer.classList.add('show-result');
      } else if (word === value) {
        console.log('CORRECT');
        usersAppState.updateProgressWord(this.currentWord.id, true);
        this.answered = true;
        this.audio.src = `./assets/${this.wordContainer.dataset.src}`;
        this.audio.play();
        this.nextBtn.classList.add('show');
        this.dropMenuBtn.classList.add('show');
        // settings params
        const wordMeaining = document.querySelector('.word-meaning-container');
        const wordExample = document.querySelector('.word-example-container');
        if (wordMeaining) wordMeaining.classList.add('show');
        if (wordExample) wordExample.classList.add('show');
      }
    }
  }

  setIncorrect() {
    this.incorrect += 1;
    this.wordsStatistic[this.wordsStatistic.length - 1].incorrect = this.incorrect;
  }

  getTrainingArea(word) {
    const template = document.createElement('template');
    let wordImg = usersAppState.picturesWords ? `<img class="card-img" src="./assets/${word.image}" alt="">` : '';
    let wordMeaning = usersAppState.examplesUsing ? `<div class="word-meaning-container">
                                                       <i class="fas fa-volume-up" data-audio="play-meaning" data-src="${word.audioMeaning}"></i> 
                                                       <p>Значение:</p>
                                                       <p class="word-meaning">${word.textMeaning}</p>
                                                       <p class="word-meaning-translate">${word.textMeaningTranslate}</p>
                                                    </div> ` : '';
    let wordExample = usersAppState.explanationExamples ? `<div class="word-example-container">
                                                              <i class="fas fa-volume-up" data-audio="play-example" data-src="${word.audioExample}"></i> 
                                                              <p>Пример:</p>
                                                              <p class="word-example">${word.textExample}</p>
                                                              <p class="word-example-translate">${word.textExampleTranslate}</p>
                                                           </div>` : '';
    template.innerHTML = `
      ${wordImg}
      <span class="input-container">
        <input type="text" class="answer-input" maxlength="50" autocomplete="off">
      </span>
      <hr>
      <p class="translation">${word.wordTranslate}</p>
      ${wordMeaning}
      ${wordExample}
      `;
    this.answerInput = template.content.querySelector('.answer-input');
    return template.content;
  }

  createWordContainer(word) {
    const container = document.createElement('span');
    container.classList.add('word-container');
    container.setAttribute('data-word', word.word);
    container.setAttribute('data-src', word.audio);
    word.word.split('').forEach((letter, index) => {
      const letterContainer = document.createElement('span');
      letterContainer.setAttribute('index', index);
      letterContainer.textContent = letter;
      container.append(letterContainer);
    });
    return container;
  }

  getTemplate() {
    this.currentWord = this.trainingWords.pop();
    this.wordsStatistic.push(this.currentWord);

    let template = document.createElement('template');
    template.innerHTML = `
      <div class="tab-wrapper training-card">
        <div class="card-header">
            <div>
                ${usersAppState.isNewWord(this.currentWord.id) ? this.getHeaderNewWord() : ''}
            </div>
            <label class="drop-menu-btn">
              <i class="fas fa-caret-down"></i>
              <input type="checkbox" class="checkbox-drop-menu">
              <div class="drop-menu">
                <input class="difficultBtn" id="difficult-btn" type="button" value="Сложное" title="Добавить в сложные">
                <input class="deleteBtn" id="delete-btn" type="button" value="Удалить" title="Удалить из словоря">
                <input class="repeatBtn" id="repeat-btn" type="button" value="Повторить" title="Повторить в тренировке">
            </div>
            </label>
        </div>
        <div class="card-body"></div>
        <div class="card-footer">
            <input class="dontKnowBtn" id="dont-know-btn" type="button" value="Не знаю">
            <input class="nextBtn" id="next-btn" type="button" value="Дальше">
            <i class="fas fa-volume-up" data-audio="play" data-src="${this.currentWord.audio}"></i>        
            <audio id="audio"></audio>
        </div>
      </div>
    `;
    this.trainingCard = template.content.querySelector('.training-card');
    this.dropMenuBtn = template.content.querySelector('.drop-menu-btn');
    this.nextBtn = template.content.querySelector('.nextBtn');
    this.dontKnowBtn = template.content.querySelector('.dontKnowBtn');
    this.cardBody = template.content.querySelector('.card-body');
    this.audio = template.content.getElementById('audio');
    this.cardBody.append(this.getTrainingArea(this.currentWord));
    this.cardBody.querySelector('.input-container').append(this.createWordContainer(this.currentWord));
    this.wordContainer = this.cardBody.querySelector('.word-container');
    return template.content;
  }

  getHeaderNewWord() {
    let innerLetters = 'Новое слово'.split('')
      .reduce((acc, letter) => acc += `<span class="training-new-word-letter">${letter}</span>`, '');
    return `<span class="training-new-word">${innerLetters}</span>`;
  }
}
