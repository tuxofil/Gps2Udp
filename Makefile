PROJECT = Gps2Udp

.PHONY: all clean dist-clean install reinstall

all: debug

# build Debug APK (unsigned)
debug:
	ant debug

clean:
	ant clean

# install the Debug APK to the running Android emulator
install: debug
	adb install bin/$(PROJECT)-debug.apk

# reinstall the Debug APK to the running Android emulator
reinstall: debug
	adb install -r bin/$(PROJECT)-debug.apk

dist-clean: clean
	find . -name \*~ -delete
	rm -rf -- bin gen libs local.properties
