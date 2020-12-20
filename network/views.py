from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
import json
from .models import User,Tweet,Follow
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from operator import itemgetter
from django.core.paginator import Paginator


def index(request):
    return render(request, "network/index.html")

@csrf_exempt
@login_required
def userfollow(request,user):
    loggedin_name = str(request.user)
    if request.method == "GET":#This  will run only work when the profile page is loaded this check if user is followerr or not
        following_obj = User.objects.get(username=request.user).followdata.get().following.all().values_list("username",flat=True)
        following_list = []
        for i in range(len(following_obj)):
            name = following_obj[i]
            following_list.append(name) #Save the following names in a pure list
        if user in following_list:#check is user is following or not
            return JsonResponse({"message": "Unfollow"}, safe=False)#this will send message to the API that handles the innerHTML of the follow button
        else:
            return JsonResponse({"message": "Follow"}, safe=False)

    if request.method == "PUT":#This part will run when the user clicks the follow/unfollow button ....the Put request is used here
        data = json.loads(request.body)
        if data.get("body") == "Follow":#if the request Body has Follow , the follow objects of the user is updated
            usr_obj = User.objects.get(username=user)#here user is the person whom i want to follow and request.user is the logged in user
            obj1 = Follow.objects.get(user=request.user)
            obj1.following.add(usr_obj)
            obj1.save()

            obj2 = Follow.objects.get(user=usr_obj)
            obj2.followers.add(request.user)
            obj2.save()
        else:
            usr_obj = User.objects.get(username=user)
            obj1 = Follow.objects.get(user=request.user)
            obj1.following.remove(usr_obj)
            obj1.save()

            obj2 = Follow.objects.get(user=usr_obj)
            obj2.followers.remove(request.user)
            obj2.save()
    return JsonResponse({"message":"working well"}, safe=False)

def user(request,user):#here you get the number of followers/following a user has this loads a different page
    if request.user.is_authenticated==False:
        return render(request, "network/login.html", {
            "message": "You need to login to view any profiles"
        })
    logged_in_user_name = request.user
    username = user
    following = User.objects.get(username=user).followdata.get().following.all().values_list("username",flat=True)
    following = len(following)
    followers = User.objects.get(username=user).followdata.get().followers.all().values_list("username",flat=True)
    followers = len(followers)
    return render(request, "network/profile.html", {
            "username": username, "following": following, "followers": followers
        })



@csrf_exempt
@login_required
def edit(request,tweet_id):#edit tweet
    try:
        tweet = Tweet.objects.get(pk=tweet_id)
    except Tweet.DoesNotExist:
        return JsonResponse({"error": "tweet not found."}, status=404)
    if request.method == "PUT":
        data = json.loads(request.body)
        body = data.get("body")
        tweet.body = body #here we change the body of the tweet and the things to be changed are sent by the api
        tweet.save()
    return JsonResponse(tweet.serialize(), safe=False)


@csrf_exempt
@login_required
def newtweet(request):#here new tweet is created
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)

    user = request.user
    body = data["body"]
    obj = Tweet.objects.create(user=user,body=body)
    return JsonResponse({"message": "Email sent successfully."}, status=201)

@csrf_exempt
@login_required
def likes(request, tweet_id):
    try:
        tweet = Tweet.objects.get(pk=tweet_id)
    except Tweet.DoesNotExist:
        return JsonResponse({"error": "tweet not found."}, status=404)

    if request.method == "PUT":#this runs if the user likes or unlikes any tweet and depending upon what thebody of api contains like is added or removed
        data = json.loads(request.body)
        if data.get("likes") == "LIKE":
            tweet.likes.add(request.user)
        else:
            tweet.likes.remove(request.user)
        tweet.save()
    return JsonResponse(tweet.serialize(), safe=False)

def tweets(request,view,number):#when the api request alltweets/following/profile viewsthis function is run
    if view == "alltweets":
        alltweets = Tweet.objects.all()
        alltweets = alltweets.order_by("-timestamp").all()
        alltweets = [tweet.serialize() for tweet in alltweets]#all tweets
    elif view == "following":
        following_names = User.objects.get(username=request.user).followdata.get().following.all().values_list("username",flat=True)
        alltweets=[]#following names is the list of the people user follows
        for i in range(len(following_names)):
            name = following_names[i]#here in for loop we find the tweets of every single person in following list and append it to alltweets list
            name = User.objects.get(username=name)
            tweet = name.tweets.all()
            tweet = [x.serialize() for x in tweet]
            alltweets.append(tweet)
        #print(alltweets)
        alltweets = [item for elem in alltweets for item in elem]#we convert the list with sublists into one flat list using this code
        #print(alltweets)
        alltweets = sorted(alltweets, key=itemgetter('timestamp'), reverse=True)#Tweets only of the people which the user follows
    else:
        try:
            name = User.objects.get(username=view)
            alltweets = name.tweets.all()#this gives all the tweets of a particular user
            alltweets = alltweets.order_by("-timestamp").all()
            alltweets = [tweet.serialize() for tweet in alltweets]
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
    paginator = Paginator(alltweets,10)#10 is the number of tweets displayed on a single page
    page = paginator.get_page(number)#this number we get from the api
    alltweets = page.object_list

    if page.has_next():
        next_url = page.next_page_number()
    else:
        next_url = ""
    if page.has_previous():
        prev_url = page.previous_page_number()
    else:
        prev_url = ""
    rangee = page.paginator.page_range
    rangee = list(rangee)
    no = page.number
    thisdict = {"next_page_url": next_url,"prev_page_url": prev_url,"number":no,"range":rangee}
    alltweets.append(thisdict)#thisdict contains info about pages and is separated from the tweets after the response is sent to javascript api
    return JsonResponse(alltweets, safe=False)

def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            follow_obj = Follow.objects.create(user=user)
            follow_obj.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
