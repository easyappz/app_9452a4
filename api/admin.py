from django.contrib import admin
from .models import Member, Message


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'display_name', 'last_seen', 'created_at')
    search_fields = ('client_id', 'display_name')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'author_name', 'created_at')
    search_fields = ('author_name', 'content')
    list_filter = ('created_at',)
