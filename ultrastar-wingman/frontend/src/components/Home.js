// Home.js
import Tile from './Tile';
import {FaGithub} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import './Home.css';
import Wishlist from "./Wishlist";
import RandomSongSelector from "./RandomSongSelector";
import React, {useState} from "react";
import SongDetailsModal from "./SongDetailsModal";
import {useClientWishlist, useCurrentlyPlayingSong, useFavoriteIds, useGlobalWishlist} from "../helpers";

function Home() {

    const [currentlyPlayingSong, setCurrentlyPlayingSong] = useCurrentlyPlayingSong();
    const [selectedSong, setSelectedSong] = useState(null);

    const [clientWishlist, setClientWishlist] = useClientWishlist();
    const [globalWishlist, setGlobalWishlist] = useGlobalWishlist();
    const [favoriteIds, setFavoriteIds] = useFavoriteIds();

    const closeModal = () => {
        setSelectedSong(null);
    };

    console.log("clientWishlist", clientWishlist);
    console.log("globalWishlist", globalWishlist);
    console.log("favoriteIds", favoriteIds);

    return <div>
        <div className="tile-container">
            <Tile className={"title"} span>
                <span className={"logo"}></span>
                <label>Ultrastar Wingman</label>
                {/*TODO: Fill with correct version, show if update available*/}
                <div className={"info"}>
                    <span className={"version"}>Version 1.1.0</span>
                    <a href={"https://github.com/DidacticFishstick/ultrastar-wingman"} target="_blank" rel="noopener noreferrer" className={"git"}><FaGithub/> GitHub</a>
                </div>
            </Tile>
        </div>
        <Wishlist
            setSelectedSong={setSelectedSong}
            clientWishlist={clientWishlist}
            globalWishlist={globalWishlist}
            favoriteIds={favoriteIds}
        />
        <h2>Random Song Selector</h2>
        <RandomSongSelector
            setSelectedSong={setSelectedSong}
        />
        {selectedSong &&
            <SongDetailsModal
                song={selectedSong}
                onClose={() => setSelectedSong(null)}
                clientWishlist={clientWishlist}
                setClientWishlist={setClientWishlist}
                globalWishlist={globalWishlist}
                setGlobalWishlist={setGlobalWishlist}
                favoriteIds={favoriteIds}
                setFavoriteIds={setFavoriteIds}
            />
        }
    </div>;
}

export default Home;
