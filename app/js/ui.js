/*
	DYPL Spring Term 2015
	Durak Web App
	ui.js
	07/06/2015
	
	Giacomo Mineo
	Jan Dilberowic
	James Coop
*/

var debug = false;

var app = angular.module('durak', []);

app.run(function($window) {
	var start_height = 303;
	var nav_height = 41;
	var canvas_height = 447;
	var canvas_padding = 64;

	fixSplash = function() {
		$el('.content').style.height = window.innerHeight + "px";
		if(window.innerHeight > (canvas_height + (canvas_padding * 2)))
			$el('.game').style.height = (window.innerHeight - nav_height) + "px";
		$el('.splash').style.padding = ((window.innerHeight - nav_height - start_height) / 2) + "px 10px";
	};
  fixSplash();
  angular.element($window).bind('resize', function() {
  	fixSplash();
  });
});

app.controller('DurakCtrl', function($scope, $http) {
	// --- Init
	$scope.playing = false;
	$scope.winner = null;

	// Fetch difficulties
	$http.get('/difficulties.json').success(function(difficulties) {
		$scope.difficulties = [];
		for (var key in difficulties) {
			$scope.difficulties.push({
				name: key,
				file: difficulties[key]
			});
    };
    // Default difficulty
    $scope.gameDifficulty = $scope.difficulties[0].file;
	});

	// Event for start game button clicked
	$scope.initialize_game = function() {
		if($scope.playerName || debug) {
			$scope.playing = true;
			// Create the game
			$scope.game = new Game($scope.playerName, false);

			// Generate AI logic from chosen difficulty
			$http.get("/" + $scope.gameDifficulty).success(function(data) {
				generate_ai(data, $scope.game);

				// Start the game
				$scope.game.start();
			});

		} else {
			$scope.gameForm.submitted = true;
			$('name').focus();
		}
	};

	$scope.handCardClick = function(cardObj) {
		$scope.game.move(cardObj, $scope.game.players[0], $scope.game.players[1]);
	};

	$scope.getCardClass = function(card) {
		if(typeof card === "undefined") {
			return "";
		} else {
			return "card_" + card.value + card.suit;
		}
	};

	$scope.checkTurn = function(player, cpu) {
		if(typeof $scope.game === "undefined")
			return null;
		else
			return $scope.game.check_turn(player, cpu);
	};

	$scope.getCount = function(number) {
	  return new Array(number);
	};

	$scope.checkNameError = function() {
		if(($scope.gameForm.name.$error.minlength || $scope.gameForm.name.$error.required) && $scope.gameForm.submitted) {
			return true
		} else {
			return false
		}
	};

	$scope.checkEnd = function() {
		if(!(typeof $scope.game === "undefined")) {
			if($scope.game.winning_player) {
				console.log("Game over");
				$scope.winner = $scope.game.winning_player;
				return true;
			} else {
				$scope.winner = null;
			}
		}
		return false;
	};

	$scope.playAgain = function(human_won) {
		$scope.game = new Game($scope.playerName, !human_won);
		// Generate AI logic from chosen difficulty
		$http.get("/" + $scope.gameDifficulty).success(function(data) {
			generate_ai(data, $scope.game);

			// Start the game
			$scope.game.start();
		});
	};
});

// --- Card functions

// Return suit index from string
function get_suit(suit_string) {
	switch(suit_string) {
		case "D": return 0;
		case "H": return 1;
		case "C": return 2;
		case "S": return 3;
	}
};

// Generate opponents positions if there are multiple
function generate_opponents_positions(sheet_frame_height, sheet_frame_width, offset) {
	positions = [];
	pos = {
		x: (sheet_frame_width / 2) + offset,
		y: sheet_frame_height / 2
	}
	positions.push(pos);

	return positions;
};

// --- Helper functions

// Id selector
function $(id) {
    return document.getElementById(id);
};

// General css selector
function $el(selector) {
	return document.querySelectorAll(selector)[0];
};

// Element add class
function addClass(element, className) {
	if (el.classList)
	  el.classList.add(className);
	else
	  el.className += ' ' + className;
};
