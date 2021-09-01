//#region Use an event stream of double clicks rxjs
// var button = document.querySelector('.button');
// var label = document.querySelector('h4');

// var clickStream = Rx.Observable.fromEvent(button, 'click');

// var doubleClickStream = clickStream
//   .bufferWhen(() => clickStream.debounceTime(250))
//   .map(arr => arr.length)
//   .filter(len => len === 2);

// doubleClickStream.subscribe(event => {
//   label.textContent = 'double click';
// });

// doubleClickStream
//   .delay(1000)
//   .subscribe(suggestion => {
//     label.textContent = '-';
//   });

//#endregion

//#region 

var refreshButton = document.querySelector('.refresh');
var closeButton1 = document.querySelector('.close1');
var closeButton2 = document.querySelector('.close2');
var closeButton3 = document.querySelector('.close3');

var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');
var close1Clicks = Rx.Observable.fromEvent(closeButton1, 'click');
var close2Clicks = Rx.Observable.fromEvent(closeButton2, 'click');
var close3Clicks = Rx.Observable.fromEvent(closeButton3, 'click');

var startupRequestStream = Rx.Observable.of('https://api.github.com/users');

var requestOnRefreshStream = refreshClickStream
  .map(ev => {
    var randomOffset = Math.floor(Math.random()*500);
    return 'https://api.github.com/users?since=' + randomOffset;
  });

var requestStream = startupRequestStream.merge(requestOnRefreshStream);

var responseStream = requestStream
  .flatMap(requestUrl =>
    Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
  )
  .publishReplay().refCount(1);

function getRandomUser(listUsers) {
  return listUsers[Math.floor(Math.random()*listUsers.length)];
}

function createSuggestionStream(responseStream, closeClickStream) {
  return responseStream.map(getRandomUser)
    .startWith(null)
    .merge(refreshClickStream.map(ev => null))
    .merge(
      closeClickStream.withLatestFrom(responseStream, 
                                  (x, R) => getRandomUser(R))
    );
}

var suggestion1Stream = createSuggestionStream(responseStream, close1Clicks);
var suggestion2Stream = createSuggestionStream(responseStream, close2Clicks);
var suggestion3Stream = createSuggestionStream(responseStream, close3Clicks);

// Rendering ---------------------------------------------------
function renderSuggestion(suggestedUser, selector) {
  var suggestionEl = document.querySelector(selector);
  if (suggestedUser === null) {
    suggestionEl.style.visibility = 'hidden';
  } else {
    suggestionEl.style.visibility = 'visible';
    var usernameEl = suggestionEl.querySelector('.username');
    usernameEl.href = suggestedUser.html_url;
    usernameEl.textContent = suggestedUser.login;
    var imgEl = suggestionEl.querySelector('img');
    imgEl.src = "";
    imgEl.src = suggestedUser.avatar_url;
  }
}

suggestion1Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion1');
});

suggestion2Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion2');
});

suggestion3Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion3');
});

//#endregion