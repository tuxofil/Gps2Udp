#!/usr/bin/env python

"""
Unit test for the Gps2Udp server.
"""

import gps2udp
import hashlib
import os
import time
import unittest


class TestGps2UdpServer(unittest.TestCase):
    """
    Unit test for the Gps2Udp server internal functions.
    """

    def test_parse_packet(self):
        """
        Test the gps2udp.parse_packet() function
        """
        # reset internal state of the gps2udp module
        gps2udp.LAST_TIMESTAMP = None
        # bad timestamp
        time_from_the_past = int(time.time()) - gps2udp.MAX_TIME_DIFF * 2
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(time_from_the_past) + ' 1.1 2.2 2')
        time_from_the_future = int(time.time()) + gps2udp.MAX_TIME_DIFF * 2
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(time_from_the_future) + ' 1.1 2.2 2')
        # bad token number
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet, '')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 1.1 2.2')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 1.1')
        # bad latitude
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' z 2.2 2')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' -91.0 2.2 2')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 91.0 2.2 2')
        # bad longitude
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 1.1 z 2')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 1.1 -181.0 2')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 1.1 181 2')
        # bad accuracy
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 1.1 2.2 z')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 1.1 2.2 3.3')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(int(time.time())) + ' 1.1 2.2 -1')
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            (str(int(time.time())) + ' 1.1 2.2 ' +
             str(gps2udp.MAX_ACCURACY + 1)))
        # first valid packet
        now = int(time.time())
        self.assertDictEqual(
            {'timestamp': now,
             'latitude': 1.1,
             'longitude': 2.2,
             'accuracy': 3},
            gps2udp.parse_packet('%r 1.1 2.2 3' % now))
        # second valid packet (timestamp greater than previous)
        self.assertDictEqual(
            {'timestamp': now + 1,
             'latitude': 1.1,
             'longitude': 2.2,
             'accuracy': 3},
            gps2udp.parse_packet('%r 1.1 2.2 3' % (now + 1)))
        # not valid packet (timestamp is less than previous)
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            '%r 1.1 2.2 3' % now)
        # not valid packet (timestamp is equal with previous)
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            '%r 1.1 2.2 3' % (now + 1))
        # valid packet again (timestamp is greater than previous valid)
        self.assertDictEqual(
            {'timestamp': now + 2,
             'latitude': 1.1,
             'longitude': 2.2,
             'accuracy': 3},
            gps2udp.parse_packet('%r 1.1 2.2 3' % (now + 2)))
        # bad packet: timestamp is greater than previous, but
        # too big to satisfy MAX_TIME_DIFF
        time_from_the_future = int(time.time()) + gps2udp.MAX_TIME_DIFF * 2
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(time_from_the_future) + ' 1.1 2.2 3')


    def test_parse_packet_signed(self):
        """
        Test the gps2udp.parse_packet() function
        in the SIGNED mode.
        """
        # reset internal state of the gps2udp module
        gps2udp.LAST_TIMESTAMP = None
        # set the secret
        secret = sha1(str(time.time()))
        os.environ['GPS2UDP_SECRET'] = secret
        now = int(time.time())
        # bad packet (without the digest)
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(now) + ' 1.1 2.2 3',
            signed = True)
        # bad packet (digest is bad)
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            str(now) + ' 1.1 2.2 3 bad_digest',
            signed = True)
        # good packet
        payload = str(now) + ' 1.1 2.2 3'
        self.assertDictEqual(
            {'timestamp': now,
             'latitude': 1.1,
             'longitude': 2.2,
             'accuracy': 3},
            gps2udp.parse_packet(
                payload + ' ' + sha1(payload + secret),
                signed = True))
        # another good packet
        payload = str(now + 1) + ' 1.1 2.2 3'
        self.assertDictEqual(
            {'timestamp': now + 1,
             'latitude': 1.1,
             'longitude': 2.2,
             'accuracy': 3},
            gps2udp.parse_packet(
                payload + ' ' + sha1(payload + secret),
                signed = True))
        # bad packet again
        payload = str(now + 2) + ' 1.1 2.2 3'
        self.assertRaises(
            gps2udp.PacketParseError,
            gps2udp.parse_packet,
            payload + ' ' + sha1(payload + secret) + 'erroneous',
            signed = True)
        # another valid one, without trailing mess
        self.assertDictEqual(
            {'timestamp': now + 2,
             'latitude': 1.1,
             'longitude': 2.2,
             'accuracy': 3},
            gps2udp.parse_packet(
                payload + ' ' + sha1(payload + secret),
                signed = True))


    def test_format_packet(self):
        """
        Test the gps2udp.parse_packet() function
        """
        self.assertEqual(
            '123456 2.3456789 3.4567890 456\n',
            gps2udp.format_packet(
                {'timestamp': 123456,
                 'latitude': 2.3456789012,
                 'longitude': 3.4567890123,
                 'accuracy': 456}))
        self.assertEqual(
            '654321 -2.0000000 3.4567890 456\n',
            gps2udp.format_packet(
                {'timestamp': 654321,
                 'latitude': -2,
                 'longitude': 3.4567890123,
                 'accuracy': 456}))


def sha1(data):
    """
    Return SHA1 digest for the string
    """
    h = hashlib.sha1()
    h.update(data)
    return h.hexdigest()


if __name__ == '__main__':
    unittest.main(verbosity = 2)
