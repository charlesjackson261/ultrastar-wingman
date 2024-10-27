// components/SpotifySong.js
import React from 'react';
import './SpotifySong.css';
import {FaCheck} from "react-icons/fa";

function SpotifySong({
                         song,
                         setSelectedSpotifySong
                     }) {
    return (
        <div key={song.id} className={`spotify-song ${song.downloaded_songs.length > 0 ? 'downloaded' : ''}`} onClick={() => setSelectedSpotifySong(song)}>
            <span className="image" style={{backgroundImage: `url('${song.image}')`}}/>
            <div className="details">
                <label className="name" title={song.name}>{song.name}</label>
                <label className="artists" title={song.artists}>{song.artists.join(', ')}</label>
            </div>
            {song.downloaded_songs.length > 0 && <div className={"checkmark"}><FaCheck/></div>}
        </div>
    );
}

export default SpotifySong;
