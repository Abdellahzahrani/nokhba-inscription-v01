const levels = [
  ['Primaire', 'Cycle primaire'],
  ['1AC', '1ère année collège'],
  ['2AC', '2ème année collège'],
  ['3AC', '3ème année collège'],
  ['Tronc Commun', 'Lycée – tronc commun'],
  ['1BAC scientifique', 'Lycée – sciences'],
  ['1BAC lettres', 'Lycée – lettres'],
  ['2BAC', 'Lycée – deuxième année']
];

const subjectsByLevel = {
  Primaire: ['Français', 'Mathématiques', 'Arabe'],

  '1AC': [
    'Mathématiques',
    'Français',
    'Anglais',
    'Physique-Chimie',
    'SVT'
  ],

  '2AC': [
    'Mathématiques',
    'Français',
    'Anglais',
    'Physique-Chimie',
    'SVT'
  ],

  '3AC': [
    'Mathématiques',
    'Français',
    'Anglais',
    'Physique-Chimie',
    'SVT',
    'Histoire-GEO',
    'ARAB'
  ],

  'Tronc Commun': [
    'Mathématiques',
    'Français',
    'Anglais',
    'Physique-Chimie',
    'SVT'
  ],

  '1BAC scientifique': [
    'Mathématiques',
    'Physique-Chimie',
    'SVT',
    'Français',
    'Arab',
    'Histoire-GEO',
    'Education islamique'
  ],

  '1BAC lettres': [
    'Français',
    'Mathématiques'
  ],

  '2BAC': [
    'Physique-Chimie',
    'Mathématiques',
    'SVT',
    'Anglais',
    'Philosophie'
  ]
};


/* =========================================================
   CATALOGUE
========================================================= */

Object.assign(
  subjectsByLevel,
  JSON.parse(
    localStorage.getItem('nokhba-catalogue') || 'null'
  ) ||
  window.NOKHBA_CATALOG ||
  {}
);


/* =========================================================
   STATE
========================================================= */

const state = {
  step: 1,
  level: '',
  subjects: []
};


/* =========================================================
   DOM
========================================================= */

const form =
  document.querySelector('#registration-form');

const screens =
  [...document.querySelectorAll('.screen')];

const addressSelect =
  document.querySelector('#address');

const addressOtherWrapper =
  document.querySelector('#address-other-wrapper');

const addressOther =
  document.querySelector('#address-other');

const schoolSelect =
  document.querySelector('#school');

const schoolOtherWrapper =
  document.querySelector('#school-other-wrapper');

const schoolOther =
  document.querySelector('#school-other');

const studentPhone =
  document.querySelector('#student-phone');

const parentPhone =
  document.querySelector('#parent-phone');


/* =========================================================
   ERROR
========================================================= */

const error = () =>
  document.querySelector(
    `.screen[data-step="${state.step}"] .form-error`
  );


const setError = message => {

  const el = error();

  if (el) {
    el.textContent = message;
  }

};


/* =========================================================
   AUTRE — ADRESSE / ÉTABLISSEMENT
========================================================= */

function toggleOtherFields() {

  /* -------------------------
     Adresse
  ------------------------- */

  if (
    addressSelect &&
    addressOtherWrapper &&
    addressOther
  ) {

    const isOther =
      addressSelect.value === 'Autre';

    addressOtherWrapper.style.display =
      isOther ? '' : 'none';

    addressOther.required =
      isOther;

    if (!isOther) {
      addressOther.value = '';
    }
  }


  /* -------------------------
     Établissement
  ------------------------- */

  if (
    schoolSelect &&
    schoolOtherWrapper &&
    schoolOther
  ) {

    const isOther =
      schoolSelect.value === 'Autre';

    schoolOtherWrapper.style.display =
      isOther ? '' : 'none';

    schoolOther.required =
      isOther;

    if (!isOther) {
      schoolOther.value = '';
    }
  }

}


/* =========================================================
   PHONE
   Format :
   06 12 34 56 78
========================================================= */

function formatPhone(input) {

  if (!input) return;

  /*
    On enlève tout sauf les chiffres.
  */

  let value =
    input.value.replace(/\D/g, '');


  /*
    Maximum 10 chiffres.
  */

  value =
    value.substring(0, 10);


  /*
    Construction du format :
    0X XX XX XX XX
  */

  const parts = [];


  if (value.length > 0) {
    parts.push(
      value.substring(0, 2)
    );
  }


  if (value.length > 2) {
    parts.push(
      value.substring(2, 4)
    );
  }


  if (value.length > 4) {
    parts.push(
      value.substring(4, 6)
    );
  }


  if (value.length > 6) {
    parts.push(
      value.substring(6, 8)
    );
  }


  if (value.length > 8) {
    parts.push(
      value.substring(8, 10)
    );
  }


  input.value =
    parts.join(' ');
}


/* =========================================================
   RAW PHONE
========================================================= */

function getRawPhone(value) {

  return String(value || '')
    .replace(/\D/g, '');

}


/* =========================================================
   VALIDATION PHONE
========================================================= */

function isValidMoroccanPhone(value) {

  const phone =
    getRawPhone(value);

  /*
    10 chiffres exactement
    commence par 05, 06 ou 07
  */

  return /^0[5-7]\d{8}$/.test(phone);

}


