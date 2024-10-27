import os
import asyncio
import logging
import os.path
import webbrowser
from contextlib import asynccontextmanager
from functools import lru_cache

import spotipy
from packaging import version

import uvicorn
from typing import Optional, Dict
from fastapi import FastAPI, Request, HTTPException, Query, status, Response, WebSocket, WebSocketDisconnect, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from spotipy import SpotifyOauthError

import config
import models
import usdb
import usdx
import ws
import scores
import spotify
from song import Song
from wishlist import Wishlist
from github import check_new_release

from users.db import User, create_db_and_tables
from users.schemas import UserCreate, UserRead, UserUpdate
from users.users import auth_backend, current_active_user, fastapi_users
from users.players import Player
import users.permissions as permissions

__version__ = "2.0.0"

SCRIPT_BASE_PATH = os.path.abspath(os.path.dirname(__file__))


@lru_cache
def get_new_version() -> Optional[str]:
    info = check_new_release("DidacticFishstick/ultrastar-wingman", __version__)
    new_version = info.new_version.lstrip('v')

    if new_version is None:
        return None

    if version.parse(new_version) > version.parse(__version__):
        return new_version


@asynccontextmanager
async def lifespan(app: FastAPI):
    # start consumers for the download queue
    download_consumers = [asyncio.create_task(usdb.download_queue_consumer(download_queue)) for _ in range(config.usdb_downloader_count)]
    await create_db_and_tables()
    yield


app = FastAPI(
    title="UltraStar Wingman",
    version=__version__,
    lifespan=lifespan
)

download_queue = asyncio.Queue()
event_loop = asyncio.get_event_loop()

# region users

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)


# endregion


@app.get('/openapi_no_anyOf.json', include_in_schema=False)
async def get_openapi_no_any_of():
    """
    This should not be necessary but https://www.npmjs.com/package/@openapitools/openapi-generator-cli has a problem
    with generating code for models with a type set to anyOf. Therefor this endpoint will remove those anyOf sections.

    Currently only removes anyOf from the ValidationError (components.schemas.ValidationError.properties.loc.items.anyOf)
    """

    def replace_anyof_with_type(data):
        if isinstance(data, dict):
            if "anyOf" in data:
                first_element = data["anyOf"][0]
                if isinstance(first_element, dict) and "type" in first_element:
                    data["type"] = first_element["type"]
                del data["anyOf"]
            for key in data:
                replace_anyof_with_type(data[key])
        elif isinstance(data, list):
            for item in data:
                replace_anyof_with_type(item)
        return data

    openapi = app.openapi()

    return replace_anyof_with_type(openapi)


@app.get('/api/uw/state', response_model=models.UltrastarWingmanState, tags=["UltraStar Wingman"], summary="The state of Ultrastar Wingman - new available version etc.")
async def api_uw_state():
    return {
        "version": __version__,
        "new_version": get_new_version(),
        "client_url": config.client_url
    }


@app.post('/api/usdx/kill', response_model=models.BasicResponse, tags=["UltraStar Deluxe"], summary="Kills any currently running Ultrastar Deluxe process")
async def api_usdx_kill(_: User = Depends(permissions.user_permissions(permissions.songs_stop))):
    await usdx.kill()
    return {"success": True}


@app.get('/api/usdb/ids', response_model=models.UsdbIdsList, tags=["USDB"], summary="Gets the list of all downloaded USDB IDs")
async def api_usdb_ids(_: User = Depends(permissions.user_permissions(permissions.usdb_browse))):
    return {"ids": list(Song.usdb_ids)}


@app.post('/api/usdb/download', response_model=models.BasicResponse, tags=["USDB"], summary="Downloads the song with the given USDB ID")
async def api_usdb_download(usdb_id_model: models.UsdbId, _: User = Depends(permissions.user_permissions(permissions.usdb_download))):
    await download_queue.put(usdb_id_model.id)

    await ws.broadcast(ws.MessageType.download_queued, {
        "usdb_id": usdb_id_model.id
    })

    return {"success": True}


