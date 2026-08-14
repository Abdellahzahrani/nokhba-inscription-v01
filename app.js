/* =========================================================
   INSTITUT NOKHBA
   INSCRIPTION EN LIGNE
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
   CAPACITÉ DES GROUPES
========================================================= */

const groupCapacity = {

  'Primaire': 30,

  '1AC': 40,

  '2AC': 40,

  '3AC': 45,

  'Tronc Commun': 40,

  '1BAC scientifique': 50,

  '1BAC lettres': 50,

  '2BAC': 50

};


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
    'Mathématiques',
    'Français'
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
    'Catalogue non chargé',
    e
  );

}


/* =========================================================
   STATE
========================================================= */

const state = {

  step: 1,

  level: '',

  subjects: [],

  /*
    Nouveauté :
    groupes indépendants par matière
  */

  subjectGroups: []

};


/* =========================================================
   DOM
========================================================= */

const form =
  document.querySelector(
    '#registration-form'
  );

const screens =
  [...document.querySelectorAll('.screen')];

const addressSelect =
  form?.querySelector(
    '[name="address"]'
  );

const schoolSelect =
  form?.querySelector(
    '[name="school"]'
  );

const studentPhone =
  form?.querySelector(
    '[name="studentPhone"]'
  );

const parentPhone =
  form?.querySelector(
    '[name="parentPhone"]'
  );


/* =========================================================
   ERROR
========================================================= */

function getErrorElement() {

  return document.querySelector(
    `.screen[data-step="${state.step}"] .form-error`
  );

}


function setError(
  message = ''
) {

  const el =
    getErrorElement();

  if (el) {

    el.textContent =
      message;

  }

}


/* =========================================================
   AUTRE
========================================================= */

let addressOther = null;
let schoolOther = null;

let addressOtherWrapper = null;
let schoolOtherWrapper = null;


function findOtherField(
  select,
  text
) {

  if (!select) {

    return null;

  }


  const parent =
    select.parentElement;


  if (!parent) {

    return null;

  }


  const labels =
    [
      ...parent.parentElement
        ? parent.parentElement.querySelectorAll('label')
        : parent.querySelectorAll('label')
    ];


  const label =
    labels.find(
      label =>
        label.textContent
          .trim()
          .toLowerCase()
          .includes(
            text.toLowerCase()
          )
    );


  if (!label) {

    return null;

  }


  return {

    wrapper:
      label,

    input:
      label.querySelector(
        'input, textarea'
      )

  };

}


/* =========================================================
   INIT AUTRE
========================================================= */

function initOtherFields() {

  /* =========================
     ADRESSE
  ========================= */

  const addressExisting =
    findOtherField(
      addressSelect,
      'Précisez votre quartier'
    );


  if (addressExisting) {

    addressOtherWrapper =
      addressExisting.wrapper;

    addressOther =
      addressExisting.input;

  }

  else if (addressSelect) {

    const wrapper =
      document.createElement(
        'label'
      );


    wrapper.className =
      'nokhba-other-address';


    wrapper.innerHTML = `
      Précisez votre quartier

      <input
        type="text"
        name="addressOther"
        placeholder="Écrivez votre quartier"
        autocomplete="off"
      >
    `;


    addressSelect.parentElement
      .insertAdjacentElement(
        'afterend',
        wrapper
      );


    addressOtherWrapper =
      wrapper;


    addressOther =
      wrapper.querySelector(
        'input'
      );

  }


  /* =========================
     ÉTABLISSEMENT
  ========================= */

  const schoolExisting =
    findOtherField(
      schoolSelect,
      'Précisez votre établissement'
    );


  if (schoolExisting) {

    schoolOtherWrapper =
      schoolExisting.wrapper;

    schoolOther =
      schoolExisting.input;

  }

  else if (schoolSelect) {

    const wrapper =
      document.createElement(
        'label'
      );


    wrapper.className =
      'nokhba-other-school';


    wrapper.innerHTML = `
      Précisez votre établissement

      <input
        type="text"
        name="schoolOther"
        placeholder="Écrivez le nom de votre établissement"
        autocomplete="off"
      >
    `;


    schoolSelect.parentElement
      .insertAdjacentElement(
        'afterend',
        wrapper
      );


    schoolOtherWrapper =
      wrapper;


    schoolOther =
      wrapper.querySelector(
        'input'
      );

  }


  toggleOtherFields();

}


