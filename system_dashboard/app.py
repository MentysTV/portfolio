#!/usr/bin/env python3
"""
⚡ CYBER TASK MANAGER // SYSTEM & PROCESS DASHBOARD
Local Desktop & Web Application Server
"""

import os
import sys
import json
import time
import socket
import threading
import subprocess
import platform
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Ensure safe UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

try:
    import psutil
except ImportError:
    print("[ERROR] psutil is not installed. Run: py -m pip install psutil")
    sys.exit(1)

# Configuration
DEFAULT_PORT = 8765
HOST = "127.0.0.1"
BASE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))

# Critical Windows processes protected from accidental termination
PROTECTED_PROCESSES = {
    "system", "system idle process", "registry", "smss.exe", "csrss.exe", 
    "wininit.exe", "services.exe", "lsass.exe", "svchost.exe", "fontdrvhost.exe",
    "winlogon.exe", "dwm.exe", "sihost.exe"
}
PROTECTED_PIDS = {0, 4}

# Global telemetry cache for smooth, non-blocking queries
class TelemetryManager:
    def __init__(self):
        self.lock = threading.Lock()
        self.last_poll_time = time.time()
        self.cpu_percent = 0.0
        self.per_cpu_percent = []
        self.last_net_io = psutil.net_io_counters()
        self.last_disk_io = psutil.disk_io_counters()
        self.net_sent_speed = 0.0  # bytes/sec
        self.net_recv_speed = 0.0  # bytes/sec
        self.disk_read_speed = 0.0  # bytes/sec
        self.disk_write_speed = 0.0  # bytes/sec
        self.history_cpu = []
        self.history_ram = []
        self.history_net_recv = []
        self.history_net_sent = []
        self.max_history = 60
        self.last_ping_time = time.time()
        self.has_received_ping = False
        
        # Initialize cpu_percent baseline
        psutil.cpu_percent(interval=None, percpu=True)

    def update_telemetry(self):
        now = time.time()
        dt = max(now - self.last_poll_time, 0.1)

        # CPU
        total_cpu = psutil.cpu_percent(interval=None)
        per_cpu = psutil.cpu_percent(interval=None, percpu=True)

        # Network IO delta
        try:
            curr_net_io = psutil.net_io_counters()
            if curr_net_io and self.last_net_io:
                sent_diff = max(curr_net_io.bytes_sent - self.last_net_io.bytes_sent, 0)
                recv_diff = max(curr_net_io.bytes_recv - self.last_net_io.bytes_recv, 0)
                net_sent_speed = sent_diff / dt
                net_recv_speed = recv_diff / dt
            else:
                net_sent_speed = 0.0
                net_recv_speed = 0.0
            self.last_net_io = curr_net_io
        except Exception:
            net_sent_speed = 0.0
            net_recv_speed = 0.0

        # Disk IO delta
        try:
            curr_disk_io = psutil.disk_io_counters()
            if curr_disk_io and self.last_disk_io:
                read_diff = max(curr_disk_io.read_bytes - self.last_disk_io.read_bytes, 0)
                write_diff = max(curr_disk_io.write_bytes - self.last_disk_io.write_bytes, 0)
                disk_read_speed = read_diff / dt
                disk_write_speed = write_diff / dt
            else:
                disk_read_speed = 0.0
                disk_write_speed = 0.0
            self.last_disk_io = curr_disk_io
        except Exception:
            disk_read_speed = 0.0
            disk_write_speed = 0.0

        # Memory for history
        mem = psutil.virtual_memory()

        with self.lock:
            self.last_poll_time = now
            self.cpu_percent = total_cpu
            self.per_cpu_percent = per_cpu
            self.net_sent_speed = net_sent_speed
            self.net_recv_speed = net_recv_speed
            self.disk_read_speed = disk_read_speed
            self.disk_write_speed = disk_write_speed

            # Update history rolling buffers
            self.history_cpu.append(round(total_cpu, 1))
            self.history_ram.append(round(mem.percent, 1))
            self.history_net_recv.append(round(net_recv_speed, 1))
            self.history_net_sent.append(round(net_sent_speed, 1))

            if len(self.history_cpu) > self.max_history:
                self.history_cpu.pop(0)
            if len(self.history_ram) > self.max_history:
                self.history_ram.pop(0)
            if len(self.history_net_recv) > self.max_history:
                self.history_net_recv.pop(0)
            if len(self.history_net_sent) > self.max_history:
                self.history_net_sent.pop(0)

    def record_ping(self):
        with self.lock:
            self.last_ping_time = time.time()
            self.has_received_ping = True

