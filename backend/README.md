# Backend for Todo App

------------

You can stores and manage:

- Users

### Tech

------------

- Sequelize ORM 
- TypeScript
- Passport
- Commander
- Express
- Node

### Setup Guide

------------

** Requires a NPM and NodeJS installed in your local machine

** Also requires any database server installed

1. Open your prefered editor
2. Clone this repository and cd to forms/backend
3. run the **npm install**
4. make a **config.json** in that folder and reads the README.txt

### Usage Guide

------------

`npm run db help` Display the command line for database actions (restart, admin, add-input, remove-input)

`npm run start:dev` Run server and listen for any changes 

`npm run start:prod` Run server

** Is your responsability set the NODE_ENV in "production", "development" or "test" mode. Thats not handled by the scripts

### Routes

------------


:airplane: `POST` **/login**  (PUBLIC)

> Get the access token

**BODY STRUCTURE:**

    interface UserData{
        username: string,
        password: string
    }

------------
:airplane: `POST` **/user** (PUBLIC)

> Create new user and get the access token

**BODY STRUCTURE:**

    interface UserData{
        username: string,
        password: string
    }
------------
:airplane: `GET` **/user** 

** Requires the Authorization Header

> Get info of the user


------------
:airplane: `GET` **/user/all**  :warning: Requires Admin Account

** Requires the Authorization Header

> Get all of the users

------------
:airplane: `PUT` **/user** 

** Requires the Authorization Header

> Updates the user

**BODY STRUCTURE:**

    interface UserData{
        username: string,
        password: string
    }

------------
:airplane: `DELETE` **/user** 

** Requires the Authorization Header

> Deletes the user

@mdjfs
@blue01H