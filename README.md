## Instructions

- Run `npm install` to install dependencies
- Run `sudo docker compose up -d` to start the database
- Run `npm run dev` to start the server

The release should automigrate. If the migration fails, please run `./db.sh`, copying in the contents of the `schema.sql` file and pressing enter.

In a release, the generated client will be included in the `src/generated-client` folder on the frontend component. If it is missing, please run the swag.sh script to generate the client.