# main.py
import sys
import json
from yt_helper import list_formats, get_direct_url

def main():
    action = sys.argv[1]

    if action == 'formats':
        url = sys.argv[2]
        formats = list_formats(url)
        print(json.dumps(formats))

    elif action == 'get_url':
        url = sys.argv[2]
        format_id = sys.argv[3]
        direct_url = get_direct_url(url, format_id)
        print(json.dumps({"direct_url": direct_url}))

if __name__ == '__main__':
    main()
