import { isValidUsZip } from '../utils/zipValidator.js';

const zipInput = document.getElementById('zip');
const feedback = document.getElementById('feedback');

async function loadZip() {
  const { zip } = await chrome.storage.local.get('zip');
  if (zip) zipInput.value = zip;
}

document.getElementById('save').addEventListener('click', async () => {
  const value = zipInput.value.trim();
  if (!isValidUsZip(value)) {
    feedback.textContent = 'Enter a valid 5-digit ZIP code.';
    return;
  }
  await chrome.storage.local.set({ zip: value });
  feedback.textContent = 'Saved.';
});

loadZip();
