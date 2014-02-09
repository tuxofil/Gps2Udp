package com.tuxofil.android;

import android.app.Service;
import android.content.Intent;
import android.content.Context;
import android.widget.Toast;
import android.os.IBinder;

import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.net.InetAddress;

public class Gps2UdpService extends Service {

    public static final String ACTION_START =
	"com.tuxofil.android.gps2udp.action.START";
    public static final String ACTION_STOP =
	"com.tuxofil.android.gps2udp.action.STOP";

    private final class Payload extends Thread {

	/**
	 * Thread entry point.
	 */
	@Override
	public void run() {
	    while (! stop) {
		send(config.getHost(), config.getPort(), "GPS2UDP HALO\n");
		try {
		    sleep(config.getPeriod() * 1000);
		} catch (InterruptedException e) {
		    break;
		}
	    }
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

    private Config config;
    private Payload payload = new Payload();
    private boolean stop = false;

    /**
     * Called each time Context.startService(Intent) is called.
     */
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
	return START_STICKY;
    }

    /**
     * Called only once while starting the service.
     */
    @Override
    public void onCreate() {
	config = new Config(this);
	stop = false;
	payload.start();
	popUp("GPS 2 UDP Daemon Started");
    }

    /**
     * Called when the service is to be destroyed.
     */
    @Override
    public void onDestroy() {
	stop = true;
	try {
	    payload.join();
	} catch (InterruptedException e) {
	    popUp("GPS 2 UDP: join interrupted");
	}
	popUp("GPS 2 UDP Daemon Terminated");
    }

    /**
     * Do not allow to bind to the service.
     */
    @Override
    public IBinder onBind(Intent intent) {
	return null;
    }

    /**
     * Show a tiny popup notification.
     */
    private void popUp(CharSequence message) {
	Context context = getApplicationContext();
	int duration = Toast.LENGTH_SHORT;
	Toast toast = Toast.makeText(context, message, duration);
	toast.show();
    }
}
