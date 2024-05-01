#!/usr/bin/python3
import shutil
import subprocess
from datetime import datetime

date = datetime.now()
shutil.copy('/var/log/nginx/access.log', f"/logs/access.log.{date.month}.{date.day - 1}.{date.year}")
shutil.copy('/var/log/nginx/error.log', f"/logs/error.log.{date.month}.{date.day - 1}.{date.year}")

subprocess.run(['truncate', '--size', '0', '/var/log/nginx/access.log'])
subprocess.run(['truncate', '--size', '0', '/var/log/nginx/error.log'])