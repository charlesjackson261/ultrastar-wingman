import asyncio
import json
import logging
import os
import re
import shutil
import tempfile
import uuid
import chardet
from typing import Optional, List

import eyed3
import requests
from bs4 import BeautifulSoup

import config
import usdb


class DownloadException(Exception):
    pass


class Song:
    songs = {}
    usdb_ids = set()
    php_session_id = None

    @staticmethod
    def create_valid_dir_name(s):
        # Remove invalid characters
        s = re.sub(r'[<>:"/\\|?*]', '', s)

        # Replace spaces with underscores
        # s = s.replace(' ', '_')

        # Truncate to a reasonable length to avoid exceeding max path lengths
        s = s[:255]

        # Ensure the name isn't a reserved name in Windows
        reserved_names = ["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"]
        if s.upper() in reserved_names:
            s = "_" + s

        return s

    @classmethod
    def load_songs(cls):
        # Check local path first
        local_songs_dir = config.usdx_songs_dir
        network_songs_dir = config.network_songs_dir if hasattr(config, 'network_songs_dir') else None

        # Try to load from local path
        try:
            for subdir in os.listdir(local_songs_dir):
                subdir_path = os.path.join(local_songs_dir, subdir)
                cls._process_song_directory(subdir_path)
        except Exception as e:
            logging.error(f"Error loading songs from local path {local_songs_dir}: {e}")

        # Try to load from network path
        try:
            for subdir in os.listdir(network_songs_dir):
                subdir_path = os.path.join(network_songs_dir, subdir)
                cls._process_song_directory(subdir_path)
        except Exception as e:
            logging.error(f"Error loading songs from network path {network_songs_dir}: {e}")

    @classmethod
    def _process_song_directory(cls, subdir_path):
        """Helper method to process a single song directory"""
        if not os.path.isdir(subdir_path):
            return

        try:
            usdb_id = None
            if os.path.isfile(os.path.join(subdir_path, "usdb_data.json")):
                with open(os.path.join(subdir_path, "usdb_data.json")) as file:
                    usdb_data = json.loads(file.read())
                    usdb_id = usdb_data.get("id")

            txt_files = [f for f in os.listdir(subdir_path) if f.endswith('.txt')]

            if not txt_files:
                return

            txt_path = os.path.join(subdir_path, txt_files[0])

            with open(txt_path, 'rb') as file:
                encoding = chardet.detect(file.read())['encoding']

            if encoding != 'utf-8':
                logging.warning(f"Wrong encoding. Is {encoding} instead of utf-8 for '{os.path.join(subdir_path, txt_files[0])}'")

            with open(txt_path, 'r', encoding=encoding) as file:
                txt = file.read()

            match = re.search(r'#TITLE:(.*)\n', txt)
            if match:
                title = match.group(1)
            else:
                logging.warning(f"No title for {subdir_path}")
                return

            match = re.search(r'#ARTIST:(.*)\n', txt)
            if match:
                artist = match.group(1)
            else:
                logging.warning(f"No artist for {subdir_path}")
                return

            match = re.search(r'#COVER:(.*)\n', txt)
            cover = None
            if match:
                cover = match.group(1)

            match = re.search(r'#MP3:(.*)\n', txt)
            mp3 = None
            if match:
                mp3 = match.group(1)

            cls(subdir_path, title, artist, usdb_id, cover, mp3)
        except Exception as e:
            logging.exception(f"Could not process song in '{subdir_path}': {e}")

    @classmethod
    async def download(cls, id):
        try:
            response = usdb.session.post(f"https://usdb.animux.de/index.php?link=gettxt&id={id}", headers={"Cookie": cls.php_session_id}, data={"wd": "1"})
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            raise DownloadException(f"Failed to retrieve song data: {e}")

        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract the value of the input element with the name "txt"
        input_element = soup.find('input', {'name': 'txt'})

        if input_element:
            txt = input_element['value'].replace("\r\n", "\n")
        else:
            raise DownloadException(f"txt for {id} not found on usdb.animux.de. Are you logged in?")

        # TODO: get only the id, load everything here
        match = re.search(r'#TITLE:(.*)\n', txt)
        if match:
            title = match.group(1)
        else:
            raise DownloadException("missing name")

        match = re.search(r'#ARTIST:(.*)\n', txt)
        if match:
            artist = match.group(1)
        else:
            raise DownloadException("missing artist")

        match = re.search(r'#VIDEO:(.*)\n', txt)
        if match:
            video = match.group(1)
        else:
            raise DownloadException("missing video")

        if id is None:
            sanitized_name = cls.create_valid_dir_name(f"{artist} - {title}")
        else:
            sanitized_name = cls.create_valid_dir_name(f"{artist} - {title} ({id})")

        directory = os.path.join(config.usdx_songs_dir, sanitized_name)

        if os.path.exists(directory):
            raise DownloadException(f"directory '{directory}' exists")

        logging.info(f"Saving {artist} - {title} ({id}) to {directory}")

        with tempfile.TemporaryDirectory() as tempdir:
            with open(os.path.join(tempdir, f"usdb_data.json"), "w+") as file:
                file.write(json.dumps({
                    "id": id
                }))

            with open(os.path.join(tempdir, f"{sanitized_name}.txt"), "w+") as file:
                file.writelines("#VIDEO:video.mp4\n")
                file.writelines("#MP3:song.mp3\n")
                file.writelines("#COVER:cover.jpg\n")
                # TODO: Background
                # file.writelines("#BACKGROUND:background.jpg\n")
                for line in txt.split("\n"):
                    if not any(line.startswith(s) for s in ["#VIDEO", "#MP3", "#COVER", "#BACKGROUND"]):
                        file.writelines(line + "\n")

            match = re.search(r'[va]=([a-zA-Z0-9_-]+)', video)
            if match:
                url = f"https://www.youtube.com/watch?v={match.group(1)}"
            else:
                raise DownloadException(f"no video url found in txt")

            process = await asyncio.create_subprocess_exec(
                "curl", "-o", "cover.jpg", f"https://usdb.animux.de/data/cover/{id}.jpg",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=tempdir
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                raise DownloadException(f"cover download failed with code {process.returncode}, stdout: {stdout.decode()}, stderr: {stderr.decode()}")

            # try:
            #     subprocess.run(["curl", "-o", "cover.jpg", f"https://usdb.animux.de/data/cover/{id}.jpg"], cwd=tempdir, check=True)
            # except Exception as e:
            #     raise DownloadException(f"cover download failed: {e}")

            process = await asyncio.create_subprocess_exec(
                # config.youtube_dl, "-o", "video.mp4", "--format", "mp4", url,
                config.youtube_dl, "-o", "video.mp4", "-f", "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4][height<=1080]/best[height<=1080]", url,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=tempdir
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                raise DownloadException(f"youtube-dl failed with code {process.returncode}, stdout: {stdout.decode()}, stderr: {stderr.decode()}")

            # try:
            #     subprocess.run([config.youtube_dl, "-o", "video.mp4", "--format", "mp4", url], cwd=tempdir, check=True)
            # except Exception as e:
            #     raise DownloadException(f"youtube-dl failed: {e}")


            # BUG: failing on extracting the audio from the music video
            # process = await asyncio.create_subprocess_shell(
            process = await asyncio.create_subprocess_exec(
                config.ffmpeg, "-i", "video.mp4", "-vn", "-acodec", "libmp3lame", "-ac", "2", "-ab", "160k", "-ar", "48000", "song.mp3",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=tempdir
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                raise DownloadException(f"ffmpeg failed with code {process.returncode}, stdout: {stdout.decode()}, stderr: {stderr.decode()}")

            # try:
            #     subprocess.run([config.ffmpeg, "-i", "video.mp4", "-vn", "-acodec", "libmp3lame", "-ac", "2", "-ab", "160k", "-ar", "48000", "song.mp3"], cwd=tempdir, check=True)
            # except Exception as e:
            #     raise DownloadException(f"ffmpeg failed: {e}")

            os.makedirs(directory)

            for file_name in os.listdir(tempdir):
                source = os.path.join(tempdir, file_name)
                destination = os.path.join(directory, file_name)
                shutil.move(source, destination)

        return cls(directory, title, artist, id, "cover.jpg", "song.mp3", source="local")

    @classmethod
    def song_list(cls) -> List[dict]:
        return [s.to_json() for s in cls.songs.values()]

    @classmethod
    def get_song_by_id(cls, id) -> 'Song':
        """
        Get a song by ID, checking both local and network paths
        """
        # First try to get from local path
        song = cls.songs.get(str(id))
        if song:
            return song

        # If not found, check network path
        network_songs_dir = config.network_songs_dir if hasattr(config, 'network_songs_dir') else None
        try:
            for subdir in os.listdir(network_songs_dir):
                subdir_path = os.path.join(network_songs_dir, subdir)
                if os.path.isdir(subdir_path):
                    try:
                        usdb_id = None
                        if os.path.isfile(os.path.join(subdir_path, "usdb_data.json")):
                            with open(os.path.join(subdir_path, "usdb_data.json")) as file:
                                usdb_data = json.loads(file.read())
                                usdb_id = usdb_data.get("id")

                        if str(usdb_id) == str(id):
                            txt_files = [f for f in os.listdir(subdir_path) if f.endswith('.txt')]
                            if txt_files:
                                txt_path = os.path.join(subdir_path, txt_files[0])
                                with open(txt_path, 'r') as file:
                                    txt = file.read()

                                    match = re.search(r'#TITLE:(.*)\n', txt)
                                    if match:
                                        title = match.group(1)
                                    else:
                                        logging.warning(f"No title for {subdir_path}")
                                        return None

                                    match = re.search(r'#ARTIST:(.*)\n', txt)
                                    if match:
                                        artist = match.group(1)
                                    else:
                                        logging.warning(f"No artist for {subdir_path}")
                                        return None

                                    match = re.search(r'#COVER:(.*)\n', txt)
                                    cover = None
                                    if match:
                                        cover = match.group(1)

                                    match = re.search(r'#MP3:(.*)\n', txt)
                                    mp3 = None
                                    if match:
                                        mp3 = match.group(1)

                                    return cls(subdir_path, title, artist, usdb_id, cover, mp3, source="net")
                    except Exception as e:
                        logging.error(f"Error processing network song {subdir_path}: {e}")
        except Exception as e:
            logging.error(f"Error accessing network path: {e}")

        return None

    @staticmethod
    def get_mp3_length(filename):
        audiofile = eyed3.load(filename)
        duration = audiofile.info.time_secs
        return duration

    def __init__(self, directory: str, title: str, artist: str, usdb_id: Optional[str] = None, cover: Optional[str] = None, mp3: Optional[str] = None, source: str = "local"):
        """
        Creates a new song from the information found in the directory

        :param directory: The directory to the song directory
        :param title: The song title
        :param artist: The artist
        :param usdb_id: An optional ID of the song on usdb.animux.de/
        """

        self.directory = directory
        self.title = title
        self.artist = artist
        self.usdb_id = usdb_id
        self.cover = cover
        self.mp3 = mp3
        self.duration = self.get_mp3_length(os.path.join(directory, mp3))
        self.source = source  # Can be 'local' or 'net'

        if cover:
            self.cover_path = os.path.join(directory, cover)
        else:
            self.cover_path = None

        self.id = usdb_id or uuid.uuid4().hex
        self.songs[str(self.id)] = self

        if usdb_id is not None:
            self.usdb_ids.add(usdb_id)

    def __str__(self):
        if self.usdb_id is not None:
            return f"{self.title} - {self.artist} ({self.usdb_id})"
        return f"{self.title} - {self.artist}"

    def __repr__(self):
        if self.usdb_id is not None:
            return f"[Song '{self.title} - {self.artist}' ({self.usdb_id})]"
        return f"[Song '{self.title} - {self.artist}']"

    def to_json(self):
        return {
            "directory": self.directory,
            "title": self.title,
            "artist": self.artist,
            "usdb_id": self.usdb_id,
            "id": self.id,
            "duration": self.duration,
            "source": self.source
        }
