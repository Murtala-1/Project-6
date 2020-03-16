(function () {

  function getRandomNumber() {
    return Math.floor(Math.random() * (10 - 1) + 1);
  }

  function getCell(colPosition, rowPosition) {
    return document
      .querySelectorAll(`div[data-col="${colPosition}"][data-row="${rowPosition}"]`)[0];
  }

  function Player(name, weapon) {
    this.name = name;
    this.weapon = Gamebase.DEFAULT_WEAPONS[weapon];
    this.summaryContainer = document.getElementById(name + '-summary');
    this.position = {
      col: 0,
      row: 0
    };
    this.lastPosition = {
      col: 0,
      row: 0
    };
  
  }
//The prototype is an object that is associated with every functions and 
//objects by default in JavaScript, where function's prototype property is 
//accessible and modifiable and object's prototype property (aka attribute) is not visible.


  

//Math. abs() function in JavaScript is used to return the absolute value of a number. 
//It takes a number as its parameter and returns its absolute value.

  function Gamebase() {
    this.gridContainerId = 'grid-container';
    this.gridContainer = document.getElementById(this.gridContainerId);
    this.player1 = null;
    this.player2 = null;
    this.barriers = [];
    this.weapons = Gamebase.DEFAULT_WEAPONS;
    this.playerInTurn = 'player1';
    this.defending = false;

    const self = this;
  }

  const DEFAULT_WEAPON = 'weapon';

  Gamebase.DEFAULT_WEAPONS = {
    "weapon": {
      key: 'weapon',
      position: null,
      damage: 5,
    },
    "weapon1": {
      key: 'weapon1',
      position: null,
      damage: 50,
    },
    "weapon2": {
      key: 'weapon2',
      position: null,
      damage: 40,
    },
    "weapon3": {
      key: 'weapon3',
      position: null,
      damage: 30,
    },
    "weapon4": {
      key: 'weapon4',
      position: null,
      damage: 20,
    },
  };

  Gamebase.prototype.createPlayer1 = function() {
    return new Player('player1', DEFAULT_WEAPON);
  }

  Gamebase.prototype.createPlayer2 = function() {
    return new Player('player2', DEFAULT_WEAPON);
  }

  Gamebase.prototype.createMap = function() {
    let cells = '';

    for (let iRow = 1; iRow < 11; iRow++) {
      for (let iCol = 1; iCol < 11; iCol++) {
        cells += `<div class='grid-item' data-col=${iCol} data-row=${iRow} >&nbsp;</div>`;
      }
    }
    this.gridContainer.innerHTML = cells;
  }

  Gamebase.prototype.isPositionAvailable = function(position, callbackWhileIsTaken) {
    const cell = getCell(position.col, position.row);
    if (cell.classList.contains('taken')) {
      console.log('exist something int that position');
      callbackWhileIsTaken && callbackWhileIsTaken();
      return false;
    }

    return true;
  }

  Gamebase.prototype.putClass = function(position, newClass, notTaken) {
    const cell = getCell(position.col, position.row);
    console.log(newClass + ' placing ');
    cell.classList.add(newClass);
    !notTaken && cell.classList.add('taken');
  }

  Gamebase.prototype.putWeaponDetails = function(position) {
    const cell = getCell(position.col, position.row);
    console.log('putting info weapon ' + newClass);
    cell.classList.add('weapon');
  }

 
  Gamebase.prototype.placeBarrier = function() {
    const colPosition = getRandomNumber();
    const rowPosition = getRandomNumber();
    const position = {
      col: colPosition,
      row: rowPosition
    };
    const self = this;

    const available = this.isPositionAvailable(position, function() {
      self.placeBarrier();
    });

    if (available) {
      this.barriers.push(position);
      this.putClass(position, 'barrier')
    }
  }

  Gamebase.prototype.placeWeapon = function(weapon) {
    const colPosition = getRandomNumber();
    const rowPosition = getRandomNumber();
    const position = {
      col: colPosition,
      row: rowPosition
    };
    const self = this;

    const available = this.isPositionAvailable(position, function() {
      self.placeWeapon(weapon);
    });

    if (available) {
      this.weapons[weapon].position = position;
      this.putClass(position, weapon, true);
    }
  }

  Gamebase.prototype.placePlayer = function(player) {
    const colPosition = getRandomNumber();
    const rowPosition = getRandomNumber();
    const position = {
      col: colPosition,
      row: rowPosition
    };
    const me = this;

    const available = this.isPositionAvailable(position, function() {
      me.placePlayer(player);
    });

    if (available) {
      
      this.putClass(position, player.name)
    }
  }
 
  Gamebase.prototype.setup = function() {
    this.barriers = [];
    this.createMap();
    //loop for creating of barrier
    for(let i = 0; i < 13; i++){
      this.placeBarrier([i]);
    }

    this.player1 = this.createPlayer1();
    this.placePlayer(this.player1);
    this.player2 = this.createPlayer2();
    this.placePlayer(this.player2);

    this.placeWeapon('weapon1');
    this.placeWeapon('weapon2');
    this.placeWeapon('weapon3');
    this.placeWeapon('weapon4');
  }

  // Start the game
  const game = new Gamebase();
  game.setup();

})()