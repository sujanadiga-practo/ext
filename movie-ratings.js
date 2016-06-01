/* 
  Function to extract the title of movie or TV show,
  if the site being visited is not www.hotstar.com then this will call error callback
*/
function getMovieTitle(success, error) {
  // Query params to fetch current active tab in current window
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {

    var tab = tabs[0];
    var url = tab.url;

    // If visited page is not hotstar, then send error message back
    if (url.split('/')[2] !== 'www.hotstar.com') {
      error('This extension works only for hotstar');
    } else {
      // Fetch the type media being watched, TV show, Cricket or Movies etc...
      var type = url.split('/')[3];
      if (type === 'tv' || type === 'movies') {
        var title = url.split('/')[4];
        success(title);
      } else {
        // If not watching a TV show or a movie send appropriate message
        error('You are not watching a Movie or a TV show');
      }
    }
  });

}

/*
  Function to fetch Movie ratings using Open Movie Data Base APIs
  given a movie/tv show title, it returns user ratings if found
*/
function getMovieRating(title, success, error) {
  var apiUrl = 'http://www.omdbapi.com/?t=' + encodeURIComponent(title);
  var x = new XMLHttpRequest();
  
  // Use an async(XHR) request to fetch movie ratings 
  x.open('GET', apiUrl);
  x.responseType = 'json'; // Expecting a JSON response

  x.onload = function () {
    var response = x.response;
    success(response.imdbRating);
  };
  x.onerror = function () {
    // If API request fails, show error message
    error('Network error.');
  };
  
  x.send();
}

/* 
  A helper function to show messages on display
*/
function renderMessage(text) {
  document.getElementById('res').innerHTML = text;
}

// When the extension is clicked and DOM content is loaded, get the movie title and 
//  query OMDB to get the user ratings
document.addEventListener('DOMContentLoaded', function () {
  getMovieTitle(function success(title) {
    // Show status message during API call 
    renderMessage('Fetching ratings for ' + title);

    getMovieRating(title, function (ratings) {
      if (ratings) {
        renderMessage('Movie Title: ' + title + '\n' + 'User Ratings: ' + ratings);
      } else {
        renderMessage('User ratings not available');
      }

    }, function error(errorMessage) {
      renderMessage('Cannot fetch ratings. ' + errorMessage);
    });
  }, function error(errorMessage) {
    renderMessage(errorMessage);
  });
});
