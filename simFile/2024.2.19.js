"use strict";
// simFile v2024.2.19
// library to easily open and download files

const simFile =
{
	// name of file
	fileName: undefined,
	fileExtension: undefined,

	// read file blob with file reader and returns the file data
	//	file [blob]:		file blob, commonly gotten from input elements of type file
	//	readAs [str]:		how to read the file ("readAsText", readAsDataURL", "readAsArrayBuffer")
	read: function(file, readAs)
	{
		return new Promise(resolve =>
		{
			// setup file reader and onload event
			const reader = new FileReader();
			reader.addEventListener("load", event => resolve(event.target.result));

			// set file name and format properties
			this.fileName = this.getName(file.name);
			this.fileExtension = this.getExtension(file.name);

			// read file as requested type
			// reader will trigger "load" event when done
			reader[readAs](file);
		});
	},


	// Pull up import file prompt, then read the file with simFile.read()
	//	ext [str]:			what file extension to look for
	//	readAs [str]:		how to read the file ("readAsText", readAsDataURL", "readAsArrayBuffer")
	prompt: async function(ext, readAs)
	{
		// create input element and prompt user for file
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "." + ext;
		input.click();

		return new Promise(resolve =>
		{
			// when file has been chosen from file prompt,
			// pass file to simFile.read(), and return result when done
			input.addEventListener("change", () => resolve(this.read(input.files[0], readAs)));
		});
	},



	// Pull up download prompt and download file
	//	file [str]:			data that goes in the file
	//	name [str]:			name and extension of file
	//	mime [str]:			file MIME type
	download: function(file, name, mime)
	{
		// if MIME type is undefined
		if (mime === undefined)
		{
			// get mime type from file extension
			switch (this.getFormat(name))
			{
				// text formats
				case "txt": mime = "text/plain"; break;
				case "csv": mime = "text/csv"; break;
				case "pdf": mime = "application/pdf"; break;
				case "json": mime = "application/json"; break;

				// image formats
				case "bmp": mime = "image/bmp"; break;
				case "jpg": case "jpeg": mime = "image/jpeg"; break;
				case "png": mime = "image/png"; break;
				case "webp": mime = "image/webp"; break;
				case "gif": mime = "image/gif"; break;
				case "svg": mime = "image/svg+xml"; break;

				// audio / video formats
				case "mp3": mime = "audio/mpeg"; break;
				case "wav": mime = "audio/wav"; break;
				case "weba": mime = "audio/webm"; break;
				case "mp4": mime = "video/mp4"; break;
				case "webm": mime = "video/webm"; break;

				// archive formats
				case "zip": mime = "application/zip"; break;
				case "gz": mime = "application/gzip"; break;
				case "7z": mime = "application/x-7z-compressed"; break;
			}
		}

		// create download link to file and click it
		const a = document.createElement("a");
		a.href = window.URL.createObjectURL(new Blob([file], {type: [mime]}));
		a.download = name;
		a.click();
	},
	downloadDataURL: (file, name) =>
	{
		// create download link to file and click it
		const a = document.createElement("a");
		a.href = file;
		a.download = name;
		a.click();
	},


	getName: name => name.slice(0, name.lastIndexOf(".")),
	getExtension: name => name.slice(name.lastIndexOf(".") + 1),
	replaceExtension: (name, replace) => name.slice(0, name.lastIndexOf(".")) + replace
}



// lemocha - lemocha7.github.io
