// CONFIGURACIÓN - REEMPLAZA CON TUS DATOS
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_KEY = 'TU_LLAVE_ANON_DE_SUPABASE';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.sb = sb;

// Lógica de Registro
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const nickname = document.getElementById('reg-nickname').value;
    const ffid = document.getElementById('reg-ffid').value;
    const foto = document.getElementById('reg-foto').value;

    const { data, error } = await sb.auth.signUp({ email, password });

    if (error) {
        alert("Error: " + error.message);
    } else if (data.user) {
        const { error: pError } = await sb.from('perfiles').insert({
            id: data.user.id,
            email,
            nickname,
            ff_id: ffid,
            foto_url: foto
        });
        if (pError) alert("Error perfil: " + pError.message);
        else window.location.href = 'perfil.html';
    }
});

// Lógica de Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error) alert("Error: " + error.message);
    else window.location.href = 'perfil.html';
});

// Navegación entre formularios
document.getElementById('show-register')?.addEventListener('click', () => {
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('register-card').classList.remove('hidden');
});

document.getElementById('show-login')?.addEventListener('click', () => {
    document.getElementById('register-card').classList.add('hidden');
    document.getElementById('recovery-card').classList.add('hidden');
    document.getElementById('login-card').classList.remove('hidden');
});

document.getElementById('show-recovery')?.addEventListener('click', () => {
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('recovery-card').classList.remove('hidden');
});

document.getElementById('show-login-2')?.addEventListener('click', () => {
    document.getElementById('recovery-card').classList.add('hidden');
    document.getElementById('login-card').classList.remove('hidden');
});

// Lógica de Recuperación
document.getElementById('recovery-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('rec-email').value;
    const ffid = document.getElementById('rec-ffid').value;

    const { data } = await sb.from('perfiles').select('id').eq('email', email).eq('ff_id', ffid).single();

    if (data) {
        await sb.auth.resetPasswordForEmail(email);
        alert("Enlace enviado a tu correo.");
    } else {
        alert("Los datos no coinciden.");
    }
});
