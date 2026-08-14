const remote = window.NOKHBA_REMOTE;

const initialCatalogue = JSON.parse(
  JSON.stringify(window.NOKHBA_CATALOG || {})
);

let savedCatalogue = {
  ...initialCatalogue
};

const catalogueEl =
  document.querySelector('#catalogue');

const recordsEl =
  document.querySelector('#registrations');

const searchEl =
  document.querySelector('#search');

const filterEl =
  document.querySelector('#filter');

const levelFilterEl =
  document.querySelector('#level-filter');

const loginCard =
  document.querySelector('#login-card');

const dashboardContent =
  document.querySelector('#dashboard-content');

const catalogueCard =
  document.querySelector('#catalogue-card');


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

  return String(value ?? '')
    .replace(
      /[&<>'"]/g,
      char =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[char])
    );

}


/* =========================================================
   CATALOGUE
========================================================= */

function showCatalogue() {

  if (!catalogueEl) {
    return;
  }


  catalogueEl.innerHTML =
    Object.entries(savedCatalogue)
      .map(
        ([level, subjects]) => `

          <label>

            <b>
              ${escapeHtml(level)}
            </b>

            <textarea
              data-catalogue-level="${escapeHtml(level)}"
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
   CHARGER CATALOGUE
========================================================= */

async function loadCatalogue() {

  try {

    if (
      remote &&
      remote.getCatalogue
    ) {

      const remoteCatalogue =
        await remote.getCatalogue();


      if (
        Array.isArray(remoteCatalogue)
      ) {

        /*
          Compatibilité avec une table catalogue
          retournant des lignes.
        */

        remoteCatalogue.forEach(
          row => {

            const level =
              row.level ||
              row.niveau;

            const subjects =
              row.subjects ||
              row.matieres ||
              row.subject;

            if (
              level &&
              Array.isArray(subjects)
            ) {

              savedCatalogue[level] =
                subjects;

            }

          }
        );

      }

      else if (
        remoteCatalogue &&
        typeof remoteCatalogue === 'object'
      ) {

        savedCatalogue = {

          ...savedCatalogue,

          ...remoteCatalogue

        };

      }

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
   RECORDS
========================================================= */

let records = [];


/* =========================================================
   LEVEL FILTER
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
   GROUPES PAR MATIÈRE
========================================================= */

function getSubjectGroups(record) {

  /*
    Format principal attendu :
    record.subjectGroups
  */

  if (
    Array.isArray(
      record.subjectGroups
    )
  ) {

    return record.subjectGroups;

  }


  /*
    Compatibilité éventuelle :
    groups / groupsBySubject / subjectsGroups
  */

  if (
    Array.isArray(
      record.groups
    )
  ) {

    return record.groups;

  }


  if (
    Array.isArray(
      record.groupsBySubject
    )
  ) {

    return record.groupsBySubject;

  }


  if (
    Array.isArray(
      record.subjectsGroups
    )
  ) {

    return record.subjectsGroups;

  }


  return [];

}


/* =========================================================
   RENDU GROUPES
========================================================= */

function renderGroups(record) {

  const groups =
    getSubjectGroups(record);


  /*
    Aucun groupe retourné
  */

  if (
    !groups.length
  ) {

    /*
      Ancienne compatibilité :
      groupe global.
    */

    if (
      record.group ||
      record.groupPosition
    ) {

      return `

        <div class="admin-groups">

          <small>
            Groupe
          </small>

          <div class="admin-group-row">

            <strong>
              ${escapeHtml(
                record.group || '—'
              )}
            </strong>

            ${
              record.groupPosition
                ? `<span>
                    ${escapeHtml(
                      record.groupPosition
                    )}
                  </span>`
                : ''
            }

          </div>

        </div>

      `;

    }


    return `

      <div class="admin-groups">

        <small>
          Groupes par matière
        </small>

        <p class="selection-note">
          Groupe en cours d’attribution
        </p>

      </div>

    `;

  }


  return `

    <div class="admin-groups">

      <small>
        Groupes par matière
      </small>

      <div class="admin-subject-groups">

        ${
          groups
            .map(
              item => {

                const subject =
                  item.subject ||
                  item.name ||
                  item.matiere ||
                  'Matière';


                const groupName =
                  item.group_name ||
                  item.groupName ||
                  item.group ||
                  '—';


                const position =
                  item.group_position ??
                  item.groupPosition ??
                  item.position ??
                  '—';


                const capacity =
                  item.group_capacity ??
                  item.groupCapacity ??
                  item.capacity ??
                  '';


                return `

                  <div
                    class="admin-group-row"
                  >

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

                      ${
                        capacity
                          ? ` — ${escapeHtml(
                              position
                            )}/${escapeHtml(
                              capacity
                            )}`
                          : ''
                      }

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
   RENDER RECORDS
========================================================= */

function renderRecords() {

  if (
    !recordsEl ||
    !searchEl ||
    !filterEl ||
    !levelFilterEl
  ) {

    return;

  }


  renderLevelFilter();


  const query =
    searchEl.value
      .trim()
      .toLowerCase();


  const status =
    filterEl.value;


  const level =
    levelFilterEl.value;


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
        record =>
          `

            ${record.code || ''}
            ${record.firstName || ''}
            ${record.lastName || ''}

          `
            .toLowerCase()
            .includes(query)
      );


  const stats =
    document.querySelector(
      '#stats'
    );


  if (stats) {

    stats.innerHTML = `

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
          ${
            records.filter(
              record =>
                record.status ===
                'En attente'
            ).length
          }
        </b>

        <small>
          En attente
        </small>

      </div>

      <div>

        <b>
          ${
            records.filter(
              record =>
                record.status ===
                'Confirmée'
            ).length
          }
        </b>

        <small>
          Confirmées
        </small>

      </div>

    `;

  }


  if (
    !filtered.length
  ) {

    recordsEl.innerHTML = `

      <p class="selection-note">
        Aucune inscription ne correspond
        à votre recherche.
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
                    subjects.length
                      ? subjects
                          .map(
                            subject =>
                              escapeHtml(
                                subject
                              )
                          )
                          .join(', ')
                      : 'Aucune matière'
                  }

                </p>

                ${renderGroups(record)}

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

  try {

    if (
      !remote ||
      !remote.getRegistrations
    ) {

      throw new Error(
        'Supabase indisponible.'
      );

    }


    records =
      await remote.getRegistrations();


    if (
      !Array.isArray(records)
    ) {

      records = [];

    }


    renderRecords();

  }

  catch (error) {

    console.error(
      'Erreur chargement inscriptions:',
      error
    );


    records = [];


    if (recordsEl) {

      recordsEl.innerHTML = `

        <p class="form-error">

          Impossible de charger les inscriptions.

        </p>

      `;

    }

  }

}


/* =========================================================
   OPEN DASHBOARD
========================================================= */

function openDashboard() {

  if (loginCard) {

    loginCard.hidden =
      true;

  }


  if (dashboardContent) {

    dashboardContent.hidden =
      false;

  }


  if (catalogueCard) {

    catalogueCard.hidden =
      false;

  }


  loadCatalogue();

  loadRecords();

}


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
  document.querySelector(
    '#login-form'
  );


if (loginForm) {

  loginForm.addEventListener(
    'submit',
    async event => {

      event.preventDefault();


      const status =
        document.querySelector(
          '#login-status'
        );


      if (status) {

        status.textContent =
          'Connexion…';

      }


      try {

        await remote.signIn(

          document
            .querySelector(
              '#admin-email'
            )
            .value
            .trim(),

          document
            .querySelector(
              '#admin-password'
            )
            .value

        );


        if (status) {

          status.textContent =
            '';

        }


        openDashboard();

      }

      catch (error) {

        console.error(
          'Erreur connexion:',
          error
        );


        if (status) {

          status.textContent =
            error.message ||
            'Connexion impossible.';

        }

      }

    }
  );

}


/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
  document.querySelector(
    '#logout'
  );


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
   SAVE CATALOGUE
========================================================= */

const saveButton =
  document.querySelector(
    '#save'
  );


if (saveButton) {

  saveButton.addEventListener(
    'click',
    async () => {

      const status =
        document.querySelector(
          '#status'
        );


      /*
        Lire les textarea.
      */

      document
        .querySelectorAll(
          '[data-catalogue-level]'
        )
        .forEach(
          field => {

            savedCatalogue[
              field.dataset
                .catalogueLevel
            ] =
              field.value

                .split(',')

                .map(
                  value =>
                    value.trim()
                )

                .filter(Boolean);

          }
        );


      /*
        Sauvegarde locale
        pour conserver le comportement
        actuel du formulaire.
      */

      try {

        localStorage.setItem(

          'nokhba-catalogue',

          JSON.stringify(
            savedCatalogue
          )

        );

      }

      catch (error) {

        console.warn(
          'Sauvegarde locale impossible:',
          error
        );

      }


      /*
        Sauvegarde Supabase si disponible.
      */

      try {

        if (
          remote &&
          typeof remote.saveCatalogue ===
            'function'
        ) {

          await remote.saveCatalogue(
            savedCatalogue
          );

        }


        if (status) {

          status.textContent =
            'Matières enregistrées ✓';

        }

      }

      catch (error) {

        console.error(
          'Erreur sauvegarde catalogue:',
          error
        );


        if (status) {

          status.textContent =
            'Matières sauvegardées localement. Supabase n’a pas pu être mis à jour.';

        }

      }

    }
  );

}


/* =========================================================
   UPDATE STATUS
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

      }

    }
  );

}


/* =========================================================
   SEARCH / FILTERS
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
   INIT
========================================================= */

if (
  !remote ||
  !remote.enabled
) {

  const loginStatus =
    document.querySelector(
      '#login-status'
    );


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
