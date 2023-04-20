/* MagicMirror²
 * Module: Compliments
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("compliments", {
	// Module config defaults.
	defaults: {
		compliments: {
			anytime: ["Hallo Dennis !", "Looking good!", "Willst du dir den Tag versauen,\n musst du in den Spiegel schauen", "You look symmetrical!",
				 "You have cute elbows.\n For reals!","Life is short...\ Smile while you still have teeth !", "You may not be perfect,\n but at least you're limited edition !",
				"Es gibt keinen Ort wie Zuhause !", "Ich atme. \n Produktiver wird es heute nicht !", "Let's goo!", "Looking good today!","I see a lot of my self in you.",
				"My man!", "Hanging out with you\n is always a blast", "Moin Meister!", "HEEEEELLLPP!!!! I'm trapped!!!!!", "I could just hang here all day!",
				"I need some time to reflect...", "Say what you want about the deaf.", "Wenn man nachts nichts essen soll,\n warum gibt es dann Licht im Kühlschrank?", "UnAaronlos \n --Julian", "Erinnerung: Keine Pflaumen \n liegen lassen \n wenn Kamila da ist", "Langsam aber Sicher \n Wilde Dilane", "Wenn der Tag nicht mit Vodka \n begonnen hat dann hat er \n noch nicht angefangen -Kamila", "SPD \n -Franky", "Hier ist der Einzigware \n Denniiiiiis Fischer \n Voll eingebildet hat er \n selber geschrieben xD", "Wie kann man gleichzeitig so \n Fett und so Dumm sein \n wie Dei Mudaaa \n -Linda", "Das klingt vernünftig \n -Franky", "Alright Leude \n -Aaron", "12h durch die Wüste wandern? \n Da seh ich mich!! \n -Juli"],
			morning: ["Guten morgen Dennis!", "Hab nen nicen Tag!", "Gut geschlafen?", "Alles wird gut... KAFFEE !", "Back so soon? \n Don't you have something to do?"],
			afternoon: ["Servus Dennis", "Mahlzeit würd ich sagen!", "Back so soon? \nDon't you have something to do?",
				 "Du brauchst eine Pause von deiner Pause\n --Aaron", "Ich kam, sah und vergaß, was ich vorhatte."],
			evening: ["It's Party time!", "If I could high five you... I would, I promise.", "There is always a party\ with you here.", "Slaap Lekker !",
				 "\"Trust me, you can dance.\" -Vodka", "Anyways, I came.\n I saw. I left early", "Aaron was here",
				 "I have a drinking problem,\n I can’t afford it.", "The only mystery in life is\n why the kamikaze pilots wore helmets.",
				  ,"Ich kam, sah und vergaß,\n was ich vorhatte."],
			night: ["Zeit zum schlafen !", "Schon Zeit zum schlafen ?", "Looks like it's fuck this shit o'clock", "00:02 Leusden... \n Niemand --> -.- Nick --> 😝", "Surprise Motherfucker"],
			"....-01-01": ["Happy new year!", "Frohes Neues !", "Party, Benaglos, Achtarmig einen reinorgeln!!"],
			"....-04-09": ["Happy Birthday!"],
			"....-12-24": ["Frohe Weihnachten", "Finally Weihnachten"],
			"....-10-31": ["Happy Halloween!", "Und diesmal ein neues Kostüm ;)"]
		},
		updateInterval: 15000,
		remoteFile: null,
		fadeSpeed: 4000,
		morningStartTime: 4,
		morningEndTime: 13,
		afternoonStartTime: 13,
		afternoonEndTime: 20,
		eveningStartTime:20,
		eveningEndTime: 0,
		nightStartTime: 0,
		nightEndTime: 4,
		random: true,
		mockDate: null
	},
	lastIndexUsed: -1,
	// Set currentweather from module
	currentWeatherType: "",

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);

		this.lastComplimentIndex = -1;

		if (this.config.remoteFile !== null) {
			this.complimentFile((response) => {
				this.config.compliments = JSON.parse(response);
				this.updateDom();
			});
		}

		// Schedule update timer.
		setInterval(() => {
			this.updateDom(this.config.fadeSpeed);
		}, this.config.updateInterval);
	},

	/**
	 * Generate a random index for a list of compliments.
	 *
	 * @param {string[]} compliments Array with compliments.
	 * @returns {number} a random index of given array
	 */
	randomIndex: function (compliments) {
		if (compliments.length === 1) {
			return 0;
		}

		const generate = function () {
			return Math.floor(Math.random() * compliments.length);
		};

		let complimentIndex = generate();

		while (complimentIndex === this.lastComplimentIndex) {
			complimentIndex = generate();
		}

		this.lastComplimentIndex = complimentIndex;

		return complimentIndex;
	},

	/**
	 * Retrieve an array of compliments for the time of the day.
	 *
	 * @returns {string[]} array with compliments for the time of the day.
	 */
	complimentArray: function () {
		const hour = moment().hour();
		const date = this.config.mockDate ? this.config.mockDate : moment().format("YYYY-MM-DD");
		let compliments;

		if (hour >= this.config.morningStartTime && hour < this.config.morningEndTime && this.config.compliments.hasOwnProperty("morning")) {
			compliments = this.config.compliments.morning.slice(0);
		} else if (hour >= this.config.afternoonStartTime && hour < this.config.afternoonEndTime && this.config.compliments.hasOwnProperty("afternoon")) {
			compliments = this.config.compliments.afternoon.slice(0);
		} else if (this.config.compliments.hasOwnProperty("evening")) {
			compliments = this.config.compliments.evening.slice(0);
		}

		if (typeof compliments === "undefined") {
			compliments = [];
		}

		if (this.currentWeatherType in this.config.compliments) {
			compliments.push.apply(compliments, this.config.compliments[this.currentWeatherType]);
		}

		compliments.push.apply(compliments, this.config.compliments.anytime);

		for (let entry in this.config.compliments) {
			if (new RegExp(entry).test(date)) {
				compliments.push.apply(compliments, this.config.compliments[entry]);
			}
		}

		return compliments;
	},

	/**
	 * Retrieve a file from the local filesystem
	 *
	 * @param {Function} callback Called when the file is retrieved.
	 */
	complimentFile: function (callback) {
		const xobj = new XMLHttpRequest(),
			isRemote = this.config.remoteFile.indexOf("http://") === 0 || this.config.remoteFile.indexOf("https://") === 0,
			path = isRemote ? this.config.remoteFile : this.file(this.config.remoteFile);
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState === 4 && xobj.status === 200) {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

	/**
	 * Retrieve a random compliment.
	 *
	 * @returns {string} a compliment
	 */
	randomCompliment: function () {
		// get the current time of day compliments list
		const compliments = this.complimentArray();
		// variable for index to next message to display
		let index;
		// are we randomizing
		if (this.config.random) {
			// yes
			index = this.randomIndex(compliments);
		} else {
			// no, sequential
			// if doing sequential, don't fall off the end
			index = this.lastIndexUsed >= compliments.length - 1 ? 0 : ++this.lastIndexUsed;
		}

		return compliments[index] || "";
	},

	// Override dom generator.
	getDom: function () {
		const wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright pre-line";
		// get the compliment text
		const complimentText = this.randomCompliment();
		// split it into parts on newline text
		const parts = complimentText.split("\n");
		// create a span to hold it all
		const compliment = document.createElement("span");
		// process all the parts of the compliment text
		for (const part of parts) {
			// create a text element for each part
			compliment.appendChild(document.createTextNode(part));
			// add a break `
			compliment.appendChild(document.createElement("BR"));
		}
		// remove the last break
		compliment.lastElementChild.remove();
		wrapper.appendChild(compliment);

		return wrapper;
	},

	// From data currentweather set weather type
	setCurrentWeatherType: function (type) {
		this.currentWeatherType = type;
	},

	// Override notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification === "CURRENTWEATHER_TYPE") {
			this.setCurrentWeatherType(payload.type);
		}
	}
});
