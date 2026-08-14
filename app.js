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
  '1AC': ['Mathématiques', 'Français', 'Anglais', 'Physique-Chimie', 'SVT'],
  '2AC': ['Mathématiques', 'Français', 'Anglais', 'Physique-Chimie', 'SVT'],
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

Object.assign(
  subjectsByLevel,
  JSON.parse(localStorage.getItem('nokhba-catalogue') || 'null') ||
    window.NOKHBA_CATALOG ||
    {}
);

const state = {
  step: 1,
  level: '',
  subjects: []
};

const form = document.querySelector('#registration-form');
const screens = [...document.querySelectorAll('.screen')];

const error = () =>
  document.querySelector(
    `.screen[data-step="${state.step}"] .form-error`
  );

const setError = message => {
  error().textContent = message;
};


/* =========================================================
   AUTRE — ADRESSE / ÉTABLISSEMENT
========================================================= */

const addressSelect = document.querySelector('#address');
const addressOtherWrapper = document.querySelector('#address-other-wrapper');
const addressOther = document.querySelector('#address-other');

const schoolSelect = document.querySelector('#school');
const schoolOtherWrapper = document.querySelector('#school-other-wrapper');
const schoolOther = document.querySelector('#school-other');

function toggleOtherFields() {

  if (addressSelect) {
    const isOther = addressSelect.value === 'Autre';

    addressOtherWrapper.hidden = !isOther;
    addressOther.required = isOther;

    if (!isOther) {
      addressOther.value = '';
    }
  }

  if (schoolSelect) {
    const isOther = schoolSelect.value === 'Autre';

    schoolOtherWrapper.hidden = !isOther;
    schoolOther.required = isOther;

    if (!isOther) {
      schoolOther.value = '';
    }
  }
}


/* =========================================================
   TÉLÉPHONE
   Format : 06 12 34 56 78
========================================================= */

function formatPhone(input) {

  if (!input) return;

  let value = input.value.replace(/\D/g, '');

  // Maximum 10 chiffres
  value = value.substring(0, 10);

  const parts = [];

  if (value.length > 0) {
    parts.push(value.substring(0, 2));
  }

  if (value.length > 2) {
    parts.push(value.substring(2, 4));
  }

  if (value.length > 4) {
    parts.push(value.substring(4, 6));
  }

  if (value.length > 6) {
    parts.push(value.substring(6, 8));
  }

  if (value.length > 8) {
    parts.push(value.substring(8, 10));
  }

  input.value = parts.join(' ');
}


function getRawPhone(value) {
  return String(value || '').replace(/\D/g, '');
}


