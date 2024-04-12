import os
import asyncio
import logging
import os.path
from contextlib import asynccontextmanager

import uvicorn
from typing import Optional
from fastapi import FastAPI, Request, HTTPException, Query, status, Response, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import config
import models
import usdb
import usdx
import ws
from song import Song

SCRIPT_BASE_PATH = os.path.abspath(os.path.dirname(__file__))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # start consumers for the download queue
    download_consumers = [asyncio.create_task(usdb.download_queue_consumer(download_queue)) for _ in range(config.usdb_downloader_count)]
    yield


app = FastAPI(
    title="UltraStar Wingman",
    version="1.1.0",
    lifespan=lifespan
)
# app.mount("/static", StaticFiles(directory=os.path.join(SCRIPT_BASE_PATH, "static")), name="static")
# templates = Jinja2Templates(directory=os.path.join(SCRIPT_BASE_PATH, "templates"))

download_queue = asyncio.Queue()
event_loop = asyncio.get_event_loop()
php_session_id = None


@app.get('/openapi_no_anyOf.json', include_in_schema=False)
async def api_usdb_ids():
    """
    This should not be necessary but https://www.npmjs.com/package/@openapitools/openapi-generator-cli has a problem
    with generating code for models with a type set to anyOf. Therefor this endpoint will remove those anyOf sections.

    Currently only removes anyOf from the ValidationError (components.schemas.ValidationError.properties.loc.items.anyOf)
    """

    openapi = app.openapi()

    openapi["components"]["schemas"]["ValidationError"]["properties"]["loc"]["items"] = {
        "type": "string"
    }

    return openapi


