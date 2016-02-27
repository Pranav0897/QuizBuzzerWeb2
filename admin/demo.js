var myFirebaseRef = new Firebase("https://quiz-buzzer-2.firebaseio.com/");
var usersRef = myFirebaseRef.child("users");
var questionRef = myFirebaseRef.child("question");
var answersRef = myFirebaseRef.child("answers");

var users = null;
usersRef.on("value",function(snapshot) {
	users = snapshot.val();
	var numOfUsers = snapshot.numChildren();
	document.getElementById("num_connected").innerHTML = "Connected users : " + numOfUsers;
	var list_root = document.getElementById("user_list");
	list_root.innerHTML = "";
	snapshot.forEach(function(user){
		var user_item = document.createElement("li");
		user_item.innerHTML = user.val().teamName;
		list_root.appendChild(user_item);
	});
});

function setQuestionActive() {
	questionRef.set({
		isActive : true,
		isAnswered : false
	});
	answersRef.set(null);
}

function setQuestionInactive() {
	questionRef.set({
		isActive : false,
		isAnswered : false
	});
	answersRef.set(null);
}

questionRef.onDisconnect().set({
	isActive : false,
	isAnswered : false
});
answersRef.onDisconnect().set(null);


function getPressedUser(action) {
	answersRef.orderByChild('date').once("child_added",function(snapshot) {
		console.log(snapshot.val());
		var answeredUser = users[snapshot.val().user].teamName;
		console.log(answeredUser);
		action(answeredUser);
	});
}

questionRef.on("value",function(snapshot) {
	var isActive = snapshot.val().isActive;
	var isAnswered = snapshot.val().isAnswered;
	if (!isActive) {
		document.getElementById('questionStatus').innerHTML = 'Inactive';
		document.getElementById('answeredStatusDiv').style.visibility = 'hidden';
	} else {
		document.getElementById('questionStatus').innerHTML = 'Active';
		document.getElementById('answeredStatusDiv').style.visibility = 'visible';

		//set is answered status
		if(!isAnswered) {
			document.getElementById('answerStatus').innerHTML = 'No';
		} else {
			getPressedUser(function(user) {
				document.getElementById('answerStatus').innerHTML = 'Yes by <b>' + user + '</b>';
			});
		}
	}
});