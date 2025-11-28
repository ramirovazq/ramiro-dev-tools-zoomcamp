from django import forms
from .models import Todo


class TodoForm(forms.ModelForm):
    # Use a date-only field and HTML5 date widget so users pick a calendar date (no time)
    due_date = forms.DateField(required=False, widget=forms.DateInput(attrs={
        'type': 'date',
        'placeholder': 'dd/mm/aaaa'
    }))

    class Meta:
        model = Todo
        fields = ['title', 'description', 'due_date', 'completed']
