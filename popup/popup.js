const options = document.querySelectorAll('.option > input');

// Save options
options.forEach((element) => {
	element.addEventListener('change', function (e) {
		console.log(`Setting ${e.target.id} to ${e.target.checked}`);
		var option = {};
		option[e.target.id] = e.target.checked;
		chrome.storage.sync.set(option);
	});
});

// Restore options
options.forEach((element) => {
	chrome.storage.sync.get(element.id, (result) => {
		console.log(`Restoring ${element.id} to ${!!result[element.id]}`);
		element.checked = !!result[element.id];
	});
});

// Replace kbd with OS specific meta key (⌘ or Ctrl)
const IS_MAC = (navigator?.userAgentData?.platform || navigator?.platform)
	.toLowerCase()
	.includes('mac');
document.querySelectorAll('.kbd-meta').forEach((element) => {
	element.textContent = IS_MAC ? '⌘' : 'Ctrl';
});
document.querySelectorAll('.kbd-opt').forEach((element) => {
	element.textContent = IS_MAC ? '⌥' : 'Alt';
});

// Conditionally hide elements based on option
document.querySelectorAll('[show-if]').forEach((element) => {
	const optionName = 'option-' + element.getAttribute('show-if');
	const vis = (show, animate = true) => {
		if (!animate) {
			if (show) {
				$(element).show();
			} else {
				$(element).hide();
			}
			return;
		}

		if (show) {
			$(element).slideDown();
		} else {
			$(element).slideUp();
		}
		// element.style.display = show ? 'block' : 'none';
	};

	// Initial load
	chrome.storage.sync.get(optionName, (result) => {
		vis(result[optionName], false);
	});
	// Future changes
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === 'sync' && optionName in changes) {
			vis(changes[optionName].newValue);
		}
	});
});
