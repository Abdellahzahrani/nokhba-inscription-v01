/* =========================================================
   INSTITUT NOKHBA
   ADMIN DASHBOARD
========================================================= */

const remote = window.NOKHBA_REMOTE;


/* =========================================================
   DOM
========================================================= */

const loginCard =
  document.querySelector('#login-card');

const dashboardContent =
  document.querySelector('#dashboard-content');

const catalogueCard =
  document.querySelector('#catalogue-card');

const loginForm =
  document.querySelector('#login-form');

const loginStatus =
  document.querySelector('#login-status');

const logoutButton =
  document.querySelector('#logout');

const recordsEl =
  document.querySelector('#registrations');

const catalogueEl =
  document.querySelector('#catalogue');

const searchEl =
  document.querySelector('#search');

const filterEl =
  document.querySelector('#filter');

const levelFilterEl =
  document.querySelector('#level-filter');

const statsEl =
  document.querySelector('#stats');

const saveButton =
  document.querySelector('#save');

const catalogueStatus =
  document.querySelector('#status');


/* =========================================================
   CATALOGUE INITIAL
========================================================= */

const initialCatalogue =
  JSON.parse(
    JSON.stringify(
      window.NOKHBA_CATALOG || {}
    )
  );


let savedCatalogue =
  JSON.parse(
    JSON.stringify(
      initialCatalogue
    )
  );


/* =========================================================
   RECORDS
========================================================= */

let records = [];


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ''
  ).replace(
    /[&<>'"]/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[char])
  );

}


/* =========================================================
   CONVERTIR CATALOGUE SUPABASE
========================================================= */

function convertCatalogueRows(rows) {

  const catalogue = {};


  if (!Array.isArray(rows)) {

    return catalogue;

  }


  rows.forEach(row => {

    /*
      Compatible avec plusieurs noms
      possibles de colonnes.
    */

    const level =
      row.level ||
      row.niveau ||
      row.level_name ||
      row.name;


    if (!level) {

      return;

    }


    let subjects =
      row.subjects ||
      row.matieres ||
      row.subject ||
      [];


    if (typeof subjects === 'string') {

      subjects =
        subjects
          .split(',')
          .map(
            item => item.trim()
          )
          .filter(Boolean);

    }


    if (!Array.isArray(subjects)) {

      subjects = [];

    }


    catalogue[level] =
      subjects;

  });


  return catalogue;

}


/* =========================================================
   AFFICHAGE CATALOGUE
========================================================= */

function showCatalogue() {

  if (!catalogueEl) {

    return;

  }


  catalogueEl.innerHTML =
    Object.entries(
      savedCatalogue
    )
      .map(
        ([level, subjects]) => `

          <label>

            <b>
              ${escapeHtml(level)}
            </b>

            <textarea
              data-level="${escapeHtml(level)}"
              rows="3"
            >${escapeHtml(
              Array.isArray(subjects)
                ? subjects.join(', ')
                : ''
            )}</textarea>

            <small>
              Séparez les matières par une virgule.
            </small>

          </label>

        `
      )
      .join('');

}


/* =========================================================
   CHARGER CATALOGUE SUPABASE
========================================================= */

async function loadCatalogue() {

  try {

    const remoteCatalogue =
      await remote.getCatalogue();


    /*
      Si Supabase retourne un tableau,
      on le convertit en objet.
    */

    const converted =
      convertCatalogueRows(
        remoteCatalogue
      );


    if (
      Object.keys(
        converted
      ).length
    ) {

      savedCatalogue = {

        ...savedCatalogue,

        ...converted

      };

    }

  }

  catch (error) {

    console.warn(
      'Catalogue distant indisponible:',
      error
    );

  }


  showCatalogue();

}


/* =========================================================
   NIVEAUX DU FILTRE
========================================================= */

