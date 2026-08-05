import { db, collection, addDoc } from "./firebase.js";

console.log("✅ script.js cargado correctamente");

// ==========================================
// CONTROL DEL MODAL DE PLANES
// ==========================================

function abrirModal(plan, velocidad, precio) {
    console.log("Intentando abrir modal para:", plan, velocidad, precio);

    const modal = document.getElementById("modal");
    if (!modal) {
        console.error("❌ No se encontró ningún elemento con id='modal' en el HTML.");
        return;
    }

    const titulo = document.getElementById("tituloPlan");
    const vel = document.getElementById("velocidadPlan");
    const inputPlan = document.getElementById("plan");
    const inputPrecio = document.getElementById("precio");

    if (titulo) titulo.textContent = plan;
    if (vel) vel.textContent = `${velocidad} - ${precio}`;
    if (inputPlan) inputPlan.value = plan;
    if (inputPrecio) inputPrecio.value = precio;

    modal.style.display = "flex";
}

function cerrarModal() {
    const modal = document.getElementById("modal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Exposiciones globales para handlers HTML onclick
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

// Cierre del modal al hacer clic fuera del contenido
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
        cerrarModal();
    }
});

// ==========================================
// CHATBOT Y MENÚ DE SOPORTE
// ==========================================

function abrirMenu() {
    const menu = document.getElementById("menu");
    if (menu) {
        menu.classList.toggle("activo");
    }
}

function abrirChatbot() {
    const chatbot = document.getElementById("chatbot");
    const menu = document.getElementById("menu");
    if (chatbot) {
        chatbot.style.display = "block";
    }
    if (menu) {
        menu.classList.remove("activo"); // Cierra el menú desplegable al abrir el chat
    }
}

function cerrarChat() {
    const chatbot = document.getElementById("chatbot");
    if (chatbot) {
        chatbot.style.display = "none";
    }
}

