const countryList = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Bolivia', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia',
  'Costa Rica', 'Croatia', 'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Estonia',
  'Finland', 'France', 'Germany', 'Greece', 'Guatemala', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Latvia', 'Lithuania', 'Luxembourg', 'Malaysia',
  'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Romania', 'Saudi Arabia', 'Singapore', 'Slovakia', 'Slovenia',
  'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Venezuela', 'Vietnam'
];

const vesselName = document.getElementById('vessel-name');
const vesselInput = document.getElementById('vessel_id');
const form = document.getElementById('feedback-form');
const nationalitySelect = document.getElementById('nationality');
const errorBox = document.getElementById('error-box');

function populateNationalities() {
  countryList.sort().forEach((country) => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    nationalitySelect.appendChild(option);
  });
}

function parseVessel() {
  const url = new URL(window.location.href);
  const vessel = url.searchParams.get('v');
  if (!vessel || !['LETTY', 'CALIPSO', 'NAREL'].includes(vessel)) {
    vesselName.textContent = 'Unknown Vessel';
    errorBox.textContent = 'Invalid or missing vessel. Please scan the vessel-specific QR code.';
    errorBox.hidden = false;
    form.classList.add('hidden');
    return null;
  }
  vesselName.textContent = vessel;
  vesselInput.value = vessel;
  return vessel;
}

function getRatingValue(rowName) {
  const checked = document.querySelector(`input[name="${rowName}"]:checked`);
  return checked ? checked.value : null;
}

function buildPayload() {
  return {
    vessel_id: vesselInput.value,
    nationality: nationalitySelect.value,
    cabin_number: document.getElementById('cabin_number').value.trim(),
    likelihood: document.querySelector('input[name="likelihood"]:checked')?.value,
    best_part: document.getElementById('best_part').value.trim(),
    improvement: document.getElementById('improvement').value.trim(),
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    guide_score: getRatingValue('guide_score'),
    crew_friendliness_score: getRatingValue('crew_friendliness_score'),
    cleanliness_score: getRatingValue('cleanliness_score'),
    professionalism_score: getRatingValue('professionalism_score'),
    meals_score: getRatingValue('meals_score'),
    cabin_score: getRatingValue('cabin_score'),
    interior_areas_score: getRatingValue('interior_areas_score'),
    sundeck_score: getRatingValue('sundeck_score'),
    value_score: getRatingValue('value_score')
  };
}

function validatePayload(payload) {
  if (!payload.vessel_id) return 'Vessel is required.';
  if (!payload.nationality) return 'Please select your nationality.';
  if (!payload.cabin_number) return 'Please enter your cabin number.';
  if (!payload.likelihood) return 'Please answer how likely you are to recommend us.';
  const ratings = [
    payload.guide_score,
    payload.crew_friendliness_score,
    payload.cleanliness_score,
    payload.professionalism_score,
    payload.meals_score,
    payload.cabin_score,
    payload.interior_areas_score,
    payload.sundeck_score,
    payload.value_score
  ];
  if (ratings.some((r) => !r)) return 'Please rate all service items.';
  return null;
}

async function handleSubmit(event) {
  event.preventDefault();
  const payload = buildPayload();
  const validationError = validatePayload(payload);
  if (validationError) {
    errorBox.textContent = validationError;
    errorBox.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  errorBox.hidden = true;
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Unable to submit feedback.');
    }

    window.location.href = '/thanks.html';
  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit feedback';
    errorBox.textContent = error.message;
    errorBox.hidden = false;
  }
}

function init() {
  populateNationalities();
  const vessel = parseVessel();
  if (!vessel) return;
  form.addEventListener('submit', handleSubmit);
}

document.addEventListener('DOMContentLoaded', init);
