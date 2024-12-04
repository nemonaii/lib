"use strict";
// tabs library
// tab, window, local storage, and drag/drop functions so I don't have to rewrite that code

// TABS TODO:
//	- fix ALL function under tabs.open()
//	- containerActive all function


// ===================
// === TAB MANAGER ===
// ===================
const tabs =
{
	list: {},
	all: false,

	// open tab, set <div> and <button> as classes
	//	group [str]:		name of object in tabs.list
	//	id [int]:				ID of tab to open
	open: function(group, id)
	{
		if (id !== this.list[group].active)
		{
			this.list[group].fate.forEach(currentValue =>
			{
				switch (currentValue)
				{
					// add "active" class to button ID in [group].buttons
					case "tabActive":
						if (id === "all")
						{
							const l = this.list[group].buttons.length;
							for (let i = 0; i < l; i++)
							{
								this.list[group].buttons[i].classList.add("active");
							}

							this.all = true;
						}
						else
						{
							if (this.all)
							{
								const l = this.list[group].buttons.length;
								for (let i = 0; i < l; i++)
								{
									this.list[group].buttons[i].classList.add("active");
								}
							}
							this.list[group].buttons[id].classList.add("active");

							if (this.list[group].active !== undefined)
							{
								this.list[group].buttons[this.list[group].active].classList.remove("active");
							}
							// this.list[group].buttons[id].classList.add("selected");
						}
						break;

					// add class named [group].name[id] to container
					case "containerClass":
						if (id === "all")
						{
							this.list[group].name.forEach((currentValue) =>
								this.list[group].container.classList.add(currentValue));

							this.all = true;
						}
						else
						{
							if (this.all)
							{
								this.list[group].name.forEach((currentValue) =>
									this.list[group].container.classList.remove(currentValue));
							}

							this.list[group].container.classList.add(this.list[group].name[id]);
							if (this.list[group].active !== undefined)
							{
								this.list[group].container.classList.remove(this.list[group].name[this.list[group].active]);
							}
							// this.list[group].container.classList = this.list[group].name[id];
						}
						break;

					// add "active" to container child ID
					case "childActive":
						this.list[group].container.children[id].classList.add("active");
						if (this.list[group].active !== undefined)
						{
							this.list[group].container.children[this.list[group].active].classList.remove("active");
						}
						break;
				}
			});


			if (this.all)
			{
				this.all = false;
			}

			this.list[group].active = id;
			if (this.list[group].storage !== undefined)
			{
				localStorage.setItem(this.list[group].storage, id);
			}
		}
	},


	// open tab ID specified in local storage. else, open default specified
	//	group [str]:		name of object in tabs.list
	openStorage: function(group)
	{
		// if local storage is enabled and key in local storage is not empty
		if (navigator.cookieEnabled && localStorage.getItem(this.list[group].storage) !== null)
		{
			// if tab ID is not out of bounds
			if (Number(localStorage.getItem(this.list[group].storage)) < tabs.list.tab.name.length)
			{
				// open the tab ID that was set in local storage
				tabs.open("tab", Number(localStorage.getItem(this.list[group].storage)));
			}
			else
			{
				tabs.open("tab", this.list[group].default);
			}
		}
		else
		{
			tabs.open("tab", this.list[group].default);
		}
	}
};


// ======================
// === WINDOW MANAGER ===
// ======================
const windows =
{
	active: undefined,
	list: {},

	open: function(id)
	{
		if (this.active !== id)
		{
			this.list.DOM[id].classList.add("open");

			if (this.active !== undefined)
			{
				this.list.DOM[this.active].classList.remove("open");
			}
			this.active = id;
		}
		else
		{
			this.list.DOM[id].classList.remove("open");
			this.active = undefined;
		}
	},
	close: function()
	{
		if (this.active !== undefined)
		{
			this.list.DOM[this.active].classList.remove("open");
			this.active = undefined;
		}
	}
};



// ==============================
// === LOCAL STORAGE SETTINGS ===
// ==============================
const storage =
{
	list: [],
	storage: "",

	load: function()
	{
		this.list.forEach(currentValue => this.item(currentValue, true));
	},

	// ...
	//	DOM [DOM]:			...
	//	load [bool]:		...
	item: function(DOM, load)
	{
		// let value;
		let attrib;

		switch (DOM.tagName)
		{
			case "INPUT":
				switch (DOM.type)
				{
					case "": case "text": case "number":
						attrib = "value";
						break;
					case "checkbox":
						attrib = "checked";
						break;
				}
				break;

			case "SELECT":
				attrib = "value";
				break;
		}


		if (!load && attrib !== undefined)
		{
			localStorage.setItem(this.storage + "DOM/" + DOM.id, DOM[attrib]);
		}
		else
		{
			if (localStorage.getItem(this.storage + "DOM/" + DOM.id) !== null)
			{
				DOM[attrib] = localStorage.getItem(this.storage + "DOM/" + DOM.id);
			}
		}
	}
};



// =================
// === FILE DRAG ===
// =================
const drag =
{
	// tied to "ondragover" event. set drop visuals, add "drag" class
	//	event [event]:		drag / drop event
	//	DOM [DOM]:				DOM of file-area
	drag: (event, DOM) =>
	{
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";

		DOM.classList.add("drag");
	},

	// tied to "ondragleave" event. remove "drag" class
	//	DOM [DOM]:				DOM of file-area
	leave: (DOM) => DOM.classList.remove("drag"),

	// tied to "ondrop" event. remove drop visuals, run loadFile() on specified object
	//	event [event]:		drag / drop event
	//	DOM [DOM]:				DOM of file-area
	//	dest [obj]:
	//  func [str]:				name of function to run in dest
	drop: (event, DOM, dest, func) =>
	{
		event.stopPropagation();
		event.preventDefault();
		dest[func](event.dataTransfer.files);

		DOM.classList.remove("drag");
	}
};



// lemocha - lemocha7.github.io
