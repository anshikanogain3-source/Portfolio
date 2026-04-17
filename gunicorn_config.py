# Gunicorn configuration for lower memory use and longer request timeout.
workers = 1
threads = 2
timeout = 120
graceful_timeout = 120
preload_app = False
