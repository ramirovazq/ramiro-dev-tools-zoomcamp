from django.test import TestCase
from django.urls import reverse
from django.core.exceptions import ValidationError
from .models import Todo


class TodoModelTest(TestCase):
	def test_create_todo(self):
		t = Todo.objects.create(title='Test', description='Desc')
		self.assertEqual(str(t), 'Test')
		self.assertFalse(t.completed)

	def test_title_required(self):
		t = Todo(title='')
		with self.assertRaises(ValidationError):
			t.full_clean()


class TodoViewsTest(TestCase):
	def test_list_view(self):
		Todo.objects.create(title='One')
		resp = self.client.get(reverse('todo_list'))
		self.assertEqual(resp.status_code, 200)
		self.assertContains(resp, 'One')

	def test_edit_todo(self):
		todo = Todo.objects.create(title='Old title', description='old')
		url = reverse('todo_edit', args=[todo.pk])
		resp = self.client.post(url, {
			'title': 'New title',
			'description': 'new desc',
			'due_date': '',
			'completed': False,
		})
		# should redirect back to list
		self.assertIn(resp.status_code, (302, 301))
		todo.refresh_from_db()
		self.assertEqual(todo.title, 'New title')

	def test_delete_todo(self):
		todo = Todo.objects.create(title='To delete')
		url = reverse('todo_delete', args=[todo.pk])
		resp = self.client.post(url)
		self.assertIn(resp.status_code, (302, 301))
		self.assertFalse(Todo.objects.filter(pk=todo.pk).exists())

