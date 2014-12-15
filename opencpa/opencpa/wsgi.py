"""
WSGI config for opencpa project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "opencpa.settings.production")

from django.core.wsgi import get_wsgi_application
_application = get_wsgi_application()

env_variables_to_pass = ['DJANGO_SECRET_KEY', 'DJANGO_DB_NAME',]
def application(environ, start_response):
	for var in env_variables_to_pass:
		os.environ[var] = environ.get(var, '')
	return _application(environ, start_response)
