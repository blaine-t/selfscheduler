<p align="center">
  <img src="public/img/logo.png" height="128">
</p>

## Description

selfscheduler is a project developed to improve the usability and features of the existing collegescheduler used at many universities across the US. To do this we reverse engineered the socket.io connections going to and from the server to develop a 1:1 compatible implementation that allows us to include advanced features such as autoenroll, our solution to making sure that you get that one class that you need for the ultimate schedule. We also implemented a proxy between collegescheduler and the user to ensure that the users cookie is always available for quick schedule changes.

## Powered By

      <img src="public/img/node.png" width="20" height="20"> [**Node.js**](https://github.com/nodejs/node) is the runtime we decided to use for this project because of its long standing reputation in the programming world <br />
      <img src="public/img/typeScript.svg" width="20" height="20"> [**Typescript**](https://github.com/microsoft/TypeScript) - Most if not all of the backend code is written in typescript. TS was chosen over javascript because for a complex project ensuring that types remained consistent throughout was crucial to having less error prone code. While it was a decent learning curve it definitely made development easier especially towards the end <br />
      <img src="public/img/express.png" height="20"> [**Express.js**](https://github.com/expressjs/express) was used as a minimalist web framework. It gave us low enough capabilities without going too low that it was hard to develop with <br />
      <img src="public/img/ejs.png" height="20"> [**EJS**](https://github.com/expressjs/express) was used as a minimalist template framework. It allows for the fine development of HTML with the niceties of server side rendering which was crucial for this project to be lightweight <br />
      <img src="public/img/socketIO.svg" height="20"> [**Socket.io**](https://github.com/socketio/socket.io) - used to interface with shopping cart and enrollment actions in collegescheduler

## Special Thanks To

      <img src="https://avatars.githubusercontent.com/u/4109551" height="20"> [**Original College Scheduler Proxy**](https://github.com/cougargrades/collegescheduler) - Helped us implement the proxy part of the program with speed

## Contributors

      <img src="https://avatars.githubusercontent.com/u/65707789" height="20"> [**anton-3**](https://github.com/anton-3) <br />
      <img src="https://avatars.githubusercontent.com/u/108963625" height="20"> [**blaine-t**](https://github.com/blaine-t)
