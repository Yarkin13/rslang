import './css/style.css';
import './js/usersAppState';
import './js/menu';
import './js/account';
import Auth from './js/auth';
import State from './js/usersAppState';
import Menu from './js/menu';
import ControlPanel from './js/controlPanel/controlPanel';
import Dictionary from './js/dictionary';
import Account from './js/account';
import GamesPage from './js/games/gamesPage';
// import Audiocall from './js/games/Audiocall/audiocall';

// INIT
window.currentPage = null;
let auth = new Auth();

export let usersAppState = new State();

export let menu = new Menu(
  new ControlPanel(),
  new Account(),
  new Auth(),
  new Dictionary(),
  new GamesPage(),
  new TrainingCards()
);

// check if user has session and load settings if has
auth.authorized().then(authorized => {
  if (!authorized && window.currentPage !== 'auth') {
    auth.showLoginPage();
  } else {
    auth.loginSuccess();
    setTimeout(() => {
      // uncomment if you want to delete all words. And refresh page :D
      // usersAppState.getAllWords().forEach(word => {
      //   usersAppState.deleteUserWord(word.wordId).then(() => console.log('------------------'));
      // });
    }, 2000);
  }
}).finally(() => {
  // set the session check every 10 seconds
  setInterval(() => {
    if (window.currentPage !== 'auth') {
      auth.authorized().then(authorized => {
        if (!authorized) {
          auth.showLoginPage();
        }
      });
    }
  }, 10000);
});
