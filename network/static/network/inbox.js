document.addEventListener('DOMContentLoaded', function() {

document.querySelector('#allposts').addEventListener('click', alltweetsfunction);

alltweetsfunction()
});

function alltweetsfunction(){
var username=document.querySelector('#login_name').innerHTML
if(username!=="")
{
document.querySelector('#newtweetview').style.display = 'block';
document.querySelector('#alltweetview').style.display = 'block';
tweetsview("alltweets")
document.querySelector('#following').addEventListener('click', followingfunction);
document.querySelector('#tweetform').addEventListener('submit',createtweet);

}
else
{
tweetsview("alltweets")
document.querySelector('#newtweetview').style.display = 'none';
document.querySelector('#alltweetview').style.display = 'block';
}
}
//*******************************************THE API for ALL TWEETS VIEW***********************
function tweetsview(view,number){

if (number===undefined){number=1;}//this is current page number it default is 1
var username = document.querySelector('#login_name').innerHTML
const url = `/tweet/${view}/${number}`;
fetch(url)
	.then(response => response.json())
	.then(tweets => {
	   var p = tweets[tweets.length - 1];//here we slice the array returned and the last object in the array is separated
	   var tweet = tweets.splice(0,tweets.length - 1);//here we slice all the objects inside the array except the last one because the last object is not a tweet but page info
       var mainContainer = document.getElementById("alltweetview");
       document.querySelector("#alltweetview").innerHTML="";
        for(var i = 0;i<tweet.length;i++){
        var div = document.createElement("div");
		div.setAttribute("class", "col-md-8 mx-auto col-10 border-top border-dark p-1");
        div.innerHTML=`<div class="card card-body bg-light" id="tweet-${tweet[i]["id"]}">
                        <a href="/user/${tweet[i]["user"]}" class="text-dark"><h4 class="font-italic" id="user-${tweet[i]["id"]}">${tweet[i]["user"]}</h4></a>
                        <h6><a href="#0" id="edit-${tweet[i]["id"]}" onclick="edit(${tweet[i]["id"]},'${tweet[i]["body"]}')"></a></h6>
	                    <p class="text-muted"><small>${tweet[i]["timestamp"]}</small></p>
	                    <p class="text-center">${tweet[i]["body"]} </p>
                       </div>
                       <button type="submit" class="btn btn-info" id="${tweet[i]["id"]}" onclick="likefunction(this);">LIKE</button> <small id="like-${tweet[i]["id"]}">${tweet[i]["likes"].length} LIKES</small>`
        mainContainer.appendChild(div);
        var likers = tweet[i]["likes"];
        if(likers.indexOf(username) >= 0)//checks if user name is present in likers list
        {
            document.getElementById(`${tweet[i]["id"]}`).innerHTML="UNLIKE"
        }
        else
        {
            document.getElementById(`${tweet[i]["id"]}`).innerHTML="LIKE"
        }
        var editcheck=document.getElementById(`user-${tweet[i]["id"]}`).innerHTML
        if(editcheck===username)//the user can edit the posts made by him only and the edit button will not be available for anyone else
        {
            document.getElementById(`edit-${tweet[i]["id"]}`).innerHTML = "Edit"
        }

       }
/////////depending on the page info here the id of the paginator buttons is changed. If any pagination buttton is clicked than that id is sent to tweetsview function
document.getElementById("paginatorid1").childNodes[0].id=`${p["prev_page_url"]}`
document.getElementById("paginatorid2").children[0].id=`${p["number"]}`
document.getElementById("paginatorid2").children[0].innerHTML=`${p["number"]}`
document.getElementById("paginatorid3").children[0].id=`${p["next_page_url"]}`
document.querySelectorAll('.page-link').forEach(button => {
                    button.onclick = function() {
                        var number = this.id;
                        tweetsview(view,number)
                        }
                        });
	})
}

//*******************************************API For ALLTWEETS VIEW ENDS HERE**********************

//**************************************FOLLOWING VIEW Function starts here*********************************************
function followingfunction(){
document.querySelector('#newtweetview').style.display = 'none';
document.querySelector('#alltweetview').style.display = 'block';
tweetsview("following")
}
//*************************************FOLLOWING VIEW Function ends here********************************************

//*****************************************CREATING NEW TWEET****************************************
function createtweet(){
event.preventDefault();
var body=document.querySelector('#tweet-body').value
if (body==="")
{alert("Tweet should not be empty")}
else
{
fetch('newtweet', {
  method: 'POST',
  body: JSON.stringify({
    user: document.querySelector('#login_name').innerHTML,
    body: document.querySelector('#tweet-body').value
  })
}).then(response => response.json())
  .then(response => {
      console.log('Response: ', response);
  })
}
document.querySelector('#tweet-body').value = '';
setTimeout(location.reload.bind(location), 500);//this will refresh the application after 500ms
 }
//*********************************CREATING NEW TWEET ENDS HERE****************************************

//*********************************FUNCTION FOR LIKE BUTTON ON TWEET*************************************************
function likefunction(id){
var username=document.querySelector('#login_name').innerHTML
var button=document.getElementById(`${id.id}`).innerHTML
if (button==="LIKE")
{
    if(username!=="")
    {
    document.getElementById(`${id.id}`).innerHTML="UNLIKE"
        fetch(`/likes/${id.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                likes:"LIKE"
                })
            }).then(response => response.json())
	.then(tweet => {
	document.getElementById(`like-${id.id}`).innerHTML=` ${tweet["likes"].length} LIKES`
	})
    }
    else
    {
        alert("You can only LIKE posts if you are logged in")
    }
}
else
{
    if(username!=="")
    {
    document.getElementById(`${id.id}`).innerHTML="LIKE"
        fetch(`/likes/${id.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                likes:"UNLIKE"
                })
            }).then(response => response.json())
	.then(tweet => {
	document.getElementById(`like-${id.id}`).innerHTML=` ${tweet["likes"].length} LIKES`
	})
    }
    else
    {
        alert("You can only LIKE posts if you are logged in")
    }
}
}
//**************************************LIKE BUTTON FUNCTION ENDS HERE***********************************************

//****************************************EDIT BUTTON FUNCTION BEGINS HERE*****************************
function edit(id,body){
document.getElementById(`tweet-${id}`).innerHTML=`<textarea class="form-control" name="content" id="edit-body">${body}</textarea>
                                                  <button type="submit" class="btn btn-secondary" id="editbutton" onclick="edit_save(${id})">Save</button>`
document.getElementById(id).style.display="none"
document.getElementById(`like-${id}`).style.display="none"

}
//*******************************************EDIT FUNCTION ENDS HERE**************************************
//*************************************EDIT SAVE FUNCTION STARTS HERE *********************************
function edit_save(id){
    fetch(`/edit/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                body:document.querySelector("#edit-body").value
                })
            }).then(response => response.json())
	.then(tweet => {
	document.querySelector("#edit-body").value=""
	document.getElementById(`tweet-${id}`).innerHTML=`<a href="/user/${tweet["user"]}" class="text-dark"><h4 class="font-italic" id="user-${tweet["id"]}">${tweet["user"]}</h4></a>
                                                        <h6><a href="#0" id="edit-${tweet["id"]}" onclick="edit(${tweet["id"]},'${tweet["body"]}')">Edit</a></h6>
	                                                    <p class="text-muted"><small>${tweet["timestamp"]}</small></p>
	                                                    <p class="text-center">${tweet["body"]} </p>`
	document.getElementById(id).style.display="block"
    document.getElementById(`like-${id}`).style.display="block"
	})
}
//************************************EDIT SAVE ENDS HERE************************************************