from django.shortcuts import render, get_object_or_404, redirect
from django.urls import reverse
from .models import Todo
from .forms import TodoForm


def todo_list(request):
	todos = Todo.objects.order_by('-created_at')
	total = todos.count()
	completed = todos.filter(completed=True).count()
	pending = total - completed
	context = {
		'todos': todos,
		'total': total,
		'completed': completed,
		'pending': pending,
	}
	return render(request, 'todo/list.html', context)


def todo_create(request):
	if request.method == 'POST':
		form = TodoForm(request.POST)
		if form.is_valid():
			form.save()
			return redirect(reverse('todo_list'))
	else:
		form = TodoForm()
	return render(request, 'todo/form.html', {'form': form, 'create': True})


def todo_edit(request, pk):
	todo = get_object_or_404(Todo, pk=pk)
	if request.method == 'POST':
		form = TodoForm(request.POST, instance=todo)
		if form.is_valid():
			form.save()
			return redirect(reverse('todo_list'))
	else:
		form = TodoForm(instance=todo)
	return render(request, 'todo/form.html', {'form': form, 'create': False, 'todo': todo})


def todo_delete(request, pk):
	todo = get_object_or_404(Todo, pk=pk)
	if request.method == 'POST':
		todo.delete()
		return redirect(reverse('todo_list'))
	return render(request, 'todo/confirm_delete.html', {'todo': todo})


def todo_toggle_complete(request, pk):
	todo = get_object_or_404(Todo, pk=pk)
	todo.completed = not todo.completed
	todo.save()
	return redirect(reverse('todo_list'))
