from .base import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ALLOWED_HOSTS = ('*',)

INSTALLED_APPS += ('job',)

SECRET_KEY = get_env_variable('DJANGO_SECRET_KEY')

DATABASES = { 
	'default': {
		'ENGINE': 'django.db.backends.sqlite3',
		'NAME': os.path.join(BASE_DIR, get_env_variable('DJANGO_DB_NAME')),
	}   
}

