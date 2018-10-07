const http = require('http');
const exec = require('child_process').exec;

var Fetcher = function(url, reloadInterval) {
	var self = this;
	if (reloadInterval < 800) {
		reloadInterval = 800;
	}
	var reloadTimer = null;
	var reloadTimers = [];
	var fetchFailedCallback = function() {};
	var itemsReceivedCallback = function() {};
	
	/** private methods **/
	var fetchNews = function() {
		clearAllTimeouts();
		http.get(url, (res) => {
            let rawData = '';
            res.on('data', (chunk) => {rawData += chunk;});
            res.on('end', () => {
                try {
					const parsedData = JSON.parse(rawData);
                    var status = parsedData.state.presence;
                    console.log(status);
                    if (status) {
						//activateMonitor
						// Check if hdmi output is already on
						exec("/usr/bin/vcgencmd display_power").stdout.on('data', function(data) {
							if (data.indexOf("display_power=0") === 0){
								console.log('activating monitor');
								exec("/usr/bin/vcgencmd display_power 1", null);
								self.setReloadInterval(1*60*1000);
								scheduleTimer();
							}
						})
					}
                    else {
                        //deactivateMonitor
						exec("/usr/bin/vcgencmd display_power").stdout.on('data', function(data) {
							if (data.indexOf("display_power=1") === 0){
								console.log('deactivating monitor');
								exec("/usr/bin/vcgencmd display_power 0", null);
								self.setReloadInterval(800);
								scheduleTimer();
							}
						})
                    }
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
			fetchFailedCallback(self, e);
        });
	}

	/* scheduleTimer()
	 * Schedule the timer for the next update.
	 */

	var scheduleTimer = function() {
		//console.log('Schedule update timer.');
		console.log('Schedule timer with interval ms: ' +reloadInterval);
		//clearTimeout(reloadTimer);
		clearAllTimeouts();
		reloadTimer = setTimeout(function() {
			fetchNews();
		}, reloadInterval);
		reloadTimers.push(reloadTimer);
	};
	
	var clearAllTimeouts = function() {
		for (timer in reloadTimers) {
			console.log(reloadTimers[timer]);
			clearTimeout(reloadTimers[timer]);
		}
		reloadTimers = [];
	}

	/* public methods */

	/* setReloadInterval()
	 * Update the reload interval.
	 *
	 * attribute interval number - Interval for the update in milliseconds.
	 */
	this.setReloadInterval = function(interval) {
		if (interval != reloadInterval) {
			if (interval >= 800) {
				console.log('adjusting timeout to ms: ' + interval);
				reloadInterval = interval;
			} else {
				console.log('adjusting timeout to default ms: 800');
				reloadInterval = 800;
			}
		}
	};

	/* startFetch()
	 * Initiate fetchNews();
	 */
	this.startFetch = function() {
		fetchNews();
	};

	this.onReceive = function(callback) {
		itemsReceivedCallback = callback;
	};

	this.onError = function(callback) {
		fetchFailedCallback = callback;
	};

	this.url = function() {
		return url;
	};

	this.items = function() {
		return items;
	};
}
module.exports = Fetcher;