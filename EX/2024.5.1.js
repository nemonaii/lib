"use strict";
// EX Lib - lemocha
// Provide extra functions to data types

const IntegerEX =
{
	// generate a random number between min and max
	//		min (int):			lower limit
	//		max (int):			upper limit
	randBetween: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
};
const StringEX =
{
	// find the difference in length between input and amount
	//		str (str):			input to get length of
	//		amount (int):		target length to compare
	missingLength: (str, amount) => amount - str.toString().length
};
const ArrayEX =
{
	// find the first index that is undefined
	//		arr (arr):			array to check
	firstOpenSlot: (arr) =>
	{
		let id = arr.findIndex(x => x === undefined);
		if (id === -1) { id = arr.length; }

		while (arr[id] !== undefined)
		{
			id++;
		}
		return id;
	}
};



// lemocha - lemocha7.github.io
