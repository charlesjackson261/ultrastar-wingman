$ErrorActionPreference = 'Stop'

# Download yt-dlp
$ytDlpUrl = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
$ytDlpPath = 'executables\yt-dlp.exe'

# Download ffmpeg
$ffmpegUrl = 'https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip'
$ffmpegZip = 'ffmpeg.zip'
$ffmpegPath = 'executables\ffmpeg.exe'

# Create executables directory if it doesn't exist
New-Item -ItemType Directory -Force -Path 'executables'

# Download yt-dlp
Write-Host "Downloading yt-dlp..."
Invoke-WebRequest -Uri $ytDlpUrl -OutFile $ytDlpPath
Write-Host "yt-dlp downloaded successfully"

# Download and extract ffmpeg
Write-Host "Downloading ffmpeg..."
Invoke-WebRequest -Uri $ffmpegUrl -OutFile $ffmpegZip
Expand-Archive -Path $ffmpegZip -DestinationPath 'executables' -Force

# Copy ffmpeg.exe to executables directory
Copy-Item -Path 'executables\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe' -Destination $ffmpegPath -Force
Write-Host "ffmpeg downloaded and extracted successfully"

# Clean up
Remove-Item -Path $ffmpegZip -Force
Remove-Item -Path 'executables\ffmpeg-master-latest-win64-gpl' -Recurse -Force

Write-Host "All dependencies have been downloaded successfully!"
