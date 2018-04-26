const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");

const scaleVal = 200;
context.scale(scaleVal,scaleVal);

var player1Turn = true;
const player1 = 0, player2 = 1, noPlayer = -1;
const maximizingPlayer = player1, minimizingPlayer = player2;
const playerColor = ["red", "steelblue"];
const INF = 100;
const humanPlayer = player1;

var currentPlayer = player1; 
var text;
var gameFinished = false;

cellColors = ["#fff","#fff","#fff","#fff","#fff","#fff","#fff","#fff","#fff"]
available = [true,true,true,true,true,true,true,true,true]
occupiedBy = [noPlayer,noPlayer,noPlayer,noPlayer,noPlayer,noPlayer,noPlayer,noPlayer,noPlayer]

function draw() {
	for (let i=0; i<3; i++) {
		for (let j=0; j<3; j++) {
			context.fillStyle = cellColors[i*3+j];
			context.fillRect(j*(1+0.047),i*(1+0.047), 1,1); // also creates spaces between the boxes
		}
	}
}

function update(time = 0) {

	if (gameFinished) {
		context.fillStyle = "#000";
		context.fillRect(0,0, canvas.width, canvas.height);
		context.scale(1/scaleVal, 1/scaleVal);
		console.log("game has finished");
		context.font = "50px Comic Sans MS";
		context.fillStyle = "red";
		context.textAlign = "center";
		context.fillText(text, canvas.width/2, canvas.height/2);
		return;
	}

	if (currentPlayer != humanPlayer) {
		let move = nextMove(currentPlayer);
		console.log("computer playing at: " + move);
		updateGame(move);
	}

	draw();
	requestAnimationFrame(update);
}

function updateGame(position) {
	cellColors[position] = playerColor[currentPlayer];
	available[position] = false;
	occupiedBy[position] = currentPlayer;
	if (gameOver(occupiedBy, currentPlayer)) {
		gameFinished = true;
		text = (currentPlayer == player1) ? "RED WIN!!" : "BLUE WIN!!";
		console.log(text);
	}
	else if (noMoreMove(occupiedBy)) {
		gameFinished = true;
		text = "ITS A DRAW!!";
		console.log(text);
	}
	currentPlayer = (currentPlayer == player1) ? player2: player1;
}

canvas.addEventListener('mousedown', function(e) {
	
	if (currentPlayer != humanPlayer) return;

	let rect = canvas.getBoundingClientRect();
	let ej = Math.round((e.x - rect.left)/220);
	let ei = Math.round((e.y - rect.top)/220);

	let position = ei*3+ej;
	if (!available[position]) return;

	updateGame(position);
});




/********************* AI *********************/


function minimax(availableState, occupiedByState, player) {

	if (gameOver(occupiedByState, minimizingPlayer)) 
		return [-1]; // minimizing player won
	if (gameOver(occupiedByState, maximizingPlayer)) 
		return [1]; // maximizing player won
	if (noMoreMove(occupiedByState))
		return [0]; // tie
	
	let retval = new Array(9);
	if (player == maximizingPlayer)
		for (let i=0; i<9; i++) retval[i] = -INF;
	else
		for (let i=0; i<9; i++) retval[i] = INF;

	for (let i=0; i<9; i++) {
		//console.log("minimax: i:" + i);
		if (availableState[i]) {
			availableState[i] = false;
			occupiedByState[i] = player;
			nextPlayer = (player == maximizingPlayer) ? minimizingPlayer: maximizingPlayer;
			retval[i] = minimax(availableState, occupiedByState, nextPlayer )[0];
			availableState[i] = true;
			occupiedByState[i] = noPlayer;
		}
	}

	let retPos = 0;
	let ret = retval[0];
	for (let i=0; i<9; i++) {
		if (player == maximizingPlayer) {
			if (retval[i] > ret) {
				ret = retval[i];
				retPos = i;
			}
		}
		else {
			if (retval[i] < ret) {
				ret = retval[i];
				retPos = i;
			}
		}

	}

	return [ret, retPos];
}


function nextMove(player) {
	// this function is used by AI Player
	let availableState = new Array(9);
	let occupiedByState = new Array(9);

	for (let i=0; i<9; i++) {
		availableState[i] = available[i];
		occupiedByState[i] = occupiedBy[i];
	}

	var retval = minimax(availableState, occupiedByState, player);
	console.log("minimax returned: " + retval);

	return retval[1];
}



function gameOver(occupiedByState, player) {
	if (((occupiedByState[0]==occupiedByState[1]) && (occupiedByState[0]==occupiedByState[2]) && (occupiedByState[0]==player)) ||
		((occupiedByState[3]==occupiedByState[4]) && (occupiedByState[3]==occupiedByState[5]) && (occupiedByState[3]==player)) ||
		((occupiedByState[6]==occupiedByState[7]) && (occupiedByState[6]==occupiedByState[8]) && (occupiedByState[6]==player)) ||
		((occupiedByState[0]==occupiedByState[3]) && (occupiedByState[0]==occupiedByState[6]) && (occupiedByState[0]==player)) ||
		((occupiedByState[1]==occupiedByState[4]) && (occupiedByState[1]==occupiedByState[7]) && (occupiedByState[1]==player)) ||
		((occupiedByState[2]==occupiedByState[5]) && (occupiedByState[2]==occupiedByState[8]) && (occupiedByState[2]==player)) ||
		((occupiedByState[0]==occupiedByState[4]) && (occupiedByState[0]==occupiedByState[8]) && (occupiedByState[0]==player)) ||
		((occupiedByState[2]==occupiedByState[4]) && (occupiedByState[2]==occupiedByState[6]) && (occupiedByState[2]==player)))
	{
		return true;
	}

	return false;
}

function noMoreMove(occupiedByState) {
	for (let i=0; i<9; i++)
		if (occupiedByState[i] == noPlayer) 
			return false;
	return true;
}


update();
