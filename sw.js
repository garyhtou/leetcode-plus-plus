chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason != 'install') return;

	// Set default options
	chrome.storage.sync.set({
		'option-disable-save': true,
	});
});
