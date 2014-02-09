package com.tuxofil.android;

import android.content.Context;
import android.preference.PreferenceManager;
import android.content.SharedPreferences;

public class Config {

    // Configuration item identifiers.
    public static final String CFG_ENABLED = "cfg_enabled";
    public static final String CFG_HOST = "cfg_host";
    public static final String CFG_PORT = "cfg_port";
    public static final String CFG_PERIOD = "cfg_period";

    // Default values for the configuration items
    private static final boolean DEF_ENABLED = false;
    private static final String DEF_HOST = "";
    private static final int DEF_PORT = 5000;
    private static final int DEF_PERIOD = 1;

    private SharedPreferences sharedPreferences;

    /**
     * Create link to the application's persistent configuration storage.
     */
    public Config(Context context) {
	sharedPreferences =
	    PreferenceManager.getDefaultSharedPreferences(context);
    }

    /**
     * Return if daemon is enabled or not.
     */
    public boolean isEnabled() {
	return sharedPreferences.getBoolean(CFG_ENABLED, DEF_ENABLED);
    }

    /**
     * Return remote host name or address.
     */
    public String getHost() {
	return sharedPreferences.getString(CFG_HOST, DEF_HOST);
    }

    /**
     * Return remote UDP port number.
     */
    public int getPort() {
	return sharedPreferences.getInt(CFG_PORT, DEF_PORT);
    }

    /**
     * Return send period.
     */
    public int getPeriod() {
	return sharedPreferences.getInt(CFG_PERIOD, DEF_PERIOD);
    }

    /**
     * Set new values for the configuration items.
     */
    public void set(boolean enabled, String host, int port, int period) {
	SharedPreferences.Editor editor = sharedPreferences.edit();
	editor.putBoolean(CFG_ENABLED, enabled);
	editor.putString(CFG_HOST, host);
	editor.putInt(CFG_PORT, port);
	editor.putInt(CFG_PERIOD, period);
	editor.apply();
    }
}
