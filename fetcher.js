const http = require('http');
const exec = require('child_process').exec;

var Fetcher = function(url, reloadInterval) {
	var self = this;
	if (reloadInterval < 800) {
		reloadInterval = 800;
	}
	var reloadTimer = null;
	var fetchFailedCallback = function() {};
	var itemsReceivedCallback = function() {};
	
	/** private methods **/
	var fetchNews = function() {
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
								self.setReloadInterval(2*60*1000);
							}
						})
					}
                    else {
                        //deactivateMonitor
						exec("/usr/bin/vcgencmd display_power=1").stdout.on('data', function(data) {
							console.log('deactivating monitor');
							exec("/usr/bin/vcgencmd display_power 0", null);
							self.setReloadInterval(800);
						})
                    }
                } catch (e) {
                    console.error(e.message);
					self.setReloadInterval(800);
                }
				scheduleTimer();
            });
        }).on('error', (e) => {
			fetchFailedCallback(self, e);
			scheduleTimer();
        });
	}

	/* scheduleTimer()
	 * Schedule the timer for the next update.
	 */

	var scheduleTimer = function() {
		//console.log('Schedule update timer.');
		clearTimeout(reloadTimer);
		reloadTimer = setTimeout(function() {
			fetchNews();
		}, reloadInterval);
	};

	/* public methods */

	/* setReloadInterval()
	 * Update the reload interval.
	 *
	 * attribute interval number - Interval for the update in milliseconds.
	 */
	this.setReloadInterval = function(interval) {
		if (interval > 800) {
			console.log('adjusting timeout to ms: ' + interval);
			reloadInterval = interval;
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