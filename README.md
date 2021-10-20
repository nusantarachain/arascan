# ARAScan

Block and data explorer for [Nuchain](https://nuchain.network) network.

Minimal and optimized version of [Subscan](https://www.subscan.io/).

Engine that power [ARAScan](https://scan.nuchain.network).

## Sequencer

Use to iterate through blocks from higher to lower number of blocks and process them.

Run:

```bash
yarn start:sequencer
```

Parameters:

-   `--no-skip-limit` - process without skip limit.
-   `--all` - process all blocks.

## Development Cycle

Run the database using docker:

```bash
docker-compose up -d mongodb
```

## API server

To start API server run the following command:

```bash
yarn start:api-server
```

Make sure the database already running and ready to accept connections.
