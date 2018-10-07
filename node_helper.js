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
var Fetcher = require("./fetcher.js");
var validUrl = require("valid-url");

module.exports = NodeHelper.create({
    start: function () {
		console.log("Starting module: " + this.name);
        this.started = false;
    },
    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'INIT' && this.started == false) {
			const url = 'http://' + payload["HUE_BRIDGE_IP"] + '/api/' + payload["HUE_USER_ID"] + '/sensors/' + payload["HUE_SENSOR_ID"];
			this.createFetcher(url)
            this.started = true;

        }
    },
	createFetcher: function(hue_url) {
		var self = this;

		var url = hue_url || "";
		const reloadInterval = 800;

		if (!validUrl.isUri(url)) {
			self.sendSocketNotification("INCORRECT_URL", url);
			return;
		}

		var fetcher;
		
		console.log("Create new fetcher for url: " + url + " - Interval: " + reloadInterval);
		fetcher = new Fetcher(url, reloadInterval);
		/*
		fetcher.onReceive(function(fetcher) {
			self.broadcastFeeds();
		});
		*/
		fetcher.onError(function(fetcher, error) {
			self.sendSocketNotification("FETCH_ERROR", {
				url: fetcher.url(),
				error: error
			});
		});

		fetcher.startFetch();
	},

});
