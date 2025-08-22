from django.db import models

# Create your models here.
from django.contrib.auth.models import User

class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Each user has their own subjects
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Attendance(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="attendance")
    present = models.IntegerField(default=0)
    total = models.IntegerField(default=0)

    def percentage(self):
        return (self.present / self.total * 100) if self.total > 0 else 0
