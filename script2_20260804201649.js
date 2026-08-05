// ==========================================
// SISTEMA INTEGRADO DE AUTENTICACIÓN Y PANEL
// 100% FIRESTORE & FIREBASE AUTH (SIN LOCALSTORAGE)
// ==========================================

import {
    auth,
    db,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    setDoc,
    doc,
    collection,
    addDoc,
    getDocs,
    updateDoc
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", function () {

    // ==========================
    // ELEMENTOS DEL DOM
    // ==========================
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const forgotSection = document.getElementById("forgotSection");

    const showRegister = document.getElementById("showRegister");
    const showForgot = document.getElementById("showForgot");

    const backLogin1 = document.getElementById("backLogin1");
    const backLogin2 = document.getElementById("backLogin2");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const forgotForm = document.getElementById("forgotForm");

    const loginPassword = document.getElementById("loginPassword");
    const togglePassword = document.getElementById("togglePassword");

    // ==========================
    // MOSTRAR / OCULTAR CONTRASEÑA
    // ==========================
    if (togglePassword && loginPassword) {
        togglePassword.addEventListener("click", function () {
            if (loginPassword.type === "password") {
                loginPassword.type = "text";
                togglePassword.textContent = "Ocultar";
            } else {
                loginPassword.type = "password";
                togglePassword.textContent = "Ver";
            }
        });
    }

    // ==========================
    // CAMBIAR ENTRE SECCIONES
    // ==========================
    function mostrarLogin() {
        if (loginSection) loginSection.classList.remove("login-hidden");
        if (registerSection) registerSection.classList.add("login-hidden");
        if (forgotSection) forgotSection.classList.add("login-hidden");
    }

    function mostrarRegistro() {
        if (loginSection) loginSection.classList.add("login-hidden");
        if (registerSection) registerSection.classList.remove("login-hidden");
        if (forgotSection) forgotSection.classList.add("login-hidden");
    }

    function mostrarRecuperar() {
        if (loginSection) loginSection.classList.add("login-hidden");
        if (registerSection) registerSection.classList.add("login-hidden");
        if (forgotSection) forgotSection.classList.remove("login-hidden");
    }

    showRegister?.addEventListener("click", mostrarRegistro);
    showForgot?.addEventListener("click", mostrarRecuperar);
    backLogin1?.addEventListener("click", mostrarLogin);
    backLogin2?.addEventListener("click", mostrarLogin);

    // ==========================
    // LOGIN
    // ==========================
    loginForm?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            alert("Por favor complete todos los campos.");
            return;
        }

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            console.log("Sesión iniciada. UID:", cred.user.uid);
            window.location.href = "panel.html";
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Error al autenticar: " + error.message);
        }
    });

    // ==========================
    // REGISTRO DIRECTO A FIRESTORE
    // ==========================
    registerForm?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const nombre = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmar = document.getElementById("confirmPassword").value;

        if (!nombre || !email || !password || !confirmar) {
            alert("Complete todos los campos.");
            return;
        }

        if (password !== confirmar) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
            // 1. Crear el usuario en Authentication
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            const esAdmin = email.toLowerCase().includes("admin");

            // 2. Guardar perfil directamente en Firestore
            await setDoc(doc(db, "usuarios", cred.user.uid), {
                nombre: nombre,
                email: email,
                rol: esAdmin ? "admin" : "cliente",
                plan: "Sin plan asignado",
                precio: "RD$0.00",
                fechaRegistro: new Date()
            });

            alert("Cuenta registrada con éxito.");
            window.location.href = "panel.html";
        } catch (error) {
            console.error("Error en el registro:", error);
            alert("No se pudo crear la cuenta: " + error.message);
        }
    });

    // ==========================
    // RECUPERAR CONTRASEÑA (FIREBASE AUTH)
    // ==========================
    forgotForm?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("forgotEmail").value.trim();

        if (!email) {
            alert("Ingrese su correo electrónico.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert(`Se ha enviado un enlace de recuperación a: ${email}`);
            mostrarLogin();
        } catch (error) {
            console.error("Error al enviar correo de recuperación:", error);
            alert("Error: " + error.message);
        }
    });
});

// ==========================================
// MÓDULO ADMINISTRATIVO (CRUD FIRESTORE)
// ==========================================

// 1. REGISTRAR CLIENTE
async function registrarCliente(cliente) {
    try {
        await addDoc(collection(db, "clientes"), {
            ...cliente,
            estado: "Activo",
            fechaRegistro: new Date().toLocaleDateString("es-DO")
        });
        await cargarClientes();
        await actualizarDashboard();
    } catch (error) {
        console.error("Error al registrar cliente en Firestore:", error);
    }
}

// 2. REGISTRAR TICKET SOPORTE
async function registrarTicket(ticket) {
    try {
        await addDoc(collection(db, "tickets"), {
            ...ticket,
            estado: "Pendiente",
            tecnico: "Sin asignar",
            fecha: new Date().toLocaleDateString("es-DO")
        });
        await cargarTickets();
        await actualizarDashboard();
    } catch (error) {
        console.error("Error al registrar ticket en Firestore:", error);
    }
}

