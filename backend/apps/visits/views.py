from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import VisitSession, Favourite, Rating
from .serializers import VisitSessionSerializer, FavouriteSerializer, RatingSerializer
from apps.places.models import Place

class StartVisitView(generics.CreateAPIView):
    serializer_class = VisitSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UpdateVisitView(generics.UpdateAPIView):
    serializer_class = VisitSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return VisitSession.objects.filter(user=self.request.user)

    def patch(self, request, *args, **kwargs):
        session = self.get_object()
        duration_s = request.data.get('duration_s', session.duration_s)
        session.duration_s = duration_s
        session.ended_at = timezone.now()
        session.save()
        return Response(self.get_serializer(session).data)

class VisitHistoryView(generics.ListAPIView):
    serializer_class = VisitSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VisitSession.objects.filter(user=self.request.user).select_related('place', 'place__category', 'place__state')

class FavouriteListView(generics.ListAPIView):
    serializer_class = FavouriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favourite.objects.filter(user=self.request.user).select_related('place', 'place__category', 'place__state')

class ToggleFavouriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        place_id = request.data.get('place_id')
        if not place_id:
            return Response({'detail': 'place_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            place = Place.objects.get(id=place_id)
        except Place.DoesNotExist:
            return Response({'detail': 'Place not found'}, status=status.HTTP_404_NOT_FOUND)

        fav = Favourite.objects.filter(user=request.user, place=place).first()
        if fav:
            fav.delete()
            return Response({'favourited': False, 'message': 'Removed from favourites'})
        else:
            Favourite.objects.create(user=request.user, place=place)
            return Response({'favourited': True, 'message': 'Added to favourites'})

