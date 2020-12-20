from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newtweet",views.newtweet,name="newtweet"),
    path("tweet/<str:view>/<int:number>",views.tweets,name="tweets"),
    path("likes/<int:tweet_id>",views.likes,name="likes"),
    path("edit/<int:tweet_id>",views.edit,name="edit"),
    path("user/<str:user>",views.user,name="user"),
    path("userfollow/<str:user>",views.userfollow,name="userfollow")
    #path("profile/<str:user>",views.profile,name="profile")


]