// 3. REGISTRAR AVERÍA
async function registrarAveria(averia) {
    try {
        await addDoc(collection(db, "averias"), {
            ...averia,
            estado: "Pendiente",
            fecha: new Date().toLocaleDateString("es-DO")
        });
        await cargarAverias();
        await actualizarDashboard();
    } catch (error) {
        console.error("Error al registrar avería en Firestore:", error);
    }
}

// 4. MOSTRAR CLIENTES
async function cargarClientes() {
    const tabla = document.getElementById("admin-clientes-list");
    if (!tabla) return;

    tabla.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        querySnapshot.forEach((docSnap) => {
            const c = docSnap.data();
            const idDoc = docSnap.id;
            tabla.innerHTML += `
                <tr>
                    <td>${idDoc.substring(0, 6)}</td>
                    <td>${c.nombre || "-"}</td>
                    <td>${c.telefono || "-"}</td>
                    <td>${c.plan || "-"}</td>
                    <td><span class="estado-activo">${c.estado || "Activo"}</span></td>
                    <td>${c.fechaInstalacion || "-"}</td>
                    <td><button onclick="verCliente('${idDoc}')">Ver</button></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando clientes de Firestore:", error);
    }
}

// 5. MOSTRAR TICKETS
async function cargarTickets() {
    const tabla = document.getElementById("admin-tickets-list");
    if (!tabla) return;

    tabla.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        querySnapshot.forEach((docSnap) => {
            const t = docSnap.data();
            const idDoc = docSnap.id;
            tabla.innerHTML += `
                <tr>
                    <td>${idDoc.substring(0, 6)}</td>
                    <td>${t.cliente || "-"}</td>
                    <td>${t.problema || "-"}</td>
                    <td>${t.prioridad || "-"}</td>
                    <td>
                        <select onchange="cambiarEstadoTicket('${idDoc}', this.value)">
                            <option ${t.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
                            <option ${t.estado === "En proceso" ? "selected" : ""}>En proceso</option>
                            <option ${t.estado === "Resuelto" ? "selected" : ""}>Resuelto</option>
                        </select>
                    </td>
                    <td>${t.tecnico || "Sin asignar"}</td>
                    <td>${t.fecha || "-"}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando tickets de Firestore:", error);
    }
}

// 6. CAMBIAR ESTADO TICKET
async function cambiarEstadoTicket(id, estado) {
    try {
        const ticketRef = doc(db, "tickets", id);
        await updateDoc(ticketRef, { estado: estado });
        await cargarTickets();
        await actualizarDashboard();
    } catch (error) {
        console.error("Error actualizando ticket en Firestore:", error);
    }
}

// 7. MOSTRAR AVERÍAS
async function cargarAverias() {
    const tabla = document.getElementById("admin-averias-list");
    if (!tabla) return;

    tabla.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "averias"));
        querySnapshot.forEach((docSnap) => {
            const a = docSnap.data();
            const idDoc = docSnap.id;
            tabla.innerHTML += `
                <tr>
                    <td>${idDoc.substring(0, 6)}</td>
                    <td>${a.cliente || "-"}</td>
                    <td>${a.zona || "-"}</td>
                    <td>${a.descripcion || "-"}</td>
                    <td>${a.estado || "Pendiente"}</td>
                    <td><button onclick="resolverAveria('${idDoc}')">Resolver</button></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando averías de Firestore:", error);
    }
}

// 8. RESOLVER AVERÍA
async function resolverAveria(id) {
    try {
        const averiaRef = doc(db, "averias", id);
        await updateDoc(averiaRef, { estado: "Resuelta" });
        await cargarAverias();
    } catch (error) {
        console.error("Error al resolver avería en Firestore:", error);
    }
}

// 9. METRICAS DEL DASHBOARD
async function actualizarDashboard() {
    try {
        const clientesSnap = await getDocs(collection(db, "clientes"));
        const ticketsSnap = await getDocs(collection(db, "tickets"));

        let resueltos = 0;
        let pendientes = 0;

        ticketsSnap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.estado === "Resuelto") {
                resueltos++;
            } else {
                pendientes++;
            }
        });

        const totalClientesEl = document.getElementById("totalClientes");
        const clientesActivosEl = document.getElementById("clientesActivos");
        const ticketsPendientesEl = document.getElementById("ticketsPendientes");
        const ticketsResueltosEl = document.getElementById("ticketsResueltos");

        if (totalClientesEl) totalClientesEl.innerHTML = clientesSnap.size;
        if (clientesActivosEl) clientesActivosEl.innerHTML = clientesSnap.size;
        if (ticketsPendientesEl) ticketsPendientesEl.innerHTML = pendientes;
        if (ticketsResueltosEl) ticketsResueltosEl.innerHTML = resueltos;
    } catch (error) {
        console.error("Error al actualizar dashboard con Firestore:", error);
    }
}

// Exportar funciones globalmente para eventos HTML inline (onclick, onchange, etc.)
window.registrarCliente = registrarCliente;
window.registrarTicket = registrarTicket;
window.registrarAveria = registrarAveria;
window.cambiarEstadoTicket = cambiarEstadoTicket;
window.resolverAveria = resolverAveria;
window.verCliente = (id) => console.log("ID del cliente seleccionado:", id);

// CARGA INICIAL
window.onload = async function () {
    await cargarClientes();
    await cargarTickets();
    await cargarAverias();
    await actualizarDashboard();
};