function enviarPregunta() {
    const input = document.getElementById("pregunta");
    if (!input) return;

    const mensaje = input.value.trim();
    if (mensaje === "") return;

    const chat = document.getElementById("chat-body");
    if (!chat) return;

    // Mostrar mensaje del usuario
    chat.innerHTML += `<div class="user">${mensaje}</div>`;

    const texto = mensaje.toLowerCase();
    let respuesta = "";

    // PLANES
    if (texto.includes("plan") || texto.includes("planes")) {
        respuesta = `
        Estos son nuestros planes de Internet:
        <br><br>
        📶 20 Mbps - RD$995.99/mes
        <br>
        📶 50 Mbps - RD$1,995.99/mes
        <br>
        📶 100 Mbps - RD$2,995.99/mes
        <br>
        📶 200 Mbps - RD$3,795.99/mes
        <br>
        📶 500 Mbps - RD$4,495.99/mes
        <br>
        📶 1000 Mbps - RD$6,995.99/mes
        <br><br>
        ¿Deseas contratar alguno?`;
    }
    // PRECIOS
    else if (texto.includes("precio") || texto.includes("cuánto cuesta") || texto.includes("costo")) {
        respuesta = `
        Nuestros precios comienzan desde <b>RD$995.99</b> al mes.
        <br><br>
        Tenemos planes para hogares y empresas.`;
    }
    // COBERTURA
    else if (texto.includes("cobertura") || texto.includes("disponibilidad")) {
        respuesta = `
        Para verificar la cobertura necesitamos tu provincia o dirección.
        <br><br>
        Escríbela y con gusto te ayudaremos.`;
    }
    // PAGO
    else if (texto.includes("pagar") || texto.includes("factura") || texto.includes("pago")) {
        respuesta = `
        Puedes pagar tu factura mediante:
        <br><br>
        💳 Tarjeta de crédito o débito.
        <br>
        🏦 Transferencia bancaria.
        <br>
        💵 En nuestras oficinas autorizadas.`;
    }
    // FIBRA
    else if (texto.includes("fibra") || texto.includes("cable")) {
        respuesta = `
        La fibra óptica ofrece:
        <br><br>
        ✅ Mayor velocidad.
        <br>
        ✅ Conexión más estable.
        <br>
        ✅ Menor latencia.
        <br><br>
        El cable coaxial suele ser más económico, pero puede perder rendimiento cuando hay muchos usuarios conectados.`;
    }
    // INTERNET LENTO
    else if (texto.includes("internet lento") || texto.includes("lento")) {
        respuesta = `
        Puedes intentar lo siguiente:
        <br><br>
        1️⃣ Reinicia el módem durante 30 segundos.
        <br>
        2️⃣ Comprueba que los cables estén bien conectados.
        <br>
        3️⃣ Acércate al router si utilizas Wi-Fi.
        <br>
        4️⃣ Si el problema continúa, comunícate con soporte técnico.`;
    }
    // SALUDO
    else if (texto.includes("hola") || texto.includes("buenas") || texto.includes("buenos días") || texto.includes("buenas tardes")) {
        respuesta = "¡Hola! 👋 Bienvenido a NET SUPPORT. ¿En qué puedo ayudarte?";
    }
    // DESPEDIDA
    else if (texto.includes("gracias") || texto.includes("adiós") || texto.includes("hasta luego")) {
        respuesta = "¡Gracias por comunicarte con nosotros! 😊";
    }
    // DEFECTO
    else {
        respuesta = `
        Lo siento, no entendí tu pregunta.
        <br><br>
        Puedes preguntarme sobre:
        <br>
        • Planes de Internet
        <br>
        • Precios
        <br>
        • Cobertura
        <br>
        • Pago de facturas
        <br>
        • Fibra óptica
        <br>
        • Soporte técnico`;
    }

    // Simular tiempo de respuesta del bot y desplazar scroll abajo
    setTimeout(() => {
        chat.innerHTML += `<div class="bot">${respuesta}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 600);

    input.value = "";
    chat.scrollTop = chat.scrollHeight;
}

// Asignar funciones del Chatbot al objeto global window
window.abrirMenu = abrirMenu;
window.abrirChatbot = abrirChatbot;
window.cerrarChat = cerrarChat;
window.enviarPregunta = enviarPregunta;

// ==========================================
// ENVÍO DE CORREO VIA EMAILJS
// ==========================================

async function enviarCorreo(nombre, email, plan, precio) {
    const fecha = new Date().toLocaleDateString("es-DO");

    if (typeof emailjs === "undefined") {
        console.warn("⚠️ EmailJS no está cargado en el HTML.");
        return;
    }

    try {
        await emailjs.send(
            "service_y4k9d8m",
            "template_gnmuza7",
            {
                nombre: nombre,
                email: email,
                plan: plan,
                precio: precio,
                fecha: fecha
            }
        );
        console.log("✅ Correo enviado con éxito vía EmailJS");
    } catch (err) {
        console.error("❌ Error enviando correo vía EmailJS:", err);
    }
}

// ==========================================
// MANEJO DE FORMULARIO & FIRESTORE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario");

    if (formulario) {
        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            const btnSubmit = formulario.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = "Procesando...";
            }

            const nombre = document.getElementById("nombre").value.trim();
            const email = document.getElementById("email").value.trim();
            const cedula = document.getElementById("cedula").value.trim();
            const plan = document.getElementById("plan").value;
            const precio = document.getElementById("precio").value;

            try {
                await addDoc(collection(db, "Solicitudes"), {
                    nombre: nombre,
                    email: email,
                    cedula: cedula,
                    plan: plan,
                    precio: precio,
                    fecha: new Date()
                });

                await enviarCorreo(nombre, email, plan, precio);

                alert(`🎉 ¡Plan "${plan}" seleccionado exitosamente!\n\nUn asesor se pondrá en contacto contigo a la brevedad.`);

                formulario.reset();
                cerrarModal();

            } catch (error) {
                console.error("❌ Error en Firestore:", error);
                alert("Ocurrió un error al procesar tu solicitud:\n\n" + error.message);
            } finally {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Solicitar Plan";
                }
            }
        });
    }

    const loginPassword = document.getElementById("loginPassword");
    const togglePassword = document.getElementById("togglePassword");

    if (togglePassword && loginPassword) {
        togglePassword.addEventListener("click", () => {
            if (loginPassword.type === "password") {
                loginPassword.type = "text";
                togglePassword.textContent = "Ocultar";
            } else {
                loginPassword.type = "password";
                togglePassword.textContent = "Ver";
            }
        });
    }
});

// ==========================================
// SISTEMA ADMINISTRATIVO (LOCAL STORAGE)
// ==========================================

function generarID(prefijo) {
    return prefijo + "-" + Date.now();
}

function obtenerDatos(tabla) {
    let datos = localStorage.getItem(tabla);
    return datos ? JSON.parse(datos) : [];
}

function guardarDatos(tabla, datos) {
    localStorage.setItem(tabla, JSON.stringify(datos));
}

function cargarClientes() {
    let tabla = document.getElementById("admin-clientes-list");
    if (!tabla) return;

    let clientes = obtenerDatos("clientes");
    tabla.innerHTML = "";

    clientes.forEach(c => {
        tabla.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.telefono}</td>
            <td>${c.plan}</td>
            <td><span class="estado-activo">${c.estado}</span></td>
            <td>${c.fechaInstalacion || "-"}</td>
            <td><button onclick="verCliente('${c.id}')">Ver</button></td>
        </tr>`;
    });
}

