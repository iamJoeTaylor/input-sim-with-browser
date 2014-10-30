NPMBIN = $(shell npm bin)

all: build

ESNEXT = find . -name '*.js' && $(NPMBIN)/esnext -o ../ $$(find . -name '*.js')

build:
	cd lib && $(ESNEXT)

