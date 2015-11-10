window.onload = function() {

  var startButton = document.getElementById('start-game');
  startButton.addEventListener( 'click' , startGame , false );

}

// Global variables
var score = -1;
var currentActor = '';
var moviesUsed = [];
var container = document.getElementById('movie-container');

// Global error messages
var notFound = 'We didn&rsquo;t find any movies that match your search. Try a different spelling.';
var sameMovie = 'Looks like you&rsquo;ve already used that movie.';
var noMovie = 'We weren&rsquo;t able to find that movie. Try a different spelling.';
var badConnection = 'There may be a problem with your connection. Please verify you\'re connected to the internet and try again.';


function startGame() {
  container.innerHTML = ''; // Remove current content
  var heading = document.createElement('h1');
  heading.innerHTML = 'Give me any movie to get started.';
  container.appendChild(heading);
  var text = document.createElement('p');
  text.className = 'lead';
  text.innerHTML = 'Pro tip: it helps if you&rsquo;re familiar with the cast.';
  container.appendChild(text);
  var movieInput = document.createElement('input');
  movieInput.id = "movie-search";
  movieInput.type = 'text';
  movieInput.placeholder = 'Enter your movie here.';
  movieInput.addEventListener( 'keyup' , searchMovies , false );
  container.appendChild(movieInput);
  movieInput.focus();
} // End of startGame


// Query OMDB and get list of movies matching search
function searchMovies(e) {
  if( e.keyCode === 13 ) {
    var query = e.target.value;
    var movieQuery = {
      url: 'http://www.omdbapi.com/?',
      type: 'GET',
      data: {
        s: query,
      },
      dataType: 'json',
      success: function(data) {
        if( data.hasOwnProperty('Search') ) {
          // Fetch movie directly if only one result comes back
          if( data.Search.length == 1 ) {
            var movieID = data.Search[0].imdbID;
            getMovie(movieID);
          } else {
            // Show movie list if more than one result comes back
            var movieList = new MovieList(data);
          }
        } else {
          var notFoundError = new Error( notFound );
          notFoundError.initialize();
          notFoundError.render();
        }
      },
      error: function(data) {
        var notFoundError = new Error( notFound );
        notFoundError.initialize();
        notFoundError.render();
      }
    }
    $.ajax(movieQuery);
  }
} // End of searh movies

// Capture input, query OMBD, respond accordingly
function getMovie(e) {
  // Get id from div if movie is clicked
  if( typeof(e) == 'object' ) {
    var query = e.srcElement.parentNode.id;
  }
  // Get id from variable if direct search
  else {
    var query = e;
  }
  var movieQuery = {
    url: 'http://www.omdbapi.com/?',
    type: 'GET',
    data: {
      i: query, // Find movie by IMDB id
      tomatoes: 'true' // Get Rotten Tomatoes rating
    },
    dataType: 'json',
    success: function(data) {
      if( data.Response == 'True' ) {
        var title = data.Title;
        for( i in moviesUsed ) {
          if ( data.Title == moviesUsed[i] ) {
            var sameMovieError = new Error( sameMovie );
            sameMovieError.initialize();
            sameMovieError.render();
            return;
          }
        }
        var newActors = data.Actors.split( ', ' );
        var isCorrect = true;
        if( score > -1 ) {
          isCorrect = checkActors(newActors);
        }
        if( isCorrect ) {
          moviesUsed.push( title );
          score++;
          var movie = new Movie( data , isCorrect ); // Display new movie
          movie.initialize();
          movie.render();
        }
        else {
          var movie = new Movie( data , isCorrect );
          movie.initialize();
          movie.render();
        }
      }
      else {
        var noMovieError = new Error( noMovie );
        notFoundError.initialize();
        notFoundError.render();
      }
    },
    error: function(data) {
      var connectionError = new Error( badConnection );
      connectionError.initialize();
      connectionError.render();
    }
  }
  $.ajax(movieQuery);
} // End of getMovie


// Movies parent class constructor
var Movies = function(movie) {
  this.title = movie.Title;
  this.posterURL = movie.Poster;
  this.img = document.createElement('img');
  if(this.posterURL != 'N/A') {
    this.img.src = this.posterURL;
  } else {
    this.img.src = 'images/no-poster-available.png'
  }
  this.heading = document.createElement('h1');
  this.heading.innerHTML = this.title;
}

var MovieListItem = function(movie) {
  Movies.call(this, movie); // inherit properties and methods of Movies
  this.searchID = movie.imdbID;
  this.year = movie.Year;
  this.initialize = function() {
    this.wrapper = document.createElement('div');
    this.wrapper.id = this.searchID;
    this.date = document.createElement('p');
    this.date.innerHTML = this.year;
  }
  this.render = function() {
    if(this.hasOwnProperty('img')) {
      this.wrapper.appendChild(this.img);
    }
    this.wrapper.appendChild(this.heading);
    this.wrapper.appendChild(this.date);
    this.wrapper.addEventListener( 'click', getMovie, false );
    container.appendChild(this.wrapper);
  }
} // End of MovieListItem constructor
MovieListItem.prototype = Object.create(Movies.prototype); // MovieListItem extends Movies


