from rest_framework import serializers
from .models import Member, Message


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['client_id', 'display_name', 'last_seen', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'author_name', 'content', 'created_at']