function renderLevelFilter() {

  if (!levelFilterEl) {

    return;

  }


  const selected =
    levelFilterEl.value;


  const levels =
    [
      ...new Set(
        records
          .map(
            record => record.level
          )
          .filter(Boolean)
      )
    ]
      .sort();


  levelFilterEl.innerHTML = `

    <option value="">
      Tous les niveaux
    </option>

    ${
      levels
        .map(
          level => `

            <option
              value="${escapeHtml(level)}"
              ${
                level === selected
                  ? 'selected'
                  : ''
              }
            >
              ${escapeHtml(level)}
            </option>

          `
        )
        .join('')
    }

  `;

}


/* =========================================================
   AFFICHER STATISTIQUES
========================================================= */

function renderStats() {

  if (!statsEl) {

    return;

  }


  const pending =
    records.filter(
      record =>
        record.status === 'En attente'
    ).length;


  const confirmed =
    records.filter(
      record =>
        record.status === 'Confirmée'
    ).length;


  statsEl.innerHTML = `

    <div>
      <b>
        ${records.length}
      </b>

      <small>
        Total
      </small>
    </div>


    <div>
      <b>
        ${pending}
      </b>

      <small>
        En attente
      </small>
    </div>


    <div>
      <b>
        ${confirmed}
      </b>

      <small>
        Confirmées
      </small>
    </div>

  `;

}


/* =========================================================
   AFFICHER INSCRIPTIONS
========================================================= */

function renderRecords() {

  if (!recordsEl) {

    return;

  }


  renderLevelFilter();

  renderStats();


  const query =
    searchEl
      ? searchEl.value
          .trim()
          .toLowerCase()
      : '';


  const status =
    filterEl
      ? filterEl.value
      : '';


  const level =
    levelFilterEl
      ? levelFilterEl.value
      : '';


  const filtered =
    records

      .filter(
        record =>
          !status ||
          record.status === status
      )

      .filter(
        record =>
          !level ||
          record.level === level
      )

      .filter(
        record => {

          const text = `

            ${record.code || ''}

            ${record.firstName || ''}

            ${record.lastName || ''}

          `
            .toLowerCase();


          return text.includes(
            query
          );

        }

      );


  if (!filtered.length) {

    recordsEl.innerHTML = `

      <p class="selection-note">
        Aucune inscription ne correspond à votre recherche.
      </p>

    `;


    return;

  }


  recordsEl.innerHTML =
    filtered
      .map(
        record => {

          const subjects =
            Array.isArray(
              record.subjects
            )
              ? record.subjects
              : [];


          return `

            <article
              class="registration"
            >

              <div>

                <strong>
                  ${escapeHtml(
                    record.firstName
                  )}
                  ${escapeHtml(
                    record.lastName
                  )}
                </strong>


                <small>

                  ${escapeHtml(
                    record.code
                  )}

                  ·

                  ${escapeHtml(
                    record.createdAt
                  )}

                </small>


                <p>

                  ${escapeHtml(
                    record.level
                  )}

                  ·

                  ${
                    subjects
                      .map(
                        escapeHtml
                      )
                      .join(', ')
                  }

                </p>

              </div>


              <label>

                Statut

                <select
                  data-code="${escapeHtml(
                    record.code
                  )}"
                >

                  <option
                    ${
                      record.status ===
                      'En attente'
                        ? 'selected'
                        : ''
                    }
                  >
                    En attente
                  </option>


                  <option
                    ${
                      record.status ===
                      'Confirmée'
                        ? 'selected'
                        : ''
                    }
                  >
                    Confirmée
                  </option>


                  <option
                    ${
                      record.status ===
                      'Refusée'
                        ? 'selected'
                        : ''
                    }
                  >
                    Refusée
                  </option>

                </select>

              </label>

            </article>

          `;

        }
      )
      .join('');

}


/* =========================================================
   CHARGER INSCRIPTIONS
========================================================= */

async function loadRecords() {

  if (!remote) {

    return;

  }


  try {

    records =
      await remote.getRegistrations();


    if (!Array.isArray(records)) {

      records = [];

    }


    renderRecords();

  }

  catch (error) {

    console.error(
      'Erreur chargement inscriptions:',
      error
    );


    recordsEl.innerHTML = `

      <p class="form-error">

        Impossible de charger les inscriptions.

      </p>

    `;

  }

}


