window.NOKHBA_STORE = {
  getRegistrations(){return JSON.parse(localStorage.getItem('nokhba-registrations') || '[]')},
  saveRegistration(registration){const records=this.getRegistrations();records.unshift(registration);localStorage.setItem('nokhba-registrations',JSON.stringify(records))},
  updateStatus(code,status){const records=this.getRegistrations().map(item=>item.code===code?{...item,status}:item);localStorage.setItem('nokhba-registrations',JSON.stringify(records));return records},
  catalog(){return JSON.parse(localStorage.getItem('nokhba-catalogue') || 'null') || window.NOKHBA_CATALOG}
};
