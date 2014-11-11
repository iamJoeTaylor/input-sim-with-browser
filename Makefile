NPMBIN = $(shell npm bin)
ESNEXT = find . -name '*.js' && $(NPMBIN)/esnext -o ../lib $$(find . -name '*.js')
MODULES = $(NPMBIN)/compile-modules convert -I lib -f bundle -o dist/index.js

all: clean dist test

build_source:
	cd src && $(ESNEXT)

lib:
	cd lib && $(ESNEXT)

dist: build_source
	$(MODULES) input-sim-with-browser.umd

test:
	$(NPMBIN)/mocha

clean_lib:
	@mkdir -p lib
	cd lib && find . -name '*.js' | xargs rm || true

clean_dist:
	@mkdir -p dist
	cd dist && find . -name '*.js*' | xargs rm || true

clean: clean_dist clean_lib

.PHONY: clean_lib clean lib test

