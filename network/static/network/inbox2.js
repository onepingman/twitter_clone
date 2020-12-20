document.addEventListener('DOMContentLoaded', function() {

const name = document.querySelector("#username").innerHTML
const url = `/userfollow/${name}`;
const username = document.querySelector("#login_name").innerHTML
if(name===username)
{
document.querySelector('#buttondiv').style.display = 'none';
}
fetch(url)
	.then(response => response.json())
	.then(status => {
    if(status["message"]==="Unfollow")
    {
        document.querySelector("#followbtn").innerHTML="Unfollow"
        console.log("printed Unfollow")
    }
    if(status["message"]==="Follow")
    {
        document.querySelector("#followbtn").innerHTML="Follow"
        console.log("printed follow")
    }

	})
tweetsview(name)
document.querySelector("#followbtn").addEventListener('click', FollowUnfollow);
});

function FollowUnfollow(){
const name = document.querySelector("#username").innerHTML
const url = `/userfollow/${name}`;
var status = document.querySelector("#followbtn").innerHTML
console.log(status)
if (status==="Unfollow")
{
document.querySelector("#followbtn").innerHTML="Follow"
fetch(url, {
            method: 'PUT',
            body: JSON.stringify({
                body:"Unfollow"
                })
            })
}
else
{
document.querySelector("#followbtn").innerHTML="Unfollow"
fetch(url, {
            method: 'PUT',
            body: JSON.stringify({
                body:"Follow"
                })
            })
}
setTimeout(location.reload.bind(location), 500);//this will refresh the application after 500ms
}

