"use strict";

// key / gamepad events
document.body.addEventListener("keydown", event => simKey.check(event, true));
document.body.addEventListener("keyup", event => simKey.check(event, false));
window.addEventListener("gamepadconnected", () =>
{
	simKey.gamepad = true;
	simKey.gamepadCheck();
});
window.addEventListener("gamepaddisconnected", () =>
{
	simKey.gamepad = false;
	cancelAnimationFrame(simKey.gamepadAnim);
});


const simKey =
{
	name: undefined,
	map: {},  // key mappings for each input
	active: {},  // boolean for if each input is active
	used: {},  // boolean for each input that resets to false on each input reactivation. code can set to true and wait for change

	mapGamepad: {},  // gamepad mappings for each input
	mapActive: {}, // toggle for if each input group is polled or not


	// === TO DO ===
	// inputs that call functions when pressed
	mapFunc: {},  // functions to be triggered when inputs are active
	/*simKey.link([
			["ArrowLeft", () => boxAction.move(box.selectedEle, [-1, 0])],
			["ArrowRight", () => boxAction.move(box.selectedEle, [1, 0])],
			["ArrowUp", () => boxAction.move(box.selectedEle, [0, -1])],
			["ArrowDown", () => boxAction.move(box.selectedEle, [0, 1])]
			]);*/
	// make it a map (like, the JS object)
	// map.get on input, and if the returned value is a function, input it

	// lastUsed: [undefined, undefined, undefined, undefined],

	// keyboard modifier keys, free of access
	ctrl: false,
	alt: false,
	shift: false,
	space: false,

	mapDefault:
	{
		menu:
		{
			up: [], left: [], down: [], right: [],
			enter: ["Enter", " ", "_B0"],
			back: ["Backspace", "Escape", "_B1"],
			_sim_buttons: ["arrow->[axis]", "WASD->[axis]", "dpad->[axis]"],
			_sim_stick: ["_A0_.3->[axis]", "_A1_.3->[axis]"],
		}
	},
	gamepad: false,
	gamepadAnim: undefined,
	preset:
	{
		WASD: ["w", "a", "s", "d"],
		arrow: ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"],
		face: ["_B0", "_B1", "_B2", "_B3"],
		dpad: ["_B12", "_B14", "_B13", "_B15"],
		shoulder: ["_B4", "_B5"],
		trigger: ["_B6", "_B7"],
		shoulder_trigger: ["_B4", "_B5", "_B6", "_B7"]
	},
	icons: new Map([
		["ArrowLeft", "←"],
		["ArrowDown", "↓"],
		["ArrowUp", "↑"],
		["ArrowRight", "→"],
		["Enter", "↵"],
		["Backspace", "⇤"],
		["Escape", "Esc"],
		[" ", "Space"]
	]),


	setup: function(jsonInput)
	{
		let json;

		// if JSON data is given as parameter, parse it
		if (jsonInput !== undefined)
		{ json = JSON.parse(jsonInput); }
		// else, use preset defaults
		else
		{ json.key = this.mapDefault; }

		this.name = json.name;

		for (let x in json.key)
		{
			this.active[x] = {};
			this.used[x] = {};
			this.mapActive[x] = true;

			if (json.key[x] !== "default")
			{
				this.map[x] = json.key[x];
			}
			else
			{
				this.map[x] = this.mapDefault[x];
			}


			// reserved property names
			// preset key/button mapping
			if (this.map[x]["_sim_buttons"] !== undefined)
			{
				this.map[x]["_sim_buttons"].forEach(currentValue =>
				{
					const split = currentValue.split("->");
					if (this.preset[split[0]] !== undefined)
					{
						switch (split[1])
						{
							case "[axis]":
								this.map[x].up.push(this.preset[split[0]][0]);
								this.map[x].left.push(this.preset[split[0]][1]);
								this.map[x].down.push(this.preset[split[0]][2]);
								this.map[x].right.push(this.preset[split[0]][3]);
								break;

							default:
								this.preset[split[0]].forEach(currentValue =>
								{
									this.map[x][split[1]].push(currentValue);
								});
						}
					}
				});
				delete this.map[x]["_sim_buttons"];
			}

			// preset stick mapping
			if (this.map[x]["_sim_stick"] !== undefined)
			{
				// for each element in array
				this.map[x]["_sim_stick"].forEach(currentValue =>
				{
					const split = currentValue.split("->");

					// if key mapping is a gamepad button
					let map = "map";
					/*if (split[0].startsWith("_A"))
					{
						// map = "mapGamepad";
						if (this.mapGamepad[x] === undefined)
						{
							this.mapGamepad[x] = { up: [], left: [], down: [], right: []};
						}
					}*/

					switch (split[1])
					{
						case "[axis]":
							this[map][x].up.push(split[0] + "_u");
							this[map][x].left.push(split[0] + "_l");
							this[map][x].down.push(split[0] + "_d");
							this[map][x].right.push(split[0] + "_r");
							break;
						default:
							this.map[x][split[1]].push(split[0]);
					}
				});
				delete this.map[x]["_sim_stick"];
			}

			// set key active to false
			if (this.map[x]["_sim_active"] !== undefined)
			{
				if (typeof this.map[x]["_sim_active"] === "boolean")
				{
					this.mapActive[x] = this.map[x]["_sim_active"];
				}
				delete this.map[x]["_sim_active"];
			}

			for (let y in this.map[x])
			{
				// for each key map
				let l = this.map[x][y].length;
				for (let i = 0; i < l; i++)
				{
					// if keymap is for gamepad
					if (this.map[x][y][i].startsWith("_B") || this.map[x][y][i].startsWith("_A"))
					{
						if (this.map[x][y][i].startsWith("_B"))
						{
							// get button ID
							const index = Number(this.map[x][y][i].slice(2));

							//
							if (this.mapGamepad[index] === undefined)
							{
								this.mapGamepad[index] = [];
							}
							this.mapGamepad[index].push([x, y]);
						}
						else
						{
							const index = this.map[x][y][i].charAt(2) * -1 - 1;
							const split = this.map[x][y][i].slice(2).split("_");

							if (this.mapGamepad[index] === undefined)
							{
								this.mapGamepad[index] = [];
							}
							this.mapGamepad[index].push([x, y, Number(split[1]), split[2]]);
						}

						// remove from main mapping
						this.map[x][y].splice(i, 1);
						i--; l--;
					}
				}

				this.active[x][y] = false;
				this.used[x][y] = false;
			}
		}
	},


	check: function(event, bool)
	{
		// if modifier keys were pressed, set value to respective bool instead
		switch (event.key)
		{
			case "Control":
				this.ctrl = bool;
				// return;
				break
			case "Alt":
				this.alt = bool;
				// return;
				break;
			case "Shift":
				this.shift = bool;
				// return;
				break;
			case " ":
				this.space = bool;
				// return;
				break
		}

		// if pressed key is same as quick use
		/*if (event.key === this.lastUsed[2])
		{
			// register this input without checking others
			// express shipping, free of charge
			this.active[this.lastUsed[0]][this.lastUsed[1]] = bool;
			if (bool)
			{
				console.log(this.lastUsed[0], this.lastUsed[1]);
			}
			else
			{
				this.used[this.lastUsed[0]][this.lastUsed[1]] = false;
			}
			return;
		}*/


		// for each map category
		for (let x in this.map)
		{
			// if category is set to active
			if (this.mapActive[x])
			{
				// for each input in category
				for (let y in this.map[x])
				{
					// if key in mapping is currently pressed
					if (this.map[x][y].includes(event.key))
					{
						this.active[x][y] = bool;
						if (bool)
						{
							console.log(x, y);
							// this.lastUsed = [x, y, event.key, undefined];
						}
						else
						{
							this.used[x][y] = false;
						}
						return;
					}
				}
			}
		}
	},


	gamepadCheck: () =>
	{
		// if gamepad is plugged in
		if (simKey.gamepad)
		{
			const gamepad = navigator.getGamepads()[0];
			const alreadyChecked = [];

			for (let x in simKey.mapGamepad)
			{
				// if input is button
				if (x > -1)
				{
					simKey.mapGamepad[x].forEach(currentValue =>
					{
						if (!alreadyChecked.includes(currentValue.join("")))
						{
							if (gamepad.buttons[x].pressed)
							{
								simKey.active[currentValue[0]][currentValue[1]] = true;
								simKey.used[currentValue[0]][currentValue[1]] = false;
								// console.log(currentValue, x);
								alreadyChecked.push(currentValue.join(""));
							}
							else
							{
								simKey.active[currentValue[0]][currentValue[1]] = false;
							}
						}
					});
				}
				// else, input is stick
				else
				{
					simKey.mapGamepad[x].forEach(currentValue =>
					{
						if (!alreadyChecked.includes(currentValue.join("")))
						{
							const index = (Number(x) + 1) * -2;
							let axis;

							// switch to which input is being checked
							switch (currentValue[3])
							{
								case "l": case "r":
									axis = Math.abs(gamepad.axes[index]);
									break;
								case "u": case "d":
									axis = Math.abs(gamepad.axes[index + 1]);
									break;

								// no specific direction
								default:
									// pick which axis' value is higher, vertical or horizontal
									// then, get absolute value (always convert - to +)
									if (Math.abs(gamepad.axes[index]) > Math.abs(gamepad.axes[index + 1]))
									{ axis = Math.abs(gamepad.axes[index]); }
									else
									{ axis = Math.abs(gamepad.axes[index + 1]); }
							}
							// if stick meets input threshold (outside dead zone), register as input
							if (axis >= currentValue[2])
							{
								simKey.active[currentValue[0]][currentValue[1]] = true;
								simKey.used[currentValue[0]][currentValue[1]] = false;
								alreadyChecked.push(currentValue.join(""));
							}
							else
							{
								simKey.active[currentValue[0]][currentValue[1]] = false;
							}
						}
					});
				}
			}
		}
		simKey.gamepadAnim = requestAnimationFrame(simKey.gamepadCheck);
	}
};



// lemocha - lemocha7.github.io
