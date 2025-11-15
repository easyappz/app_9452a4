from django.urls import path
from .views import HeartbeatView, OnlineCountView, MessagesView

urlpatterns = [
    path('members/heartbeat/', HeartbeatView.as_view(), name='heartbeat'),
    path('members/online_count/', OnlineCountView.as_view(), name='online-count'),
    path('messages/', MessagesView.as_view(), name='messages'),
]
