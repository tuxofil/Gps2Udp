#!/usr/bin/env python

"""
Receive Geo location data from the Gps2Udp Android application
via UDP/IP and forward them to the stdout line by line.

There is some requirements to a valid incoming packet:
- it must be of form: TIMESTAMP LATITUDE LONGITUDE ACCURACY [other fields];
- TIMESTAMP is a Unix timestamp (seconds since 1 Jan 1970);
- the diff between TIMESTAMP and local time must be less
 than MAX_TIME_DIFF (definition of the MAX_TIME_DIFF variable see below);
- TIMESTAMP must be greater than timestamp of a previous valid packet;
- LATITUDE is a float between [-90.0..90.0];
- LONGITUDE is a float between [-180.0..180.0];
- ACCURACY is an integer between [0..MAX_ACCURACY] (definition of
 MAX_ACCURACY variable see below).

If any of the requirements are not met, the packet will be silently ignored.

When started with --signed command line option, an extra field must
be defined in each incoming UDP packet - DIGEST. With the field common
packet format must be of form:

   TIMESTAMP LATITUDE LONGITUDE ACCURACY DIGEST

DIGEST - is a SHA1 from "TIMESTAMP LATITUDE LONGITUDE ACCURACY" + secret
string known only by Gps2Udp client (Android app) and the server. The
server reads the secret from GPS2UDP_SECRET environment variable.

Important notes. When in --signed mode:
- any packet without the digest will be ignored;
- any packet with digest not matched with digest calculated on the
 server side, will be ignored;
- if the secret is not defined (GPS2UDP_SECRET environment variable is not
 set or empty), no packets will be matched as valid.
"""

import getopt
import hashlib
import os
import os.path
import socket
import sys
import time

DEFAULT_PORT = 5000

# Maximum time difference between a timestamp in a packet and
# the local Unix timestamp (in seconds).
MAX_TIME_DIFF = 60 * 5
# Maximum valid accuracy value (in meters).
MAX_ACCURACY = 10000  # 10km
# Here will be stored the timestamp of the last valid packet received.
# The timestamp will be used later to avoid receiving data from the past.
LAST_TIMESTAMP = None


def usage(exitcode = 1):
    """
    Show usage info and exit.
    """
    argv0 = os.path.basename(sys.argv[0])
    print 'Usage: {0} [options]'.format(argv0)
    print '  Options:'
    print '    --signed   check every UDP packet for digital signature;'
    print '    --port=N   UDP port number to listen. Default is 5000.'
    sys.exit(exitcode)


def main():
    """
    Entry point.
    """
    try:
        cmd_opts, _cmd_args = getopt.getopt(
            sys.argv[1:], '', ['port=', 'signed'])
    except getopt.GetoptError as exc:
        sys.stderr.write('Error: ' + str(exc) + '\n')
        usage()
    cmd_opts = dict(cmd_opts)
    port = int(cmd_opts.get('--port', str(DEFAULT_PORT)))
    signed = '--signed' in cmd_opts
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(('', port))
    while True:
        data, _addr = sock.recvfrom(100)
        try:
            result = parse_packet(data, signed)
        except PacketParseError:
            continue
        sys.stdout.write(format_packet(result))
        sys.stdout.flush()


class PacketParseError(Exception):
    """Bad packet received."""
    pass


def parse_packet(data, signed = False):
    """
    Parse and check incoming packet.
    The packet must be of form:
      TIMESTAMP LATITUDE LONGITUDE ACCURACY

    :param data: packet body
    :type data: string
    :param signed: if True, the packet will be checked for a
        valid digital signature
    :type signed: boolean
    :rtype: dict
    """
    global LAST_TIMESTAMP
    result = {}
    tokens = [elem for elem in data.split(' ') if elem]
    if signed:
        # check the signature
        if len(tokens) < 5:
            raise PacketParseError
        payload = ' '.join(tokens[:4])
        digest = tokens[4]
        secret = os.environ.get('GPS2UDP_SECRET')
        if secret is None or len(secret) == 0:
            # secret is not defined => unable to check
            raise PacketParseError
        hasher = hashlib.sha1()
        hasher.update(payload + secret)
        if hasher.hexdigest() != digest:
            # digital signature mismatch
            raise PacketParseError
    else:
        # check tokens count
        if len(tokens) < 4:
            raise PacketParseError
    # parse the tokens
    try:
        result['timestamp'] = int(tokens[0])
        result['latitude'] = float(tokens[1])
        result['longitude'] = float(tokens[2])
        result['accuracy'] = int(tokens[3])
    except ValueError:
        raise PacketParseError
    # check timestamp
    time_diff = abs(result['timestamp'] - int(time.time()))
    if time_diff > MAX_TIME_DIFF:
        # the timestamp differs from NOW for more than 5 minutes
        raise PacketParseError
    if LAST_TIMESTAMP is not None:
        if result['timestamp'] <= LAST_TIMESTAMP:
            # the timestamp is not greater than the previous timestamp
            raise PacketParseError
    # check lat&long values
    if not (-90.0 <= result['latitude'] <= 90.0):
        raise PacketParseError
    if not (-180.0 <= result['longitude'] <= 180.0):
        raise PacketParseError
    # check accuracy value
    if result['accuracy'] < 0 or result['accuracy'] > MAX_ACCURACY:
        raise PacketParseError
    # All checks is passed => packet is valid.
    # Save the timestamp in global var:
    LAST_TIMESTAMP = result['timestamp']
    return result


def format_packet(data):
    """
    Format received packet for the stdout.

    :param data: packet data
    :type data: dict
    :rtype: string
    """
    return (str(data['timestamp']) + ' ' +
            format(data['latitude'], '.7f') + ' ' +
            format(data['longitude'], '.7f') + ' ' +
            str(data['accuracy']) + '\n')


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(1)
