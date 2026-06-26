let sb;
try {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error("Error creating Supabase client:", e);
}

let currentUser = null;

// Sistema de Notificaciones (Toasts)
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

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
    if (document.getElementById('bracket-container')) loadBrackets();
    if (document.getElementById('slots-container')) loadTournamentSlots();
    if (document.getElementById('ranking-table')) loadRanking();
    if (document.getElementById('p-nickname')) loadProfile();
    if (document.getElementById('vote-container')) loadVotingSystem();
    setupSupportChat();
    setupYouTubeWidget();
}

function setupSupportChat() {
    const form = document.getElementById('support-form');
    if (!form) return;

    window.toggleSupport = () => {
        document.getElementById('support-modal').classList.toggle('hidden');
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return showToast("Inicia sesión para enviar mensajes.", 'error');

        const asunto = document.getElementById('sup-asunto').value;
        const mensaje = document.getElementById('sup-mensaje').value;

        const { error } = await sb.from('mensajes_soporte').insert({
            perfil_id: currentUser.id,
            asunto,
            mensaje
        });

        if (error) showToast("Error: " + error.message, 'error');
        else {
            showToast("Mensaje enviado con éxito.");
            form.reset();
            toggleSupport();
        }
    };
}

async function setupYouTubeWidget() {
    const bubble = document.getElementById('yt-bubble');
    const content = document.getElementById('yt-content');
    if (!bubble) return;

    bubble.onclick = () => content.classList.toggle('hidden');

    // Aquí normalmente usarías la API de YouTube, pero como no tengo tu API Key,
    // buscaré si hay un link de live en el torneo actual
    if (sb) {
        const { data: torneo } = await sb.from('torneos').select('link_youtube_live').neq('estado', 'finalizado').order('created_at', { ascending: false }).limit(1).single();

        if (torneo?.link_youtube_live) {
            document.getElementById('yt-status').classList.remove('hidden');
            document.getElementById('yt-video-container').innerHTML = `
                <iframe width="100%" height="100%" src="${torneo.link_youtube_live.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen></iframe>
            `;
            document.getElementById('yt-title').innerText = "¡Torneo en Vivo!";
        } else {
            // Mostrar mensaje de canal
            document.getElementById('yt-video-container').innerHTML = `
                <div style="text-align: center; color: #fff;">
                    <p style="font-size: 14px; margin-bottom: 5px;">Mira nuestros torneos pasados</p>
                    <a href="https://www.youtube.com/@They-Black-King" target="_blank" style="color: red; font-size: 10px;">@They-Black-King</a>
                </div>
            `;
        }
    }
}

async function loadTournaments() {
    const { data } = await sb.from('torneos').select('*').in('estado', ['abierto', 'votacion']);
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

// CARGA DINÁMICA DE PAYPAL SDK
function loadPayPalSDK(callback) {
    if (window.paypal) return callback();
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.onload = callback;
    document.head.appendChild(script);
}

// MODAL DE PAGO Y PAYPAL
window.openPayModal = async (id, titulo, monto) => {
    if (!currentUser) {
        showToast("Inicia sesión para inscribirte.", 'error');
        setTimeout(() => window.location.href = 'auth.html', 1500);
        return;
    }
    const modal = document.getElementById('pay-modal');
    modal.classList.remove('hidden');
    document.getElementById('pay-torneo-name').innerText = titulo;
    const finance = await calculateTotalUSD(100); // 100 DOP
    document.getElementById('pay-monto').innerText = `${finance.totalUSD} (Eq. 100 DOP)`;

    document.getElementById('paypal-button-container').innerHTML = 'Cargando botones de pago...';

    loadPayPalSDK(() => {
        document.getElementById('paypal-button-container').innerHTML = '';
        paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: finance.totalUSD },
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
            showToast("Error al registrar: " + error.message, 'error');
            } else {
                // Verificar si se llenó el torneo
                const { data: t } = await sb.from('torneos').select('max_participantes, titulo, tipo, precio_inscripcion, premio_descripcion').eq('id', id).single();
                const { count } = await sb.from('participantes').select('*', { count: 'exact', head: true }).eq('torneo_id', id);

                if (count >= t.max_participantes) {
                    // Crear nuevo torneo automáticamente
                    await sb.from('torneos').insert({
                        titulo: `${t.titulo} (Mesa 2)`,
                        tipo: t.tipo,
                        precio_inscripcion: t.precio_inscripcion,
                        premio_descripcion: t.premio_descripcion,
                        max_participantes: t.max_participantes
                    });
                }

                showToast("¡Felicidades! Estás inscrito.");
                setTimeout(() => location.reload(), 2000);
            }
        }
        }).render('#paypal-button-container');
    });
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
        if (!currentUser) return showToast("Inicia sesión para votar.", 'error');

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekStr = startOfWeek.toISOString().split('T')[0];

        const { error } = await sb.from('votos').upsert({
            perfil_id: currentUser.id,
            tipo_preferido: selectedType,
            semana_inicio: weekStr
        });

        if (error) showToast(error.message, 'error');
        else showToast("¡Voto registrado!");
    };
}