@app.api_route('/proxy/{path:path}', tags=["USDB Proxy"], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH', 'TRACE'], include_in_schema=False)
async def proxy(request: Request, path: Optional[str] = '', _: User = Depends(permissions.user_permissions(permissions.usdb_browse_proxy))):
    # Define the base URL for the proxied requests
    base_url = "https://usdb.animux.de"

    # Collect incoming request data
    request_method = request.method
    request_body = await request.body()
    request_query_params = request.query_params
    request_headers = dict(request.headers)

    # Ensure we don't accidentally forward Host headers as it could cause issues
    request_headers.pop("host", None)

    # Construct the full URL
    url = f"{base_url}/{path}"

    # Forward the request to the target API
    response = await usdb.session.request(
        method=request_method,
        url=url,
        content=request_body,
        params=request_query_params,
        headers=request_headers,
        cookies=request.cookies,
    )

    forwarded_response_headers = {key: value for key, value in response.headers.items() if key.lower() not in ['content-encoding', 'content-length']}

    return Response(content=response.content, status_code=response.status_code, headers=forwarded_response_headers)


@app.get('/api/usdb/songs', response_model=models.USDBSongsResponse, tags=["USDB"], summary="Search Songs", response_description="A list of songs matching the criteria")
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
        page: int = Query(1, description="Page number for pagination."),
        _: User = Depends(permissions.user_permissions(permissions.usdb_browse))
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


def get_client_identifier(request: Request) -> str:
    """
    Creates an identifier for the client based its request.
    Currently, the host is used as the client identifier.

    :param request: The request object.
    :return: The identifier
    """

    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    else:
        return request.client.host


@app.get('/api/songs', response_model=models.SongsResponse, summary="Retrieve all downloaded songs", response_description="A list of songs", tags=["Songs"])
async def api_songs(_: User = Depends(permissions.user_permissions(permissions.songs_browse))):
    return {"songs": Song.song_list()}


@app.get('/api/songs/{song_id}', response_model=models.Song, summary="Retrieve the song with the given id. Use id 'random' for a random song or 'current' for the currently playing song.", response_description="The song", tags=["Songs"])
async def api_get_song_by_id(song_id, _: User = Depends(permissions.user_permissions(permissions.songs_browse))):
    song = Song.get_song_by_id(song_id)

    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    return song.to_json()


@app.get('/api/songs/{song_id}/scores', response_model=models.SongScoresModel, summary="All the scores for a given song (matched by USDX Id, so the scores might belong to different files).", response_description="The scores", tags=["Songs"])
async def api_get_song_by_id(song_id, _: User = Depends(permissions.user_permissions(permissions.songs_browse))):
    song = Song.get_song_by_id(song_id)

    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    return {
        "scores": await scores.get_song_scores(song.title, song.artist)
    }


@app.get('/api/songs/{song_id}/cover', tags=["Songs"])
async def api_cover(song_id, _: User = Depends(permissions.user_permissions(permissions.songs_browse))):
    song = Song.get_song_by_id(song_id)

    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    if song.cover_path:
        return FileResponse(song.cover_path)
    else:
        # Use logo as default cover
        return FileResponse(os.path.join(SCRIPT_BASE_PATH, "frontend/public/logo.png"))


@app.get('/api/songs/{song_id}/mp3', tags=["Songs"])
async def api_mp3(song_id, _: User = Depends(permissions.user_permissions(permissions.songs_browse))):
    song = Song.get_song_by_id(song_id)

    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    if song.mp3:
        return FileResponse(os.path.join(song.directory, song.mp3))
    else:
        raise HTTPException(status_code=404, detail="mp3 not found")


@app.post('/api/songs/{song_id}/sing', response_model=models.BasicResponse, tags=["Songs"], summary="Starts UltraStar Deluxe and loads the song")
async def api_sing_song(song_id, sing_model: models.SingModel, _: User = Depends(permissions.user_permissions(permissions.songs_play))):
    if Song.active_song is not None and Song.active_song.id == song_id:
        return {"success": True}

    song = Song.get_song_by_id(song_id)

    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    if await song.sing([await Player.get_by_id(id) for id in sing_model.player_ids], force=sing_model.force):
        return {"success": True}
    else:
        raise HTTPException(status_code=409, detail="Another song is already playing")


@app.get('/api/song_lookup', response_model=models.SongsResponse, summary="Searches for the given title and artist in the downloaded songs. Title and artist will be normalized to allow for slightly different spellings.", response_description="The songs", tags=["Songs"])
async def api_get_song_lookup(title: str, artist: str, _: User = Depends(permissions.user_permissions(permissions.songs_browse))):
    return {
        "songs": [s.to_json() for s in Song.lookup_song(title, artist)]
    }


@app.get('/api/players', response_model=models.PlayerConfig, summary="Retrieve Players", response_description="A list of unique player names", tags=["Players"])
async def api_players(_: User = Depends(permissions.user_permissions(permissions.players_view))):
    """
    Retrieves a list of all unique player names and the available colors.
    """

    registered, unregistered = await Player.all_players()

    return {
        "players": {
            "registered": [player.to_json() for player in registered],
            "unregistered": [player.to_json() for player in unregistered]
        },
        "colors": config.setup_colors
    }


@app.post('/api/players', response_model=models.UnregisteredPlayerModel, status_code=status.HTTP_201_CREATED, summary="Add a New Player", response_description="Confirmation of player addition", tags=["Players"])
async def api_players_add(player_data: models.PlayerCreation, _: User = Depends(permissions.user_permissions(permissions.players_add_temp))):
    """
    Adds a new temporary player name to the list.
    If the operation is successful, it returns a success message. Otherwise, it raises an HTTPException.
    """

    try:
        player = await Player.new_temporary(player_data.name)
        return player.to_json()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@app.delete('/api/players', response_model=models.BasicResponse, status_code=status.HTTP_200_OK, summary="Delete a Player", response_description="Confirmation of player deletion", tags=["Players"])
async def api_players_delete(id: str = Query(..., description="The id of the player to delete."), _: User = Depends(permissions.user_permissions(permissions.players_remove_temp))):
    """
    Deletes a player name from the list.
    If the operation is successful, it returns a success message.
    """

    Player.delete_temporary(id)

    return {"success": True}


@app.get('/api/players/avatars/default/{color}', tags=["Players"])
async def api_get_default_avatar(color, _: User = Depends(permissions.user_permissions(permissions.players_view))):
    """
    The default avatars (cat pictures)

    :param color: The color
    """

    try:
        return FileResponse(os.path.join(SCRIPT_BASE_PATH, "avatars", f"cat_{color}.jpg"))
    except FileNotFoundError:
        return FileResponse(os.path.join(SCRIPT_BASE_PATH, "avatars", "cat_rainbow.jpg"))


@app.get('/api/players/registered', response_model=models.RegisteredPlayersModel, summary="Retrieve all registered Players", response_description="A list of all registered players", tags=["Players"])
async def api_registered_players(_: User = Depends(permissions.user_permissions(permissions.players_view))):
    """
    Retrieves a list of all registered players.
    """

    registered = await Player.all_registered_players()

    return {
        "registered": [player.to_json() for player in registered]
    }


@app.patch('/api/players/registered', response_model=models.RegisteredPlayersModel, summary="Patch data for registered Players", response_description="A list of all modified registered players", tags=["Players"])
async def api_registered_players(players_patch_data: models.RegisteredPlayersPatchModel, user: User = Depends(permissions.user_permissions(permissions.players_edit))):
    """
    Patches a list of registered players.
    """

    players = {}
    for player_patch_data in players_patch_data.registered:
        if player_patch_data.access_level > user.access_level:
            raise HTTPException(status_code=403, detail="You can't assign access levels higher than yours.")

        player = await Player.get_by_id(player_patch_data.id)

        if player is None:
            raise HTTPException(status_code=404, detail=f"Player {player} does not exist.")

        players[player.id] = player

    for player_patch_data in players_patch_data.registered:
        await players[player_patch_data.id].set_access_level(player_patch_data.access_level)

    return {
        "registered": [player.to_json() for player in players.values()]
    }


@app.get('/api/players/registered/{player}', response_model=models.RegisteredPlayerModel, summary="Retrieve a specific registered Players", response_description="The registered player", tags=["Players"])
async def api_registered_players(player, _: User = Depends(permissions.user_permissions(permissions.players_view))):
    """
    Retrieves a registered players.
    """

    player = await Player.get_by_id(player)

    if player is None:
        raise HTTPException(status_code=404, detail="Player does not exist")

    return player.to_json()


@app.patch('/api/players/registered/{player}', response_model=models.RegisteredPlayerModel, summary="Patch data for a specific player", response_description="The player", tags=["Players"])
async def api_registered_players(player, player_patch_data: models.RegisteredPlayerPatchModel, user: User = Depends(permissions.user_permissions(permissions.players_edit))):
    """
    Retrieves a registered players.
    """

    p = await Player.get_by_id(player)

    if p is None:
        raise HTTPException(status_code=404, detail="Player does not exist.")

    if player_patch_data.access_level > user.access_level:
        raise HTTPException(status_code=403, detail="You can't assign access levels higher than yours.")

    await p.set_access_level(player_patch_data.access_level)

    return p.to_json()


@app.get('/api/players/registered/{player}/avatar', tags=["Players"])
async def api_get_player_avatar(player):
    """
    The avatar for the given player

    :param player: The player id
    """

    player = await Player.get_by_id(player)
    if player is None:
        raise HTTPException(status_code=404, detail="Player does not exist")

    return player.get_avatar_file_response(config.users_avatars_dir)


@app.post("/api/players/registered/{player}/avatar", response_model=models.BasicResponse, status_code=status.HTTP_200_OK, summary="Upload an avatar for the player", response_description="Confirmation of file upload", tags=["Players"])
async def api_post_player_avatar(player, file: UploadFile = File(...), user: User = Depends(current_active_user)):
    """
    Sets the avatar for the given player

    :param player: The player id
    :param user: The current user
    """

    if str(user.id) != player:
        raise HTTPException(status_code=403, detail="You are not allowed to change other players avatars")

    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    player = await Player.get_by_id(player)
    await player.set_avatar(config.users_avatars_dir, file)

    return {"success": True}


@app.get('/api/permissions', response_model=models.PermissionsModel, status_code=status.HTTP_200_OK, summary="Get all permissions", response_description="The permissions", tags=["Permissions"])
async def api_permissions_get():
    """
    Gets all the permissions.
    """

    return {
        "access_levels": [{
            "value": access_level.value,
            "title": access_level.name
        } for access_level in permissions.AccessLevel],
        "permissions": {permission.permission_id: permission.to_json() for permission in permissions.Permission.permissions.values()}
    }


@app.patch('/api/permissions', response_model=models.PermissionsPatchResponseModel, status_code=status.HTTP_200_OK, summary="Patch data for permissions", response_description="The edited permissions", tags=["Permissions"])
async def api_permissions_patch(permissions_patch_data: models.PermissionsPatchModel, user: User = Depends(permissions.user_permissions(permissions.permissions_edit))):
    """
    Patch permissions.
    """

    patched_permissions: Dict[str, permissions.Permission] = {}
    for permission_id, permission_patch_data in permissions_patch_data.permissions.items():
        if permission_patch_data.min_access_level > user.access_level:
            raise HTTPException(status_code=403, detail="You are not allowed to set permissions to levels you do not poses.")

        permission = permissions.Permission.permissions.get(permission_id)

        if permission is None:
            raise HTTPException(status_code=404, detail=f"Permission {permission} does not exist.")

        if permission.min_access_level > user.access_level:
            raise HTTPException(status_code=403, detail="You are not allowed to edit permissions that you do not poses.")

        patched_permissions[permission.permission_id] = permission

    for permission_id, permission_patch_data in permissions_patch_data.permissions.items():
        patched_permissions[permission_id].set_min_access_level(permission_patch_data.min_access_level)

    return {
        "access_levels": [{
            "value": access_level.value,
            "title": access_level.name
        } for access_level in permissions.AccessLevel],
        "permissions": {permission.permission_id: permission.to_json() for permission in patched_permissions.values()}
    }


@app.get('/api/sessions', response_model=models.SessionsListModel, status_code=status.HTTP_200_OK, summary="Get all sessions", response_description="The sessions", tags=["Scores"])
async def api_sessions_get(_: User = Depends(permissions.user_permissions(permissions.scores_view_current))):
    """
    Gets all the sessions.
    """

    # TODO: check if the player is allowed to see more than the current session

    return {
        "sessions": scores.get_sessions()
    }


@app.get('/api/scores', response_model=models.ScoresModel, status_code=status.HTTP_200_OK, summary="Get session scores", response_description="The scores", tags=["Scores"])
@app.get('/api/scores/{session_id}', response_model=models.ScoresModel, status_code=status.HTTP_200_OK, summary="Get session scores", response_description="The scores", tags=["Scores"])
async def api_scores_get(session_id: int = None, _: User = Depends(permissions.user_permissions(permissions.scores_view_current))):
    """
    Gets all the data for the specified session id.
    """

    # TODO: check if the player is allowed to see more than the current session
    # TODO: option for all sessions

    data = await scores.get_session_data(session_id)

    if data is None:
        raise HTTPException(status_code=404, detail="Session does not exist")

    return data


@app.get('/api/latest_scores', response_model=models.LatestScore, status_code=status.HTTP_200_OK, summary="Get latest scores and the song they belong to", response_description="The song and the scores", tags=["Scores"])
async def api_latest_scores_get():
    """
    Gets the latest scores and the song they belong to as well as all songs for the song
    """

    data = scores.latest_score

    if data is None:
        raise HTTPException(status_code=404, detail="No scores yet")

    return data


@app.get('/api/wishlist/client', response_model=models.WishlistModel, status_code=status.HTTP_200_OK, summary="Get the clients wishlist", response_description="The songs on the wishlist", tags=["Wishlist"])
async def api_wishlist_client_get(request: Request, _: User = Depends(permissions.user_permissions(permissions.wishlist_edit))):
    """
    Gets the songs on the wishlist for the current client.

    :param request: The request used to determine the client
    """

    return Wishlist.get_wishlist(get_client_identifier(request)).to_json()


@app.post('/api/wishlist/client', response_model=models.BasicResponse, status_code=status.HTTP_201_CREATED, summary="Adds the given song_id to the wishlist of the client", response_description="Confirmation of wishlist addition", tags=["Wishlist"])
async def api_wishlist_client_post(request: Request, add_to_wishlist: models.AddToWishListModel, _: User = Depends(permissions.user_permissions(permissions.wishlist_edit))):
    """
    Adds a song to the list.

    :param request: The request used to determine the client
    :param add_to_wishlist: The information what to add to the wishlist
    """

    song = Song.get_song_by_id(add_to_wishlist.song_id)

    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    wishlist = Wishlist.get_wishlist(get_client_identifier(request))

    await wishlist.add_song(song)

    return {"success": True}


@app.delete('/api/wishlist/client', response_model=models.BasicResponse, status_code=status.HTTP_200_OK, summary="Delete a song from the wishlist", response_description="Confirmation of wishlist deletion", tags=["Wishlist"])
async def api_wishlist_client_delete(request: Request, song_id: str = Query(..., description="The id of the song to delete."), _: User = Depends(permissions.user_permissions(permissions.wishlist_edit))):
    """
    Deletes a song form the clients wishlist.

    :param request: The request used to determine the client
    :param song_id: The id of the song to delete.
    """

    wishlist = Wishlist.get_wishlist(get_client_identifier(request))

    await wishlist.remove_song(song_id)

    return {"success": True}


@app.get('/api/wishlist/global', response_model=models.WishlistModel, status_code=status.HTTP_200_OK, summary="Get the global wishlist with the wishes for all players", response_description="The songs on the wishlist", tags=["Wishlist"])
async def api_wishlist_global_get(_: User = Depends(permissions.user_permissions(permissions.wishlist_view))):
    """
    Gets the global wishlist.
    """

    return Wishlist.get_global_wishlist()


@app.get('/api/spotify/authorize_url', response_model=models.SpotifyAuthorizeUrl, status_code=status.HTTP_200_OK, summary="Gets the url to access for the authorization code", response_description="The authorization url", tags=["Spotify"])
async def api_spotify_authorize(user: User = Depends(permissions.user_permissions(permissions.wishlist_view))):
    """
    Gets the url to access for the authorization code
    """

    print(user, type(user))

    if user is None:
        raise HTTPException(status_code=401, detail="You need to be logged in to use spotify.")

    player = await Player.get_by_id(str(user.id))

    print(player)

    return {
        "authorize_url": player.spotify_client.get_authorize_url()
    }


@app.post('/api/spotify/authorize', response_model=models.SpotifyMe, status_code=status.HTTP_200_OK, summary="Sets the code for Spotify to get the token", response_description="If the authorization was successful", tags=["Spotify"])
async def api_spotify_authorize(authorize: models.SpotifyAuthorize, user: User = Depends(permissions.user_permissions())):
    """
    Sets the code for Spotify to get the token
    """

    if user is None:
        raise HTTPException(status_code=401, detail="You need to be logged in to use spotify.")

    player = await Player.get_by_id(str(user.id))

    try:
        player.spotify_client.authorize(authorize.code)
    except SpotifyOauthError as e:
        raise HTTPException(status_code=403, detail=f"Failed to authorize with Spotify: {e}")

    return {
        "name": player.spotify_client.client.current_user()["display_name"]
    }


@app.post('/api/spotify/logout', status_code=status.HTTP_204_NO_CONTENT, summary="Logs out from Spotify, nothing happens if not logged in", response_description="No response", tags=["Spotify"])
async def api_spotify_logout(user: User = Depends(permissions.user_permissions())):
    """
    Logs out from Spotify, nothing happens if not logged in
    """

    if user is None:
        return

    player = await Player.get_by_id(str(user.id))

    player.spotify_client.logout()

    return {"success": True}


async def get_user_spotify_client(user: User) -> spotify.SpotifyClient:
    """
    Gets the spotify client for the user

    :param user: The user of the request
    :return: The Spotify client
    :raises HTTPException: if something is wrong
    """

    if user is None:
        raise HTTPException(status_code=401, detail="You need to be logged in to use spotify.")

    player = await Player.get_by_id(str(user.id))

    if player.spotify_client.client is None:
        raise HTTPException(status_code=403, detail=f"Not logged into Spotify")

    return player.spotify_client


@app.get('/api/spotify/me', response_model=models.SpotifyMe, status_code=status.HTTP_200_OK, summary="Information about the connected account", response_description="The Spotify account info", tags=["Spotify"])
async def api_spotify_me(user: User = Depends(permissions.user_permissions())):
    """
    Information about the connected account
    """

    sc = await get_user_spotify_client(user)

    try:
        return sc.get_me()
    except SpotifyOauthError:
        raise HTTPException(status_code=403, detail=f"Not logged into Spotify")


@app.get('/api/spotify/playlists', response_model=models.SpotifyPlaylists, status_code=status.HTTP_200_OK, summary="All saved Spotify playlists", response_description="All saved Spotify playlists", tags=["Spotify"])
async def api_spotify_playlists(user: User = Depends(permissions.user_permissions())):
    """
    All saved Spotify playlists
    """

    sc = await get_user_spotify_client(user)

    try:
        return sc.get_playlists()
    except SpotifyOauthError:
        raise HTTPException(status_code=403, detail=f"Not logged into Spotify")


@app.get('/api/spotify/playlists/{playlist_id}', response_model=models.SpotifyPlaylistItems, status_code=status.HTTP_200_OK, summary="The songs in the playlist, use /api/spotify/playlists/saved for the users saved songs", response_description="The songs in the playlist", tags=["Spotify"])
async def api_spotify_playlists_items(playlist_id: str, limit: int = 50, offset: int = 0, user: User = Depends(permissions.user_permissions())):
    """
    The songs in the playlist

    If playlist_id is saved, the users saved songs will be used
    """

    sc = await get_user_spotify_client(user)

    try:
        return sc.get_playlist_items(playlist_id, limit=limit, offset=offset)
    except SpotifyOauthError:
        raise HTTPException(status_code=403, detail=f"Not logged into Spotify")


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    # TODO: somehow include in permission management
    await websocket.accept()
    ws.ws_connections.add(websocket)
    logging.info("WebSocket client connected")
    try:
        while True:
            data = await websocket.receive_text()
            logging.info(f"Received message from websocket: {data}")
    except WebSocketDisconnect:
        ws.ws_connections.remove(websocket)


# region host UI

# TODO: merge this with the other verify - localhost should always be admin
# TODO: the first one connecting as localhost should create some ID for identification so noone else can say they are localhost
def verify_localhost(request: Request):
    # Check the X-Forwarded-For header first if the app is behind a proxy
    forwarded_for = request.headers.get("X-Forwarded-For")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host

    # Check both the forwarded_for IP and the direct client IP
    if client_ip not in ["127.0.0.1", "localhost"] and request.client.host not in ["127.0.0.1", "localhost"]:
        raise HTTPException(status_code=403, detail="Access to the host UI is only allowed from the host")


@app.get("/host_ui", dependencies=[Depends(verify_localhost)], include_in_schema=False)
async def host_ui():
    return FileResponse(os.path.join(SCRIPT_BASE_PATH, "frontend/build", "index.html"))


# endregion
# region UI

# Everything is in the index.html but the URL changes as this is a single page application.
# fastAPI does not like this -> custom routes
@app.get("/songs", include_in_schema=False)
@app.get("/UsdbList", include_in_schema=False)
@app.get("/usdb", include_in_schema=False)
@app.get("/scores", include_in_schema=False)
@app.get("/user", include_in_schema=False)
@app.get("/spotify", include_in_schema=False)
@app.get("/spotify/callback", include_in_schema=False)
async def alias_routes():
    return FileResponse(os.path.join(SCRIPT_BASE_PATH, "frontend/build", "index.html"))


app.mount("/", StaticFiles(directory=os.path.join(SCRIPT_BASE_PATH, "frontend/build"), html=True), name="static")


# endregion

async def open_browser():
    """
    Opens the UI in the default browser
    """

    await asyncio.sleep(2)
    webbrowser.open("http://localhost:8080/host_ui")


async def main():
    # login to usdb.animux.de
    await usdb.login()

    # load all sessions
    scores.init_sessions()

    # load all downloaded songs
    Song.load_songs()

    # Open browser
    asyncio.create_task(open_browser())

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
