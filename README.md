# Ultrastar Wingman

## Introduction
Welcome to the official repository of **Ultrastar Wingman**, an enhancement tool for the popular karaoke software **Ultrastar Deluxe**. This tool is designed to elevate your karaoke experience by adding a user-friendly interface for downloading and viewing songs from any phone on the network, and providing detailed performance statistics.

## Features
- **Remote Song Management**: Download and view songs directly from any phone or device connected to the network.
- **Performance Statistics**: Track your karaoke performance with insightful statistics.
- **User-Friendly Interface**: A sleek and intuitive interface for an enhanced user experience.
- **Cross-Platform Compatibility**: Designed to work seamlessly with various devices.

## Getting Started

### Prerequisites
- Ultrastar Deluxe installed on your system.
- (Optional) Another network-enabled device (e.g., smartphone, tablet).

### Installation

#### Windows
1. Install [Python](https://www.python.org/) on your system
2. Download [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [ffmpeg](https://ffmpeg.org/)
3. Clone the repository: `
    ```shell
    git clone https://github.com/DidacticFishstick/ultrastar-wingman.git
    ```
4. Navigate to the project directory: `cd ultrastar-wingman`
5. Install the required python dependencies
    ```shell
   pip install -r requirements.txt
   ```
6. Create a `config.ini` from the example `config.ini.windows_example` and change the settings to fit your setup

#### macOS
1. Install [brew](https://brew.sh/) and Python
2. Install the required system dependencies
    ```shell
    brew install ffmpeg yt-dlp
    ```
3. Clone the repository: `
    ```shell
    git clone https://github.com/DidacticFishstick/ultrastar-wingman.git
    ```
4. Navigate to the project directory: `cd ultrastar-wingman`
5. Install the required python dependencies
    ```shell
   pip install -r requirements.txt
   ```
6. Create a `config.ini` from the example `config.ini.mac_example` and modify the settings if needed


#### Linux
TBD

## Usage
- Change your configuration in the `config.ini`. You will at least need to add your credentials for https://usdb.animux.de at the top to download any songs.
- Start the Wingman: `python main.py`
- **Access the UI**: Ensure your device is on the same network as your Ultrastar Deluxe setup. Open the provided URL on your device's browser. This is either `http://localhost:8080` if your browser is on your Ultrastar Deluxe system, otherwise it will be `http://<ultrastar-system-ip>:8080`
- **Download and View Songs**: Browse the song library and select songs to download or view.
- **Assign Players**: Assign People to Ultrastar Deluxe Players directly in the Web Interface.

## Contributing
We welcome contributions from the community! If you're interested in improving Ultrastar Wingman, please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Submit a Pull Request.

## Support
For support, questions, or feedback, please open an issue in the repository.

## License
This project is licensed under the [GPLv3](LICENSE).

## Acknowledgments
- Thanks to the Ultrastar Deluxe team for their fantastic karaoke platform.
- Special thanks to all our contributors and supporters.
