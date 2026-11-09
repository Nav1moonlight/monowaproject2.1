import subprocess
import time
import os
import sys

PROJECT_DIR = r"c:\Users\Anaxagoras\.gemini\antigravity\scratch\limbahApp-gforms"
LOGS_DIR = os.path.join(PROJECT_DIR, "storage", "logs")
os.makedirs(LOGS_DIR, exist_ok=True)

server_log = open(os.path.join(LOGS_DIR, "server.log"), "a", encoding="utf-8")
sched_log = open(os.path.join(LOGS_DIR, "scheduler.log"), "a", encoding="utf-8")

DETACHED = 0x00000008 | 0x00000200 # DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP

# 1. Jalankan PHP Built-in Server Port 8088
server_proc = subprocess.Popen(
    ["php", "-S", "127.0.0.1:8088", "-t", os.path.join(PROJECT_DIR, "public")],
    cwd=PROJECT_DIR,
    stdout=server_log,
    stderr=server_log,
    creationflags=DETACHED,
    close_fds=True
)

# 2. Jalankan Laravel Scheduler (artisan schedule:work)
sched_proc = subprocess.Popen(
    ["php", "artisan", "schedule:work"],
    cwd=PROJECT_DIR,
    stdout=sched_log,
    stderr=sched_log,
    creationflags=DETACHED,
    close_fds=True
)

# 3. Lakukan initial sync
subprocess.Popen(
    ["php", "artisan", "sheets:sync"],
    cwd=PROJECT_DIR,
    stdout=sched_log,
    stderr=sched_log,
    creationflags=DETACHED,
    close_fds=True
)

print(f"LimbahApp (GForms) Server running on PID {server_proc.pid} at http://127.0.0.1:8088")
print(f"LimbahApp (GForms) Scheduler running on PID {sched_proc.pid}")
