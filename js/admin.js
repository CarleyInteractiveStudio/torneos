// CONFIGURACIÓN - REEMPLAZA CON TUS DATOS
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_KEY = 'TU_LLAVE_ANON_DE_SUPABASE';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAdmin() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) window.location.href = 'auth.html';

    const { data: p } = await sb.from('perfiles').select('es_admin').eq('id', user.id).single();
    if (!p?.es_admin) window.location.href = 'index.html';

    loadAdminData();
}

async function loadAdminData() {
    loadPendingPayments();
    loadTournamentsForResults();
}

document.getElementById('create-tournament-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('t-titulo').value;
    const tipo = document.getElementById('t-tipo').value;
    const precio = document.getElementById('t-precio').value;
    const premio = document.getElementById('t-premio').value;

    await sb.from('torneos').insert({ titulo, tipo, precio_inscripcion: precio, premio_descripcion: premio, estado: 'abierto' });
    alert("Torneo creado!");
    location.reload();
});

async function loadPendingPayments() {
    const { data } = await sb.from('participantes').select('*, perfiles(nickname, ff_id), torneos(titulo)').eq('estado_pago', 'pendiente');
    const table = document.getElementById('pending-payments');
    if (!table) return;
    table.innerHTML = data.map(p => `
        <tr>
            <td>${p.perfiles.nickname}</td>
            <td>${p.perfiles.ff_id}</td>
            <td>${p.torneos.titulo}</td>
            <td><button onclick="approvePayment('${p.id}')" class="btn btn-primary">OK</button></td>
        </tr>
    `).join('');
}

window.approvePayment = async (id) => {
    await sb.from('participantes').update({ estado_pago: 'completado' }).eq('id', id);
    loadPendingPayments();
};

async function loadTournamentsForResults() {
    const { data } = await sb.from('torneos').select('*').eq('estado', 'abierto');
    const select = document.getElementById('select-torneo-results');
    if (!select) return;
    data.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.innerText = t.titulo;
        select.appendChild(opt);
    });

    select.onchange = async () => {
        const { data: players } = await sb.from('participantes').select('*, perfiles(nickname, id)').eq('torneo_id', select.value).eq('estado_pago', 'completado');
        const container = document.getElementById('players-results-list');
        container.innerHTML = players.map(p => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${p.perfiles.nickname} (Kills: ${p.kills})</span>
                <button onclick="addKill('${p.id}', ${p.kills}, '${p.perfiles.id}')" class="btn btn-primary">+1 Kill</button>
            </div>
        `).join('');
    };
}

window.addKill = async (partId, currentKills, userId) => {
    await sb.from('participantes').update({ kills: currentKills + 1, puntos_ganados: (currentKills + 1) * 10 }).eq('id', partId);
    const { data: user } = await sb.from('perfiles').select('puntos_totales').eq('id', userId).single();
    await sb.from('perfiles').update({ puntos_totales: (user.puntos_totales || 0) + 10 }).eq('id', userId);
    alert("Puntos sumados!");
};

checkAdmin();
