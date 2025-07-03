import yt_dlp

def list_formats(video_url):
    ydl_opts = {
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        formats = info.get('formats', [])
        valid = []
        for fmt in formats:
            if fmt.get('vcodec') != 'none' or fmt.get('acodec') != 'none':
                valid.append({
                    'format_id': fmt.get('format_id'),
                    'ext': fmt.get('ext'),
                    'resolution': fmt.get('resolution') or 'audio only',
                    'note': fmt.get('format_note'),
                    'filesize': fmt.get('filesize') or fmt.get('filesize_approx'),
                })
        return valid

def get_direct_url(video_url, format_id):
    ydl_opts = {
        'quiet': True,
        'format': format_id,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        return info['url']