/* =========================================================
   NAVIGATION
========================================================= */

function showStep(step) {

  state.step = step;


  screens.forEach(screen => {

    screen.classList.toggle(
      'active',
      Number(screen.dataset.step) === step
    );

  });


  document
    .querySelectorAll('#steps li')
    .forEach((li, index) => {

      li.classList.toggle(
        'active',
        index < step
      );

    });


  const progressBar =
    document.querySelector('#progress-bar');


  if (progressBar) {

    progressBar.style.width =
      `${((step - 1) / 3) * 100}%`;

  }


  if (step === 3) {
    renderSubjects();
  }


  if (step === 4) {
    renderRecap();
  }


  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

}


/* =========================================================
   NIVEAUX
========================================================= */

function renderLevels() {

  const container =
    document.querySelector('#levels');

  if (!container) return;


  container.innerHTML =
    levels
      .map(
        ([name, sub]) => `
          <button
            type="button"
            class="level-option ${
              state.level === name
                ? 'selected'
                : ''
            }"
            data-level="${name}"
          >
            ${name}
            <small>${sub}</small>
          </button>
        `
      )
      .join('');

}


/* =========================================================
   MATIÈRES
========================================================= */

function renderSubjects() {

  const container =
    document.querySelector('#subjects');

  if (!container) return;


  const subjects =
    subjectsByLevel[state.level] || [];


  const intro =
    document.querySelector('#subjects-intro');


  if (intro) {

    intro.textContent =
      `Niveau sélectionné : ${state.level}. Choisissez une ou plusieurs matières.`;

  }


  container.innerHTML =
    subjects
      .map(
        name => `
          <label
            class="subject-option ${
              state.subjects.includes(name)
                ? 'selected'
                : ''
            }"
          >

            <input
              type="checkbox"
              value="${name}"
              ${
                state.subjects.includes(name)
                  ? 'checked'
                  : ''
              }
            >

            <span>
              <b>${name}</b>
              <small>
                Disponible pour votre niveau
              </small>
            </span>

          </label>
        `
      )
      .join('');

}


/* =========================================================
   VALEURS ADRESSE / ÉCOLE
========================================================= */

function getAddressValue() {

  if (
    addressSelect &&
    addressSelect.value === 'Autre'
  ) {

    return addressOther
      ? addressOther.value.trim()
      : '';

  }

  return addressSelect
    ? addressSelect.value
    : '';

}


function getSchoolValue() {

  if (
    schoolSelect &&
    schoolSelect.value === 'Autre'
  ) {

    return schoolOther
      ? schoolOther.value.trim()
      : '';

  }

  return schoolSelect
    ? schoolSelect.value
    : '';

}


/* =========================================================
   RÉCAPITULATIF
========================================================= */

function renderRecap() {

  const d =
    new FormData(form);


  const firstName =
    d.get('firstName') || '';

  const lastName =
    d.get('lastName') || '';


  const fullName =
    `${firstName} ${lastName}`.trim();


  const address =
    getAddressValue();


  const school =
    getSchoolValue();


  const studentPhoneValue =
    d.get('studentPhone') || '';


  const parentPhoneValue =
    d.get('parentPhone') || '';


  const birthDate =
    d.get('birthDate') || '';


  const recap =
    document.querySelector('#recap');


  if (!recap) return;


  recap.innerHTML = `

    <div class="recap-section">

      <h3>Élève</h3>

      <p>
        <strong>${fullName}</strong>
      </p>

      <p>
        Date de naissance :
        ${birthDate || '—'}
      </p>

      <p>
        Téléphone :
        ${studentPhoneValue || '—'}
      </p>

      <p>
        Téléphone parent :
        ${parentPhoneValue || '—'}
      </p>

      <p>
        Établissement :
        ${school || '—'}
      </p>

      <p>
        Adresse :
        ${address || '—'}
      </p>

    </div>


    <div class="recap-section">

      <h3>Niveau</h3>

      <p>
        <strong>${state.level}</strong>
      </p>

    </div>


    <div class="recap-section">

      <h3>Matières choisies</h3>

      ${
        state.subjects.length
          ? state.subjects
              .map(
                subject => `
                  <div class="subject-row">
                    <span>${subject}</span>
                    <span>✓</span>
                  </div>
                `
              )
              .join('')
          : '<p>Aucune matière sélectionnée.</p>'
      }

    </div>

  `;

}


/* =========================================================
   VALIDATION
========================================================= */

function validate() {

  setError('');


  /* =====================================================
     ÉTAPE 1
  ===================================================== */

  if (state.step === 1) {

    const required =
      [
        ...document.querySelectorAll(
          '[data-step="1"] [required]'
        )
      ];


    /*
      Champs obligatoires vides
    */

    if (
      required.some(
        field =>
          !String(
            field.value || ''
          ).trim()
      )
    ) {

      setError(
        'Veuillez compléter tous les champs obligatoires.'
      );

      return false;
    }


    /*
      Téléphone élève
    */

    if (
      !isValidMoroccanPhone(
        studentPhone
          ? studentPhone.value
          : ''
      )
    ) {

      setError(
        'Le numéro de téléphone de l’élève doit être au format 0X XX XX XX XX.'
      );


      if (
