(function(){

  const c = window.NOKHBA_SUPABASE || {};
  const tokenKey = 'nokhba-supabase-session';

  const enabled = Boolean(c.url && c.anonKey);


  let session = JSON.parse(
    localStorage.getItem(tokenKey) || 'null'
  );


  function authHeaders(){

    const headers = {
      apikey: c.anonKey,
      'Content-Type': 'application/json'
    };

    // Authorization is ONLY sent when there is a real user session.
    // Public requests use the publishable key through "apikey".
    if(session?.access_token){
      headers.Authorization =
        `Bearer ${session.access_token}`;
    }

    return headers;
  }


  async function request(path, options = {}){

    const headers = {
      ...authHeaders(),
      Prefer: options.prefer || 'return=minimal',
      ...(options.headers || {})
    };

    const r = await fetch(
      `${c.url}/rest/v1/${path}`,
      {
        ...options,
        headers
      }
    );

    if(!r.ok){

      const text = await r.text();

      throw new Error(
        text || `Supabase error ${r.status}`
      );
    }

    const text = await r.text();

    return text
      ? JSON.parse(text)
      : null;
  }


  async function auth(path, body){

    const r = await fetch(
      `${c.url}/auth/v1/${path}`,
      {
        method: 'POST',

        headers: {
          apikey: c.anonKey,
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(body)
      }
    );


    const data = await r.json();


    if(!r.ok){

      throw new Error(
        data.error_description ||
        data.msg ||
        data.message ||
        'Échec de connexion.'
      );
    }


    return data;
  }


  function setSession(data){

    session = data;

    localStorage.setItem(
      tokenKey,
      JSON.stringify(data)
    );
  }


  function clearSession(){

    session = null;

    localStorage.removeItem(
      tokenKey
    );
  }


  window.NOKHBA_REMOTE = {

    enabled,


    isAuthenticated: () =>
      Boolean(session?.access_token),


    async signIn(email, password){

      const data = await auth(
        'token?grant_type=password',
        {
          email,
          password
        }
      );

      setSession(data);

      return data;
    },


    signOut(){

      clearSession();
    },


    createRegistration(record){

      return request(
        'registrations',
        {
          method: 'POST',

          prefer: 'return=minimal',

          body: JSON.stringify({

            code:
              record.code,

            first_name:
              record.firstName,

            last_name:
              record.lastName,

            birth_date:
              record.birthDate,

            phone:
              record.phone,

            parent_phone:
              record.parentPhone,

            school:
              record.school,

            address:
              record.address,

            level:
              record.level,

            subjects:
              record.subjects,

            status:
              record.status

          })
        }
      );
    },


    async getRegistrations(){

      const rows = await request(
        'registrations?select=*&order=created_at.desc',
        {
          prefer:
            'return=representation'
        }
      );


      return (rows || []).map(r => ({

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

        createdAt:
          new Date(
            r.created_at
          ).toLocaleString('fr-FR')

      }));
    },


    async updateStatus(code, status){

      return request(
        `registrations?code=eq.${encodeURIComponent(code)}`,
        {
          method: 'PATCH',

          prefer:
            'return=minimal',

          body:
            JSON.stringify({
              status
            })
        }
      );
    },


    async getCatalogue(){

      const rows = await request(
        'subject_catalogue?select=level,subjects',
        {
          prefer:
            'return=representation'
        }
      );


      return Object.fromEntries(
        (rows || []).map(r => [
          r.level,
          r.subjects || []
        ])
      );
    },


    async saveCatalogue(catalogue){

      const rows =
        Object.entries(catalogue).map(
          ([level, subjects]) => ({
            level,
            subjects,
            updated_at:
              new Date().toISOString()
          })
        );


      if(rows.length){

        await request(
          'subject_catalogue?on_conflict=level',
          {
            method: 'POST',

            prefer:
              'resolution=merge-duplicates,return=representation',

            body:
              JSON.stringify(rows)
          }
        );
      }


      return catalogue;
    }

  };

})();
