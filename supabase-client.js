/* =========================================================
   INSTITUT NOKHBA
   SUPABASE CLIENT
========================================================= */

(function () {

  const c =
    window.NOKHBA_SUPABASE || {};

  const tokenKey =
    'nokhba-supabase-session';


  /* =======================================================
     CONFIGURATION
  ======================================================= */

  const enabled =
    Boolean(
      c.url &&
      c.anonKey
    );


  let session = null;


  try {

    session =
      JSON.parse(
        localStorage.getItem(tokenKey) ||
        'null'
      );

  } catch {

    session = null;

  }


  /* =======================================================
     AUTH HEADERS
  ======================================================= */

  function authHeaders() {

    const headers = {

      apikey:
        c.anonKey,

      'Content-Type':
        'application/json'

    };


    if (
      session?.access_token
    ) {

      headers.Authorization =
        `Bearer ${session.access_token}`;

    }


    return headers;

  }


  /* =======================================================
     REQUEST
  ======================================================= */

  async function request(
    path,
    options = {}
  ) {

    const headers = {

      ...authHeaders(),

      Prefer:
        options.prefer ||
        'return=minimal',

      ...(options.headers || {})

    };


    const r =
      await fetch(

        `${c.url}/rest/v1/${path}`,

        {

          ...options,

          headers

        }

      );


    if (!r.ok) {

      const text =
        await r.text();

      throw new Error(
        text ||
        `Supabase error ${r.status}`
      );

    }


    const text =
      await r.text();


    return text
      ? JSON.parse(text)
      : null;

  }


  /* =======================================================
     AUTH
  ======================================================= */

  async function auth(
    path,
    body
  ) {

    const r =
      await fetch(

        `${c.url}/auth/v1/${path}`,

        {

          method:
            'POST',

          headers: {

            apikey:
              c.anonKey,

            'Content-Type':
              'application/json'

          },

          body:
            JSON.stringify(body)

        }

      );


    const data =
      await r.json();


    if (!r.ok) {

      throw new Error(

        data.error_description ||

        data.msg ||

        data.message ||

        'Échec de connexion.'

      );

    }


    return data;

  }


  /* =======================================================
     SESSION
  ======================================================= */

  function setSession(
    data
  ) {

    session =
      data;


    localStorage.setItem(
      tokenKey,
      JSON.stringify(data)
    );

  }


  function clearSession() {

    session =
      null;


    localStorage.removeItem(
      tokenKey
    );

  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.NOKHBA_REMOTE = {

    enabled,


    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    isAuthenticated: () =>
      Boolean(
        session?.access_token
      ),


    async signIn(
      email,
      password
    ) {

      const data =
        await auth(

          'token?grant_type=password',

          {
            email,
            password
          }

        );


      setSession(
        data
      );


      return data;

    },


    signOut() {

      clearSession();

    },


    /* =====================================================
       CREATE REGISTRATION
       GROUPES PAR MATIÈRE
    ===================================================== */

    async createRegistration(
      record
    ) {

      const result =
        await request(

          'rpc/register_nokhba_student',

          {

            method:
              'POST',

            prefer:
              'return=representation',

            body:
              JSON.stringify({

                p_code:
                  record.code,

                p_first_name:
                  record.firstName,

                p_last_name:
                  record.lastName,

                p_phone:
                  record.phone,

                p_parent_phone:
                  record.parentPhone,

                p_school:
                  record.school,

                p_address:
                  record.address,

                p_level:
                  record.level,

                p_subjects:
                  record.subjects,

                p_status:
                  record.status

              })

          }

        );


      /*
        Le RPC retourne maintenant :

        registration_id

        group_name
        group_position
        group_capacity

        subjects : [
          {
            subject,
            group_name,
            group_position,
            group_capacity,
            group_number
          }
        ]
      */


      /*
        Selon la façon dont Supabase
        retourne le JSON, on normalise
        la réponse pour app.js.
      */

      if (
        result &&
        !Array.isArray(result)
      ) {

        return result;

      }


      if (
        Array.isArray(result) &&
        result.length > 0
      ) {

        return result[0];

      }


      return result || null;

    },


    /* =====================================================
       GET REGISTRATIONS
    ===================================================== */

    async getRegistrations() {

      const rows =
        await request(

          'registrations?select=*&order=created_at.desc',

          {

            prefer:
              'return=representation'

          }

        );


      return (
        rows || []
      ).map(

        r => ({

          id:
            r.id,

          code:
            r.code,

          firstName:
            r.first_name,

          lastName:
            r.last_name,

          birthDate:
            r.birth_date,

          phone:
            r.phone,

          parentPhone:
            r.parent_phone,

          school:
            r.school,

          address:
            r.address,

          level:
            r.level,

          subjects:
            r.subjects || [],

          status:
            r.status,

          group:
            r.group_name,

          groupPosition:
            r.group_position,

          createdAt:
            new Date(
              r.created_at
            ).toLocaleString(
              'fr-FR'
            )

        })

      );

    },


    /* =====================================================
       GET GROUPES PAR MATIÈRE
    ===================================================== */

    async getRegistrationSubjectGroups(
      registrationId
    ) {

      if (!registrationId) {

        return [];

      }


      const rows =
        await request(

          `registration_subject_groups?registration_id=eq.${encodeURIComponent(
            registrationId
          )}&select=*&order=id.asc`,

          {

            prefer:
              'return=representation'

          }

        );


      return rows || [];

    },


    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    async updateStatus(
      code,
      status
    ) {

      return request(

        `registrations?code=eq.${encodeURIComponent(code)}`,

        {

          method:
            'PATCH',

          prefer:
            'return=representation',

          body:
            JSON.stringify({

              status

            })

        }

      );

    },


    /* =====================================================
       CATALOGUE
    ===================================================== */

    async getCatalogue() {

      try {

        const rows =
          await request(

            'catalogue?select=*',

            {

              prefer:
                'return=representation'

            }

          );


        return rows || [];

      }

      catch (error) {

        console.warn(
          'Catalogue Supabase indisponible:',
          error
        );


        return null;

      }

    }

  };


})();
