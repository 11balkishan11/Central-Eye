import asyncio
import platform
import re
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

async def ping_target(ip_address: str) -> Dict[str, Any]:
    """
    Executes a system ping against the target IP and returns latency metrics.
    """
    system = platform.system().lower()
    
    if system == "windows":
        cmd = ["ping", "-n", "1", "-w", "2000", ip_address]
    else:
        cmd = ["ping", "-c", "1", "-W", "2", ip_address]
        
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        output = stdout.decode(errors='ignore')
        
        if proc.returncode == 0:
            # Parse latency
            latency = 0.0
            if system == "windows":
                # Average = Xms or time=Xms
                match = re.search(r"time[=<](\d+)ms", output)
                if match:
                    latency = float(match.group(1))
            else:
                # time=X.XXX ms
                match = re.search(r"time=([\d\.]+)\s*ms", output)
                if match:
                    latency = float(match.group(1))
            
            return {
                "status": "up",
                "latency_ms": latency
            }
        else:
            return {
                "status": "down",
                "latency_ms": None,
                "error": "Ping failed or timed out"
            }
            
    except Exception as e:
        logger.error(f"Error executing ping for {ip_address}: {e}")
        return {
            "status": "down",
            "latency_ms": None,
            "error": str(e)
        }
