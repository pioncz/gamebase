# gamebase

I wanted to create a game platform for board games from scratch, where users can choose between different game formats and play together with friends or bots.  

The whole project is complex as it is divided into the following parts:
- backend - handles all REST and WebSocket requests. It maintains game "rooms" where people play  
- frontend - client for the platform. pages that it supports: home that lists all available games, room where people actually play, engine where you can play with API of the game engine, admin where you can see server logs and change the config  
- engine - 3d game engine that can render board, pawns, dice with smooth animations   
- games - holds all information about each game. for each game it has: how to draw the board, how to move pawns around that board, what are the fields on that board, what are allowed actions. this component is used by engine part - to know how to render everything; and backend part - to know what how to handle incoming actions from the client  

Tech stack:
Frontend: Typescript, React, three.js, axios, react-router, socket.io  
Backend: express, socket.io, helmet, mongodb, mongoose  

![Screenshot](/screen1.png?raw=true "Screenshot 1")
