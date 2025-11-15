from django.db import models


class Member(models.Model):
    client_id = models.CharField(max_length=64, unique=True)
    display_name = models.CharField(max_length=32)
    last_seen = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.display_name} ({self.client_id})"


class Message(models.Model):
    member = models.ForeignKey('Member', null=True, blank=True, on_delete=models.SET_NULL, related_name='messages')
    author_name = models.CharField(max_length=32)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.author_name}: {self.content[:30]}"
