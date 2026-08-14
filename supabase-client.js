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
        localStorage.getItem(tokenKey) || 'null'
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


    /*
      Session uniquement pour les opérations
      administratives authentifiées.
    */

    if (
      session?.access_token
    ) {

      /*
        Vérification expiration JWT
      */

      try {

        const payload =
          JSON.parse(
            atob(
              session.access_token
                .split('.')[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/')
            )
          );


        const expired =
          payload.exp &&
          payload.exp * 1000 < Date.now();


        if (!expired) {

          headers.Authorization =
            `Bearer ${session.access_token}`;

        } else {

          console.warn(
            'Session Supabase expirée.'
          );

          clearSession();

        }

      } catch {

        clearSession();

      }

    }


    return headers;

  }


  /* =======================================================
     HEADERS PUBLICS
     Pour les inscriptions
  ======================================================= */

  function publicHeaders() {

    return {

      apikey:
        c.anonKey,

      'Content-Type':
        'application/json'

    };

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
     PUBLIC RPC REQUEST
  ======================================================= */

  async function publicRpc(
    functionName,
    body
  ) {

    const r =
      await fetch(

        `${c.url}/rest/v1/rpc/${functionName}`,

        {

          method:
            'POST',

          headers: {

            ...publicHeaders(),

            Prefer:
              'return=representation'

          },

          body:
            JSON.stringify(body)

        }

      );


    const text =
      await r.text();


    if (!r.ok) {

      throw new Error(
        text ||
        `Supabase error ${r.status}`
      );

    }


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

  function setSession(data) {

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
       
       IMPORTANT :
       Aucun JWT stocké n'est envoyé ici.
    ===================================================== */

    async createRegistration(
      record
    ) {

      const result =
        await publicRpc(

          'register_nokhba_student',

          {

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

          }

        );


      return result;

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

      } catch (error) {

        console.warn(
          'Catalogue Supabase indisponible:',
          error
        );

        return null;

      }

    }

  };

})();