const remote = window.NOKHBA_REMOTE;

const initialCatalogue = JSON.parse(
  JSON.stringify(window.NOKHBA_CATALOG)
);

let savedCatalogue = { ...initialCatalogue };

const catalogueEl = document.querySelector('#catalogue');
const recordsEl = document.querySelector('#registrations');

const searchEl = document.querySelector('#search');
const filterEl = document.querySelector('#filter');
const levelFilterEl = document.querySelector('#level-filter');

const loginCard = document.querySelector('#login-card');
const dashboardContent = document.querySelector('#dashboard-content');
const catalogueCard = document.querySelector('#catalogue-card');

const loginStatus = document.querySelector('#login-status');
const catalogueStatus = document.querySelector('#status');

let records = [];


/* =========================================================
   UTILITAIRE
========================================================= */

function escapeHtml(value) {
  return String(value).replace(
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
   CATALOGUE
========================================================= */

function showCatalogue() {

  if (!catalogueEl) return;

  catalogueEl.innerHTML =
    Object.entries(savedCatalogue)
      .map(([level, subjects]) => {

        return `
          <label>
            <b>${escapeHtml(level)}</b>

            <textarea
              data-level="${escapeHtml(level)}"
              rows="3"
            >${escapeHtml(subjects.join(', '))}</textarea>

            <small>
              Séparez les matières par une virgule.
            </small>
          </label>
        `;

      })
      .join('');
}


async function loadCatalogue() {

  try {

    const remoteCatalogue =
      await remote.getCatalogue();

    /*
      Le client Supabase retourne un tableau.
      On ne modifie pas la logique actuelle du formulaire.
    */

    if (
      Array.isArray(remoteCatalogue) &&
      remoteCatalogue.length
    ) {

      remoteCatalogue.forEach(row => {

        /*
          Compatibilité avec plusieurs noms possibles
          sans toucher au catalogue local.
        */

        const level =
          row.level ||
          row.niveau;

        const subjects =
          row.subjects ||
          row.matières ||
          row.matieres;

        if (
          level &&
          Array.isArray(subjects)
        ) {

          savedCatalogue[level] =
            subjects;

        }

      });

    }

  } catch (error) {

    console.warn(
      'Catalogue Supabase indisponible :',
      error
    );

  }

  showCatalogue();
}


/* =========================================================
   NIVEAUX
========================================================= */

function renderLevelFilter() {

  const selected =
    levelFilterEl.value;

  const levels =
    [...new Set(
      records
        .map(r => r.level)
        .filter(Boolean)
    )].sort();

  levelFilterEl.innerHTML = `
    <option value="">
      Tous les niveaux
    </option>

    ${levels
      .map(level => `
        <option
          value="${escapeHtml(level)}"
          ${level === selected ? 'selected' : ''}
        >
          ${escapeHtml(level)}
        </option>
      `)
      .join('')
    }
  `;
}


/* =========================================================
   AFFICHAGE DES INSCRIPTIONS
========================================================= */

function renderRecords() {

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
        r =>
          !status ||
          r.status === status
      )

      .filter(
        r =>
          !level ||
          r.level === level
      )

      .filter(r => {

        const text = `
          ${r.code || ''}
          ${r.firstName || ''}
          ${r.lastName || ''}
        `.toLowerCase();

        return text.includes(query);

      });


  /* =======================================================
     STATISTIQUES
  ======================================================= */

  document.querySelector('#stats').innerHTML = `

    <div>
      <b>${records.length}</b>
      <small>Total</small>
    </div>

    <div>
      <b>
        ${
          records.filter(
            r => r.status === 'En attente'
          ).length
        }
      </b>

      <small>En attente</small>
    </div>

    <div>
      <b>
        ${
          records.filter(
            r => r.status === 'Confirmée'
          ).length
        }
      </b>

      <small>Confirmées</small>
    </div>

  `;


  /* =======================================================
     LISTE
  ======================================================= */

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
      .map(r => {

        const subjects =
          Array.isArray(r.subjects)
            ? r.subjects
            : [];

        return `

          <article class="registration">

            <div>

              <strong>
                ${escapeHtml(
                  `${r.firstName || ''} ${r.lastName || ''}`
                )}
              </strong>

              <small>
                ${escapeHtml(r.code || '')}
                ·
                ${escapeHtml(r.createdAt || '')}
              </small>

              <p>
                ${escapeHtml(r.level || '')}
                ·
                ${subjects
                  .map(escapeHtml)
                  .join(', ')
                }
              </p>

            </div>


            <label>

              Statut

              <select
                data-code="${escapeHtml(r.code)}"
              >

                <option
                  value="En attente"
                  ${r.status === 'En attente' ? 'selected' : ''}
                >
                  En attente
                </option>

                <option
                  value="Confirmée"
                  ${r.status === 'Confirmée' ? 'selected' : ''}
                >
                  Confirmée
                </option>

                <option
                  value="Refusée"
                  ${r.status === 'Refusée' ? 'selected' : ''}
                >
                  Refusée
                </option>

              </select>

            </label>

          </article>

        `;

      })
      .join('');
}


/* =========================================================
   CHARGER LES INSCRIPTIONS
========================================================= */

async function loadRecords() {

  try {

    records =
      await remote.getRegistrations();

    renderRecords();

  } catch (error) {

    console.error(
      'Erreur chargement inscriptions :',
      error
    );

    records = [];

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

  loginCard.hidden = true;

  dashboardContent.hidden = false;

  catalogueCard.hidden = false;

  loadCatalogue();

  loadRecords();

}


/* =========================================================
   LOGIN
========================================================= */

document
  .querySelector('#login-form')
  .addEventListener(
    'submit',
    async event => {

      event.preventDefault();

      loginStatus.textContent =
        'Connexion…';

      try {

        await remote.signIn(

          document
            .querySelector('#admin-email')
            .value
            .trim(),

          document
            .querySelector('#admin-password')
            .value

        );

        loginStatus.textContent = '';

        openDashboard();

      } catch (error) {

        console.error(error);

        loginStatus.textContent =
          error.message ||
          'Connexion impossible.';

      }

    }
  );


/* =========================================================
   LOGOUT
========================================================= */

document
  .querySelector('#logout')
  .addEventListener(
    'click',
    () => {

      remote.signOut();

      location.reload();

    }
  );


/* =========================================================
   CHANGEMENT DE STATUT
========================================================= */

recordsEl.addEventListener(
  'change',
  async event => {

    if (
      !event.target.matches('[data-code]')
    ) {
      return;
    }

    const select =
      event.target;

    const code =
      select.dataset.code;

    const status =
      select.value;


    select.disabled = true;


    try {

      await remote.updateStatus(
        code,
        status
      );

      await loadRecords();

    } catch (error) {

      console.error(error);

      alert(
        'Impossible de mettre à jour le statut.'
      );

      await loadRecords();

    }

  }
);


/* =========================================================
   FILTRES
========================================================= */

searchEl.addEventListener(
  'input',
  renderRecords
);

filterEl.addEventListener(
  'change',
  renderRecords
);

levelFilterEl.addEventListener(
  'change',
  renderRecords
);


/* =========================================================
   CATALOGUE
========================================================= */

document
  .querySelector('#save')
  .addEventListener(
    'click',
    async () => {

      /*
        On conserve la modification locale
        sans toucher à la logique des groupes.

        Le supabase-client actuel ne fournit pas encore
        saveCatalogue(), donc on ne lance pas un appel
        inexistant.
      */

      document
        .querySelectorAll('[data-level]')
        .forEach(field => {

          savedCatalogue[
            field.dataset.level
          ] =
            field.value
              .split(',')
              .map(x => x.trim())
              .filter(Boolean);

        });


      /*
        Sauvegarde locale uniquement pour l'instant.
      */

      localStorage.setItem(
        'nokhba-catalogue',
        JSON.stringify(savedCatalogue)
      );


      catalogueStatus.textContent =
        'Matières enregistrées sur cet appareil ✓';

    }
  );


/* =========================================================
   INITIALISATION
========================================================= */

if (!remote.enabled) {

  loginStatus.textContent =
    'Supabase n’est pas configuré.';

} else if (
  remote.isAuthenticated()
) {

  openDashboard();

}
