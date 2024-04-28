# List the basenames
BASENAMES = game_01 game_02 game_03

# Declare the extra dependencies for each .js that will be built
#
# ** DO NOT INCLUDE THE BASE .TS FILES **
game_01.js:
game_02.js: ./common.ts
game_03.js: ./common.ts

# Include the common makefile, it does the rest
include ../../common.mk
