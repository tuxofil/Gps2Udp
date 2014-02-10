package com.tuxofil.android;

import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.net.InetAddress;

/**
 * Separate thread which reads Geo location and send
 * it periodically to the remote server.
 */
public class Gps2UdpSendThread extends Thread {

    private Gps2UdpService master;

    /**
     * Constructor.
     */
    public Gps2UdpSendThread(Gps2UdpService master) {
	this.master = master;
    }

    /**
     * Thread entry point.
     */
    @Override
    public void run() {
	Config config = master.getConfig();
	while (config.isEnabled()) {
	    send(config.getHost(), config.getPort(),
		 getLocation().concat("\n"));
	    try {
		sleep(config.getPeriod() * 1000);
	    } catch (InterruptedException e) {
		break;
	    }
	}
    }

    /**
     * Fetch and return encoded Geo location.
     */
    private String getLocation() {
	// TODO: implement
	return "GPS2UDP HALO";
    }

    /**
     * Send the UDP datagram to the remote server.
     */
    private void send(String host, int port, String message) {
	try {
	    byte[] bytes = message.getBytes();
	    InetAddress address = InetAddress.getByName(host);
	    DatagramPacket packet =
		new DatagramPacket(bytes, bytes.length, address, port);
	    DatagramSocket socket = new DatagramSocket();
	    socket.send(packet);
	    socket.close();
	} catch (Exception e) {
	    System.err.println(e);
	}
    }
}
