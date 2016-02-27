var myFirebaseRef = new Firebase("https://quiz-buzzer-2.firebaseio.com/");
var usersRef = myFirebaseRef.child("users");
var questionRef = myFirebaseRef.child("question");
var answersRef = myFirebaseRef.child("answers");

var question = null;

var currentUserId = null;
var numOfUsers = 0;
var users = null;
usersRef.on("value",function(snapshot) {
	users = snapshot.val();
	numOfUsers = snapshot.numChildren();
});


function deRegisterCurrentUser() {
	usersRef.child(currentUserId).set(null);
	currentUserId = null;
}

function registerNewUser(userName) {
	var newUserRef = usersRef.push();
	currentUserId = newUserRef.key();
	newUserRef.set({
		teamName : userName
	});
	newUserRef.onDisconnect().set(null);
}

function onCheckUserName() {
	var filledUserName = document.getElementById("userNameInput").value;
	console.log(filledUserName);
	if(filledUserName != '') {
		if(currentUserId != null)
			deRegisterCurrentUser();
		registerNewUser(filledUserName);
		document.getElementById('user_name').innerHTML = "Team name : <b>"+filledUserName+"</b>";
		document.getElementById('other_users').innerHTML = "Connected with " + (numOfUsers-1) + " other users";
		document.getElementById('content').style.visibility = 'visible';
		activate();
	}
}

function onAnswerButtonClick() {
	console.log("Button Pressed");
	if(question.isActive) {
		if(!question.isAnswered) {
			console.log("I am probably first");
			answersRef.push({
				user : currentUserId,
				date : Firebase.ServerValue.TIMESTAMP
			});
			questionRef.child("isAnswered").set(true);
		}
	}
}

function activate() {
	questionRef.on("value",function(snapshot) {
		question = snapshot.val();
		var isActive = snapshot.val().isActive;
		var isAnswered = snapshot.val().isAnswered;
		if (!isActive) {
			document.getElementById('questionStatus').innerHTML = 'Inactive';
			document.getElementById('answeredButtonDiv').style.visibility = 'hidden';
		} else {
			document.getElementById('questionStatus').innerHTML = 'Active';
			document.getElementById('answeredButtonDiv').style.visibility = 'visible';

			//set is answered status
			if(!isAnswered) {
				document.getElementById("answeredStatusIndicator").innerHTML = "Press button to answer question";
				document.getElementById("answerButton").style.visibility = '';
			} else {
				answersRef.orderByChild('date').once("child_added",function(snapshot) {
					document.getElementById("answerButton").style.visibility = 'hidden';
					var answerId = snapshot.val().user;
					if(answerId == currentUserId) {
						document.getElementById("answeredStatusIndicator").innerHTML = "Fast! You pressed the button first :)";
					} else {
						var ansTeamName = users[answerId].teamName;
						document.getElementById("answeredStatusIndicator").innerHTML = "Too Slow! <b>" + ansTeamName + "</b> already pressed the button :(";
					}
				});
			}
		}
	});
};