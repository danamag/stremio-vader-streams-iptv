# Stremio Vader Streams IPTV Add-on

Add-on to add Vader Streams IPTV to Stremio. This service requires a subscription.

**This Add-on requires Stremio v4.4.10+**

## Usage


### Run Vader Streams IPTV Add-on

[Download Vader Streams IPTV Add-on](https://github.com/danamag/stremio-vader-streams-iptv/releases) for your operating system, unpack it, run it.

It will print the message: `Created "config.json" in the same folder. Please edit this file and add Vader Streams IPTV user and password then run this application again.`

Open `config.json` (in the same folder), add username and password where you see `""`, between the quotes.

Run Add-on again. It will print a link: `http://127.0.0.1:7025/manifest.json`

Note: in the same `config.json` file, you also have setting to turn on `autoLaunch` (which will launch this add-on on system start-up), turn on `remote` (which will create a https url that can be used through LAN or the Internet) and set up a `subdomain` (which can be any unique string that will make the remote https url always be the same instead of a random url)

### Add Vader Streams IPTV Add-on to Stremio

Add `http://127.0.0.1:7025/manifest.json` as an Add-on URL in Stremio.

![addlink](https://user-images.githubusercontent.com/1777923/43146711-65a33ccc-8f6a-11e8-978e-4c69640e63e3.png)
