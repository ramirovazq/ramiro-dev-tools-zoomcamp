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

	def test_toggle_complete(self):
		todo = Todo.objects.create(title='Toggle me')
		self.assertFalse(todo.completed)
		url = reverse('todo_toggle', args=[todo.pk])
		resp = self.client.post(url)
		self.assertIn(resp.status_code, (302, 301))
		todo.refresh_from_db()
		self.assertTrue(todo.completed)

	def test_create_view_requires_title(self):
		url = reverse('todo_create')
		# Post without title should render form with errors and not create object
		resp = self.client.post(url, {
			'title': '',
			'description': 'no title',
			'due_date': '',
			'completed': False,
		})
		# form invalid -> status 200 with form rendered
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(Todo.objects.count(), 0)

	def test_create_via_view(self):
		url = reverse('todo_create')
		resp = self.client.post(url, {
			'title': 'Created via view',
			'description': 'desc',
			'due_date': '',
			'completed': False,
		})
		self.assertIn(resp.status_code, (301, 302))
		self.assertEqual(Todo.objects.count(), 1)