/* =========================================================
   SHOW / HIDE AUTRE
========================================================= */

function toggleOtherFields() {

  /* =========================
     ADRESSE
  ========================= */

  if (
    addressSelect &&
    addressOtherWrapper &&
    addressOther
  ) {

    const isOther =
      addressSelect.value === 'Autre';


    addressOtherWrapper.style.setProperty(
      'display',
      isOther
        ? 'block'
        : 'none',
      'important'
    );


    addressOther.hidden =
      !isOther;


    addressOther.required =
      isOther;


    if (!isOther) {

      addressOther.value =
        '';

    }

  }


  /* =========================
     ÉTABLISSEMENT
  ========================= */

  if (
    schoolSelect &&
    schoolOtherWrapper &&
    schoolOther
  ) {

    const isOther =
      schoolSelect.value === 'Autre';


    schoolOtherWrapper.style.setProperty(
      'display',
      isOther
        ? 'block'
        : 'none',
      'important'
    );


    schoolOther.hidden =
      !isOther;


    schoolOther.required =
      isOther;


    if (!isOther) {

      schoolOther.value =
        '';

    }

  }

}


/* =========================================================
   PHONE
========================================================= */

function formatPhone(
  input
) {

  if (!input) {

    return;

  }


  let digits =
    input.value.replace(
      /\D/g,
      ''
    );


  digits =
    digits.substring(
      0,
      10
    );


  const parts = [];


  if (digits.length > 0) {

    parts.push(
      digits.substring(
        0,
        2
      )
    );

  }


  if (digits.length > 2) {

    parts.push(
      digits.substring(
        2,
        4
      )
    );

  }


  if (digits.length > 4) {

    parts.push(
      digits.substring(
        4,
        6
      )
    );

  }


  if (digits.length > 6) {

    parts.push(
      digits.substring(
        6,
        8
      )
    );

  }


  if (digits.length > 8) {

    parts.push(
      digits.substring(
        8,
        10
      )
    );

  }


  input.value =
    parts.join(' ');

}


function getRawPhone(
  value
) {

  return String(
    value || ''
  ).replace(
    /\D/g,
    ''
  );

}


function isValidPhone(
  value
) {

  const phone =
    getRawPhone(
      value
    );


  return /^0[5-7]\d{8}$/.test(
    phone
  );

}


/* =========================================================
   NAVIGATION
========================================================= */

function showStep(
  step
) {

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
    .querySelectorAll(
      '#steps li'
    )
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


  if (!container) {

    return;

  }


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

            <small>
              ${sub}
            </small>

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


  if (!container) {

    return;

  }


  const subjects =
    subjectsByLevel[
      state.level
    ] || [];


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
              state.subjects.includes(
                name
              )
                ? 'selected'
                : ''
            }"
          >

            <input
              type="checkbox"
              value="${name}"
              ${
                state.subjects.includes(
                  name
                )
                  ? 'checked'
                  : ''
              }
            >

            <span>

              <b>
                ${name}
              </b>

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
   ESCAPE HTML
   Protection pour l'affichage
========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );

}


/* =========================================================
   RECAP
========================================================= */