// Display movies by creating a MovieListItem for each search result
MovieList = function(data) {
  if(data.hasOwnProperty('Search')) {
    var movies = data.Search;
    container.innerHTML = '';
    var listHeading = document.createElement('h1');
    listHeading.innerHTML = 'Which movie did you have in mind?';
    container.appendChild(listHeading);
    for( var i = 0; i < movies.length; i++ ) {
      var displayMovie = new MovieListItem( movies[i] );
      displayMovie.initialize();
      displayMovie.render();
    }
  }
} // End of MovieList

// Movie object constructor
function Movie( data , isCorrect ) {
  Movies.call(this, data);
  this.display = null;
  this.rating = data.tomatoMeter;
  this.correct = isCorrect;

  // Pick an actor from the cast of the given movie
  this.getRandomActor = function() {
    var newCast = this.cast;
    for( var i = 0; i < this.cast.length; i++ ) { // Remove current actor from array of new actors
      if( this.cast[i] == currentActor ) {
        newCast.splice( i, 1 );
      }
    }
    return newCast[Math.floor(Math.random()*(newCast.length))]; // Pick random actor
  } // End of getRandomActor

  if(this.correct) {
    this.cast = data.Actors.split( ', ');
    this.randomActor = this.getRandomActor();
    currentActor = this.randomActor;
  } else {
    this.cast = data.Actors;
  }

  this.getSnarky = function() {
    if( this.rating >= 80 ) {
      return 'Nice pick.';
    }
    else if( this.rating < 80 && this.rating >= 60 ) {
      return 'Decent flick.';
    }
    else {
      return 'Meh, that movie was ok.';
    }
  }
  this.textContent = function() {
    var also = '';
    if( score > 0 ) {
      also = ' also';
    }
    if(this.correct) {
      this.actor.innerHTML = this.randomActor + also + ' stars in this movie. Name another movie in which ' + this.randomActor + ' has a starring role.';
    } else {
      this.actor.className += ' red-text';
      this.actor.innerHTML = 'Sorry, ' + currentActor + ' does not have a leading role in that movie. The official cast is ' + this.cast + '.';
      this.newGamePrompt = document.createElement('p');
      this.newGamePrompt.className = 'lead';
      this.newGamePrompt.innerHTML = 'Want to try again? Enter a new movie and go for it!'
    }
  }
  this.initialize = function() {
    this.comment = document.createElement('p');
    this.comment.className = 'lead';
    this.comment.innerHTML = this.getSnarky();
    this.actor = document.createElement('p');
    this.actor.className = 'lead';
    this.textContent();
    this.movieInput = document.createElement('input');
    this.movieInput.id = "movie-search";
    this.movieInput.type = 'text';
    this.movieInput.placeholder = 'Enter your movie here.';
    this.movieInput.addEventListener( 'keyup', searchMovies, false );
    this.showScore = document.createElement('p');
    this.showScore.className = 'lead';
    if(this.correct) {
      this.showScore.innerHTML = 'Current score: ' + score;
    } else {
      this.showScore.innerHTML = 'Your final score was: ' + score;
    }
  }
  this.render = function() {
    container.innerHTML = ''; // Empty container
    container.appendChild(this.img);
    container.appendChild(this.heading);
    container.appendChild(this.comment);
    container.appendChild(this.actor);
    if(!(this.correct)) {
      container.appendChild(this.newGamePrompt);
      resetGame();
    }
    container.appendChild(this.movieInput);
    this.movieInput.focus();
    container.appendChild(this.showScore);
  }
} // End of Movie constructor
Movie.prototype = Object.create(Movies.prototype);

// Error message constructor
function Error( message ) {
  this.initialize = function() {
    this.message = message;
  }
  this.render = function() {
    var previousError = document.getElementById('error'); // Get current error message
    if( previousError == null ) { // Create an error p tag if it doesn't exist
      var errorMessage = document.createElement('p');
      errorMessage.className = 'lead';
      errorMessage.id = 'error';
    }
    else {
      var errorMessage = document.getElementById('error');
    }
    errorMessage.innerHTML = this.message;
    var input = document.getElementById('movie-search');
    var parent = input.parentNode;
    parent.insertBefore( errorMessage , input );
  }
} // End of Error constructor

// Check cast of given movie for required actor
function checkActors(actors) {
  for( i in actors ) {
    if( currentActor == actors[i] ) {
      return true;
    }
  }
  return false;
} // End of checkActors

// Reset global variables to start game over
function resetGame() {
  score = -1;
  currentActor = '';
  moviesUsed = [];
}