telemetry = TelemetryManager()

def telemetry_background_loop():
    while True:
        try:
            telemetry.update_telemetry()
        except Exception:
            pass
        time.sleep(1.0)

# Get CPU Brand Model
def get_cpu_model():
    try:
        if platform.system() == "Windows":
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
            cpu_name = winreg.QueryValueEx(key, "ProcessorNameString")[0].strip()
            winreg.CloseKey(key)
            return cpu_name
    except Exception:
        pass
    return platform.processor() or "Multi-Core CPU"

CPU_MODEL_NAME = get_cpu_model()

# API Request Handler
class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Disable caching for API responses
        if self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/system":
            self.handle_api_system()
        elif path == "/api/processes":
            query = parse_qs(parsed.query)
            self.handle_api_processes(query)
        elif path == "/api/connections":
            self.handle_api_connections()
        elif path.startswith("/api/process/"):
            pid_str = path.split("/")[-1]
            self.handle_api_process_detail(pid_str)
        else:
            # Default static file handler
            if path == "/" or path == "":
                self.path = "/index.html"
            return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b""
        data = {}
        if body:
            try:
                data = json.loads(body.decode("utf-8"))
            except Exception:
                pass

        if path == "/api/kill":
            self.handle_api_kill(data)
        elif path == "/api/ping":
            telemetry.record_ping()
            self.send_json({"status": "pong", "time": time.time()})
        else:
            self.send_error(404, "Unknown POST endpoint")

    def send_json(self, data, status_code=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # Telemetry Snapshot
    def handle_api_system(self):
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()

        try:
            freq = psutil.cpu_freq()
            freq_curr = round(freq.current, 0) if freq else 0
            freq_max = round(freq.max, 0) if freq and freq.max else 0
        except Exception:
            freq_curr = 0
            freq_max = 0

        disks = []
        for part in psutil.disk_partitions(all=False):
            if 'cdrom' in part.opts or part.fstype == '':
                continue
            try:
                usage = psutil.disk_usage(part.mountpoint)
                disks.append({
                    "device": part.device,
                    "mountpoint": part.mountpoint,
                    "fstype": part.fstype,
                    "total": usage.total,
                    "used": usage.used,
                    "free": usage.free,
                    "percent": usage.percent
                })
            except (PermissionError, FileNotFoundError):
                continue

        net_adapters = []
        try:
            addrs = psutil.net_if_addrs()
            stats = psutil.net_if_stats()
            for iface, addr_list in addrs.items():
                is_up = stats[iface].isup if iface in stats else False
                ipv4 = ""
                for a in addr_list:
                    if a.family == socket.AF_INET:
                        ipv4 = a.address
                        break
                if ipv4 and not ipv4.startswith("127."):
                    net_adapters.append({
                        "name": iface,
                        "ipv4": ipv4,
                        "is_up": is_up
                    })
        except Exception:
            pass

        try:
            proc_count = len(psutil.pids())
        except Exception:
            proc_count = 0

        boot_time = psutil.boot_time()
        uptime_sec = int(time.time() - boot_time)

        with telemetry.lock:
            payload = {
                "timestamp": time.time(),
                "uptime": uptime_sec,
                "boot_time": datetime.fromtimestamp(boot_time).strftime("%Y-%m-%d %H:%M:%S"),
                "system": {
                    "os": f"{platform.system()} {platform.release()}",
                    "build": platform.version(),
                    "arch": platform.machine(),
                    "hostname": socket.gethostname(),
                    "cpu_model": CPU_MODEL_NAME,
                    "logical_cores": psutil.cpu_count(logical=True) or 1,
                    "physical_cores": psutil.cpu_count(logical=False) or 1,
                    "total_processes": proc_count,
                },
                "cpu": {
                    "total_percent": telemetry.cpu_percent,
                    "per_core": telemetry.per_cpu_percent,
                    "frequency_mhz": freq_curr,
                    "frequency_max_mhz": freq_max,
                },
                "memory": {
                    "total": mem.total,
                    "used": mem.used,
                    "free": mem.free,
                    "available": mem.available,
                    "percent": mem.percent,
                    "swap_total": swap.total,
                    "swap_used": swap.used,
                    "swap_percent": swap.percent
                },
                "disks": disks,
                "disk_io": {
                    "read_bytes_sec": telemetry.disk_read_speed,
                    "write_bytes_sec": telemetry.disk_write_speed
                },
                "network": {
                    "adapters": net_adapters,
                    "recv_bytes_sec": telemetry.net_recv_speed,
                    "sent_bytes_sec": telemetry.net_sent_speed,
                },
                "history": {
                    "cpu": list(telemetry.history_cpu),
                    "ram": list(telemetry.history_ram),
                    "net_recv": list(telemetry.history_net_recv),
                    "net_sent": list(telemetry.history_net_sent)
                }
            }

        self.send_json(payload)

    # Process List
    def handle_api_processes(self, query):
        sort_by = query.get("sort", ["cpu"])[0]
        order = query.get("order", ["desc"])[0]
        search = query.get("search", [""])[0].strip().lower()
        limit = min(int(query.get("limit", ["80"])[0]), 250)
        filter_type = query.get("filter", ["all"])[0]

        processes = []
        attrs = ['pid', 'name', 'cpu_percent', 'memory_info', 'memory_percent', 'status', 'username', 'num_threads']

        for p in psutil.process_iter(attrs, ad_value=None):
            try:
                info = p.info
                name = (info['name'] or "").lower()
                pid = info['pid']

                if search and (search not in name and search not in str(pid)):
                    continue

                mem_info = info['memory_info']
                rss = mem_info.rss if mem_info else 0
                mem_mb = round(rss / (1024 * 1024), 1)
                cpu_p = round(info['cpu_percent'] or 0.0, 1)

                if filter_type == "high_cpu" and cpu_p < 2.0:
                    continue
                if filter_type == "high_mem" and mem_mb < 150.0:
                    continue

                is_protected = (pid in PROTECTED_PIDS) or (name in PROTECTED_PROCESSES)

                processes.append({
                    "pid": pid,
                    "name": info['name'] or f"Process-{pid}",
                    "cpu_percent": cpu_p,
                    "memory_mb": mem_mb,
                    "memory_percent": round(info['memory_percent'] or 0.0, 1),
                    "status": info['status'] or "running",
                    "username": info['username'] or "SYSTEM",
                    "threads": info['num_threads'] or 1,
                    "is_protected": is_protected
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue

        reverse = (order == "desc")
        if sort_by == "cpu":
            processes.sort(key=lambda x: x["cpu_percent"], reverse=reverse)
        elif sort_by == "memory":
            processes.sort(key=lambda x: x["memory_mb"], reverse=reverse)
        elif sort_by == "name":
            processes.sort(key=lambda x: x["name"].lower(), reverse=reverse)
        elif sort_by == "pid":
            processes.sort(key=lambda x: x["pid"], reverse=reverse)

        total_count = len(processes)
        processes = processes[:limit]

        self.send_json({
            "total": total_count,
            "count": len(processes),
            "processes": processes
        })

    # Detailed Process Information
    def handle_api_process_detail(self, pid_str):
        try:
            pid = int(pid_str)
            proc = psutil.Process(pid)
            mem_info = proc.memory_info()
            
            detail = {
                "pid": pid,
                "name": proc.name(),
                "exe": proc.exe() if hasattr(proc, 'exe') else "",
                "cmdline": " ".join(proc.cmdline()) if hasattr(proc, 'cmdline') else "",
                "cwd": proc.cwd() if hasattr(proc, 'cwd') else "",
                "status": proc.status(),
                "username": proc.username() if hasattr(proc, 'username') else "",
                "created": datetime.fromtimestamp(proc.create_time()).strftime("%Y-%m-%d %H:%M:%S"),
                "cpu_percent": round(proc.cpu_percent(interval=0.1), 1),
                "memory_rss_mb": round(mem_info.rss / (1024 * 1024), 2),
                "memory_vms_mb": round(mem_info.vms / (1024 * 1024), 2),
                "threads": proc.num_threads(),
                "is_protected": (pid in PROTECTED_PIDS) or (proc.name().lower() in PROTECTED_PROCESSES)
            }
            self.send_json(detail)
        except psutil.NoSuchProcess:
            self.send_json({"error": f"Proces s PID {pid_str} již neexistuje."}, 404)
        except psutil.AccessDenied:
            self.send_json({"error": f"Přístup odepřen k procesu PID {pid_str}."}, 403)
        except Exception as e:
            self.send_json({"error": str(e)}, 500)

    # Network Connections
    def handle_api_connections(self):
        connections = []
        try:
            proc_names = {}
            for p in psutil.process_iter(['pid', 'name']):
                try:
                    proc_names[p.info['pid']] = p.info['name']
                except Exception:
                    pass

            for conn in psutil.net_connections(kind='inet'):
                if not conn.raddr and conn.status != 'LISTEN':
                    continue
                
                laddr_str = f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "-"
                raddr_str = f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "-"
                pid = conn.pid or 0
                pname = proc_names.get(pid, "Neznámý")

                connections.append({
                    "family": "IPv4" if conn.family == socket.AF_INET else "IPv6",
                    "type": "TCP" if conn.type == socket.SOCK_STREAM else "UDP",
                    "local": laddr_str,
                    "remote": raddr_str,
                    "status": conn.status,
                    "pid": pid,
                    "process_name": pname
                })
        except Exception:
            pass

        connections.sort(key=lambda x: (x["status"] != "ESTABLISHED", x["process_name"]))
        self.send_json({"count": len(connections), "connections": connections[:120]})

    # Kill Process API
    def handle_api_kill(self, data):
        pids = []
        if "pid" in data:
            pids.append(int(data["pid"]))
        elif "pids" in data and isinstance(data["pids"], list):
            pids = [int(p) for p in data["pids"]]

        force = data.get("force", False)

        results = []
        errors = []

        for pid in pids:
            if pid in PROTECTED_PIDS:
                errors.append(f"PID {pid} je chráněný systémový proces a nelze jej ukončit.")
                continue

            try:
                proc = psutil.Process(pid)
                pname = proc.name()
                
                if pname.lower() in PROTECTED_PROCESSES and not force:
                    errors.append(f"Proces '{pname}' (PID {pid}) je kritická součást systému. Ukončení zablokováno.")
                    continue

                proc.terminate()
                try:
                    proc.wait(timeout=1.0)
                except psutil.TimeoutExpired:
                    proc.kill()

                results.append({"pid": pid, "name": pname, "status": "terminated"})
            except psutil.NoSuchProcess:
                results.append({"pid": pid, "name": "Neznámý", "status": "already_dead"})
            except psutil.AccessDenied:
                errors.append(f"Odepřen přístup k ukončení procesu PID {pid}. Spusťte aplikaci jako Správce (Run as Administrator).")
            except Exception as e:
                errors.append(f"Chyba při ukončování PID {pid}: {str(e)}")

        self.send_json({
            "success": len(results) > 0,
            "killed": results,
            "errors": errors
        })


def find_free_port(start_port=DEFAULT_PORT):
    port = start_port
    while port < start_port + 50:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex((HOST, port)) != 0:
                return port
            port += 1
    return DEFAULT_PORT

def launch_app_window(url):
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
    ]
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    ]

    selected_browser = None
    for p in edge_paths + chrome_paths:
        if os.path.isfile(p):
            selected_browser = p
            break

    width, height = 1320, 860
    app_args = f"--app={url} --window-size={width},{height} --app-launch-url-for-shortcuts-menu-item={url}"

    if selected_browser:
        print(f"[LAUNCH] Otevírám nativní okno Task Manageru přes: {selected_browser}")
        cmd = f'"{selected_browser}" {app_args}'
        subprocess.Popen(cmd, shell=True)
    else:
        import webbrowser
        print(f"[LAUNCH] Otevírám ve výchozím prohlížeči: {url}")
        webbrowser.open(url)

def main():
    port = find_free_port(DEFAULT_PORT)
    server_address = (HOST, port)
    
    t_thread = threading.Thread(target=telemetry_background_loop, daemon=True)
    t_thread.start()

    httpd = ThreadingHTTPServer(server_address, DashboardHandler)
    url = f"http://{HOST}:{port}"

    print("=" * 60)
    print(f"⚡ CYBER PC MONITOR // REAL-TIME PERFORMANCE & TELEMETRY")
    print(f"📡 Server běží na adrese: {url}")
    print(f"🖥️  Spouštím okno aplikace...")
    if "--no-browser" not in sys.argv:
        launch_app_window(url)
    else:
        print("[INFO] Režim bez automatického otevření prohlížeče (--no-browser).")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Ukončuji server...")
        httpd.shutdown()

if __name__ == "__main__":
    main()
