// components/SpotifySongDetailsModal.js
import './SpotifySongDetailsModal.css';
import React, {useEffect, useRef, useState} from "react";
import Modal from "./Modal";
import {Spotify} from "react-spotify-embed";
import {SongsApi} from "../api/src";
import SongListItem from "./SongListItem";
import {FaCheck} from "react-icons/fa";

const SpotifySongDetailsModal = ({
                                     selectedSpotifySong,
                                     setSelectedSpotifySong,
                                     setSelectedSong,
                                     clientWishlist,
                                     favoriteIds
                                 }) => {
    const modalRef = useRef(null);

    const [downloadedSongs, setDownloadedSongs] = useState([]);

    const songsApi = new SongsApi();

    // useEffect(() => {
    //     songsApi.apiGetSongLookupApiSongLookupGet(selectedSpotifySong.name, selectedSpotifySong.artists, apiCallback(data => {
    //         console.log(data);
    //         setDownloadedSongs(data.songs);
    //     }))
    // }, [selectedSpotifySong]);

    console.log(selectedSpotifySong);

    return (
        <Modal fullscreen={true} ref={modalRef} className={"spotify-song-detail-modal"} onClose={() => setSelectedSpotifySong(null)}>
            <Spotify wide link={`https://open.spotify.com/track/${selectedSpotifySong.id}`}/>
            {selectedSpotifySong.downloaded_songs.length > 0 && <h1>Downloaded Songs</h1>}
            {selectedSpotifySong.downloaded_songs.map(song => (
                <SongListItem
                    song={song}
                    coverUrl={`/api/songs/${song.id}/cover`}
                    onClick={() => setSelectedSong(song)}
                    clientWishlist={clientWishlist}
                    favoriteIds={favoriteIds}
                />
            ))}
        </Modal>
    );
};

export default SpotifySongDetailsModal;
