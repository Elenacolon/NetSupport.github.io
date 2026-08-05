// ===============================
// PANEL.JS
// ===============================

import {
    auth,
    db,
    signOut,
    onAuthStateChanged,
    getDoc,
    doc,
    collection,
    getDocs
} from "./firebase.js";

// ELEMENTOS HTML
const adminPanel = document.getElementById("adminPanel");
const clientePanel = document.getElementById("clientePanel");
const nombreCliente = document.getElementById("nombreCliente");

if (adminPanel) adminPanel.style.display = "none";
if (clientePanel) clientePanel.style.display = "none";

// ===============================
// VALIDAR USUARIO LOGIN
// ===============================
onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        window.location.href = "login.html";
        return;
    }

    try {
        const usuarioRef = doc(db, "usuarios", usuario.uid);
        const usuarioDoc = await getDoc(usuarioRef);

        if (!usuarioDoc.exists()) {
            alert("El usuario no existe en la base de datos");
            await window.cerrarSesion();
            return;
        }

        const datos = usuarioDoc.data();
        console.log("Datos de usuario logueado:", datos);

        // ADMINISTRADOR
        if (datos.rol === "admin") {
            if (adminPanel) adminPanel.style.display = "flex";
            if (clientePanel) clientePanel.style.display = "none";
            cargarDashboard();
        } 
        // CLIENTE
        else if (datos.rol === "cliente") {
            if (clientePanel) clientePanel.style.display = "flex";
            if (adminPanel) adminPanel.style.display = "none";

            if (nombreCliente) {
                nombreCliente.textContent = datos.nombre || usuario.email;
            }

            cargarDatosCliente(datos);
        } else {
            alert("Rol no autorizado");
            await window.cerrarSesion();
        }
    } catch (error) {
        console.error("Error cargando panel:", error);
    }
});

// ===============================
// DASHBOARD ADMINISTRADOR
// ===============================
async function cargarDashboard() {
    try {
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        let clientes = 0;
        let tecnicos = 0;

        usuariosSnapshot.forEach((usuario) => {
            const data = usuario.data();
            if (data.rol === "cliente") clientes++;
            if (data.rol === "tecnico") tecnicos++;
        });

        const elemClientes = document.getElementById("clientes");
        const elemTecnicos = document.getElementById("tecnicos");
        const elemPlanes = document.getElementById("planes");
        const elemSolicitudes = document.getElementById("solicitudes");
        const elemFacturas = document.getElementById("facturas");
        const elemInstalaciones = document.getElementById("instalaciones");

        if (elemClientes) elemClientes.textContent = clientes;
        if (elemTecnicos) elemTecnicos.textContent = tecnicos;

        if (elemPlanes) elemPlanes.textContent = await contarColeccion("planes");
        
        // Corregido: Coincidir exactamente con "Solicitudes" con 'S' mayúscula
        if (elemSolicitudes) elemSolicitudes.textContent = await contarColeccion("Solicitudes");
        
        if (elemFacturas) elemFacturas.textContent = await contarColeccion("facturas");
        if (elemInstalaciones) elemInstalaciones.textContent = await contarColeccion("instalaciones");
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// ===============================
// CONTAR DATOS FIRESTORE
// ===============================
async function contarColeccion(nombre) {
    try {
        const resultado = await getDocs(collection(db, nombre));
        return resultado.size;
    } catch (e) {
        return 0;
    }
}

// ===============================
// DATOS CLIENTE
// ===============================
function cargarDatosCliente(datos) {
    const contenido = document.getElementById("clienteContenido");
    if (!contenido) return;

    contenido.innerHTML = `
        <div class="card">
            <h2>👤 Mi Perfil</h2>
            <p><strong>Nombre:</strong> ${datos.nombre || "No especificado"}</p>
            <p><strong>Correo:</strong> ${datos.email || ""}</p>
            <p><strong>Plan Contratado:</strong> ${datos.plan || "Sin plan asignado"}</p>
            <p><strong>Precio del Plan:</strong> ${datos.precio || "N/A"}</p>
        </div>
    `;
}

// ===============================
// EXPORTAR FUNCIONES AL NAVEGADOR (GLOBAL)
// ===============================
window.mostrar = function (id) {
    document.querySelectorAll(".seccion").forEach((seccion) => {
        seccion.classList.add("oculto");
    });

    const seccion = document.getElementById(id);
    if (seccion) {
        seccion.classList.remove("oculto");
    }
};

window.mostrarCliente = function (op) {
    const contenido = document.getElementById("clienteContenido");
    if (!contenido) return;

    const paginas = {
        inicio: "🏠 Inicio",
        plan: "📦 Mi Plan",
        cuenta: "💳 Estado de Cuenta",
        facturas: "📄 Facturas",
        soporte: "🎫 Soporte",
        perfil: "👤 Mi Perfil"
    };

    contenido.innerHTML = `
        <div class="card">
            <h2>${paginas[op] || op}</h2>
            <p>Información disponible de tu cuenta en NET SUPPORT.</p>
        </div>
    `;
};

window.cerrarSesion = async function () {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
};