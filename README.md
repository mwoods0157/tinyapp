# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Register screen"](https://user-images.githubusercontent.com/38844101/145905811-8825d76a-fe69-4a2c-b3f8-7edc7741fbbe.png)   

!["Main page"](https://user-images.githubusercontent.com/38844101/145905940-94ce1f25-2ac9-4e43-b65e-fa7333db9b66.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.

## Notes

- When creating new shortURLs, when valid it will redirect you to the edit section, not your main page
- Root when logged in is /url, when not it's /login
- Users shouldnt be able to look at /urls when not logged it. 

