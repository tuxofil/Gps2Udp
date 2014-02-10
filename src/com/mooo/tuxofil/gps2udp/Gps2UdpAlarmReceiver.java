package com.mooo.tuxofil.gps2udp;

import android.content.BroadcastReceiver;
import android.app.AlarmManager;
import android.content.Intent;
import android.content.Context;
import android.app.PendingIntent;
import android.os.SystemClock;

import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.net.InetAddress;

/**
 * Implements alarm receiver and facility to enable/disable
 * the periodic alarms.
 */
public class Gps2UdpAlarmReceiver extends BroadcastReceiver {

    /**
     * Called each time device is waked up for alarm processing.
     */
    @Override
    public void onReceive(Context context, Intent intent) {
        Config config = new Config(context);
        send(config.getHost(), config.getPort(), getLocation());
        schedule(context);
    }

    /**
     * Schedule next alarm according to current configuration.
     * The method called:
     *   - after device boot;
     *   - when user enables the daemon with UI;
     *   - each time after data sent.
     */
    public void schedule(Context context) {
        Config config = new Config(context);
        AlarmManager alarmManager =
            (AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, getClass());
        PendingIntent pendingIntent =
            PendingIntent.getBroadcast(context, 0, intent, 0);
        if (config.isEnabled()) {
            long current_time = SystemClock.elapsedRealtime();
            long period_millis = config.getPeriod() * 1000;
            alarmManager.set(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                             current_time + period_millis,
                             pendingIntent);
        } else {
            alarmManager.cancel(pendingIntent);
        }
    }

    /**
     * Fetch and return encoded Geo location.
     */
    private String getLocation() {
        String time = String.valueOf(System.currentTimeMillis() / 1000);
        // TODO: implement
        return time + " GPS2UDP HALO\n";
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
