let sb;
try {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error("Error creating Supabase client:", e);
}
window.sb = sb;

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

// Lógica de Registro
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const nickname = document.getElementById('reg-nickname').value;
    const ffid = document.getElementById('reg-ffid').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;

    if (password !== passwordConfirm) {
        const lang = localStorage.getItem('preferred_lang') || 'es';
        const errorMsg = (typeof translations !== 'undefined') ? translations[lang].error_password_mismatch : "Las contraseñas no coinciden.";
        showToast(errorMsg, 'error');
        return;
    }

    const { data, error } = await sb.auth.signUp({ email, password });

    if (error) {
        showToast("Error: " + error.message, 'error');
    } else if (data.user) {
        const pais = localStorage.getItem('user_country') || 'Desconocido';
        const { error: pError } = await sb.from('perfiles').insert({
            id: data.user.id,
            email,
            nickname,
            ff_id: ffid,
            pais: pais
        });

        if (pError) {
            showToast("Error perfil: " + pError.message, 'error');
        } else {
            const lang = localStorage.getItem('preferred_lang') || 'es';
            const welcomeMsg = (lang === 'es' ? '¡Bienvenido a la Arena, ' : (lang === 'fr' ? 'Bienvenue dans l\'arène, ' : (lang === 'ht' ? 'Byenvini nan Arena, ' : 'Bem-vindo à Arena, '))) + nickname + '!';
            showToast(welcomeMsg);
            setTimeout(() => window.location.href = 'perfil.html', 2000);
        }
    }
});

// Lógica de Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
        showToast("Error: " + error.message, 'error');
    } else {
        const pais = localStorage.getItem('user_country');
        if (pais) {
            await sb.from('perfiles').update({ pais: pais }).eq('id', data.user.id);
        }
        window.location.href = 'perfil.html';
    }
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
        showToast("Enlace enviado a tu correo.");
    } else {
        showToast("Los datos no coinciden.", 'error');
    }
});
