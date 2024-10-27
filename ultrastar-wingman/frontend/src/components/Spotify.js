// components/Spotify.js
import React, {useEffect, useState} from 'react';
import './Spotify.css';
import {apiCallback, useClientWishlist, useCurrentlyPlayingSong, useFavoriteIds, useSpotifyMe, useSpotifyPlaylists} from "../helpers";
import Spinner from "./Spinner";
import {NavLink, useNavigate} from "react-router-dom";
import SpotifyAlbum from "./SpotifyAlbum";
import {SpotifyApi} from "../api/src";
import SpotifySong from "./SpotifySong";
import SpotifySongDetailsModal from "./SpotifySongDetailsModal";
import PlayerSelection from "./PlayerSelection";
import SongDetailsModal from "./SongDetailsModal";

function Spotify() {
    const [spotifyMe, setSpotifyMe] = useSpotifyMe();
    const [spotifyPlaylists, setSpotifyPlaylists] = useSpotifyPlaylists();

    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistItems, setPlaylistItems] = useState(null);
    const [playlistOffset, setPlaylistOffset] = useState(0);
    const [playlistItemsLoading, setPlaylistItemsLoading] = useState(false);
    const [hasMorePlayListItems, setHasMorePlayListItems] = useState(true);

    const [selectedSpotifySong, setSelectedSpotifySong] = useState(null);

    const [playerSelectionSong, setPlayerSelectionSong] = useState(null);
    const [currentlyPlayingSong, setCurrentlyPlayingSong] = useCurrentlyPlayingSong();
    const [clientWishlist, setClientWishlist] = useClientWishlist();
    const [favoriteIds, setFavoriteIds] = useFavoriteIds();
    const [selectedSong, setSelectedSong] = useState(null);

    // TODO: back does not work as this is does not open a new url on album selection

    const spotifyApi = new SpotifyApi()

    const loadItems = async () => {
        if (playlistItemsLoading || !hasMorePlayListItems) return; // Prevent multiple requests at the same time

        setPlaylistItemsLoading(true);

        spotifyApi.apiSpotifyPlaylistsItemsApiSpotifyPlaylistsPlaylistIdGet(selectedPlaylist.id, {offset: playlistOffset}, apiCallback(data => {
            if (selectedPlaylist === null) return;

            setPlaylistItems((prevItems) => [...prevItems, ...data.songs]);
            setPlaylistOffset(data.offset + data.songs.length);

            if (data.offset + data.songs.length >= data.total) {
                setHasMorePlayListItems(false);
            }

            setPlaylistItemsLoading(false);
        }));
    };

    useEffect(() => {
        if (selectedPlaylist === null) {
            setPlaylistItems([]);
            setPlaylistOffset(0);
            setHasMorePlayListItems(true);
        } else {
            if (playlistOffset === 0) {
                loadItems();
            }

            const handleScroll = () => {
                if (Math.abs(window.innerHeight + document.documentElement.scrollTop - document.documentElement.offsetHeight) > 1) return;
                loadItems();
            };

            window.addEventListener('scroll', handleScroll);
            return () => {
                window.removeEventListener('scroll', handleScroll); // Clean up on unmount
            };
        }
    }, [selectedPlaylist, playlistOffset, playlistItemsLoading, hasMorePlayListItems])

    if (spotifyMe === null || spotifyPlaylists === null) {
        // still loading
        return (
            <div className="spotify-page">
                <h1>Spotify</h1>
                <Spinner/>
            </div>
        );
    } else if (Object.keys(spotifyMe).length === 0) {
        // not logged in
        return (
            <div className="spotify-page">
                <h1>Spotify</h1>
                <NavLink to="/user">Connect a spotify account to your user</NavLink>
            </div>
        );
    } else {
        // initially loaded
        if (selectedPlaylist !== null) {
            // selected playlist
            return (
                <div className="spotify-page">
                    <h1>{selectedPlaylist.name}</h1>

                    <div className={"songs"}>
                        {playlistItems.map(song => (
                            <SpotifySong
                                song={song}
                                setSelectedSpotifySong={setSelectedSpotifySong}
                            />
                        ))}
                    </div>

                    {playlistItemsLoading && <Spinner/>}

                    {selectedSpotifySong && !selectedSong &&
                        <SpotifySongDetailsModal
                            selectedSpotifySong={selectedSpotifySong}
                            setSelectedSpotifySong={setSelectedSpotifySong}
                            setSelectedSong={setSelectedSong}
                            clientWishlist={clientWishlist}
                            favoriteIds={favoriteIds}
                        />
                    }

                    {selectedSong && !playerSelectionSong &&
                        <SongDetailsModal
                            song={selectedSong}
                            onClose={() => setSelectedSong(null)}
                            setPlayerSelectionSong={setPlayerSelectionSong}
                            currentlyPlayingSong={currentlyPlayingSong}
                            clientWishlist={clientWishlist}
                            setClientWishlist={setClientWishlist}
                            favoriteIds={favoriteIds}
                            setFavoriteIds={setFavoriteIds}
                        />
                    }

                    {playerSelectionSong &&
                        <PlayerSelection
                            song={playerSelectionSong}
                            onClose={() => setPlayerSelectionSong(false)}
                        />
                    }
                </div>
            );
        } else {
            // show albums
            return (
                <div className="spotify-page">
                    <h1>Your Spotify Playlists</h1>

                    <div className={"albums"}>
                        <SpotifyAlbum
                            id={"saved"}
                            name={"Liked Songs"}
                            owner={spotifyMe.name}
                            setSelectedPlaylist={setSelectedPlaylist}
                        />
                        {spotifyPlaylists.map(playlist => (
                            <SpotifyAlbum
                                id={playlist.id}
                                name={playlist.name}
                                image={playlist.image}
                                owner={playlist.owner}
                                setSelectedPlaylist={setSelectedPlaylist}
                            />
                        ))}
                    </div>
                </div>
            );
        }

    }
}

export default Spotify;
