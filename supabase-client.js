/* =========================================================
   INSTITUT NOKHBA
   SUPABASE CLIENT
========================================================= */

(function(){

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
     PUBLIC HEADERS
     
     IMPORTANT:
     Les inscriptions publiques ne doivent PAS
     envoyer un ancien JWT.
  ======================================================= */

  function publicHeaders(){

    return {

      apikey:
        c.anonKey,

      'Content-Type':
        'application/json'

    };

  }


  /* =======================================================
     AUTH HEADERS
     
     Utilisés uniquement pour les opérations
     nécessitant une session utilisateur.
  ======================================================= */

  function authHeaders(){

    const headers =
      publicHeaders();


    if (
      session?.access_token
    ){

      headers.Authorization =
        `Bearer ${session.access_token}`;

    }


    return headers;

  }


  /* =======================================================
     REQUEST
     
     options.auth = true
     => utilise le JWT de session
     
     sinon
     => requête publique avec apikey uniquement
  ======================================================= */

  async function request(
    path,
    options = {}
  ){

    const headers =
      options.auth
        ? authHeaders()
        : publicHeaders();


    const finalHeaders = {

      ...headers,

      Prefer:
        options.prefer ||
        'return=minimal',

      ...(options.headers || {})

    };


    /*
      Ne pas envoyer "auth" vers fetch.
    */

    const fetchOptions = {

      ...options,

      headers:
        finalHeaders

    };


    delete fetchOptions.auth;
    delete fetchOptions.prefer;


    const r =
      await fetch(

        `${c.url}/rest/v1/${path}`,

        fetchOptions

      );


    if (!r.ok){

      const text =
        await r.text();


      /*
        Si le JWT admin est expiré,
        on supprime uniquement la session locale.
      */

      if (
        r.status === 401 &&
        options.auth
      ){

        clearSession();

      }


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
  ){

    const r =
      await fetch(

        `${c.url}/auth/v1/${path}`,

        {

          method:
            'POST',

          headers:
            publicHeaders(),

          body:
            JSON.stringify(body)

        }

      );


    const data =
      await r.json();


    if (!r.ok){

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
  ){

    session =
      data;


    localStorage.setItem(
      tokenKey,
      JSON.stringify(data)
    );

  }


  function clearSession(){

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
    ){

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


    signOut(){

      clearSession();

    },


    /* =====================================================
       CREATE REGISTRATION
       
       IMPORTANT:
       PUBLIC REQUEST
       
       Aucun JWT de session n'est envoyé ici.
       
       Supabase calcule directement :
       - groupe
       - position
       - capacité
       ===================================================== */

    async createRegistration(
      record
    ){

      const result =
        await request(

          'rpc/register_nokhba_student',

          {

            method:
              'POST',

            /*
              IMPORTANT:
              Pas de JWT admin.
              Seulement apikey.
            */
            auth:
              false,

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
        Le résultat peut contenir :

        group_name
        group_position
        group_capacity
        group_order
        total_in_group
      */

      return result;

    },


    /* =====================================================
       GET REGISTRATIONS
       
       ADMIN
       => JWT de session
    ===================================================== */

    async getRegistrations(){

      const rows =
        await request(

          'registrations?select=*&order=created_at.desc',

          {

            auth:
              true,

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
       
       ADMIN
       => JWT de session
    ===================================================== */

    async updateStatus(
      code,
      status
    ){

      return request(

        `registrations?code=eq.${encodeURIComponent(code)}`,

        {

          method:
            'PATCH',

          auth:
            true,

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
       
       PUBLIC
       => Pas besoin de JWT
    ===================================================== */

    async getCatalogue(){

      try {

        const rows =
          await request(

            'catalogue?select=*',

            {

              auth:
                false,

              prefer:
                'return=representation'

            }

          );


        return rows || [];

      }

      catch (error){

        console.warn(
          'Catalogue Supabase indisponible:',
          error
        );


        return null;

      }

    }

  };


})();
