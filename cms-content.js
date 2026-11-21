(() => {
  const cfg = window.MUNDCOND_CONTENT_REPO || {};
  if (!cfg.owner || !cfg.repo || cfg.owner.startsWith('REPLACE')) return;
  const api = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/content`;
  const safe = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function parseFrontmatter(raw) {
    const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    const meta = {};
    if (m) m[1].split(/\r?\n/).forEach(line => { const p=line.indexOf(':'); if(p>0) meta[line.slice(0,p).trim()] = line.slice(p+1).trim().replace(/^['"]|['"]$/g,''); });
    return {meta, body: m ? m[2].trim() : raw.trim()};
  }
  const bodyHtml = (s='') => s.split(/\n\s*\n/).map(p => `<p>${safe(p).replace(/\n/g,'<br>')}</p>`).join('');
  async function readFolder(folder) {
    const response = await fetch(`${api}/${folder}`, {headers:{'Accept':'application/vnd.github+json'}});
    if (!response.ok) throw new Error('GitHub API error '+response.status);
    const files = await response.json();
    const mdFiles = files.filter(f=>f.name.endsWith('.md'));
    const entries = await Promise.all(mdFiles.map(async f => { const r=await fetch(f.download_url); return parseFrontmatter(await r.text()); }));
    return entries;
  }
  const projectsTarget = document.querySelector('#projects-content');
  if (projectsTarget) readFolder('projects').then(entries=>{
    entries.sort((a,b)=>String(a.meta.title).localeCompare(String(b.meta.title)));
    projectsTarget.innerHTML = entries.map((e,i)=>{
      const art = ['neuro-art','paul-art'].includes(e.meta.art) ? e.meta.art : 'neuro-art';
      return `<article class="project-card reveal visible"><div class="project-index">PROJECT ${String(i+1).padStart(2,'0')}</div><div class="project-art ${art}" aria-hidden="true">${art==='neuro-art'?'<div class="art-sun"></div><div class="art-ring"></div><div class="art-noise"></div>':'<div class="paul-circle"></div><div class="paul-lines"></div>'}<div class="art-code">${safe(e.meta.title)}</div></div><div class="project-text"><div class="project-status">[ ${safe(e.meta.status||'IN DEVELOPMENT')} ]</div><h2>${safe(e.meta.title||'Untitled')}</h2>${bodyHtml(e.body)}</div></article>`;
    }).join('');
  }).catch(console.warn);
  const teamTarget = document.querySelector('#team-content');
  if (teamTarget) readFolder('team').then(entries=>{
    entries.sort((a,b)=>Number(a.meta.order||0)-Number(b.meta.order||0));
    teamTarget.innerHTML = entries.map((e,i)=>`<article class="team-card reveal visible"><span class="team-no">${String(Number(e.meta.order)||i+1).padStart(2,'0')}</span><div><h3>${safe(e.meta.name||'Team member')}</h3><p>${safe(e.meta.role||'')}</p></div></article>`).join('');
  }).catch(console.warn);
  const newsTarget = document.querySelector('#news-content');
  if (newsTarget) readFolder('news').then(entries=>{
    entries.sort((a,b)=>String(b.meta.date||'').localeCompare(String(a.meta.date||'')));
    newsTarget.innerHTML = `<div class="news-head"><span>LOG / MUNDCOND</span><span>STATUS: ONLINE</span></div>`+entries.map(e=>{
      let date = String(e.meta.date||'').slice(0,10); if (/^\d{4}-\d{2}-\d{2}$/.test(date)) date=date.split('-').reverse().join('.');
      return `<article class="news-row"><time>${safe(date)}</time><div><span class="news-tag">${safe(e.meta.tag||'NEWS')}</span><h3>${safe(e.meta.title||'News')}</h3>${bodyHtml(e.body)}</div></article>`;
    }).join('');
  }).catch(console.warn);
})();
