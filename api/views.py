from datetime import timedelta
import random
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Member, Message
from .serializers import MessageSerializer

GUEST_PREFIX = 'Гость'
ONLINE_DELTA_SECONDS = 60


class HeartbeatView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        client_id = (request.data.get('client_id') or '').strip()
        if not client_id:
            # Allow client to start without id; generate one server-side
            import uuid
            client_id = uuid.uuid4().hex
        member, created = Member.objects.get_or_create(
            client_id=client_id,
            defaults={'display_name': f"{GUEST_PREFIX} {random.randint(1000, 9999)}"}
        )
        # Touch last_seen
        member.last_seen = timezone.now()
        member.save(update_fields=['last_seen'])
        # Compute online count
        threshold = timezone.now() - timedelta(seconds=ONLINE_DELTA_SECONDS)
        online_count = Member.objects.filter(last_seen__gte=threshold).count()
        return Response({
            'client_id': member.client_id,
            'display_name': member.display_name,
            'online_count': online_count,
        })


class OnlineCountView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        threshold = timezone.now() - timedelta(seconds=ONLINE_DELTA_SECONDS)
        online_count = Member.objects.filter(last_seen__gte=threshold).count()
        return Response({'online_count': online_count})


class MessagesView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        after_id = request.query_params.get('after_id')
        try:
            if after_id is not None:
                after_id = int(after_id)
        except ValueError:
            return Response({'detail': 'after_id must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
        qs = Message.objects.all()
        if after_id:
            qs = qs.filter(id__gt=after_id).order_by('id')
        else:
            # return last 50 in ascending order
            latest_ids = list(Message.objects.order_by('-id').values_list('id', flat=True)[:50])
            qs = Message.objects.filter(id__in=latest_ids).order_by('id')
        data = MessageSerializer(qs, many=True).data
        return Response({'messages': data})

    def post(self, request):
        content = (request.data.get('content') or '').strip()
        client_id = (request.data.get('client_id') or '').strip()
        if not content:
            return Response({'detail': 'content is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not client_id:
            return Response({'detail': 'client_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        member, _ = Member.objects.get_or_create(
            client_id=client_id,
            defaults={'display_name': f"{GUEST_PREFIX} {random.randint(1000, 9999)}"}
        )
        msg = Message.objects.create(
            member=member,
            author_name=member.display_name,
            content=content[:2000],
        )
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