function isValidMoroccanPhone(value) {

  const phone = getRawPhone(value);

  /*
    Format marocain :
    0X XX XX XX XX

    On accepte :
    05...
    06...
    07...
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
      +screen.dataset.step === step
    );
  });

  document.querySelectorAll('#steps li').forEach((li, i) => {
    li.classList.toggle(
      'active',
      i < step
    );
  });

  document.querySelector('#progress-bar').style.width =
    `${((step - 1) / 3) * 100}%`;

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

  document.querySelector('#levels').innerHTML =
    levels
      .map(
        ([name, sub]) => `
          <button
            type="button"
            class="level-option ${
              state.level === name ? 'selected' : ''
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

  const subjects =
    subjectsByLevel[state.level] || [];

  document.querySelector(
    '#subjects-intro'
  ).textContent =
    `Niveau sélectionné : ${state.level}. Choisissez une ou plusieurs matières.`;

  document.querySelector('#subjects').innerHTML =
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
   VALEURS RÉELLES ADRESSE / ÉCOLE
========================================================= */

function getAddressValue() {

  if (addressSelect.value === 'Autre') {
    return addressOther.value.trim();
  }

  return addressSelect.value;
}


function getSchoolValue() {

  if (schoolSelect.value === 'Autre') {
    return schoolOther.value.trim();
  }

  return schoolSelect.value;
}


/* =========================================================
   RÉCAPITULATIF
========================================================= */

function renderRecap() {

  const d = new FormData(form);

  const fullName =
    `${d.get('firstName')} ${d.get('lastName')}`;

  const address = getAddressValue();
  const school = getSchoolValue();

  const studentPhone =
    d.get('studentPhone');

  const parentPhone =
    d.get('parentPhone');

  const birthDate =
    d.get('birthDate');

  document.querySelector('#recap').innerHTML = `

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
        ${studentPhone || '—'}
      </p>

      <p>
        Téléphone parent :
        ${parentPhone || '—'}
      </p>

      <p>
        ${school || '—'}
      </p>

      <p>
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
        state.subjects
          .map(
            subject => `
              <div class="subject-row">
                <span>${subject}</span>
                <span>✓</span>
              </div>
            `
          )
          .join('')
      }

    </div>

  `;
}


/* =========================================================
   VALIDATION
========================================================= */

function validate() {

  setError('');

  /* ÉTAPE 1 */
  if (state.step === 1) {

    const required = [
      ...document.querySelectorAll(
        '[data-step="1"] [required]'
      )
    ];

    if (
      required.some(
        field => !String(field.value || '').trim()
      )
    ) {

      setError(
        'Veuillez compléter tous les champs obligatoires.'
      );

      return false;
    }


    /* Téléphone élève */
    if (
      !isValidMoroccanPhone(
        document.querySelector('#student-phone').value
      )
    ) {

      setError(
        'Le numéro de téléphone de l’élève doit être au format 0X XX XX XX XX.'
      );

      document
        .querySelector('#student-phone')
        .focus();

      return false;
    }


    /* Téléphone parent */
    if (
      !isValidMoroccanPhone(
        document.querySelector('#parent-phone').value
      )
    ) {

      setError(
        'Le numéro du parent doit être au format 0X XX XX XX XX.'
      );

      document
        .querySelector('#parent-phone')
        .focus();

      return false;
    }


    /* Adresse Autre */
    if (
      addressSelect.value === 'Autre' &&
      !addressOther.value.trim()
    ) {

      setError(
        'Veuillez préciser votre quartier.'
      );

      addressOther.focus();

      return false;
    }


    /* École Autre */
    if (
      schoolSelect.value === 'Autre' &&
      !schoolOther.value.trim()
    ) {

      setError(
        'Veuillez préciser votre établissement.'
      );

      schoolOther.focus();

      return false;
    }
  }


  /* ÉTAPE 2 */
  if (
    state.step === 2 &&
    !state.level
  ) {

    setError(
      'Veuillez choisir votre niveau.'
    );

    return false;
  }


  /* ÉTAPE 3 */
  if (
    state.step === 3 &&
    !state.subjects.length
  ) {

    setError(
      'Sélectionnez au moins une matière.'
    );

    return false;
  }


  /* ÉTAPE 4 */
  if (
    state.step === 4 &&
    !form.confirmed.checked
  ) {

    setError(
      'Veuillez confirmer que vos informations sont correctes.'
    );

    return false;
  }

  return true;
}


/* =========================================================
   CLICS
========================================================= */

document.addEventListener(
  'click',
  e => {

    const next =
      e.target.closest('[data-next]');

    const back =
      e.target.closest('[data-back]');

    const level =
      e.target.closest('[data-level]');


    /* Niveau */
    if (level) {

      state.level =
        level.dataset.level;

      state.subjects = [];

      renderLevels();

      return;
    }


    /* Continuer */
    if (
      next &&
      validate()
    ) {

      showStep(
        state.step + 1
      );
    }


    /* Retour */
    if (back) {

      showStep(
        state.step - 1
      );
    }

  }
);


/* =========================================================
   CHANGEMENTS
========================================================= */

document.addEventListener(
  'change',
  e => {

    /* Matières */
    if (
      e.target.matches(
        '#subjects input'
      )
    ) {

      const n =
        e.target.value;

      state.subjects =
        e.target.checked
          ? [...state.subjects, n]
          : state.subjects.filter(
              x => x !== n
            );

      renderSubjects();

      return;
    }


    /* Adresse */
    if (
      e.target.matches('#address')
    ) {

      toggleOtherFields();

      return;
    }


    /* Établissement */
    if (
      e.target.matches('#school')
    ) {

      toggleOtherFields();

      return;
    }

  }
);


/* =========================================================
   FORMATAGE DES TÉLÉPHONES
========================================================= */

document.addEventListener(
  'input',
  e => {

    if (
      e.target.matches(
        '#student-phone, #parent-phone'
      )
    ) {

      formatPhone(e.target);
    }

  }
);


/* =========================================================
   ENVOI INSCRIPTION
========================================================= */

document
  .querySelector('#submit-registration')
  .addEventListener(
    'click',
    async () => {

      if (!validate()) {
        return;
      }

      const d =
        new FormData(form);

      const code =
        `NOK-26-${String(
          Math.floor(
            Math.random() * 90000
          ) + 10000
        )}`;


      const address =
        getAddressValue();

      const school =
        getSchoolValue();


      const record = {

        code,

        firstName:
          d.get('firstName'),

        lastName:
          d.get('lastName'),

        birthDate:
          d.get('birthDate'),

        phone:
          getRawPhone(
            d.get('studentPhone')
          ),

        parentPhone:
          getRawPhone(
            d.get('parentPhone')
          ),

        school,

        address,

        level:
          state.level,

        subjects:
          state.subjects,

        status:
          'En attente',

        createdAt:
          new Date().toLocaleString(
            'fr-FR'
          )

      };


      try {

        if (
          window.NOKHBA_REMOTE.enabled
        ) {

          await window.NOKHBA_REMOTE
            .createRegistration(
              record
            );

        } else {

          window.NOKHBA_STORE
            .saveRegistration(
              record
            );
        }

      } catch (error) {

        console.error(
          'Erreur inscription:',
          error
        );

        setError(
          'Une erreur est survenue. Veuillez réessayer.'
        );

        return;
      }


      document.querySelector(
        '#student-name'
      ).textContent =
        d.get('firstName');


      document.querySelector(
        '#registration-code'
      ).textContent =
        code;


      form.hidden = true;

      document.querySelector(
        '#success'
      ).hidden = false;


      document.querySelector(
        '.progress-wrap'
      ).hidden = true;


      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }
  );


/* =========================================================
   COPIER CODE
========================================================= */

document
  .querySelector('#copy-code')
  .addEventListener(
    'click',
    async e => {

      const code =
        document.querySelector(
          '#registration-code'
        ).textContent;

      try {

        await navigator.clipboard
          .writeText(code);

        e.target.textContent =
          'Code copié ✓';

      } catch {

        e.target.textContent =
          code;
      }

      setTimeout(
        () => {
          e.target.textContent =
            'Copier le code';
        },
        1800
      );

    }
  );


/* =========================================================
   NOUVELLE INSCRIPTION
========================================================= */

document
  .querySelector('#new-registration')
  .addEventListener(
    'click',
    () => {

      form.reset();

      state.level = '';

      state.subjects = [];

      form.hidden = false;

      document.querySelector(
        '#success'
      ).hidden = true;

      document.querySelector(
        '.progress-wrap'
      ).hidden = false;


      if (addressOtherWrapper) {
        addressOtherWrapper.hidden = true;
      }

      if (schoolOtherWrapper) {
        schoolOtherWrapper.hidden = true;
      }


      if (addressOther) {
        addressOther.required = false;
      }

      if (schoolOther) {
        schoolOther.required = false;
      }


      renderLevels();

      showStep(1);

    }
  );


/* =========================================================
   INITIALISATION
========================================================= */

toggleOtherFields();

renderLevels();
