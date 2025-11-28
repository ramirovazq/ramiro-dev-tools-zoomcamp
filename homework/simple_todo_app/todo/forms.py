from django import forms
from .models import Todo


class TodoForm(forms.ModelForm):
    due_date = forms.DateTimeField(required=False, widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}))

    class Meta:
        model = Todo
        fields = ['title', 'description', 'due_date', 'completed']
