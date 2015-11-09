window.onload = function() {

  var startButton = document.getElementById('start-game');
  startButton.addEventListener( 'click' , startGame , false );

}

// Global variables
var score = -1;
var currentActor = '';
var main = document.getElementById('main');
var moviesUsed = [];

function startGame() {
  main.innerHTML = ''; // Remove current content
  var heading = document.createElement('h1');
  heading.innerHTML = 'Give me any movie to get started.';
  main.appendChild(heading);
  var text = document.createElement('p');
  text.className = 'lead';
  text.innerHTML = 'Pro tip: it helps if you&rsquo;re familiar with the cast.';
  main.appendChild(text);
  var movieInput = document.createElement('input');
  movieInput.id = "movie-search";
  movieInput.type = 'text';
  movieInput.placeholder = 'Enter your movie here.';
  movieInput.addEventListener( 'keyup' , getMovie , false );
  main.appendChild(movieInput);
} // End of startGame

// Capture input, query OMBD, respond accordingly
function getMovie(e) {
  if( e.keyCode === 13 ) {
    var query = e.target.value;
    var movieQuery = {
      url: 'http://www.omdbapi.com/?',
      type: 'GET',
      data: {
        t: query,
        tomatoes: 'true'
      },
      dataType: 'json',
      success: function(data) {
        if( data.Response == 'True' ) {
          var title = data.Title;
          for( i in moviesUsed ) {
            if ( data.Title == moviesUsed[i] ) {
              var sameMovie = 'Looks like you&rsquo;ve already used that movie.';
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
          var notFound = 'We weren&rsquo;t able to find that movie. Try a different spelling.';
          var notFoundError = new Error( notFound );
          notFoundError.initialize();
          notFoundError.render();
        }
      },
      error: function(data) {
        var badConnection = 'There may be a problem with your connection. Please verify you\'re connected to the internet and try again.';
        var connectionError = new Error( badConnection );
        connectionError.initialize();
        connectionError.render();
      }
    }
    $.ajax(movieQuery);
  }
} // End of getMovie

// Movie object constructor
function Movie( data , isCorrect ) {
  this.display = null;
  this.title = data.Title;
  this.posterURL = data.Poster;
  this.rating = data.tomatoMeter;
  if(isCorrect) {
    this.cast = data.Actors.split( ', ');
    this.randomActor = getRandomActor(this.cast);
    currentActor = this.randomActor;
  } else {
    this.cast = data.Actors;
  }
  this.initialize = function() {
    this.display = document.createElement('div');
    this.display.id = 'movie-container';
    if(this.posterURL != 'N/A') {
      this.img = document.createElement('img');
      this.img.src = this.posterURL;
    }
    this.heading = document.createElement('h1');
    this.heading.innerHTML = this.title;
    this.comment = document.createElement('p');
    this.comment.className = 'lead';
    if( this.rating >= 80 ) {
      this.comment.innerHTML = 'Nice pick.';
    }
    else if( this.rating < 80 && this.rating >= 60 ) {
      this.comment.innerHTML = 'Decent flick.';
    }
    else {
      this.comment.innerHTML = 'Meh, that movie was ok.';
    }
    this.actor = document.createElement('p');
    this.actor.className = 'lead';
    var also = '';
    if( score > 0 ) {
      also = ' also';
    }
    if(isCorrect) {
      this.actor.innerHTML = this.randomActor + also + ' stars in this movie. Name another movie in which ' + this.randomActor + ' has a starring role.';
    } else {
      this.actor.innerHTML = 'Sorry, ' + currentActor + ' does not have a leading role in that movie. The official cast is ' + this.cast + '.';
    }
    this.movieInput = document.createElement('input');
    this.movieInput.id = "movie-search";
    this.movieInput.type = 'text';
    this.movieInput.placeholder = 'Enter your movie here.';
    this.movieInput.addEventListener( 'keyup' , getMovie , false );
    this.showScore = document.createElement('p');
    this.showScore.className = 'lead';
    this.showScore.innerHTML = 'Current score: ' + score;
  }
  this.render = function() {
    if(this.posterURL != 'N/A') {
      this.display.appendChild(this.img);
    }
    this.display.appendChild(this.heading);
    this.display.appendChild(this.comment);
    this.display.appendChild(this.actor);
    this.display.appendChild(this.movieInput);
    this.display.appendChild(this.showScore);
    main.innerHTML = '';
    main.appendChild(this.display);
  }
} // End of Movie constructor

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

// Pick an actor from the cast of the given movie
function getRandomActor(cast) {
  var newCast = cast;
  for( var i = 0; i < cast.length; i++ ) { // Remove current actor from array of new actors
    if( cast[i] == currentActor ) {
      newCast.splice( i, 1 );
    }
  }
  return newCast[Math.floor(Math.random()*(cast.length))]; // Pick random actor
} // End of getRandomActor
