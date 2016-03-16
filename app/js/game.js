/*
	DYPL Spring Term 2015
	Durak Web App
	game.js
	07/06/2015
	
	Giacomo Mineo
	Jan Dilberowic
	James Coop
*/

function Game(playerName, is_durak) {
	var minimum_cards = 7;

	this.deck = initialize_deck(minimum_cards);
	this.players = [new Player(playerName, [], false, is_durak), new Player('CPU', [], true, !is_durak)];
	// Board Attributes
  this.attacks = [];
  this.defense = [];
  this.defended_cards = [];
  this.undefended_cards = [];
  this.values = [];
  this.used_staple = [];
  this.isEmpty = true;
  this.winning_player = null;

	this.draw = function() {
    if (this.deck.length == 0) {
      console.log("ERROR! Someone tries to draw a card from an empty deck!");
      return null;
    } else {
    	return this.deck.pop();
    }
	};

	this.player_draw = function(player) {
		player.cards.push(this.draw());
	};

  this.is_legit_attack = function (card) {
    if (this.isEmpty == true)
      return true;

    //6 Attacks max!
    if (this.attacks.length == 6)
      return false;
    //TODO very important: check the amount of cards of the player being attacked and see if he has enough

    requested_value = card.value;

    if (this.values.indexOf(requested_value) != -1)
      return true;

    return false;
  };

  this.is_legit_defense = function (defending_card, card_to_be_defended) {
    if (this.isEmpty == true)
      return false;

    if (this.undefended_cards.length == 0)
      return false;

    if(defending_card.trump && !card_to_be_defended.trump)
      return true;
    else if(defending_card.trump && card_to_be_defended.trump)
      return defending_card.value > card_to_be_defended.value;
    else if(!defending_card.trump && card_to_be_defended.trump)
      return false;
    else
      return defending_card.suit == card_to_be_defended.suit && defending_card.value > card_to_be_defended.value
  };

  this.attack = function (card, attacking_player, defending_player) {
    if (!this.is_legit_attack(card)) {
      return false;
		}

    if (this.attacks.length == 0)
      this.isEmpty = false;

    this.attacks.push(card);
		this.undefended_cards.push(card);

    if (this.values.indexOf(card.value) == -1)
      this.values.push(card.value);

    attacking_player.has_played(card);
    // Check victory
    this.check_end_game(attacking_player, defending_player);
    console.log("The card " + card.value + " of suit " + card.suit + " was played as an attack by: " + attacking_player.name + "!");

    if(!attacking_player.cpu)
    	defending_player.compute_defense(this, attacking_player);
    return true;
  };

	this.defend = function (card_to_be_defended, defending_card, defending_player, attacking_player) {
    if (!this.is_legit_defense(defending_card, card_to_be_defended)) {
      return false;
	}

    this.defense.push(defending_card);
    if (this.values.indexOf(defending_card.value) == -1)
      this.values.push(defending_card.value);

    defending_player.has_played(defending_card);
    // Check victory
    this.check_end_game(defending_player, attacking_player);
	  this.defended_cards.push(card_to_be_defended);
	  var index = this.undefended_cards.indexOf(card_to_be_defended);
		if(index > -1) {
			this.undefended_cards.splice(index, 1);
		}

    console.log("The card " + defending_card.value + " of suit " + defending_card.suit + " was played as a defense by: " + defending_player.name + "!");
		if(!defending_player.cpu) {
			// The player was defending successfully and the CPU doesn´t have any more attacks
			attacking_player.compute_attack(this, defending_player);
			if(this.undefended_cards.length == 0) {
				this.end_turn(defending_player, attacking_player);
			}
		}

    return true;
  };

  this.end_turn = function(player, cpu) {
		if(player.is_turn) {
			if(!(this.undefended_cards.length == 0)) {
				console.log("I was attacking and I clicked done, CPU could not defend");
				this.pick_up(cpu);
				this.re_draw(player, cpu);
			} else {
				console.log("I was attacking and I clicked done, CPU defended");
				this.re_draw(player, cpu);
				player.is_turn = !player.is_turn;
				cpu.compute_attack(this, player);
			};
		} else {
			if(!(this.undefended_cards.length == 0)) {
				console.log("I'm defending and I clicked take");
				this.pick_up(player);
				this.re_draw(cpu, player);
				// He could play further cards
				cpu.compute_attack(this, player);
			} else {

				console.log("I'm defending and CPU doesn't have any more attacks, I defended");
				player.is_turn = !player.is_turn;
				this.re_draw(cpu, player);
			};
		};
	};

	this.check_turn = function(player, cpu) {
		if(player.is_turn) {
			if(this.undefended_cards.length == 0 && this.defended_cards.length == 0)
				return "Hide";
			else
				return "Done";
		} else {
			return "Take";
		};
	};

  this.pick_up = function (player) {
  	console.log(player.name + " picks up cards!");
	  for(i = 0; i < this.attacks.length; i++) {
      player.cards.push(this.attacks[i]);
	  }
	  for(i = 0; i < this.defense.length; i++) {
	  	player.cards.push(this.defense[i]);
	  }
	  player.cards = order(player.cards);
  };

  this.re_draw = function(attacker, defender) {
  	this.clear_board();

		while(attacker.cards.length < 6) {
			if (this.deck.length == 0) {
				break;
			}
			this.player_draw(attacker);
		}

		while(defender.cards.length < 6) {
			if (this.deck.length == 0) {
				break;
			}
			this.player_draw(defender);
		}

		attacker.cards = order(attacker.cards);
		defender.cards = order(defender.cards);
  };

  this.clear_board = function () {
    this.used_staple = this.used_staple.concat(this.attacks);
    this.used_staple = this.used_staple.concat(this.defense);
    this.attacks = [];
    this.defense = [];
    this.defended_cards = [];
    this.undefended_cards = [];
    this.values = [];
    this.isEmpty = true;
  };

	this.move = function(card, player, cpu) {
		if(player.is_turn) {
			this.attack(card, player, cpu);
		}
		else {
			this.defend(this.undefended_cards[this.undefended_cards.length - 1], card, player, cpu);
		}
	};

	this.check_end_game = function(attacking_player, defending_player) {
		winning_player = null;
		if(attacking_player.cards.length == 0 && this.deck.length == 0 && !winning_player) {
			winning_player = attacking_player;
		}
		if(defending_player.cards.length == 0 && this.deck.length == 0 && !winning_player) {
			winning_player = defending_player;
		}
		if(defending_player.cards.length == 0 && ((this.deck.length + attacking_player.cards.length) <= 6) && !winning_player) {
			winning_player = defending_player;
		}
		if(winning_player) { 
			console.log("This player has won:", winning_player);
			this.clear_board();
			this.winning_player = {
				name: winning_player.name,
				human_won: !winning_player.cpu
			};
		};
	}

	this.distribute_cards = function() {
		i = 0;
		for(b = 0; b < minimum_cards; b++) {
			if (i == 2) {
				i = 0;
			}
			if(this.players[i].cards.length < 6) {
				this.player_draw(this.players[i]);
				this.player_draw(this.players[i]);
			}
			i++;
		}

		this.fix_trumps();
	};

	this.fix_trumps = function() {
		trump = this.draw();
		trump.trump = true;
		this.trumps = trump.suit;
		console.log("Trumps is ", this.trumps);
		for(i = 0; i < this.players.length; i++) {
			for(b = 0; b < this.players[i].cards.length; b++) {
				if(this.players[i].cards[b].suit === trump.suit) {
					this.players[i].cards[b].trump = true;
				}
			}
		};

		for(i = 0; i < this.deck.length; i++) {
			if(this.deck[i].suit === trump.suit) {
				this.deck[i].trump = true;
			}
		};

    for(i = 0; i < this.players.length; i++) {
      this.players[i].cards = order(this.players[i].cards);
    };

		this.deck.unshift(trump);
	};

	// Game initialization ---------------------------------------------------------------------------
	this.start = function() {
	  this.distribute_cards();
	  if(is_durak)
	  	this.players[1].compute_attack(this, this.players[0]);
	};
};