@app.get('/', tags=["Website"], response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse('index.html', {"request": request})  # , "messages": messages})


@app.get('/songs', tags=["Website"], response_class=HTMLResponse)
async def songs(request: Request):
    return templates.TemplateResponse('songs.html', {"request": request, "songs": Song.song_list()})  # , "messages": messages})


@app.get('/avatars/{avatar}', tags=["Website"])
async def avatar(avatar):
    try:
        return FileResponse(os.path.join(SCRIPT_BASE_PATH, "avatars", f"cat_{avatar}"))
    except FileNotFoundError:
        return FileResponse(os.path.join(SCRIPT_BASE_PATH, "avatars", "cat_rainbow.jpg"))


@app.get('/download', tags=["Website"], response_class=HTMLResponse)
async def download(request: Request, view: str = None):
    if view == "usdb":
        return templates.TemplateResponse('download.html', {"request": request})  # , "messages": messages})
    else:
        return templates.TemplateResponse('download_list.html', {"request": request})  # , "messages": messages})


@app.get('/scores', tags=["Website"], response_class=HTMLResponse)
async def scores(request: Request):
    return templates.TemplateResponse('scores.html', {"request": request})  # , "messages": messages})


@app.get('/players', tags=["Website"], response_class=HTMLResponse)
async def players(request: Request):
    return templates.TemplateResponse('players.html', {"request": request, "colors": config.setup_colors})  # , "messages": messages})


@app.post('/api/usdx/restart', response_model=models.BasicResponse, tags=["UltraStar Deluxe"], summary="Restarts UltraStar Deluxe")
async def api_usdx_restart():
    await usdx.restart()
    return {"success": True}


@app.get('/api/usdb/ids', response_model=models.UsdbIdsList, tags=["USDB"], summary="Gets the list of all downloaded USDB IDs")
async def api_usdb_ids():
    return {"ids": list(Song.usdb_ids)}


@app.post('/api/usdb/download', response_model=models.BasicResponse, tags=["USDB"], summary="Downloads the song with the given USDB ID")
async def api_usdb_download(usdb_id_model: models.UsdbId):
    await download_queue.put(usdb_id_model.id)

    await ws.broadcast_download_queued(usdb_id_model.id)

    return {"success": True}


@app.api_route('/usdb/{path:path}', tags=["USDB Proxy"], methods=['GET', 'POST', 'PUT', 'DELETE'], include_in_schema=False)
async def proxy(request: Request, path: Optional[str] = ''):
    # Prepare the URL by replacing the incoming request's URL part
    # with the target URL's base, keeping the path and query parameters.
    target_url = str(request.url).replace(f"{request.url.scheme}://{request.url.netloc}/usdb/", "https://usdb.animux.de/")

    # Prepare headers, removing or modifying problematic ones
    forwarded_headers = {key: value for key, value in request.headers.items() if key.lower() not in ['host', 'content-length', 'content-encoding']}

    # Assemble request parameters to forward, including method, url, and headers.
    # The body will be streamed directly from the request to the target service.
    request_params = {
        "method": request.method,
        "url": target_url,
        "headers": forwarded_headers,
        "content": await request.body(),
    }

    # Forward the request to the target service asynchronously
    response = await usdb.session.request(**request_params)

    # Remove 'content-encoding' and 'content-length' from response headers to avoid conflicts
    forwarded_response_headers = {key: value for key, value in response.headers.items() if key.lower() not in ['content-encoding', 'content-length']}

    # Return the proxied response content, status code, and headers back to the client
    return Response(content=response.content, status_code=response.status_code, headers=forwarded_response_headers)


@app.get('/api/usdb/songs', response_model=models.SongsResponse, tags=["USDB"], summary="Search Songs", response_description="A list of songs matching the criteria")
async def api_usdb_songs(
        artist: str = Query(None, nullable=True, description="Filter songs by the artist's name."),
        title: str = Query(None, nullable=True, description="Filter songs by title."),
        edition: str = Query(None, nullable=True, description="Filter by the song's edition."),
        language: str = Query(None, nullable=True, description="Filter songs by language."),
        genre: str = Query(None, nullable=True, description="Filter songs by genre."),
        order: usdb.OrderEnum = Query(usdb.OrderEnum.rating, description="Sort the result by this order criteria."),
        ud: usdb.UdEnum = Query(usdb.UdEnum.desc, description="Sort order: ascending (asc) or descending (desc)."),
        golden: bool = False,
        songcheck: bool = False,
        limit: int = Query(30, description="The number of songs to return per page."),
        page: int = Query(1, description="Page number for pagination.")
):
    songs = await usdb.get_songs(
        artist,
        title,
        edition,
        language,
        genre,
        order,
        ud,
        golden,
        songcheck,
        limit,
        page
    )

    for song in songs["songs"]:
        song["downloaded"] = song["id"] in Song.usdb_ids

    return songs


@app.get('/api/songs/{song_id}/cover', tags=["Songs"])
async def cover(song_id):
    song = Song.get_song_by_id(song_id)

    if song.cover_path:
        # return send_file(song.cover_path, mimetype=f'image/{song.cover_path.rsplit(".", 1)[-1].lower()}')
        return FileResponse(song.cover_path)
    else:
        # TODO: default cover
        raise HTTPException(status_code=404, detail="Song not found")


@app.get('/api/players', response_model=models.PlayerList, summary="Retrieve Players", response_description="A list of unique player names", tags=["Players"])
async def api_players():
    """
    Retrieves a list of all unique player names.
    """

    try:
        with open(config.players_file, 'r') as file:
            names = file.read().splitlines()
        return {"players": sorted(set(names))}
    except FileNotFoundError:
        return {"players": []}


@app.post('/api/players', response_model=models.PlayerList, status_code=status.HTTP_201_CREATED, summary="Add a New Player", response_description="Confirmation of player addition", tags=["Players"])
async def api_players_add(player_data: models.PlayerCreation):
    """
    Adds a new player name to the list.

    - **name**: The name of the player to add. It is taken from the form data.

    This endpoint writes the new player's name to the players file, appending it to the end.
    If the operation is successful, it returns a success message. Otherwise, it raises an HTTPException.
    """

    logging.info(f"Adding player '{player_data.name}'")
    try:
        with open(config.players_file, 'a') as file:
            file.write(player_data.name + '\n')
        return {"success": True}
    except IOError as e:
        raise HTTPException(status_code=500, detail="Failed to write to file") from e


@app.delete('/api/players/', response_model=models.BasicResponse, status_code=status.HTTP_200_OK, summary="Delete a Player", response_description="Confirmation of player deletion", tags=["Players"])
async def delete_name(name: str = Query(..., description="The name of the player to delete.")):
    """
    Deletes a player name from the list.

    - **name**: The name of the player to delete.

    This endpoint reads all player names, filters out the specified name, and rewrites the file without it.
    If the operation is successful, it returns a success message.
    """

    logging.info(f"Deleting player '{name}'")
    try:
        with open(config.players_file, 'r') as file:
            names = file.read().splitlines()
        with open(config.players_file, 'w') as file:
            for name_item in names:
                if name_item != name:
                    file.write(name_item + '\n')
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Players file not found.")
    except IOError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update the file") from e

    return {"success": True}


@app.post('/api/players/submit', response_model=models.BasicResponse, status_code=status.HTTP_200_OK, summary="Submit Player Names", response_description="Confirmation of successful name submission", tags=["Players"])
async def api_players_submit(submit_request: models.PlayerList):
    """
    Submits a list of player names.

    - **names**: A list of names to be submitted.

    Accepts a list of names in the request body and submits them.
    """

    try:
        usdx.enter_names(submit_request.players)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to submit names") from e

    return {"success": True}


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    ws.ws_connections.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            logging.info(f"Received message from websocket: {data}")
    except WebSocketDisconnect:
        ws.ws_connections.remove(websocket)


async def main():
    # login to usdb.animux.de
    await usdb.login()

    # load all downloaded songs
    Song.load_songs()

    # configure and start usdx
    usdx.change_config(config.setup_colors)
    await usdx.start()

    # start the server
    server_config = uvicorn.Config(app="main:app", host="0.0.0.0", port=8080, log_level="info")
    server = uvicorn.Server(server_config)
    await server.serve()


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] %(levelname)-8s %(name)-12s %(message)s',
    )

    asyncio.run(main())
