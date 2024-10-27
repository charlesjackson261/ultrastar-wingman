// components/Spotify.js
import React, {useEffect, useState} from 'react';
import './Spotify.css';
import {apiCallback, useSpotifyMe, useSpotifyPlaylists} from "../helpers";
import Spinner from "./Spinner";
import {NavLink, useNavigate} from "react-router-dom";
import SpotifyAlbum from "./SpotifyAlbum";
import {SpotifyApi} from "../api/src";
import SpotifySong from "./SpotifySong";
import SpotifySongDetailsModal from "./SpotifySongDetailsModal";

function Spotify() {
    const [spotifyMe, setSpotifyMe] = useSpotifyMe();
    const [spotifyPlaylists, setSpotifyPlaylists] = useSpotifyPlaylists();

    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistItems, setPlaylistItems] = useState(null);
    const [playlistOffset, setPlaylistOffset] = useState(0);
    const [playlistItemsLoading, setPlaylistItemsLoading] = useState(false);
    const [hasMorePlayListItems, setHasMorePlayListItems] = useState(true);

    const [selectedSong, setSelectedSong] = useState(null);

    const navigate = useNavigate();

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
                                id={song.id}
                                name={song.name}
                                image={song.image}
                                artists={song.artists}
                                setSelectedSong={setSelectedSong}
                            />
                        ))}
                    </div>

                    {playlistItemsLoading && <Spinner/>}

                    {selectedSong &&
                        <SpotifySongDetailsModal
                            selectedSong={selectedSong}
                            setSelectedSong={setSelectedSong}
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
