package com.mooo.tuxofil.gps2udp;

import java.util.Locale;

import android.content.BroadcastReceiver;
import android.app.AlarmManager;
import android.content.Intent;
import android.content.Context;
import android.app.PendingIntent;
import android.os.SystemClock;

import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.net.InetAddress;

import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;

/**
 * Implements alarm receiver and facility to enable/disable
 * the periodic alarms.
 */
public class Receiver extends BroadcastReceiver
    implements LocationListener {

    private Config config;
    private Context context;

    /**
     * Called each time device is waked up for alarm processing.
     */
    @Override
    public void onReceive(Context context, Intent intent) {
        LocationManager manager =
            (LocationManager)
            context.getSystemService(Context.LOCATION_SERVICE);
        this.config = new Config(context);
        this.context = context;
        manager.requestSingleUpdate(getCriteria(config), this, null);
    }

    // -------------------------------------------------------------------
    // LocationListener callbacks
    // -------------------------------------------------------------------

    public void onLocationChanged(Location location) {
        String formattedLocation = formatLocation(location);
        if(config.isSigned()){
            String secret = config.getSecret();
            if(secret.length() > 0){
                formattedLocation =
                    formattedLocation + " " +
                    sha1(formattedLocation + secret);
                send(config.getHost(), config.getPort(),
                     formattedLocation + "\n");
            }
        }else{
            send(config.getHost(), config.getPort(),
                 formattedLocation + "\n");
        }
        schedule(context);
    }

    public void onProviderDisabled(String provider) {
    }

    public void onProviderEnabled(String provider) {
    }

    public void onStatusChanged(String provider, int status,
                                  Bundle extras) {
    }

    // -------------------------------------------------------------------
    // Auxiliary private methods
    // -------------------------------------------------------------------

    /**
     * Create a location provider criteria object.
     */
    private Criteria getCriteria(Config config) {
        Criteria criteria = new Criteria();
        // common requirements
        criteria.setBearingAccuracy(Criteria.NO_REQUIREMENT);
        criteria.setBearingRequired(false);
        criteria.setCostAllowed(config.isPaidSources());
        criteria.setSpeedAccuracy(Criteria.NO_REQUIREMENT);
        criteria.setSpeedRequired(false);
        criteria.setVerticalAccuracy(Criteria.NO_REQUIREMENT);
        criteria.setAltitudeRequired(false);
        if(config.isBestAccuracy()){
            // for the best accuracy
            criteria.setAccuracy(Criteria.ACCURACY_FINE);
            criteria.setHorizontalAccuracy(Criteria.ACCURACY_HIGH);
            criteria.setPowerRequirement(Criteria.POWER_HIGH);
        }else{
            criteria.setAccuracy(Criteria.ACCURACY_COARSE);
            criteria.setHorizontalAccuracy(Criteria.ACCURACY_LOW);
            criteria.setPowerRequirement(Criteria.POWER_LOW);
        }
        return criteria;
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
     * Format Location to a string.
     */
    private String formatLocation(Location location) {
        long time = location.getTime() / 1000;
        float accuracy = -1;
        if(location.hasAccuracy())
            accuracy = location.getAccuracy();
        double latitude = location.getLatitude();
        double longitude = location.getLongitude();
        return
            String.valueOf(time) + " " +
            String.format(Locale.US, "%1.6f %1.6f",
                          latitude, longitude) + " " +
            String.valueOf((long)accuracy);
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

    /**
     * Return hex digest for the string.
     */
    private String sha1(String data){
        try{
            MessageDigest h = MessageDigest.getInstance("SHA-1");
            h.reset();
            h.update(data.getBytes("UTF-8"));
            return new BigInteger(1, h.digest()).toString(16).toLowerCase();
        }catch(NoSuchAlgorithmException exc){
            exc.printStackTrace();
        }catch(UnsupportedEncodingException exc){
            exc.printStackTrace();
        }
        return null;
    }
}
