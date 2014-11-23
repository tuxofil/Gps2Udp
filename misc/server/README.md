# Gps2Udp server

Receives Geo location data from the Gps2Udp Android application
via UDP/IP and forward them to the stdout line by line.

There is some requirements to a valid incoming packet:
* it must be of form: TIMESTAMP LATITUDE LONGITUDE ACCURACY [other fields];
* TIMESTAMP is a Unix timestamp (seconds since 1 Jan 1970);
* the diff between TIMESTAMP and local time must be less
 than MAX_TIME_DIFF (the MAX_TIME_DIFF variable is defined in the gps2udp.py);
* TIMESTAMP must be greater than timestamp of a previous valid packet;
* LATITUDE is a float between [-90.0..90.0];
* LONGITUDE is a float between [-180.0..180.0];
* ACCURACY is an integer between [0..MAX_ACCURACY]. MAX_ACCURACY variable
 is defined in the gps2udp.py.

If any of the requirements are not met, the packet will be silently ignored.

## Signed mode

When started with --signed command line option, an extra field must
be defined in each incoming UDP packet - DIGEST. With the field common
packet format must be of form:

```
TIMESTAMP LATITUDE LONGITUDE ACCURACY DIGEST
```

DIGEST - is a SHA1 from "TIMESTAMP LATITUDE LONGITUDE ACCURACY" + secret
string known only by Gps2Udp client (Android app) and the server. The
server reads the secret from GPS2UDP_SECRET environment variable.

Important notes. When in _--signed_ mode:
* any packet without the digest will be ignored;
* any packet with digest not matched with digest calculated on the
 server side, will be ignored;
* if the secret is not defined (GPS2UDP_SECRET environment variable is not
 set or empty), no packets will be matched as valid.

## Requirements

* Python 2.7 or later.

## Run

```sh
$ ./gps2udp.py [--port=PortNumber] >> file.txt
```

Default UDP port number to listen to is 5000.

## Test

```sh
$ ./gps2udp_test.py
```
