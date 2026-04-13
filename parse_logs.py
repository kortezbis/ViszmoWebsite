
import json

path = r'C:\Users\Kortez\.gemini\antigravity\brain\230eabcc-2629-44d1-9339-4e9a50f2b1cc\.system_generated\steps\79\output.txt'

with open(path, 'r') as f:
    data = json.load(f)

logs = data['result']['result']
for log in logs:
    event = json.loads(log['event_message'])
    if 'error' in event and event['error']:
        print(f"Time: {event.get('time')}, Method: {event.get('method')}, Path: {event.get('path')}, Error: {event.get('error')}")
    elif log.get('level') == 'error':
        print(f"Time: {event.get('time')}, Msg: {log.get('msg')}")
