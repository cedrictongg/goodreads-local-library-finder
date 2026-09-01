document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');
  const { zip } = await chrome.storage.local.get('zip');
  status.textContent = zip ? `Active ZIP: ${zip}` : 'No ZIP code set yet.';

  document.getElementById('options-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
