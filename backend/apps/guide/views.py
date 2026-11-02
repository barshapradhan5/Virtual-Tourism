from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.places.models import Place
from .models import GuideChatSession, GuideMessage
from .services import GroqGuideService

class AskGuideView(APIView):
    """
    In-world AI Guide endpoint. Accessible by authenticated users.
    Accepts: { place_slug, question, session_id (optional), current_poi (optional) }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        place_slug = request.data.get('place_slug')
        question = request.data.get('question', '').strip()
        session_id = request.data.get('session_id')
        current_poi = request.data.get('current_poi')

        if not place_slug or not question:
            return Response(
                {'detail': 'Both place_slug and question are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            place = Place.objects.prefetch_related('pois').get(slug=place_slug)
        except Place.DoesNotExist:
            return Response({'detail': 'Place not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Get or create chat session
        if session_id:
            session = GuideChatSession.objects.filter(id=session_id, user=request.user).first()
        else:
            session = None

        if not session:
            session = GuideChatSession.objects.create(user=request.user, place=place)

        # Retrieve recent history for context
        recent_messages = list(session.messages.order_by('-created_at')[:4])
        recent_messages.reverse()
        history = [{'role': m.role, 'content': m.content} for m in recent_messages]

        # Save user question
        GuideMessage.objects.create(session=session, role='user', content=question)

        # Query guide service
        service = GroqGuideService()
        result = service.ask(place, question, history=history, current_poi_title=current_poi)

        # Save assistant answer
        GuideMessage.objects.create(
            session=session,
            role='assistant',
            content=result['answer'],
            is_fallback=result['is_fallback']
        )

        return Response({
            'session_id': str(session.id),
            'answer': result['answer'],
            'is_fallback': result['is_fallback'],
            'source': result['source']
        })

class SessionHistoryView(APIView):
    """
    Retrieves message history for a given session.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = GuideChatSession.objects.get(id=session_id, user=request.user)
        except GuideChatSession.DoesNotExist:
            return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        messages = session.messages.order_by('created_at').values('id', 'role', 'content', 'created_at')
        return Response({
            'session_id': str(session.id),
            'place_name': session.place.name,
            'messages': list(messages)
        })

