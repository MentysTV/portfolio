import time
import subprocess
import urllib.request
import json
import os
import psutil
import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

print("--- TESTING SYSTEM & PROCESS DASHBOARD BACKEND ---")

# Start app server as subprocess without browser launcher
import sys
my_env = dict(os.environ, PYTHONIOENCODING="utf-8")
server_proc = subprocess.Popen([sys.executable, "app.py", "--no-browser"], cwd=os.path.dirname(os.path.abspath(__file__)), env=my_env)
time.sleep(2.0)

base_url = "http://127.0.0.1:8765"

try:
    # 1. Test /api/system
    print("Testing GET /api/system...")
    req = urllib.request.Request(f"{base_url}/api/system")
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read().decode())
        assert "cpu" in data, "CPU missing in /api/system"
        assert "memory" in data, "Memory missing in /api/system"
        assert "disks" in data, "Disks missing in /api/system"
        assert "network" in data, "Network missing in /api/system"
        print(f"✅ /api/system OK: CPU={data['cpu']['total_percent']}%, RAM={data['memory']['percent']}%, Cores={len(data['cpu']['per_core'])}")

    # 2. Spawn dummy test process
    print("Spawning dummy test process (python sleep)...")
    dummy_proc = subprocess.Popen([sys.executable, "-c", "import time; time.sleep(60)"])
    time.sleep(1.0)
    dummy_pid = dummy_proc.pid
    print(f"Spawned dummy PID: {dummy_pid}")

    # 3. Test /api/processes
    print(f"Testing GET /api/processes?search=python...")
    req = urllib.request.Request(f"{base_url}/api/processes?search=python")
    with urllib.request.urlopen(req, timeout=5) as res:
        proc_data = json.loads(res.read().decode())
        found = any(p["pid"] == dummy_pid for p in proc_data["processes"])
        assert found, f"Dummy PID {dummy_pid} not found in process list!"
        print("✅ /api/processes OK: Found dummy process in process table.")

    # 4. Test /api/kill on dummy process
    print(f"Testing POST /api/kill for PID {dummy_pid}...")
    kill_payload = json.dumps({"pid": dummy_pid}).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/api/kill", data=kill_payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=5) as res:
        kill_res = json.loads(res.read().decode())
        assert kill_res["success"], "Kill failed!"
        print(f"✅ /api/kill OK: Terminated dummy process successfully: {kill_res['killed']}")

    # 5. Verify protected process blocking
    print("Testing protection of PID 4 (System)...")
    kill_sys_payload = json.dumps({"pid": 4}).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/api/kill", data=kill_sys_payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req, timeout=5) as res:
        kill_sys_res = json.loads(res.read().decode())
        assert not kill_sys_res["success"], "Protected process was not blocked!"
        print(f"✅ Protection filter OK: System PID 4 blocked with error: {kill_sys_res['errors']}")

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")

finally:
    server_proc.terminate()
    try:
        server_proc.wait(timeout=2)
    except Exception:
        server_proc.kill()
