# The includer of this file might have declared some targets, so re-establish
# that this Makefile's "all" is the goal.
.DEFAULT_GOAL=all

# Define "all" as making a .js and a .html for each BASENAME
all: info $(patsubst %, %.js, $(BASENAMES)) $(patsubst %, %.iframe.html, $(BASENAMES))

# Housekeeping to keep "make" happy
.PHONY: all info

info:
	@echo Building examples for chapter $(notdir $(CURDIR))

%.js: %.ts
# 1) Merge the source .ts file with all .ts files on which the Makefile says it
#    depends.  Use grep instead of cat, to ensure a newline between files.
	@grep -h "" $^ > $@.merged
# 2) Remove all import statements from that file, transpile it to JavaScript
	@grep -v -e "import .* from" $@.merged > $@.nodeps.ts
	@npx esbuild --log-level=error $@.nodeps.ts --platform=browser --outfile=$@.nodeps.js
# 3) Extract the jetlag imports from the merged file, turn them into global vars
#    in the output JS file
	@grep -e "import .* from \"../jetlag\"" $@.merged > $@.deps
	@rm -f $@
	@sed -i 's/import .//' $@.deps
	@sed -i 's/. from .*//' $@.deps
	@sed -i 's/,//g' $@.deps
	@for v in `cat $@.deps`; do echo "var $$v = jetlag.$$v;" >> $@; done
# 4) Make sure there's a declaration for stage!
	@echo "var stage = jetlag.stage;" >> $@
	@sort -u $@ > $@.tmp
	@mv $@.tmp $@
# 5) Concatenate the transpiled JavaScript into the output JS file
	@cat $@.nodeps.js >> $@
# 6) Make sure that initializeAndLaunch passes a new init_stage() method to
#    patch the stage singleton
	@echo 'function init_stage() { stage = jetlag.stage; }' >> $@
	@sed -i -E 's/(initializeAndLaunch.*)\);/\1, init_stage);/' $@
# 7) Fix the assets line
	@sed -i -E 's|prefix: "./assets/"|prefix: "../assets/"|' $@
# 8) Clean up
	@rm -f $@.deps $@.nodeps.js $@.nodeps.ts $@.merged

%.iframe.html: %.html
# 1) Transform the HTML file so it includes the iife and treats the
#    tutorial script as a module
	@sed "s|script src|script type=\"module\" src|" $< > $@
	@sed -i 's|<head>|<head><script src="../jetlag.js"></script>|' $@
# 2) Make sure the HTML file path to `assets` is updated
	@sed -i "s|assets|../assets|g" $@

# TODO: This has not been tested with common.ts
# TODO: This has not been tested for stage_transitions
