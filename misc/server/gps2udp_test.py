#!/usr/bin/env python

"""
Unit test for the Gps2Udp server.
"""

import gps2udp
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


if __name__ == '__main__':
    unittest.main(verbosity = 2)
