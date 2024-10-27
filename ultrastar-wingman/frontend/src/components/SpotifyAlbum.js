// components/SpotifyAlbum.js
import React from 'react';
import './SpotifyAlbum.css';
import {FaHeart} from "react-icons/fa";

function SpotifyAlbum({
                          id,
                          name,
                          image,
                          owner,
                          setSelectedPlaylist
                      }) {
    let imageDiv;
    if (id === "saved") {
        imageDiv = <span className="image saved">
            <FaHeart/>
        </span>;
    } else if (image) {
        imageDiv = <span className="image" style={{backgroundImage: `url('${image}')`}}/>;
    } else {
        imageDiv = <span className="image no-image"/>;
    }

    return (
        <div key={id} className="spotify-album" onClick={() => setSelectedPlaylist({
            id: id,
            name: name,
            image: image,
            owner: owner
        })}>
            {imageDiv}
            <div className="details">
                <label className="name" title={name}>{name}</label>
                <label className="owner" title={owner}>{owner}</label>
            </div>
        </div>
    );
}

export default SpotifyAlbum;