// --- Card class

function Card(card_suit, card_value, trump) {
	this.suit = card_suit;
	this.value = card_value;
	this.trump = trump;
};

// --- Player class

function Player(player_name, player_cards, is_cpu, is_durak) {
	this.name = player_name;
	this.cards = player_cards;
    this.cpu = is_cpu;
    this.player_status;
    this.is_turn = !is_durak;

    this.has_played = function(card) {
    this.cards.splice(this.cards.indexOf(card), 1);
  };
};

// --- Utility classes

function initialize_deck(min_value) {
	trump_num = Math.floor(Math.random() * 4);
	cards = [];
	suits = ['H', 'D', 'C', 'S'];

  trump = false;
  for(i = 0; i < suits.length; i++) {
		for(j = min_value; j < 15; j++) {
			cards.push(new Card(suits[i], j, trump));
		};
	};

	return shuffle(cards);
};

function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);

  return o;
};

function order(cards) {
  return cards.sort(function(c1, c2) {
    if (c1.value < c2.value) {
      if (c1.trump && !c2.trump)
          return 1;
      else
          return -1;
    }
    else if (c1.value > c2.value) {
      if (c2.trump && !c1.trump)
          return -1;
      else
          return 1;
    }
    else if (c1.value == c2.value) {
      if(!c1.trump && !c2.trump )
          return 0;
      if(c2.trump)
          return -1;
      if(c1.trump)
          return 1;
    }
  });
}

function trump_only(cards) {
  for (i = 0; i < cards.length; i++) {
    if (!cards[i].trump)
      return false;
    return true;
  }
}