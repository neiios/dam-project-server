# Conference Application Backend

To run the project:

- Have [Bun](https://bun.sh/) and [Docker](https://www.docker.com/products/docker-desktop/) installed
- Run `bun install` in the project directory
- Use `docker compose up -d` in the project directory to run the database
- Create a `.env` file in project directory based on `.env.example`; you dont need to change the contents of the file to work on the project
- Create the database schema with `bun run push` and then, optionally, create the test data `bun run seed`
- Develop the project with `bun run dev`

To generate database diagram:

```
bun dbml.ts && bun dbml-renderer -i schema.dbml -o erd.svg
```
