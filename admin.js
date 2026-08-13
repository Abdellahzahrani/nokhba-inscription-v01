const remote=window.NOKHBA_REMOTE;
const initialCatalogue=JSON.parse(JSON.stringify(window.NOKHBA_CATALOG));
let savedCatalogue={...initialCatalogue};
const catalogueEl=document.querySelector('#catalogue');
const recordsEl=document.querySelector('#registrations');
const searchEl=document.querySelector('#search');
const filterEl=document.querySelector('#filter');
const levelFilterEl=document.querySelector('#level-filter');
const loginCard=document.querySelector('#login-card');
const dashboardContent=document.querySelector('#dashboard-content');
const catalogueCard=document.querySelector('#catalogue-card');
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function showCatalogue(){catalogueEl.innerHTML=Object.entries(savedCatalogue).map(([level,subjects])=>`<label><b>${escapeHtml(level)}</b><textarea data-level="${escapeHtml(level)}" rows="3">${escapeHtml(subjects.join(', '))}</textarea><small>Séparez les matières par une virgule.</small></label>`).join('')}
async function loadCatalogue(){try{const remoteCatalogue=await remote.getCatalogue();if(Object.keys(remoteCatalogue).length)savedCatalogue={...savedCatalogue,...remoteCatalogue};}catch{}showCatalogue()}
let records=[];
function renderLevelFilter(){const selected=levelFilterEl.value;const levels=[...new Set(records.map(r=>r.level))].sort();levelFilterEl.innerHTML=`<option value="">Tous les niveaux</option>${levels.map(level=>`<option value="${escapeHtml(level)}" ${level===selected?'selected':''}>${escapeHtml(level)}</option>`).join('')}`}
function renderRecords(){renderLevelFilter();const query=searchEl.value.trim().toLowerCase(),status=filterEl.value,level=levelFilterEl.value;const filtered=records.filter(r=>!status||r.status===status).filter(r=>!level||r.level===level).filter(r=>`${r.code} ${r.firstName} ${r.lastName}`.toLowerCase().includes(query));document.querySelector('#stats').innerHTML=`<div><b>${records.length}</b><small>Total</small></div><div><b>${records.filter(r=>r.status==='En attente').length}</b><small>En attente</small></div><div><b>${records.filter(r=>r.status==='Confirmée').length}</b><small>Confirmées</small></div>`;recordsEl.innerHTML=filtered.length?filtered.map(r=>`<article class="registration"><div><strong>${escapeHtml(r.firstName)} ${escapeHtml(r.lastName)}</strong><small>${escapeHtml(r.code)} · ${escapeHtml(r.createdAt)}</small><p>${escapeHtml(r.level)} · ${r.subjects.map(escapeHtml).join(', ')}</p></div><label>Statut<select data-code="${escapeHtml(r.code)}"><option ${r.status==='En attente'?'selected':''}>En attente</option><option ${r.status==='Confirmée'?'selected':''}>Confirmée</option><option ${r.status==='Refusée'?'selected':''}>Refusée</option></select></label></article>`).join(''):'<p class="selection-note">Aucune inscription ne correspond à votre recherche.</p>';}
async function loadRecords(){records=await remote.getRegistrations();renderRecords()}
function openDashboard(){
  loginCard.hidden=true;
  dashboardContent.hidden=false;
  catalogueCard.hidden=false;
  loadCatalogue();
  loadRecords();
}
document.querySelector('#login-form').addEventListener('submit',async e=>{e.preventDefault();const status=document.querySelector('#login-status');status.textContent='Connexion…';try{await remote.signIn(document.querySelector('#admin-email').value.trim(),document.querySelector('#admin-password').value);status.textContent='';openDashboard();}catch(err){status.textContent=err.message||'Connexion impossible.';}});
document.querySelector('#logout').addEventListener('click',()=>{remote.signOut();location.reload()});
document.querySelector('#save').addEventListener('click',async()=>{document.querySelectorAll('[data-level]').forEach(field=>{savedCatalogue[field.dataset.level]=field.value.split(',').map(x=>x.trim()).filter(Boolean)});const status=document.querySelector('#status');try{await remote.saveCatalogue(savedCatalogue);status.textContent='Matières enregistrées ✓';}catch(err){status.textContent='Impossible d’enregistrer les matières.';}});
recordsEl.addEventListener('change',async event=>{if(event.target.matches('[data-code]')){try{await remote.updateStatus(event.target.dataset.code,event.target.value);await loadRecords();}catch{alert('Impossible de mettre à jour le statut.');}}});
searchEl.addEventListener('input',renderRecords);filterEl.addEventListener('change',renderRecords);levelFilterEl.addEventListener('change',renderRecords);
if(!remote.enabled){document.querySelector('#login-status').textContent='Supabase n’est pas configuré.';}else if(remote.isAuthenticated())openDashboard();
