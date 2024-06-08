# Conference Application Backend

To run the project:

- Have [Bun](https://bun.sh/) and [Docker](https://www.docker.com/products/docker-desktop/) installed
- Run `bun install` in the project directory
- Use `docker compose up -d` in the project directory to run the database
- Create a `.env` file in project directory based on `.env.example`; you dont need to change the contents of the file to work on the project
- Create the database schema with `bun run push`
- Develop the project with `bun run dev`
