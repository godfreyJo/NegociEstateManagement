from django.apps import AppConfig

class ExpensesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.expenses'  # Must be 'apps.expenses', not just 'expenses'
    verbose_name = 'Expenses'