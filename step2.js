(function () {

  const DEFAULT_WEAPON = 'weapon';

  function getRandomNumber() {
    return Math.floor(Math.random() * (10 - 1) + 1);
  }

  console.log()
  function getCell(colPosition, rowPosition) {
    return document
      .querySelectorAll(`div[data-col="${colPosition}"][data-row="${rowPosition}"]`)[0];
  }

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

  Gamebase.prototype.setup = function() {
    this.barriers = [];
    this.weapons = Gamebase.DEFAULT_WEAPONS;
    this.playerInTurn = 'player1';

    this.createMap();
    //loop for creating of barrier
    for(let i = 0; i < 13; i++){
      this.placeBarrier([i]);
    }

    this.player1 = this.createPlayer1();
    this.player1.inTurn = true;
    this.placePlayer(this.player1);
    this.player2 = this.createPlayer2();
    this.placePlayer(this.player2);

    if (this.isReadyToMove()) {
      this.setup();
      return;
    }

    this.placeWeapon('weapon1');
    this.placeWeapon('weapon2');
    this.placeWeapon('weapon3');
    this.placeWeapon('weapon4');
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
    this.lives = 100;
    this.inTurn = false;
  }
//The prototype is an object that is associated with every functions and 
//objects by default in JavaScript, where function's prototype property is 
//accessible and modifiable and object's prototype property (aka attribute) is not visible.
  Player.prototype.getCell = function () {
    return getCell(this.position.col, this.position.row);
  }
  //keys() is used for returning enumerable properties of an array-like object
  Player.prototype.getCellHtml = function () {
    return `
      <div class="player-weapon">
        <span class="${this.weapon.key}" >&nbsp;</span>
        <span>${this.weapon.damage}</span>
      </div>
    `;
  }

  Player.prototype.refreshHtml = function () {
    const oldCell = getCell(this.lastPosition.col, this.lastPosition.row);
    if (oldCell) {
      oldCell.innerHTML = '&nbsp;';
    }

    this.refreshSummaryHtml();
  }

  Player.prototype.refreshSummaryHtml = function () {
    const cell = this.getCellHtml();
    this.summaryContainer.innerHTML = `
      <h2 class="turning-title">${this.name}</h2>
      <h4 class="turning-title">${this.inTurn ? 'Your Turn' : 'Waiting'}</h4>
      <div class="player-cell ${this.name}">
        ${cell}
      </div>
    `;
  }

  Player.prototype.moveTo = function (newPosition, refreshHtml) {
    this.lastPosition = Object.assign({}, this.position);
    this.position = newPosition;
    refreshHtml && this.refreshHtml();
  }

//Math. abs() function in JavaScript is used to return the absolute value of a number. 
//It takes a number as its parameter and returns its absolute value.

  Player.prototype.canMoveTo = function (newPosiblePosition, callbackIfCan) {
    const direction = newPosiblePosition.col == this.position.col ? 'row' : 'col';
    const diffCol = Math.abs(this.position.col - newPosiblePosition.col);
    const diffRow = Math.abs(this.position.row - newPosiblePosition.row);

    const validColPosition = direction === 'col' && diffCol <= 3 && diffRow === 0;
    const validRowPosition = direction === 'row' && diffRow <= 3 && diffCol === 0;

    const canMove = (validColPosition || validRowPosition);
    canMove && callbackIfCan && callbackIfCan();

    return canMove;
  }

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

    //add of jquery event here
    $(this.gridContainer).click(function(event) {
      const element = event.target;
      const newPosiblePosition = {
        col: Number(element.dataset.col),
        row: Number(element.dataset.row)
      };

      self.tryMovePlayerInTurn(newPosiblePosition);
     
    });
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
      player.moveTo(position, true);
      this.putClass(position, player.name)
    }
  }

  Gamebase.prototype.hasBarriers = function(fromPosition, toPosition) {
    const direction = toPosition.col == fromPosition.col ? 'row' : 'col';
    console.log("Gamebase.prototype.hasBarriers -> direction", direction)
    const diff = direction === 'col'
      ? fromPosition.col - toPosition.col
      : fromPosition.row - toPosition.row;
    console.log("Gamebase.prototype.hasBarriers -> diff", diff)

    let col = direction === 'col' ? fromPosition.col - 1 : fromPosition.col;
    let row = direction === 'row' ? fromPosition.row - 1 : fromPosition.row;

    if (diff < 0) {
      col = direction === 'col' ? fromPosition.col + 1 : fromPosition.col;
      row = direction === 'row' ? fromPosition.row + 1 : fromPosition.row;
    }

    const fromPositionWay = { col: col, row: row };

    console.log("Gamebase.prototype.hasBarriers -> fromPositionWay", fromPositionWay)

    const cell = getCell(fromPositionWay.col, fromPositionWay.row);
    if (!cell) {
      return false;
    }
    if (cell.classList.contains('barrier')) {
      console.log('exist a barrier from fromPosition to toPosition');
      return true;
    }

    if (Math.abs(diff) !== Math.abs(fromPosition[direction] - fromPositionWay[direction])) {
      return this.hasBarriers(fromPositionWay, toPosition);
    }

    return false;
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

  Gamebase.prototype.putWeaponInfo = function(position) {
    const cell = getCell(position.col, position.row);
    console.log('putting info weapon ' + newClass);
    cell.classList.add('weapon');
  }

  Gamebase.prototype.removeClass = function(position, classToRemove) {
    const cell = getCell(position.col, position.row);
  console.log('removing ' + classToRemove);
    cell.classList.remove(classToRemove);
    cell.classList.remove('taken');
  }

 
  Gamebase.prototype.isReadyToMove = function() {
    const colPlayer1 = this.player1.position.col;
    const rowPlayer1 = this.player1.position.row;
    const colPlayer2 = this.player2.position.col;
    const rowPlayer2 = this.player2.position.row;

    const diffCol = Math.abs(colPlayer1 - colPlayer2);
    const diffRow = Math.abs(rowPlayer1 - rowPlayer2);

    const isReadyForCol = diffCol === 1 && diffRow === 0;
    const isReadyForRow = diffRow === 1 && diffCol === 0;

    if (isReadyForCol || isReadyForRow) {
      return true
    }

    return false;
  }

  Gamebase.prototype.tryMovePlayer = function(player, newPosiblePosition) {
    const self = this;
    player.canMoveTo(newPosiblePosition, function() {
      if (self.isPositionAvailable(newPosiblePosition) && !self.hasBarriers(player.position, newPosiblePosition)) {
        self.movePlayer(player, newPosiblePosition);
      }
    });
  }

  Gamebase.prototype.tryMovePlayerInTurn = function(newPosiblePosition) {
    this.tryMovePlayer(this[this.playerInTurn], newPosiblePosition);
  }
  Gamebase.prototype.findWeaponByPosition = function(newPosition) {
    return Object
      .values(this.weapons)
      .find(weapon => weapon.position && weapon.position.col === newPosition.col && weapon.position.row === newPosition.row);
  };

  Gamebase.prototype.switchWeapon = function(player) {
    const position = player.position;
    const newWeapon = this.findWeaponByPosition(position);
    if (newWeapon) {
      // Put down the old weapon down
      this.weapons[player.weapon.key].position = position;
      this.putClass(position, player.weapon.key, true);

      // Put up the new Weapon to the player
      // For the weapons in use the position attribute is null
      this.weapons[newWeapon.key].position = null;
      this.removeClass(position, newWeapon.key);
      player.weapon = this.weapons[newWeapon.key];
    }
  };

  Gamebase.prototype.movePlayer = function(player, newPosition) {
    // Remove class player from old position
    this.removeClass(player.position, player.name);

    // Set new position and style of player to the new position cell
    this.putClass(newPosition, player.name);

    player.moveTo(newPosition);

    // switch weapon if necessary
    this.switchWeapon(player);

    // move turn to next player
    this.playerInTurn = this.playerInTurn === 'player1' ? 'player2' : 'player1';
    const anotherLayer = this.playerInTurn === 'player1' ? 'player2' : 'player1';

    this[this.playerInTurn].inTurn = true;
    this[anotherLayer].inTurn = false;

    this[this.playerInTurn].refreshHtml();
    this[anotherLayer].refreshHtml();
  };


  Gamebase.prototype.refreshPlayerInTurnLabel = function() {
    const summary = this[this.playerInTurn].summary
  }
  

  // Start the game
  const game = new Gamebase();
  game.setup();

})()