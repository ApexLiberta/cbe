document.getElementById("openNotepad").addEventListener("click", () => {
		code: `
	const textToWrite = "This is pre-defined text.";
	const notepadPath = "C:\\Windows\\System32\\notepad.exe"; // Adjust this path if necessary

	const args = [textToWrite];
	const process = new ActiveXObject("WScript.Shell").Run(notepadPath, 1, true, args);
	`
});
