from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass
class Tweet(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="tweets")
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User,related_name="user_likes",blank=True)
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %#d %Y, %#I:%M %p"),
            "likes": [user.username for user in self.likes.all()]
        }
class Follow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followdata')
    following = models.ManyToManyField(User, blank=True, related_name='following')
    followers = models.ManyToManyField(User, blank=True, related_name='followers')
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "following": [user.username for user in self.following.all()],
            "followers": [user.username for user in self.followers.all()]
        }