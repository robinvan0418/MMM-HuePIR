/* global Module */

/* Magic Mirror
* Module: MMM-HuePIR
*
* By Robin Van
* MIT Licensed.
*/

Module.register('MMM-HuePIR',{
	requiresVersion: '2.1.0',
	defaults: {
		HUE_BRIDGE_IP: "",
		HUE_USER_ID: "",
		HUE_SENSOR_ID: 10
	},

	start: function () {
		this.sendSocketNotification('INIT', this.config);
		Log.info('Starting module: ' + this.name);
	}
});
