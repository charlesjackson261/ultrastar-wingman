// components/SpotifySongDetailsModal.js
import './SpotifySongDetailsModal.css';
import React, {useEffect, useRef, useState} from "react";
import Modal from "./Modal";
import {Spotify} from "react-spotify-embed";
import {USDBApi} from "../api/src";
import SongListItem from "./SongListItem";
import UsdbSearchResults from "./UsdbSearchResults";
import Spinner from "./Spinner";

const SpotifySongDetailsModal = ({
                                     selectedSpotifySong,
                                     setSelectedSpotifySong,
                                     setSelectedSong,
                                     clientWishlist,
                                     favoriteIds
                                 }) => {
    const modalRef = useRef(null);

    const [usdbSongs, setUSDBSongs] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // const
    console.log(selectedSpotifySong.downloaded_songs);

    const usdbIds = selectedSpotifySong.downloaded_songs
        .filter(song => song.usdb_id) // Filter out items without usdb_id
        .map(song => song.usdb_id);  // Map to list of usdb_ids

    console.log(usdbIds);

    const usdbApi = new USDBApi();

    useEffect(() => {
        usdbApi.apiUsdbSongsApiUsdbSongsGet({
            artistList: selectedSpotifySong.artists,
            title: selectedSpotifySong.name,
            order: "rating",
            ud: "desc",
            limit: 100,
            page: 1,
            fuzzy: true
        }, (error, data, response) => {
            if (error) {
                setError(error + " - " + response.text);
            } else {
                setUSDBSongs(data.songs.filter(song => !usdbIds.includes(song.id)));

                setLoading(false);
            }
        });
    }, [selectedSpotifySong]);

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

            {usdbSongs.length > 0 && <h1>Download from USDB</h1>}
            <UsdbSearchResults
                songs={usdbSongs}
                setSelectedSong={setSelectedSong}
            />
            {error && <h3>{error}</h3>}
            {loading && usdbSongs.length !== 0 && <Spinner/>}

            {!loading && !error && selectedSpotifySong.downloaded_songs.length === 0 && usdbSongs.length === 0 && <h1>No Results Found</h1>}
        </Modal>
    );
};

export default SpotifySongDetailsModal;
