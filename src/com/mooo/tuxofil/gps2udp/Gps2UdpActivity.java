package com.mooo.tuxofil.gps2udp;

import android.view.View;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;

import android.widget.ToggleButton;
import android.widget.EditText;

/**
 * Represents application's user interface.
 */
public class Gps2UdpActivity extends Activity {

    private Gps2UdpAlarmReceiver receiver;

    /**
     * Called when the activity is first created.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        receiver = new Gps2UdpAlarmReceiver();
        Config config = new Config(this);
        ((ToggleButton) findViewById(R.id.btn_enabled)).
            setChecked(config.isEnabled());
        ((EditText) findViewById(R.id.dst_host)).
            setText(config.getHost());
        ((EditText) findViewById(R.id.dst_port)).
            setText(String.valueOf(config.getPort()));
        ((EditText) findViewById(R.id.send_period)).
            setText(String.valueOf(config.getPeriod()));
    }

    /**
     * Called when the activity is lost the focus
     * but is still visible to the user.
     */
    @Override
    public void onPause() {
        super.onPause();
        applyConfigs();
    }

    /**
     * Called when Enable/Disable button clicked.
     */
    public void onOnOffClicked(View view) {
        applyConfigs();
        setDaemonEnabled(true);
    }

    /**
     * Called when Apply button clicked.
     */
    public void onApplyClicked(View view) {
        applyConfigs();
    }

    /**
     * Validate the configuration values from the form
     * and store them to the application's persistent storage.
     */
    private void applyConfigs() {
        boolean enabled =
            ((ToggleButton) findViewById(R.id.btn_enabled)).isChecked();
        String host = _getText(R.id.dst_host);
        int port = Integer.parseInt(_getText(R.id.dst_port));
        if (port < 1) port = 1;
        if (port >= 0xffff) port = 0xffff - 1;
        int period = Integer.parseInt(_getText(R.id.send_period));
        if (period < 1) period = 1;
        (new Config(this)).set(enabled, host, port, period);
    }

    /**
     * Return the text from the text field.
     */
    private String _getText(int id) {
        return ((EditText) findViewById(id)).getText().toString();
    }

    /**
     * Enable or disable the daemon according to the argument value.
     */
    private void setDaemonEnabled(boolean enabled) {
        receiver.schedule(this);
    }
}
