// ===============================
// LOGIN.JS
// ===============================

import {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setDoc,
    doc,
    onAuthStateChanged
} from "./firebase.js";

// REDIRECCIÓN AUTOMÁTICA SI YA TIENE SESIÓN
onAuthStateChanged(auth, (usuario) => {
    if (usuario) {
        window.location.href = "panel.html";
    }
});

// ELEMENTOS HTML
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

// CONMUTADOR VISTAS
document.getElementById("showRegister")?.addEventListener("click", () => {
    loginSection.classList.add("login-hidden");
    registerSection.classList.remove("login-hidden");
});

document.getElementById("backLogin")?.addEventListener("click", () => {
    registerSection.classList.add("login-hidden");
    loginSection.classList.remove("login-hidden");
});

// ===============================
// INICIAR SESIÓN
// ===============================
loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        loginMessage.innerHTML = "Validando usuario...";
        const cred = await signInWithEmailAndPassword(auth, email, password);
        console.log("Usuario conectado:", cred.user.uid);
        loginMessage.innerHTML = "Acceso correcto";

        setTimeout(() => {
            window.location.href = "panel.html";
        }, 800);
    } catch (error) {
        console.error(error);
        loginMessage.innerHTML = "Error: " + error.message;
    }
});

// ===============================
// CREAR CUENTA + ASIGNAR PLAN
// ===============================
registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmar = document.getElementById("confirmPassword").value;

    if (password !== confirmar) {
        registerMessage.innerHTML = "Las contraseñas no coinciden";
        return;
    }

    try {
        registerMessage.innerHTML = "Creando usuario...";
        const cred = await createUserWithEmailAndPassword(auth, email, password);

        // Recuperar plan seleccionado previamente (si existe en localStorage)
        const planPendiente = localStorage.getItem("planSeleccionado") || "Sin plan asignado";
        const precioPendiente = localStorage.getItem("precioSeleccionado") || "RD$0.00";

        // Guardar documento en la colección "usuarios"
        await setDoc(doc(db, "usuarios", cred.user.uid), {
            nombre: nombre,
            email: email,
            rol: "cliente",
            plan: planPendiente,
            precio: precioPendiente,
            fechaRegistro: new Date()
        });

        // Limpiar selección temporal de almacenamiento local
        localStorage.removeItem("planSeleccionado");
        localStorage.removeItem("precioSeleccionado");

        registerMessage.innerHTML = "Cuenta creada correctamente";

        setTimeout(() => {
            window.location.href = "panel.html";
        }, 1000);
    } catch (error) {
        console.error(error);
        registerMessage.innerHTML = "Error: " + error.message;
    }
});

// MOSTRAR / OCULTAR CLAVE
document.getElementById("togglePassword")?.addEventListener("click", () => {
    const input = document.getElementById("loginPassword");
    if (input) {
        input.type = input.type === "password" ? "text" : "password";
    }
});