function renderRecap() {

  if (!form) {

    return;

  }


  const d =
    new FormData(
      form
    );


  const firstName =
    d.get(
      'firstName'
    ) || '';


  const lastName =
    d.get(
      'lastName'
    ) || '';


  const fullName =
    `${firstName} ${lastName}`.trim();


  const birthDate =
    d.get(
      'birthDate'
    ) || '';


  const phone =
    d.get(
      'studentPhone'
    ) || '';


  const parentPhoneValue =
    d.get(
      'parentPhone'
    ) || '';


  const address =
    getAddressValue();


  const school =
    getSchoolValue();


  const recap =
    document.querySelector(
      '#recap'
    );


  if (!recap) {

    return;

  }


  recap.innerHTML = `

    <div class="recap-section">

      <h3>
        Élève
      </h3>

      <p>
        <strong>
          ${escapeHtml(fullName)}
        </strong>
      </p>

      <p>
        Date de naissance :
        ${escapeHtml(
          birthDate || '—'
        )}
      </p>

      <p>
        Téléphone :
        ${escapeHtml(
          phone || '—'
        )}
      </p>

      <p>
        Téléphone parent :
        ${escapeHtml(
          parentPhoneValue || '—'
        )}
      </p>

      <p>
        Établissement :
        ${escapeHtml(
          school || '—'
        )}
      </p>

      <p>
        Adresse :
        ${escapeHtml(
          address || '—'
        )}
      </p>

    </div>


    <div class="recap-section">

      <h3>
        Niveau
      </h3>

      <p>
        <strong>
          ${escapeHtml(
            state.level
          )}
        </strong>
      </p>

    </div>


    <div class="recap-section">

      <h3>
        Matières choisies
      </h3>

      ${
        state.subjects.length

          ? state.subjects
              .map(
                subject => `

                  <div class="subject-row">

                    <span>
                      ${escapeHtml(
                        subject
                      )}
                    </span>

                    <span>
                      ✓
                    </span>

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


  /* =========================
     STEP 1
  ========================= */

  if (
    state.step === 1
  ) {

    const requiredFields =
      [
        ...form.querySelectorAll(
          '[data-step="1"] [required]'
        )
      ];


    for (
      const field
      of requiredFields
    ) {

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


    if (
      addressSelect?.value === 'Autre'
    ) {

      if (
        !addressOther ||
        !addressOther.value.trim()
      ) {

        setError(
          'Veuillez préciser votre quartier.'
        );


        addressOther?.focus();


        return false;

      }

    }


    if (
      schoolSelect?.value === 'Autre'
    ) {

      if (
        !schoolOther ||
        !schoolOther.value.trim()
      ) {

        setError(
          'Veuillez préciser votre établissement.'
        );


        schoolOther?.focus();


        return false;

      }

    }

  }


  /* =========================
     STEP 2
  ========================= */

  if (
    state.step === 2 &&
    !state.level
  ) {

    setError(
      'Veuillez choisir votre niveau.'
    );


    return false;

  }


  /* =========================
     STEP 3
  ========================= */

  if (
    state.step === 3 &&
    !state.subjects.length
  ) {

    setError(
      'Sélectionnez au moins une matière.'
    );


    return false;

  }


  /* =========================
     STEP 4
  ========================= */

  if (
    state.step === 4
  ) {

    const confirmation =
      form.querySelector(
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
   CLICK
========================================================= */

document.addEventListener(
  'click',
  event => {

    const next =
      event.target.closest(
        '[data-next]'
      );


    const back =
      event.target.closest(
        '[data-back]'
      );


    const level =
      event.target.closest(
        '[data-level]'
      );


    /* =========================
       NIVEAU
    ========================= */

    if (level) {

      state.level =
        level.dataset.level;


      state.subjects =
        [];


      state.subjectGroups =
        [];


      renderLevels();


      return;

    }


    /* =========================
       CONTINUER
    ========================= */

    if (next) {

      if (
        validate()
      ) {

        showStep(
          state.step + 1
        );

      }


      return;

    }


    /* =========================
       RETOUR
    ========================= */

    if (back) {

      showStep(
        state.step - 1
      );


      return;

    }

  }
);


/* =========================================================
   CHANGE
========================================================= */

document.addEventListener(
  'change',
  event => {


    /* =========================
       MATIÈRES
    ========================= */

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

      }

      else {

        state.subjects =
          state.subjects.filter(
            item =>
              item !== subject
          );

      }


      renderSubjects();


      return;

    }


    /* =========================
       ADRESSE
    ========================= */

    if (
      event.target ===
      addressSelect
    ) {

      toggleOtherFields();


      return;

    }


    /* =========================
       ÉTABLISSEMENT
    ========================= */

    if (
      event.target ===
      schoolSelect
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
      event.target ===
        studentPhone ||
      event.target ===
        parentPhone
    ) {

      formatPhone(
        event.target
      );

    }

  }
);


/* =========================================================
   RENDER GROUPES PAR MATIÈRE
========================================================= */

function renderSubjectGroups(
  groups,
  fallbackCapacity
) {

  const container =
    document.querySelector(
      '#registration-groups'
    );


  if (!container) {

    console.warn(
      'Élément #registration-groups absent du HTML.'
    );


    return;

  }


  if (
    !Array.isArray(groups) ||
    !groups.length
  ) {

    container.innerHTML = `

      <div class="recap-section">

        <h3>
          Groupes
        </h3>

        <p>
          Groupe en cours d’attribution.
        </p>

      </div>

    `;


    return;

  }


  container.innerHTML = `

    <div class="recap-section">

      <h3>
        Vos groupes par matière
      </h3>

      <div class="subject-groups-list">

        ${
          groups
            .map(
              item => {

                const subject =
                  item.subject ||
                  item.name ||
                  'Matière';


                const groupName =
                  item.group_name ||
                  item.groupName ||
                  '—';


                const position =
                  item.group_position ??
                  item.groupPosition ??
                  '—';


                const capacity =
                  item.group_capacity ??
                  item.groupCapacity ??
                  fallbackCapacity ??
                  '—';


                return `

                  <div class="subject-row">

                    <span>
                      <strong>
                        ${escapeHtml(
                          subject
                        )}
                      </strong>
                    </span>

                    <span>
                      ${escapeHtml(
                        groupName
                      )}

                      —

                      ${escapeHtml(
                        position
                      )}/${escapeHtml(
                        capacity
                      )}
                    </span>

                  </div>

                `;

              }
            )
            .join('')
        }

      </div>

    </div>

  `;

}


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

      if (
        !validate()
      ) {

        return;

      }


      submitButton.disabled =
        true;


      const oldButtonText =
        submitButton.innerHTML;


      submitButton.innerHTML =
        'Enregistrement...';


      const d =
        new FormData(
          form
        );


      const code =
        `NOK-26-${String(
          Math.floor(
            Math.random() * 90000
          ) + 10000
        )}`;


      const capacity =
        groupCapacity[
          state.level
        ] || 50;


      const record = {

        code,

        firstName:
          d.get(
            'firstName'
          ),

        lastName:
          d.get(
            'lastName'
          ),

        birthDate:
          d.get(
            'birthDate'
          ),

        phone:
          getRawPhone(
            d.get(
              'studentPhone'
            )
          ),

        parentPhone:
          getRawPhone(
            d.get(
              'parentPhone'
            )
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
          new Date().toISOString(),

        groupCapacity:
          capacity

      };


      let result =
        null;


      try {

        if (
          window.NOKHBA_REMOTE &&
          window.NOKHBA_REMOTE.enabled
        ) {

          result =
            await window.NOKHBA_REMOTE
              .createRegistration(
                record
              );

        }

        else if (
          window.NOKHBA_STORE
        ) {

          result =
            await window.NOKHBA_STORE
              .saveRegistration(
                record
              );

        }

        else {

          throw new Error(
            'Aucun système de stockage disponible'
          );

        }

      }

      catch (err) {

        console.error(
          'Erreur inscription:',
          err
        );


        setError(
          'Une erreur est survenue. Veuillez réessayer.'
        );


        submitButton.disabled =
          false;


        submitButton.innerHTML =
          oldButtonText;


        return;

      }


      /* =====================================================
         RÉCUPÉRATION DES GROUPES PAR MATIÈRE
      ===================================================== */

      let subjectGroups = [];


      /*
        Format principal retourné par
        register_nokhba_student
      */

      if (
        Array.isArray(
          result?.subjects
        )
      ) {

        subjectGroups =
          result.subjects;

      }


      /*
        Compatibilité avec différentes
        formes de réponse.
      */

      else if (
        Array.isArray(
          result?.data?.subjects
        )
      ) {

        subjectGroups =
          result.data.subjects;

      }


      /*
        Si le RPC retourne un tableau.
      */

      else if (
        Array.isArray(result)
      ) {

        const first =
          result[0];


        if (
          Array.isArray(
            first?.subjects
          )
        ) {

          subjectGroups =
            first.subjects;

        }

        else if (
          Array.isArray(
            first?.data?.subjects
          )
        ) {

          subjectGroups =
            first.data.subjects;

        }

      }


      /*
        Sauvegarde dans state
        pour utilisation éventuelle.
      */

      state.subjectGroups =
        subjectGroups;


      /* =====================================================
         ANCIEN GROUPE — COMPATIBILITÉ
      ===================================================== */

      let groupName =
        result?.group_name ||
        result?.groupName ||
        result?.data?.group_name ||
        result?.data?.groupName ||
        '';


      let groupPosition =
        result?.group_position ||
        result?.groupPosition ||
        result?.data?.group_position ||
        result?.data?.groupPosition ||
        '';


      /*
        Si le résultat principal ne contient
        pas group_name, on prend la première
        matière comme fallback.
      */

      if (
        !groupName &&
        subjectGroups.length
      ) {

        const first =
          subjectGroups[0];


        groupName =
          first.group_name ||
          first.groupName ||
          '';


        groupPosition =
          first.group_position ??
          first.groupPosition ??
          '';

      }


      /* =====================================================
         AFFICHAGE NOM
      ===================================================== */

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
          d.get(
            'firstName'
          ) || '';

      }


      if (registrationCode) {

        registrationCode.textContent =
          code;

      }


      /* =====================================================
         AFFICHAGE GROUPES PAR MATIÈRE
      ===================================================== */

      renderSubjectGroups(
        subjectGroups,
        capacity
      );


      /*
        Ancien élément éventuel
        #registration-group
      */

      const groupElement =
        document.querySelector(
          '#registration-group'
        );


      if (groupElement) {

        if (
          subjectGroups.length
        ) {

          groupElement.hidden =
            true;

        }

        else if (
          groupName &&
          groupPosition
        ) {

          groupElement.textContent =
            `${groupName} — ${groupPosition}/${capacity}`;

        }

        else if (
          groupName
        ) {

          groupElement.textContent =
            groupName;

        }

        else {

          groupElement.textContent =
            'Groupe en cours d’attribution';

        }

      }


      /* =====================================================
         SUCCÈS
      ===================================================== */

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


      submitButton.disabled =
        false;


      submitButton.innerHTML =
        oldButtonText;


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
          .writeText(
            code
          );


        copyButton.textContent =
          'Code copié ✓';

      }

      catch {

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

const newRegistration =
  document.querySelector(
    '#new-registration'
  );


if (newRegistration) {

  newRegistration.addEventListener(
    'click',
    () => {

      form.reset();


      state.step =
        1;


      state.level =
        '';


      state.subjects =
        [];


      state.subjectGroups =
        [];


      form.hidden =
        false;


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


      const groups =
        document.querySelector(
          '#registration-groups'
        );


      if (groups) {

        groups.innerHTML =
          '';

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
