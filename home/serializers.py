from rest_framework import serializers
from .models import Subject, Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'subject', 'subject_name', 'present', 'total', 'percentage']

    def get_percentage(self, obj):
        return obj.percentage()


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']
