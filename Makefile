# Source and Destination folders
SRC_ROOT = src
OUT_ROOT = book

# Source and Destination for making the IIFE
SRC_IIFE = $(SRC_ROOT)/jetlag.ts
OUT_IIFE = $(OUT_ROOT)/jetlag.js

# Chapters that have games that need to be built
CHAPTERS = animations audio camera_gravity collisions discrete_movement      \
           empty endless_runner_game gestures getting_started graphic_assets \
           joints maze_game movement overhead_fight_farm_game overview       \
           platformer_game projectiles rigid_bodies roles score              \
           simulation_conway stage_transitions storage svg text_hud timers   \
           video

# Specifying the chapter targets like this lets us build them all in parallel
CHAP_TGTS = $(patsubst %, %.link, $(CHAPTERS))

.DEFAULT_GOAL=all
.PHONY: all clean mdbook iife

# Build the book, the IIFE, and each chapter's games
all: mdbook iife $(CHAP_TGTS)

# Use mdbook to build the book
mdbook:
	@echo "[mdbook]  ./$(SRC_ROOT) --> $(OUT_ROOT)"
	@mdbook build -d $(OUT_ROOT) ./

# Use esbuild to build the JetLag iife file (the .js library for the games).
# The flags coerce it into being an IIFE that exports what we need exported.
iife: mdbook
	@echo "[esbuild] $(SRC_IIFE) --> $(OUT_IIFE)"
	@npx esbuild --log-level=error --bundle $(SRC_IIFE) --outfile=$(OUT_IIFE) --platform=browser --global-name=jetlag --footer:js="jetlag.default"

# We build a chapter's games by running make (sliently) in a subfolder
%.link: mdbook
	@$(MAKE) -s -C $(OUT_ROOT)/$(subst .link,,$@)

clean:
	@echo Cleaning up...
	@$(RM) -rf $(OUT_ROOT)

