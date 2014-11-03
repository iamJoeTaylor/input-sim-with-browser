NPMBIN = $(shell npm bin)

all: build test

ESNEXT = find . -name '*.js' && $(NPMBIN)/esnext -o ../ $$(find . -name '*.js')

build:
	cd lib && $(ESNEXT)

test:
	$(NPMBIN)/mocha
