import os
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class YouTubeService:
    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        self.youtube = None
        if self.api_key:
            try:
                self.youtube = build('youtube', 'v3', developerKey=self.api_key)
            except Exception as e:
                print(f"Failed to initialize YouTube API: {e}")

    def search_videos(self, query: str, max_results: int = 6):
        if not self.youtube:
            return {"error": "YouTube API not configured"}

        try:
            # Search for videos matching the query
            search_response = self.youtube.search().list(
                q=query,
                part='id,snippet',
                maxResults=max_results,
                type='video',
                videoDefinition='high',
                relevanceLanguage='en'
            ).execute()

            videos = []
            for item in search_response.get('items', []):
                videos.append({
                    "id": item['id']['videoId'],
                    "title": item['snippet']['title'],
                    "description": item['snippet']['description'],
                    "thumbnail": item['snippet']['thumbnails']['high']['url'],
                    "channel": item['snippet']['channelTitle'],
                    "publishTime": item['snippet']['publishTime']
                })
            
            return videos

        except HttpError as e:
            print(f"YouTube API Error: {e}")
            return {"error": str(e)}

youtube_service = YouTubeService()