async function loadTournamentSlots() {
    const container = document.getElementById('slots-container');
    const info = document.getElementById('slots-info');
    if (!container || !sb) return;

    // Obtener el torneo más reciente abierto o en votación
    const { data: torneo } = await sb.from('torneos').select('*').neq('estado', 'finalizado').order('created_at', { ascending: false }).limit(1).single();

    if (!torneo) {
        info.innerText = "No hay torneos activos en este momento.";
        return;
    }

    // Obtener participantes
    const { count } = await sb.from('participantes').select('*', { count: 'exact', head: true }).eq('torneo_id', torneo.id);

    container.innerHTML = '';
    const max = torneo.max_participantes || 50;

    for (let i = 1; i <= max; i++) {
        const slot = document.createElement('div');
        slot.style.width = '20px';
        slot.style.height = '20px';
        slot.style.borderRadius = '3px';

        if (i <= count) {
            slot.style.background = 'var(--primary)'; // Ocupado
            slot.title = "Ocupado";
        } else {
            slot.style.background = i <= 10 ? '#4a0000' : '#222'; // Rojo oscuro para los 10 min, gris para el resto
            slot.style.border = '1px solid #444';
            slot.title = "Disponible";
        }
        container.appendChild(slot);
    }

    const lang = localStorage.getItem('preferred_lang') || 'es';
    const t = (typeof translations !== 'undefined') ? translations[lang] : null;

    const minText = t ? "Mínimo para empezar" : "Mínimo para empezar";
    const maxText = t ? "Máximo por torneo" : "Máximo por torneo";

    info.innerHTML = `
        <div style="margin-top: 10px;">
            <span style="color: #ff4d4d;">●</span> ${minText}: 10 |
            <span style="color: #888;">●</span> ${maxText}: ${max}
        </div>
        <div style="font-weight: bold; margin-top: 5px; color: #fff;">
            ${count} / ${max} Jugadores alistados
        </div>
    `;
}

async function loadBrackets() {
    const container = document.getElementById('bracket-container');
    const section = document.getElementById('bracket-section');
    if (!container || !sb) return;

    const now = new Date();
    const isSunday = now.getDay() === 0;
    const hour = now.getHours();

    // Solo mostrar el domingo entre 12 PM y medianoche (o hasta que empiece el torneo)
    if (!isSunday || hour < 12) {
        return;
    }

    section.classList.remove('hidden');

    const { data: torneo } = await sb.from('torneos').select('*').neq('estado', 'finalizado').order('created_at', { ascending: false }).limit(1).single();
    if (!torneo) return;

    const { data: participantes } = await sb.from('participantes').select('perfiles(nickname)').eq('torneo_id', torneo.id);
    if (!participantes || participantes.length < 2) {
        container.innerHTML = '<p style="text-align:center">Esperando más jugadores para generar emparejamientos...</p>';
        return;
    }

    // Generar emparejamientos aleatorios (simulados)
    let html = '<div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: center;">';
    for (let i = 0; i < participantes.length; i += 2) {
        if (participantes[i + 1]) {
            html += `
                <div class="card" style="margin:0; background:#111;">${participantes[i].perfiles.nickname}</div>
                <div style="color:var(--primary); font-weight:bold;">VS</div>
                <div class="card" style="margin:0; background:#111;">${participantes[i+1].perfiles.nickname}</div>
            `;
        } else {
            html += `
                <div class="card" style="margin:0; background:#111;">${participantes[i].perfiles.nickname}</div>
                <div style="color:var(--primary); font-weight:bold;">BYE</div>
                <div></div>
            `;
        }
    }
    html += '</div>';
    container.innerHTML = html;
}

async function loadRanking() {
    if (!sb) return;
    const { data } = await sb.from('perfiles').select('nickname, puntos_totales').order('puntos_totales', { ascending: false }).limit(20);
    const table = document.getElementById('ranking-table');
    if (!table) return;
    table.innerHTML = data.map((u, i) => `
        <tr>
            <td>${i+1}</td>
            <td style="font-weight: bold;">${u.nickname}</td>
            <td style="text-align: right; color: var(--primary); font-weight: bold;">${u.puntos_totales}</td>
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
