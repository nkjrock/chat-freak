import React, { useEffect, useState , useRef} from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client";

function Chat() {
    const navigate = useNavigate();
    const socket = useRef();
    const [contacts, setContacts] = useState([]);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [currentChat, setCurrentChat] = useState(undefined);
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try{
                if (!localStorage.getItem("chat-app-current-user")) {
                    navigate("/login");
                } 
                else {
                    setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-current-user")));
                    setIsLoaded(true);
                }
            }
            catch(e){
                console.log(e);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        const fetchData = () => {
            try {
                if (currentUser) {
                    socket.current = io(host);
                    socket.current.emit("add-user", currentUser._id);
                }
            }
            catch(e) {
                console.log(e);
            }
        }
        fetchData();
    }, [currentUser]);
    useEffect(() => {
        const fetchData = async () => {
            try{
                if (currentUser) {
                    if (currentUser.isAvatarImageSet) {
                        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
                        setContacts(data.data);
                    } 
                    else {
                        navigate("/setAvatar");
                    }
                }
            }
            catch(e){
                console.log(e);
            }
        };
        fetchData();
    }, [currentUser]);
    const handleChatChange = (chat) => {
        setCurrentChat(chat);
    };
    return (
        <Container>
            <div className="container">
                <Contacts contacts={contacts} currentUser={currentUser} changeChat={handleChatChange}/>
                {isLoaded && currentChat === undefined ? (
                    <Welcome currentUser={currentUser} />
                ) : (
                    <ChatContainer currentChat={currentChat} currentUser = {currentUser} socket={socket}/>
                )}
            </div>
        </Container>
    );
}

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    align-items: center;
    background-color: #131324;
    .container {
        height: 85vh;
        width: 85vw;
        background-color: #00000076;
        display: grid;
        grid-template-columns: 25% 75%;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
            grid-template-columns: 35% 65%;
        }
        // this is only for tablet mode for mobile phone 360 to 480.
    }
`;

export default Chat;