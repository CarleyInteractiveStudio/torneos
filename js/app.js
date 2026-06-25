// CONFIGURACIÓN - REEMPLAZA CON TUS DATOS
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_KEY = 'TU_LLAVE_ANON_DE_SUPABASE';

let sb;
try {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error("Error creating Supabase client:", e);
}

let currentUser = null;

async function init() {
    let session = null;
    if (sb) {
        try {
            const res = await sb.auth.getSession();
            session = res.data.session;
        } catch (e) {
            console.error("Error fetching session:", e);
        }
    }
    currentUser = session?.user;

    const publicPages = ['auth.html', 'privacidad.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = 'auth.html';
        return;
    }

    if (currentUser) {
        document.querySelectorAll('#nav-profile').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('#nav-login').forEach(el => el.classList.add('hidden'));

        const { data: p } = await sb.from('perfiles').select('es_admin').eq('id', currentUser.id).single();
        if (p?.es_admin) document.querySelectorAll('#nav-admin').forEach(el => el.classList.remove('hidden'));
    }

    if (document.getElementById('tournament-list')) loadTournaments();
    if (document.getElementById('ranking-table')) loadRanking();
    if (document.getElementById('p-nickname')) loadProfile();
    if (document.getElementById('vote-container')) loadVotingSystem();
}

async function loadTournaments() {
    const { data } = await sb.from('torneos').select('*').eq('estado', 'abierto');
    const container = document.getElementById('tournament-list');
    if (!container) return;
    container.innerHTML = '';

    data?.forEach(t => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div style="background: red; color: white; padding: 4px 10px; font-size: 10px; font-weight: bold; display: inline-block; border-radius: 4px; margin-bottom: 10px;">${t.tipo.toUpperCase()}</div>
            <h3 style="margin-bottom: 10px;">${t.titulo}</h3>
            <p style="color: #aaa; font-size: 14px;">Premio: ${t.premio_descripcion}</p>
            <p style="font-weight: bold; margin: 15px 0; font-size: 18px; color: #fff;">$${t.precio_inscripcion} USD</p>
            <button onclick="openPayModal('${t.id}', '${t.titulo}', ${t.precio_inscripcion})" class="btn btn-primary" style="width: 100%;">INSCRIBIRSE</button>
        `;
        container.appendChild(div);
    });
}

// MODAL DE PAGO Y PAYPAL
window.openPayModal = (id, titulo, monto) => {
    if (!currentUser) {
        alert("Inicia sesión para inscribirte.");
        window.location.href = 'auth.html';
        return;
    }
    const modal = document.getElementById('pay-modal');
    modal.classList.remove('hidden');
    document.getElementById('pay-torneo-name').innerText = titulo;
    document.getElementById('pay-monto').innerText = monto;

    document.getElementById('paypal-button-container').innerHTML = '';
    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: monto.toString() },
                    description: `Inscripción Torneo: ${titulo}`,
                    custom_id: `${id}_${currentUser.id}`
                }]
            });
        },
        onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            const { error } = await sb.from('participantes').insert({
                torneo_id: id,
                perfil_id: currentUser.id,
                metodo_pago: 'paypal',
                estado_pago: 'completado'
            });

            if (error) {
                alert("Error al registrar: " + error.message);
            } else {
                alert("¡Felicidades! Estás inscrito.");
                location.reload();
            }
        }
    }).render('#paypal-button-container');
};

// SISTEMA DE VOTACIÓN
async function loadVotingSystem() {
    let selectedType = null;
    const btn1v1 = document.getElementById('vote-1v1');
    const btnBR = document.getElementById('vote-br');
    const btnConfirm = document.getElementById('btn-vote');

    btn1v1.onclick = () => { selectedType = '1v1'; btn1v1.style.borderColor = 'red'; btnBR.style.borderColor = '#333'; btnConfirm.disabled = false; };
    btnBR.onclick = () => { selectedType = 'br'; btnBR.style.borderColor = 'red'; btn1v1.style.borderColor = '#333'; btnConfirm.disabled = false; };

    btnConfirm.onclick = async () => {
        if (!currentUser) return alert("Inicia sesión para votar.");

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekStr = startOfWeek.toISOString().split('T')[0];

        const { error } = await sb.from('votos').upsert({
            perfil_id: currentUser.id,
            tipo_preferido: selectedType,
            semana_inicio: weekStr
        });

        if (error) alert(error.message);
        else alert("¡Voto registrado!");
    };
}

async function loadRanking() {
    const { data } = await sb.from('perfiles').select('nickname, puntos_totales').order('puntos_totales', { ascending: false }).limit(20);
    const table = document.getElementById('ranking-table');
    if (!table) return;
    table.innerHTML = data.map((u, i) => `
        <tr>
            <td>${i+1}</td>
            <td>${u.nickname}</td>
            <td style="text-align: right; color: red; font-weight: bold;">${u.puntos_totales}</td>
        </tr>
    `).join('');
}

async function loadProfile() {
    const { data: p } = await sb.from('perfiles').select('*').eq('id', currentUser.id).single();
    if (p) {
        document.getElementById('p-nickname').innerText = p.nickname;
        document.getElementById('p-ffid').innerText = `ID: ${p.ff_id}`;
        if (document.getElementById('p-pais')) document.getElementById('p-pais').innerText = p.pais || '';
        document.getElementById('p-puntos').innerText = p.puntos_totales;
    }
}

window.logout = async () => {
    await sb.auth.signOut();
    window.location.href = 'index.html';
};

init();
