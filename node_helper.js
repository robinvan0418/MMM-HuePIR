'use strict';

/* Magic Mirror
* Module: MMM-HuePIR
*
* By Robin Van
* MIT Licensed.
*/

const NodeHelper = require('node_helper');
const exec = require('child_process').exec;
const http = require('http');

module.exports = NodeHelper.create({
    start: function () {
        this.started = false;
    },

    activateMonitor: function () {
        // Check if hdmi output is already on
        exec("/usr/bin/vcgencmd display_power").stdout.on('data', function(data) {
            if (data.indexOf("display_power=0") === 0)
                exec("/usr/bin/vcgencmd display_power 1", null);
        })
    },

    deactivateMonitor: function () {
        exec("/usr/bin/vcgencmd display_power 0", null);
    },

    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'CONFIG' && this.started == false) {
            const self = this;
            this.config = payload;

            // Detect movement
            setInterval(function (err, value) {
				const url = 'http://' + this.config.HUE_BRIDGE_IP + '/api/' + this.config.HUE_USER_ID + '/sensors/' + this.config.HUE_SENSOR_ID;
                http.get(url, (res) => {
                    let rawData = '';
                    res.on('data', (chunk) => {rawData += chunk;});
                    res.on('end', () => {
                        try {
                            const parsedData = JSON.parse(rawData);
                            var status = parsedData.state.presence;
                            console.log(status);
                            if (status) {
								activateMonitor();
                                //exec("/usr/bin/vcgencmd display_power 1", null);
                            	console.log('display should be powered');
							}
                            else {
                                deactivateMonitor()
                                //exec("/usr/bin/vcgencmd display_power 0", null);
                            }
                        } catch (e) {
                            console.error(e.message);
                        }
                    });
                }).on('error', (e) => {
                    console.error(`Got error: ${e.message}`);
                });
            },500);

            this.started = true;

        }
    }

});