/* =========================================================
   OUVRIR DASHBOARD
========================================================= */

function openDashboard() {

  loginCard.hidden =
    true;


  dashboardContent.hidden =
    false;


  catalogueCard.hidden =
    false;


  loadCatalogue();

  loadRecords();

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

  loginForm.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      if (!remote?.enabled) {

        loginStatus.textContent =
          'Supabase n’est pas configuré.';

        return;

      }


      loginStatus.textContent =
        'Connexion…';


      const email =
        document
          .querySelector(
            '#admin-email'
          )
          ?.value
          .trim();


      const password =
        document
          .querySelector(
            '#admin-password'
          )
          ?.value;


      try {

        await remote.signIn(
          email,
          password
        );


        loginStatus.textContent =
          '';


        openDashboard();

      }

      catch (error) {

        console.error(
          'Erreur connexion:',
          error
        );


        loginStatus.textContent =
          error.message ||
          'Connexion impossible.';

      }

    }
  );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutButton) {

  logoutButton.addEventListener(
    'click',
    () => {

      remote.signOut();

      location.reload();

    }
  );

}


/* =========================================================
   SAUVEGARDER CATALOGUE
========================================================= */

if (saveButton) {

  saveButton.addEventListener(
    'click',
    async () => {

      document
        .querySelectorAll(
          '#catalogue [data-level]'
        )
        .forEach(
          field => {

            savedCatalogue[
              field.dataset.level
            ] =
              field.value

                .split(',')

                .map(
                  item =>
                    item.trim()
                )

                .filter(Boolean);

          }
        );


      catalogueStatus.textContent =
        'Enregistrement…';


      try {

        /*
          IMPORTANT :
          Le client Supabase actuel
          n'avait pas saveCatalogue().
          
          On ne fait donc PAS d'appel
          inexistant qui provoquerait
          une erreur JS.
        */

        localStorage.setItem(
          'nokhba-catalogue',
          JSON.stringify(
            savedCatalogue
          )
        );


        /*
          Si une fonction saveCatalogue
          existe dans une future version
          du client, elle sera utilisée.
        */

        if (
          typeof remote.saveCatalogue ===
          'function'
        ) {

          await remote.saveCatalogue(
            savedCatalogue
          );

        }


        catalogueStatus.textContent =
          'Matières enregistrées ✓';

      }

      catch (error) {

        console.error(
          'Erreur catalogue:',
          error
        );


        catalogueStatus.textContent =
          'Impossible d’enregistrer les matières.';

      }

    }
  );

}


/* =========================================================
   CHANGEMENT STATUT
========================================================= */

if (recordsEl) {

  recordsEl.addEventListener(
    'change',
    async event => {

      if (
        !event.target.matches(
          '[data-code]'
        )
      ) {

        return;

      }


      const code =
        event.target.dataset.code;


      const status =
        event.target.value;


      event.target.disabled =
        true;


      try {

        await remote.updateStatus(
          code,
          status
        );


        await loadRecords();

      }

      catch (error) {

        console.error(
          'Erreur statut:',
          error
        );


        alert(
          'Impossible de mettre à jour le statut.'
        );


        await loadRecords();

      }

    }
  );

}


/* =========================================================
   RECHERCHE
========================================================= */

if (searchEl) {

  searchEl.addEventListener(
    'input',
    renderRecords
  );

}


if (filterEl) {

  filterEl.addEventListener(
    'change',
    renderRecords
  );

}


if (levelFilterEl) {

  levelFilterEl.addEventListener(
    'change',
    renderRecords
  );

}


/* =========================================================
   INITIALISATION
========================================================= */

if (!remote?.enabled) {

  if (loginStatus) {

    loginStatus.textContent =
      'Supabase n’est pas configuré.';

  }

}

else if (
  remote.isAuthenticated()
) {

  openDashboard();

}