function cargarTickets() {
    let tabla = document.getElementById("admin-tickets-list");
    if (!tabla) return;

    let tickets = obtenerDatos("tickets");
    tabla.innerHTML = "";

    tickets.forEach(t => {
        tabla.innerHTML += `
        <tr>
            <td>${t.id}</td>
            <td>${t.cliente}</td>
            <td>${t.problema}</td>
            <td>${t.prioridad}</td>
            <td>
                <select onchange="cambiarEstadoTicket('${t.id}', this.value)">
                    <option ${t.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option ${t.estado === "En proceso" ? "selected" : ""}>En proceso</option>
                    <option ${t.estado === "Resuelto" ? "selected" : ""}>Resuelto</option>
                </select>
            </td>
            <td>${t.tecnico}</td>
            <td>${t.fecha}</td>
        </tr>`;
    });
}

function cargarAverias() {
    let tabla = document.getElementById("admin-averias-list");
    if (!tabla) return;

    let averias = obtenerDatos("averias");
    tabla.innerHTML = "";

    averias.forEach(a => {
        tabla.innerHTML += `
        <tr>
            <td>${a.id}</td>
            <td>${a.cliente}</td>
            <td>${a.zona}</td>
            <td>${a.descripcion}</td>
            <td>${a.estado}</td>
            <td><button onclick="resolverAveria('${a.id}')">Resolver</button></td>
        </tr>`;
    });
}

function actualizarDashboard() {
    let totalClientes = document.getElementById("totalClientes");
    let clientesActivos = document.getElementById("clientesActivos");
    let ticketsPendientes = document.getElementById("ticketsPendientes");
    let ticketsResueltos = document.getElementById("ticketsResueltos");

    if (!totalClientes) return;

    let clientes = obtenerDatos("clientes");
    let tickets = obtenerDatos("tickets");

    totalClientes.innerHTML = clientes.length;
    clientesActivos.innerHTML = clientes.filter(c => c.estado === "Activo").length;
    ticketsPendientes.innerHTML = tickets.filter(t => t.estado !== "Resuelto").length;
    ticketsResueltos.innerHTML = tickets.filter(t => t.estado === "Resuelto").length;
}

window.addEventListener("load", () => {
    cargarClientes();
    cargarTickets();
    cargarAverias();
    actualizarDashboard();
});