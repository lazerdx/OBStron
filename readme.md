# OBStron
A webserver designed to attach OBS functionality to an HTTP command panel for remote commands.

Requirements:
- https://mpv.io/
- https://github.com/Palakis/obs-websocket/releases

Make sure to run npm install on the directory to fetch all the related module requirements.

You must configure credentials and filepaths under /config.

Add Discord user IDs to whitelist.json under /config to allow them access to the panel.

The Spotify and SCP transfer support is not quite there yet, so you can ignore the relvent code.

Start the whole shebang up with server.js.