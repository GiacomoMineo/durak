/*
  DYPL Spring Term 2015
  Durak Web App
  ai-generator.js
  07/06/2015
  
  Giacomo Mineo
  Jan Dilberowic
  James Coop
*/

function generate_ai(rules_data, game) {
    attack_statements = "";
    defense_statements = "";

    // Parse additional attack statements
    rules_data.attack.forEach(function(statement) {
        attack_statements = attack_statements.concat(map_attacks(statement));
    });
    // Parse additional defense statements
    rules_data.defense.forEach(function(statement) {
        defense_statements = defense_statements.concat(map_defenses(statement));
    });

    console.log("Attack extension string:", attack_statements);
    console.log("Defense extension string:", defense_statements);

    // Dynamic function declaration
    attack_extension = eval('(function(game, defending_player) {' + attack_statements + '})');
    defense_extension = eval('(function(game, attacking_player) {' + defense_statements + '})');

    console.log("Attack extension method:", attack_extension);
    console.log("Defense extension method:", defense_extension);

    game.players.forEach(function(player) {
        if(player.cpu) {
            // Assign default compute methods to cpu players
            player.compute_attack = compute_attack;
            player.compute_defense = compute_defense;

            // Extend compute attack with custom rules
            var old_compute_attack = player.compute_attack;
            player.compute_attack = function() {
                var old_return = old_compute_attack.apply(player, arguments);
                // Run extended function
                if(typeof old_return === 'undefined') {
                    attack_extension.apply(player, arguments);
                } else {
                    return old_return;
                }
            };

            // Extend compute defense with custom rules
            var old_compute_defense = player.compute_defense;
            player.compute_defense = function() {
                var old_return = old_compute_defense.apply(player, arguments);
                // Run extended function
                if(typeof old_return === 'undefined') {
                    defense_extension.apply(player, arguments);
                } else {
                    return old_return;
                }
            };
        };
    });
};

function map_attacks(statement) {
    var mappings = [["lowest_allowed_card", "legit_cards[0]"],
                    ["only_trumps", "trump_only(legit_cards)"],
                    ["dont_have_to_move", "!game.isEmpty"],
                    ["do_not_move", "return false;"]];

    statement = statement.replace("if", "if(");
    statement = statement.replace("and", "&&");
    statement = statement.replace("then", ") {");
    statement = statement.replace("end", "}");
    statement = statement.replace("play", "game.attack(");
    statement = statement.replace("[", "");
    statement = statement.replace("]", ", this, defending_player);");
    statement = statement.concat("\n");
    mappings.forEach(function(pair) {
        statement = statement.replace(pair[0], pair[1]);
    });
    return statement;
};

function map_defenses(statement) {
    var mappings = [["lowest_allowed_card", "legit_cards[0]"],
                    ["only_trumps_on_table", "card_to_defend.trump == true"],
                    ["stack_is_not_empty", "!(game.deck.length == 0)"],
                    ["pick_up_cards", "return false;"]];

    statement = statement.replace("if", "if(");
    statement = statement.replace("then", ") {");
    statement = statement.replace("and", "&&");
    statement = statement.replace("end", "}");
    statement = statement.replace("play", "game.defend(card_to_defend, ");
    statement = statement.replace("[", "");
    statement = statement.replace("]", ", this, attacking_player);");
    statement = statement.concat("\n");
    mappings.forEach(function(pair) {
        statement = statement.replace(pair[0], pair[1]);
    });
    return statement;
};

// Compute attack default (no cards played)
var compute_attack = function(game, defending_player) {
    legit_cards = [];
    this.cards = order(this.cards);

    this.cards.forEach(function(item) {
        if (game.is_legit_attack(item))
            legit_cards.push(item);
    });

    if (legit_cards.length == 0) {
        return false;
    }
};

// Compute defense default (no cards played)
var compute_defense = function(game, attacking_player){
    legit_cards = [];
    card_to_defend = game.undefended_cards[0];

    this.cards = order(this.cards);
    this.cards.forEach(function(item) {
        if (game.is_legit_defense(item, card_to_defend))
            legit_cards.push(item);
    });

    if (game.undefended_cards.length == 0)
        return true;

    if (legit_cards.length == 0){
        console.log("AI ("+name+"): I cannot defend this! Add cards, I will pick them up afterwards... ");
        return false;
    }
};