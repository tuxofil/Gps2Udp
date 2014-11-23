#!/usr/bin/env python

"""
Receive Geo location data from the Gps2Udp Android application
and forward them to the stdout line by line.
"""

import getopt
import os.path
import socket
import sys

DEFAULT_PORT = 5000


def usage(exitcode = 1):
    """
    Show usage info and exit.
    """
    argv0 = os.path.basename(sys.argv[0])
    print 'Usage: {0} [options]'.format(argv0)
    print '  Options:'
    print '    --port=N   UDP port number to listen. Default is 5000.'
    sys.exit(exitcode)


def main():
    """
    Entry point.
    """
    try:
        cmd_opts, _cmd_args = getopt.getopt(
            sys.argv[1:], '', ['port='])
    except getopt.GetoptError as exc:
        print str(exc)
        usage()
    cmd_opts = dict(cmd_opts)
    port = int(cmd_opts.get('--port', str(DEFAULT_PORT)))
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(('', port))
    while True:
        data, _addr = sock.recvfrom(100)
        try:
            tokens = data.split(' ')
            _time = int(tokens[0])
        except Exception:
            continue
        sys.stdout.write(data)
        sys.stdout.flush()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(1)
