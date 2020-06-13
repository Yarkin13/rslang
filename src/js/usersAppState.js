import { usersAppState } from '../app';

export class State {
  constructor() {
    this.wordsPerDay = null;
    this.cardsPerDay = null;
    this.username = null;
    this.examplesUsing = null;
    this.explanationExamples = null;
    this.nightMode = null;
    this.picturesWords = null;
    this.transcription = null;
    this.translateWord = null;
  }

  getUserSettings() {
    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('user_id');
    return fetch(`https://afternoon-falls-25894.herokuapp.com/users/${userId}/settings`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      })
      .then(responseJson => {
        console.log(responseJson, 'GET USER SETTINGS');
        this.saveSettings(responseJson);
        return this.nightMode;
      })
      .catch(error => console.log(error));
  }

  setUserSettings(settings) {
    let token = localStorage.getItem('token');
    let userId = localStorage.getItem('user_id');
    return fetch(`https://afternoon-falls-25894.herokuapp.com/users/${userId}/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })
      .then(response => {
        // if (!response.ok) {
        //     throw Error(response.statusText)
        // }
        return response.json();
      })
      .then(responseJson => {
        console.log(responseJson, 'SET USER SETTINGS');
        this.saveSettings(responseJson);
        return responseJson;
      })
      .catch(error => console.log(error));
  }

  saveSettings(settings) {
    console.log(settings, 'SAVE');
    let options = settings.optional;
    this.wordsPerDay = settings.wordsPerDay;
    if (options) {
      this.cardsPerDay = options.cardsPerDay;
      this.username = options.username;
      this.nightMode = options.nightMode;
      this.translateWord = options.translateWord;
      this.explanationExamples = options.explanationExamples;
      this.examplesUsing = options.examplesUsing;
      this.transcription = options.transcription;
      this.picturesWords = options.picturesWords;
    }
  }
}
