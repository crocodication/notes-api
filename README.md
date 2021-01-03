<p align="center">
  <img src="https://img.shields.io/badge/typescript%20-%23007ACC.svg?&style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?&style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github" height="18.5"/>
  <img src="https://visitor-badge.laobi.icu/badge?page_id=crocodication.notes-api" width="82" height="20"/>
</p>

# Notes API

> Example API project using Express, PostgreSQL, TypeScript and deployed to Heroku.

<p align="center">
  <img src="./screenshots/0.png" alt="Postman Preview" width="300"/>
</p>

## Import Postman Collection

- Copy the link https://www.getpostman.com/collections/f9885c6632968cf1c52f
- Open Postman
- Select Import Button on the Top Right

<img src="./screenshots/1.png" alt="Postman Preview" width="300"/>

- Select Link Tab
- Paste Link
- Press Continue

## Self Deploy Preparation

If you want to deploy your own on your heroku, do the following steps

- Create new Heroku app
- At resource tab, make sure enable Heroku Postgres add-on
- Copy the Heroku Postgres credential information
- Clone the project
- Change pool config at the top of query-functions.ts to your own configuration
- Push to your own GitHub repo
- Connect heroku app it with the repo
- Don't forget to select automatic deploy
- Create database and table using postgres command line