import wordCards from '../../wordCards';
import { usersAppState } from '../../../app';
import TrainingCards from '../../../js/trainingCards/trainingCards';
import * as utils from '../../utils';

// export let usersAppState = new State();

console.log(usersAppState);

export default class Audiocall {
  constructor() {
    this.mainArea = document.querySelector('.main-area');
    this.wordsWrapper = null;
    this.currentPlayed = null;
    this.startButton = null;
    this.errors = 0;
    this.wordsListLength = 50;
    this.allWords = usersAppState.getTrainingWords(this.wordsListLength);
    this.startBell = new Audio('./assets/sounds/start-bell.wav');
    this.errorSound = new Audio('./assets/sounds/error.mp3');
    this.successSound = new Audio('./assets/sounds/success.mp3');
    this.gameOverSound = new Audio('./assets/sounds/game-over.wav');
    this.statistics = [];
  }

  show() {
    utils.destroy();
    // this.mainArea.append(this.intro);
    this.getIntro();
    // this.handleStart();
  }

  playGameSound(url) {
    const volumeSlider = document.querySelector('#volume');
    const mp3 = new Audio(url);
    // mp3.volume = (volumeSlider.value) / (volumeSlider.max);
    mp3.play();
  }

  shuffle(array) {
    const newArray = array.slice();
    let m = array.length;
    let i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      [newArray[m], newArray[i]] = [newArray[i], newArray[m]];
    }
    return newArray;
  }

  handleStart() {
    // выбор 50 елементов из массива слов вынес на уровень выше так как выбрать нужно единожды
    // запускаем стартовую страницу с выборкой 5 первых слов
    const currentWords = this.allWords.splice(0, 5);
    this.currentPlayed = currentWords[0];
    // Перетасовываем массив
    const shuffledWords = this.shuffle(currentWords);
    // Выбираем [последний]
    // Проигрываем звук
    this.playGameSound(`../../../assets/${this.currentPlayed.audio}`);
    // Вешаем обработчик на контейнер
    // Превращаем "старт" в "повтор" / Прячем "старт", показываем "повтор"
    // startButton.classList.toggle('purple-gradient');
    // startButton.classList.toggle('repeat');
    /* if (!gameMogeSwitch.checked) return; */
    this.setAudiocallWrapper(shuffledWords);
  }

  checkCorrectAnswer(e) {
    const playableTarget = e.target.closest('.word');
    if (playableTarget && !playableTarget.classList.contains('already-checked')) {
    // выяснить какого слова касается карточка
    // если слово совпало:
      if (playableTarget.dataset.word === this.currentPlayed.wordTranslate) {
        // добавляем галочку
        playableTarget.insertAdjacentHTML('beforeEnd', '<span class="correct"></span>');
        // добавляем в массив угаладанных
        this.addToStatistic(this.currentPlayed, true);
        usersAppState.updateProgressWord(this.currentPlayed.id, true);
        // если слов больше нету ->
        if (this.allWords.length === 0) {
          // проигрываем звук прохождения теста
          this.playGameSound('../../../assets/sounds/game-over.mp3'); /* success */
          // возврат в экран выбора категорий и return
          setTimeout(() => {
            this.showResults();
          }, 500);
          // return;
        }
        // проигрываем звук победы
        this.playGameSound('../../../assets/sounds/success.mp3');
        // берем следующею пару слов
        setTimeout(() => {
          this.handleStart();
        }, 900);
      }
      // ---- если слово НЕ совпало----:
      else {
        // добавляем хрестик
        playableTarget.insertAdjacentHTML('beforeEnd', '<span class="wrong"></span>');
        // добавляем в массив не угаладанных
        this.errors += 1;
        this.addToStatistic(this.currentPlayed);
        usersAppState.updateProgressWord(this.currentPlayed.id, false);
        // проигрываем звук поражения
        this.playGameSound('../../../assets/sounds/error.mp3');
        console.log(this.errors);
        // ожидание слова
      }
    }
  }

  getIntro() {
    const introTemplate = `
      <div class="tab-wrapper audiocall">
        <div class="intro">
          <h1 class="intro__title">Аудиовызов</h1>
          <p class="intro__description">Тренировка Аудиовызов развивает словарный запас.</br>
            В процессе игры будут звучать английские слова, которые нужно угадать среди предлагаемых.</p>
          <button class="into__button button">Начать</button>
        </div>
      </div>`.trim();

    setTimeout(() => {
      this.mainArea.innerHTML = introTemplate;
      const button = document.querySelector('.into__button');
      button.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
          this.handleStart();
        }
      });
    }, 400);
  }

  startButtonClickHandler() {
    this.startButton.addEventListener('click', () => {
      this.getIntro().remove();
      this.startBell.play();
      this.handleStart();
    });
  }

  setAudiocallWrapper(currentWords) {
    const audiocallTemplate = `
    <div class="tab-wrapper audiocall">
      <div class="intro">
        <h1 class="intro__title">Аудиовызов</h1>
        <div class="word-wrapper">
        </div>
        <button class="into__button">Не знаю</button>
      </div>
    </div>
    `;
    setTimeout(() => {
      this.mainArea.innerHTML = audiocallTemplate;
      this.wordsWrapper = document.querySelector('.word-wrapper');
      this.setAudiocallWord(currentWords);
    }, 400);
  }

  setAudiocallWord(currentWords) {
    console.log(currentWords);
    this.wordsWrapper.innerHTML = currentWords.map((word) => `<div class="word" data-word="${word.wordTranslate}" data-audiosrc="../../../assets/${word.word}">${word.wordTranslate}</div>`).join('');
    this.wordsWrapper.onclick = (e) => {
      this.checkCorrectAnswer(e);
    };
  }

  addToStatistic(el, isLearned = false) {
    const question = {
      id: el.id,
      word: el.word,
      translate: el.wordTranslate,
      isLearned: isLearned,
      audioSrc: el.audio,
      transcription: el.transcription
    };

    this.statistics.push(question);
  }

  showResults() {
    this.gameOverSound.play();
    utils.getStatistic(this.statistics);
  }

  // startButton.onclick = () => {
  //   // Кликаем на кнопку только когда она "старт", а не "повтор"
  //   if (startButton.classList.contains('repeat')) this.playGameSound(currentObject.audioSrc);
  //   else handleStart();
  // };
}
