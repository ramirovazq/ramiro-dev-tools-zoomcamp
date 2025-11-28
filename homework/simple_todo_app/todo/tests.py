from django.test import TestCase
from django.urls import reverse
from .models import Todo


class TodoModelTest(TestCase):
	def test_create_todo(self):
		t = Todo.objects.create(title='Test', description='Desc')
		self.assertEqual(str(t), 'Test')
		self.assertFalse(t.completed)


class TodoViewsTest(TestCase):
	def test_list_view(self):
		Todo.objects.create(title='One')
		resp = self.client.get(reverse('todo_list'))
		self.assertEqual(resp.status_code, 200)
		self.assertContains(resp, 'One')
