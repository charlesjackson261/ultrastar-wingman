// components/SpotifySong.js
import React from 'react';
import './SpotifySong.css';

function SpotifySong({
                          id,
                          name,
                          image,
                          artists,
                          setSelectedSong
                      }) {
    return (
        <div key={id} className="spotify-song" onClick={() => setSelectedSong({
            id: id,
            name: name,
            image: image,
            artists: artists
        })}>
            <span className="image" style={{backgroundImage: `url('${image}')`}}/>
            <div className="details">
                <label className="name" title={name}>{name}</label>
                <label className="artists" title={artists}>{artists.join(', ')}</label>
            </div>
        </div>
    );
}

export default SpotifySong;
