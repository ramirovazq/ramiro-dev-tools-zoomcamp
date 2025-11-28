from django.db import models
from django.core.exceptions import ValidationError
from datetime import date


class Todo(models.Model):
	title = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	due_date = models.DateField(null=True, blank=True)
	completed = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return self.title

	def clean(self):
		# validate that due_date is not in the past
		if self.due_date and self.due_date < date.today():
			raise ValidationError({'due_date': 'Due date cannot be in the past.'})
