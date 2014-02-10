package com.tuxofil.android;

import android.app.Service;
import android.content.Intent;
import android.content.Context;
import android.widget.Toast;
import android.os.IBinder;

public class Gps2UdpService extends Service {

    public static final String ACTION_START =
	"com.tuxofil.android.gps2udp.action.START";
    public static final String ACTION_STOP =
	"com.tuxofil.android.gps2udp.action.STOP";

    private Gps2UdpSendThread payload;

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
	payload = new Gps2UdpSendThread(this);
	payload.start();
	popUp("GPS 2 UDP Daemon Started");
    }

    /**
     * Called when the service is to be destroyed.
     */
    @Override
    public void onDestroy() {
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

    /**
     * Getter for the configuration storage object.
     * Called from instance of Gps2UdpSendThread class to
     * obtain current configurations.
     */
    public Config getConfig() {
	return new Config(this);
    }
}
