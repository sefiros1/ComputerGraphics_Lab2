import {remote} from 'electron';
import {exec} from'child_process';

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
	const replaceText = (selector: string, text: string) => {
		const element = document.getElementById(selector);
		if (element) {
			element.innerText = text;
		}
	};

	for (const type of ["chrome", "node", "electron"]) {
		replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
	}
});

window.addEventListener('keyup', (e) => {
	if (e.key === 'F5') {
		if (e.ctrlKey)
			exec("npm run build", (err, stdout, stderr) => {
				if (err) {
					console.log("Error\n" + stderr);
					return;
				}
				remote.getCurrentWindow().reload();
			})
		else remote.getCurrentWindow().reload();
	}
})