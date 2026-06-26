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

    select.onchange = renderPlayers;
}

async function renderPlayers() {
    const torneoId = document.getElementById('select-torneo-results').value;
    if (!torneoId) return;

    const { data: players } = await sb.from('participantes').select('*, perfiles(nickname, id)').eq('torneo_id', torneoId).eq('estado_pago', 'completado');
    const container = document.getElementById('players-results-list');

    // Botón para finalizar torneo
    const finalizeBtn = `<button onclick="finalizeTournament('${torneoId}')" class="btn" style="background: var(--primary); margin-bottom: 20px; width: 100%;">FINALIZAR TORNEO Y PASAR A HISTORIAL</button>`;

    container.innerHTML = finalizeBtn + players.map(p => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
            <span>${p.perfiles.nickname} (Kills: ${p.kills})</span>
            <button onclick="addKill('${p.id}', ${p.kills}, '${p.perfiles.id}')" class="btn btn-primary">+1 Kill</button>
        </div>
    `).join('');
}

window.addKill = async (partId, currentKills, userId) => {
    const newKills = currentKills + 1;
    await sb.from('participantes').update({
        kills: newKills,
        puntos_ganados: newKills * 10
    }).eq('id', partId);

    const { data: user } = await sb.from('perfiles').select('puntos_totales').eq('id', userId).single();
    await sb.from('perfiles').update({
        puntos_totales: (user.puntos_totales || 0) + 10
    }).eq('id', userId);

    renderPlayers(); // Recargar la lista para actualizar el contador sin refrescar página
};

window.finalizeTournament = async (torneoId) => {
    if (confirm("¿Estás seguro de finalizar este torneo? Ya no se podrán sumar más kills y pasará al historial.")) {
        await sb.from('torneos').update({ estado: 'finalizado' }).eq('id', torneoId);
        alert("Torneo finalizado con éxito.");
        location.reload();
    }
};

window.handleSeasonReset = async () => {
    if (!confirm("¿Seguro que quieres reiniciar la temporada? Los puntos de todos los jugadores volverán a 0.")) return;

    const now = new Date();
    const mesAnio = `${now.getMonth() + 1}-${now.getFullYear()}`;

    // 1. Obtener ranking actual
    const { data: ranking } = await sb.from('perfiles').select('id, puntos_totales').order('puntos_totales', { ascending: false });

    if (ranking) {
        // 2. Guardar en historial
        const historyData = ranking.map((p, index) => ({
            mes_anio: mesAnio,
            perfil_id: p.id,
            puntos_acumulados: p.puntos_totales,
            posicion: index + 1
        }));

        await sb.from('historial_temporadas').insert(historyData);

        // 3. Resetear puntos
        await sb.from('perfiles').update({ puntos_totales: 0 }).neq('id', '00000000-0000-0000-0000-000000000000');

        alert("Temporada reiniciada y guardada con éxito.");
        location.reload();
    }
};

checkAdmin();
