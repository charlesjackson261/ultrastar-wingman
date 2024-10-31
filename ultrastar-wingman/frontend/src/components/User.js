// components/User.js

import React, {useRef, useState} from 'react';
import './User.css';
import LoginForm from "./LoginForm";
import {logout, uploadAvatar, usePermissions, useUser} from "../helpers";
import Button from "./Button";
import Permissions from "./Permissions";
import Modal from "./Modal";
import SpotifyAccount from "./SpotifyAccount"; // Importing the CSS for styling

const User = () => {
    const [user, setUser] = useUser();
    const [permissions, setPermissions] = usePermissions()
    const [editPermissionsOpen, setEditPermissionsOpen] = useState(false);
    const [editPlayersOpen, setEditPlayersOpen] = useState(false);

    const fileInputRef = useRef(null);
    const avatarRef = useRef(null);

    let userAccessLevel = "";
    if (user !== null) {
        userAccessLevel = permissions.access_levels
            .filter(item => item.value <= user.access_level)
            .reduce((max, item) => (item.value > max.value ? item : max), {value: -Infinity}).title;
    }

    if (!user) {
        return <div className={"user-page"}>
            <LoginForm
                setUser={setUser}
            />
        </div>;
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        uploadAvatar(user.id, file, data => {
            avatarRef.current.style.backgroundImage = `url(/api/players/registered/${user.id}/avatar?t=${new Date().getTime()}.png)`
        });
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    return <div className={"user-page"}>
        <div className={"profile"}>
            <input
                ref={fileInputRef}
                type="file"
                id="fileInput"
                accept="image/*"
                style={{display: 'none'}}
                onChange={handleFileChange}
            />
            <span ref={avatarRef} className={"avatar"} onClick={handleButtonClick} style={{backgroundImage: `url(/api/players/registered/${user.id}/avatar)`}}></span>

            <label>{user.email}</label>
            <label className={"role"}>{userAccessLevel}</label>
            <Button onClick={() => logout(() => setUser(null))}>Log Out</Button>
        </div>

        <h1>Connected Accounts</h1>

        <SpotifyAccount/>

        {((user.access_level >= permissions.permissions["permissions.edit"].min_access_level) ||
        (user.access_level >= permissions.permissions["players.edit"].min_access_level)) &&
            <h1>Admin Controls</h1>
        }

        {user.access_level >= permissions.permissions["permissions.edit"].min_access_level &&
            <Button onClick={() => setEditPermissionsOpen(true)}>Edit Permissions</Button>
        }

        {editPermissionsOpen && user.access_level >= permissions.permissions["permissions.edit"].min_access_level &&
            <Modal
                fullscreen={true}
                onClose={() => setEditPermissionsOpen(false)}
            >
                <Permissions
                    permissions={permissions}
                    setPermissions={setPermissions}
                    accessLevels={permissions.access_levels}
                />
            </Modal>
        }

        {user.access_level >= permissions.permissions["players.edit"].min_access_level &&
            <Button onClick={() => setEditPlayersOpen(true)}>Manage Players</Button>
        }
    </div>;
};

export default User;
