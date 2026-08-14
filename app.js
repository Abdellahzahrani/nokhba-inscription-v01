/* =========================================================
   INSTITUT NOKHBA - INSCRIPTION EN LIGNE
========================================================= */


/* =========================================================
   NIVEAUX
========================================================= */

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


/* =========================================================
   MATIÈRES
========================================================= */

const subjectsByLevel = {

  Primaire: [
    'Français',
    'Mathématiques',
    'Arabe'
  ],

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

try {

  const savedCatalogue =
    JSON.parse(
      localStorage.getItem('nokhba-catalogue') || 'null'
    );

  if (savedCatalogue) {
    Object.assign(
      subjectsByLevel,
      savedCatalogue
    );
  }

  if (window.NOKHBA_CATALOG) {
    Object.assign(
      subjectsByLevel,
      window.NOKHBA_CATALOG
    );
  }

} catch (e) {

  console.warn(
    'Catalogue non chargé:',
    e
  );

}


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
  form?.querySelector('[name="address"]');

const schoolSelect =
  form?.querySelector('[name="school"]');

const studentPhone =
  form?.querySelector('[name="studentPhone"]');

const parentPhone =
  form?.querySelector('[name="parentPhone"]');


/* =========================================================
   ERROR
========================================================= */

function getErrorElement() {

  return document.querySelector(
    `.screen[data-step="${state.step}"] .form-error`
  );

}


function setError(message = '') {

  const el =
    getErrorElement();

  if (el) {
    el.textContent = message;
  }

}


/* =========================================================
   AUTRE FIELDS
   On les crée automatiquement.
   Donc pas besoin de modifier index.html.
========================================================= */

let addressOther = null;
let schoolOther = null;

let addressOtherWrapper = null;
let schoolOtherWrapper = null;


function createOtherField(
  select,
  type
) {

  if (!select) return null;


  const existing =
    select.parentElement.querySelector(
      `.nokhba-other-${type}`
    );

  if (existing) {

    return {
      wrapper: existing,
      input: existing.querySelector('input')
    };

  }


  const wrapper =
    document.createElement('div');

  wrapper.className =
    `nokhba-other-${type}`;

  wrapper.hidden = true;

  wrapper.style.display =
    'none';


  const label =
    document.createElement('label');


  label.textContent =
    type === 'address'
      ? 'Précisez votre quartier'
      : 'Précisez votre établissement';


  const input =
    document.createElement('input');

  input.type =
    'text';

  input.name =
    type === 'address'
      ? 'addressOther'
      : 'schoolOther';

  input.placeholder =
    type === 'address'
      ? 'Écrivez votre quartier'
      : 'Écrivez le nom de votre établissement';

  input.autocomplete =
    'off';

  input.required =
    false;


  label.appendChild(input);

  wrapper.appendChild(label);


  select.parentElement.insertAdjacentElement(
    'afterend',
    wrapper
  );


  return {
    wrapper,
    input
  };

}


/* =========================================================
   INITIALISER LES CHAMPS AUTRE
========================================================= */

function initOtherFields() {

  if (addressSelect) {

    const result =
      createOtherField(
        addressSelect,
        'address'
      );

    if (result) {

      addressOtherWrapper =
        result.wrapper;

      addressOther =
        result.input;

    }

  }


  if (schoolSelect) {

    const result =
      createOtherField(
        schoolSelect,
        'school'
      );

    if (result) {

      schoolOtherWrapper =
        result.wrapper;

      schoolOther =
        result.input;

    }

  }


  toggleOtherFields();

}


/* =========================================================
   AFFICHER / CACHER AUTRE
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


    addressOtherWrapper.hidden =
      !isOther;


    addressOtherWrapper.style.setProperty(
      'display',
      isOther ? 'block' : 'none',
      'important'
    );


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


    schoolOtherWrapper.hidden =
      !isOther;


    schoolOtherWrapper.style.setProperty(
      'display',
      isOther ? 'block' : 'none',
      'important'
    );


    schoolOther.required =
      isOther;


    if (!isOther) {
      schoolOther.value = '';
    }

  }

}


/* =========================================================
   PHONE FORMAT
   0X XX XX XX XX
========================================================= */

function formatPhone(input) {

  if (!input) return;


  let digits =
    input.value.replace(
      /\D/g,
      ''
    );


  /* Maximum 10 chiffres */

  digits =
    digits.substring(
      0,
      10
    );


  const parts = [];


  if (digits.length >= 1) {
    parts.push(
      digits.substring(0, 2)
    );
  }


  if (digits.length > 2) {
    parts.push(
      digits.substring(2, 4)
    );
  }


  if (digits.length > 4) {
    parts.push(
      digits.substring(4, 6)
    );
  }


  if (digits.length > 6) {
    parts.push(
      digits.substring(6, 8)
    );
  }


  if (digits.length > 8) {
    parts.push(
      digits.substring(8, 10)
    );
  }


  input.value =
    parts.join(' ');

}


function getRawPhone(value) {

  return String(value || '')
    .replace(
      /\D/g,
      ''
    );

}


function isValidPhone(value) {

  const phone =
    getRawPhone(value);


  return /^0[5-7]\d{8}$/.test(
    phone
  );

}


/* =========================================================
   NAVIGATION
========================================================= */

function showStep(step) {

  if (step < 1) {
    step = 1;
  }

  if (step > 4) {
    step = 4;
  }


  state.step =
    step;


  screens.forEach(
    screen => {

      screen.classList.toggle(
        'active',
        Number(
          screen.dataset.step
        ) === step
      );

    }
  );


  document
    .querySelectorAll('#steps li')
    .forEach(
      (li, index) => {

        li.classList.toggle(
          'active',
          index < step
        );

      }
    );


  const progressBar =
    document.querySelector(
      '#progress-bar'
    );


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
   LEVELS
========================================================= */

function renderLevels() {

  const container =
    document.querySelector(
      '#levels'
    );

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
   SUBJECTS
========================================================= */

function renderSubjects() {

  const container =
    document.querySelector(
      '#subjects'
    );

  if (!container) return;


  const subjects =
    subjectsByLevel[state.level] || [];


  const intro =
    document.querySelector(
      '#subjects-intro'
    );


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
   ADDRESS VALUE
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


/* =========================================================
   SCHOOL VALUE
========================================================= */

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
   RECAP
========================================================= */

function renderRecap() {

  if (!form) return;


  const d =
    new FormData(form);


  const firstName =
    d.get('firstName') || '';


  const lastName =
    d.get('lastName') || '';


  const fullName =
    `${firstName} ${lastName}`.trim();


  const birthDate =
    d.get('birthDate') || '';


  const phone =
    d.get('studentPhone') || '';


  const parentPhone =
    d.get('parentPhone') || '';


  const address =
    getAddressValue();


  const school =
    getSchoolValue();


  const recap =
    document.querySelector(
      '#recap'
    );


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
        ${phone || '—'}
      </p>

      <p>
        Téléphone parent :
        ${parentPhone || '—'}
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

    if (!form) {
      return false;
    }


    const requiredFields =
      [
        ...form.querySelectorAll(
          '[data-step="1"] [required]'
        )
      ];


    /*
      Vérifier les champs obligatoires
    */

    for (
      const field
      of requiredFields
    ) {

      /*
        Checkbox / select / input
      */

      if (
        !String(
          field.value || ''
        ).trim()
      ) {

        setError(
          'Veuillez compléter tous les champs obligatoires.'
        );

        field.focus();

        return false;
      }

    }


    /* -------------------------
       Téléphone élève
    ------------------------- */

    if (
      !isValidPhone(
        studentPhone?.value
      )
    ) {

      setError(
        'Le numéro de téléphone de l’élève doit être au format 0X XX XX XX XX.'
      );


      studentPhone?.focus();

      return false;

    }


    /* -------------------------
       Téléphone parent
    ------------------------- */

    if (
      !isValidPhone(
        parentPhone?.value
      )
    ) {

      setError(
        'Le numéro du parent doit être au format 0X XX XX XX XX.'
      );


      parentPhone?.focus();

      return false;

    }


    /* -------------------------
       Adresse Autre
    ------------------------- */

    if (
      addressSelect?.value === 'Autre' &&
      !addressOther?.value.trim()
    ) {

      setError(
        'Veuillez préciser votre quartier.'
      );


      addressOther?.focus();

      return false;

    }


    /* -------------------------
       Établissement Autre
    ------------------------- */

    if (
      schoolSelect?.value === 'Autre' &&
      !schoolOther?.value.trim()
    ) {

      setError(
        'Veuillez préciser votre établissement.'
      );


      schoolOther?.focus();

      return false;

    }

  }


  /* =====================================================
     ÉTAPE 2
  ===================================================== */

  if (
    state.step === 2 &&
    !state.level
  ) {

    setError(
      'Veuillez choisir votre niveau.'
    );

    return false;

  }


  /* =====================================================
     ÉTAPE 3
  ===================================================== */

  if (
    state.step === 3 &&
    !state.subjects.length
  ) {

    setError(
      'Sélectionnez au moins une matière.'
    );

    return false;

  }


  /* =====================================================
     ÉTAPE 4
  ===================================================== */

  if (state.step === 4) {

    const confirmation =
      form?.querySelector(
        '[name="confirmed"]'
      );


    if (
      !confirmation ||
      !confirmation.checked
    ) {

      setError(
        'Veuillez confirmer que les informations saisies sont correctes.'
      );

      return false;

    }

  }


  return true;

}


/* =========================================================
   CLICK EVENTS
========================================================= */

document.addEventListener(
  'click',
  event => {

    const nextButton =
      event.target.closest(
        '[data-next]'
      );


    const backButton =
      event.target.closest(
        '[data-back]'
      );


    const levelButton =
      event.target.closest(
        '[data-level]'
      );


    /* -------------------------
       LEVEL
    ------------------------- */

    if (levelButton) {

      state.level =
        levelButton.dataset.level;

      state.subjects = [];


      renderLevels();

      return;

    }


    /* -------------------------
       NEXT
    ------------------------- */

    if (nextButton) {

      if (
        validate()
      ) {

        showStep(
          state.step + 1
        );

      }

      return;

    }


    /* -------------------------
       BACK
    ------------------------- */

    if (backButton) {

      showStep(
        state.step - 1
      );

      return;

    }

  }
);


/* =========================================================
   CHANGE EVENTS
========================================================= */

document.addEventListener(
  'change',
  event => {

    /* -------------------------
       Matières
    ------------------------- */

    if (
      event.target.matches(
        '#subjects input[type="checkbox"]'
      )
    ) {

      const subject =
        event.target.value;


      if (
        event.target.checked
      ) {

        if (
          !state.subjects.includes(
            subject
          )
        ) {

          state.subjects.push(
            subject
          );

        }

      } else {

        state.subjects =
          state.subjects.filter(
            x =>
              x !== subject
          );

      }


      renderSubjects();

      return;

    }


    /* -------------------------
       Adresse
    ------------------------- */

    if (
      event.target === addressSelect
    ) {

      toggleOtherFields();

      return;

    }


    /* -------------------------
       Établissement
    ------------------------- */

    if (
      event.target === schoolSelect
    ) {

      toggleOtherFields();

      return;

    }

  }
);


/* =========================================================
   PHONE INPUT
========================================================= */

document.addEventListener(
  'input',
  event => {

    if (
      event.target === studentPhone ||
      event.target === parentPhone
    ) {

      formatPhone(
        event.target
      );

    }

  }
);


/* =========================================================
   SUBMIT
========================================================= */

const submitButton =
  document.querySelector(
    '#submit-registration'
  );


if (submitButton) {

  submitButton.addEventListener(
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

        school:
          getSchoolValue(),

        address:
          getAddressValue(),

        level:
          state.level,

        subjects:
          state.subjects,

        status:
          'En attente',

        createdAt:
          new Date().toISOString()

      };


      try {

        if (
          window.NOKHBA_REMOTE &&
          window.NOKHBA_REMOTE.enabled
        ) {

          await window.NOKHBA_REMOTE
            .createRegistration(
              record
            );

        } else if (
          window.NOKHBA_STORE
        ) {

          window.NOKHBA_STORE
            .saveRegistration(
              record
            );

        } else {

          throw new Error(
            'Aucun système de stockage disponible.'
          );

        }


      } catch (err) {

        console.error(
          'Erreur inscription:',
          err
        );


        setError(
          'Une erreur est survenue. Veuillez réessayer.'
        );

        return;

      }


      const studentName =
        document.querySelector(
          '#student-name'
        );


      const registrationCode =
        document.querySelector(
          '#registration-code'
        );


      if (studentName) {

        studentName.textContent =
          d.get('firstName') || '';

      }


      if (registrationCode) {

        registrationCode.textContent =
          code;

      }


      form.hidden =
        true;


      const success =
        document.querySelector(
          '#success'
        );


      if (success) {
        success.hidden =
          false;
      }


      const progress =
        document.querySelector(
          '.progress-wrap'
        );


      if (progress) {
        progress.hidden =
          true;
      }


      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }
  );

}


/* =========================================================
   COPY CODE
========================================================= */

const copyButton =
  document.querySelector(
    '#copy-code'
  );


if (copyButton) {

  copyButton.addEventListener(
    'click',
    async () => {

      const code =
        document.querySelector(
          '#registration-code'
        )?.textContent || '';


      try {

        await navigator.clipboard
          .writeText(code);


        copyButton.textContent =
          'Code copié ✓';


      } catch {

        copyButton.textContent =
          code;

      }


      setTimeout(
        () => {

          copyButton.textContent =
            'Copier le code';

        },
        1800
      );

    }
  );

}


/* =========================================================
   NOUVELLE INSCRIPTION
========================================================= */

const newRegistrationButton =
  document.querySelector(
    '#new-registration'
  );


if (newRegistrationButton) {

  newRegistrationButton.addEventListener(
    'click',
    () => {

      if (form) {
        form.reset();
      }


      state.step =
        1;

      state.level =
        '';

      state.subjects =
        [];


      if (form) {
        form.hidden =
          false;
      }


      const success =
        document.querySelector(
          '#success'
        );


      if (success) {
        success.hidden =
          true;
      }


      const progress =
        document.querySelector(
          '.progress-wrap'
        );


      if (progress) {
        progress.hidden =
          false;
      }


      toggleOtherFields();

      renderLevels();

      showStep(1);

    }
  );

}


/* =========================================================
   INITIALISATION
========================================================= */

initOtherFields();

renderLevels();

showStep(1);
