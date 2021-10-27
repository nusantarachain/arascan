# Nuchain Sequncer

Walk through Nuchain blocks and index the data.

How to run sequencer:

```
$ yarn start:sequencer
```

Available parameters:

```
--starting-block=XXX  - to sequencing from specified block XXX
--no-skip-limiter     - disable skip limit.
--all                 - process all blocks.
--continue            - continue sequencing from last processed block
                        this useful when something went wrong in the middle of sequencing.
```

Example, to run sequencer from block 100 until block 0:

```
yarn start:sequencer --starting-block=100 --all
```
