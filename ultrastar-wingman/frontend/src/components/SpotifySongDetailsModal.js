// components/SpotifySongDetailsModal.js
import './SpotifySongDetailsModal.css';
import React, {useRef} from "react";
import Modal from "./Modal";
import {Spotify} from "react-spotify-embed";

const SpotifySongDetailsModal = ({
                                     selectedSong,
                                     setSelectedSong
                                 }) => {
    const modalRef = useRef(null);

    return (
        <Modal fullscreen={true} ref={modalRef} className={"spotify-song-detail-modal"} onClose={() => setSelectedSong(null)}>
            <Spotify wide link={`https://open.spotify.com/track/${selectedSong.id}`} />
        </Modal>
    );
};

export default SpotifySongDetailsModal;
