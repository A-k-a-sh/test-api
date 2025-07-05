import yt_dlp
import shutil
import os
import sys
class MyLogger:
    def debug(self, msg):
        pass
    def warning(self, msg):
        pass
    def error(self, msg):
        print(msg, file=sys.stderr)

def human_readable_size(size_bytes):
    """Convert bytes to human-readable format (KB, MB, GB)."""
    if size_bytes is None or size_bytes == 0:
        return "Unknown"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.2f} TB"

def check_ffmpeg():
    """Check if FFmpeg is available."""
    ffmpeg_path = '/opt/homebrew/bin/ffmpeg'
    if os.path.exists(ffmpeg_path):
        return ffmpeg_path
    return shutil.which('ffmpeg')

def list_formats(video_url):
    """List available formats for the given URL, return JSON-serializable list."""
    ydl_opts = {
        'quiet': True,
        'no_warnings': False,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            formats = info.get('formats', [])
            duration = info.get('duration', None)
            title = info.get('title', 'video')
            
        if not formats:
            print("No formats available for this URL.", file=sys.stderr)
            return [], title, duration
        
        valid_formats = [
            {
                'format_id': f.get('format_id', 'N/A'),
                'ext': f.get('ext', 'N/A'),
                'resolution': f.get('resolution', 'audio only' if f.get('vcodec') == 'none' else 'N/A'),
                'note': f.get('format_note', 'N/A'),
                'fps': str(f.get('fps', 'N/A')),
                'size': human_readable_size(f.get('filesize') or f.get('filesize_approx') or (f.get('tbr', 0) * duration * 1000 / 8 if duration and f.get('tbr') else None))
            }
            for f in formats
            if f.get('ext') in ['mp4', 'webm', 'm4a', 'mp3'] and f.get('format_note', 'N/A') != 'storyboard'
        ]
        
        return valid_formats, title, duration
    except Exception as e:
        print(f"Error fetching formats: {e}", file=sys.stderr)
        return [], None, None


def download_video(video_url, format_id, valid_formats):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_folder = os.path.join(script_dir, "downloads")  # match Node
    os.makedirs(output_folder, exist_ok=True)

    ffmpeg_path = check_ffmpeg()
    is_audio_only = any(f['format_id'] == format_id and f.get('resolution') == 'audio only' for f in valid_formats)

    if not ffmpeg_path and not is_audio_only:
        return False

    ydl_opts = {
        'outtmpl': f'{output_folder}/%(title)s.%(ext)s',
        'format': format_id if is_audio_only else f'{format_id}+bestaudio/best',
        'merge_output_format': None if is_audio_only else 'mp4',
        'ffmpeg_location': ffmpeg_path if ffmpeg_path else None,
        'quiet': True,
        'no_warnings': True,
        'logger': MyLogger(),
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            file_name = ydl.prepare_filename(info)
            ydl.download([video_url])
        return os.path.basename(file_name)
    except Exception as e:
        return False





def get_direct_url(video_url, format_id=None):
    ydl_opts = {
        'quiet': True,
        'format': format_id if format_id else 'bestvideo+bestaudio/best',
        'merge_output_format': 'mp4',
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        # If it's merged, it's in .url or .requested_formats
        if 'url' in info:
            return info['url']
        elif 'requested_formats' in info:
            return info['requested_formats'][0]['url']
        return None
