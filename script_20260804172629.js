import { db, collection, addDoc } from "./firebase.js";

console.log("✅ script.js cargado correctamente");


// CONTROL DEL MODAL


function abrirModal(plan, velocidad, precio) {
    console.log("Intentando abrir modal para:", plan);

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

// Asignar al objeto global 'window'
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

// Cierre al dar clic fuera de la caja modal
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    if (e.target === modal) {
        cerrarModal();
    }
});

// EMAILJS

async function enviarCorreo(nombre, email, plan, precio) {
    const fecha = new Date().toLocaleDateString("es-DO");

    // Verificar si la librería de EmailJS existe en window
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


// FORMULARIO & FIRESTORE


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
            // 1. Guardar en Firestore
            await addDoc(collection(db, "Solicitudes"), {
                nombre: nombre,
                email: email,
                cedula: cedula,
                plan: plan,
                precio: precio,
                fecha: new Date()
            });

            // 2. Intentar envío de correo (sin bloquear si falla)
            enviarCorreo(nombre, email, plan, precio);

            // 3. Confirmación al usuario
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


// Validación de campos del formulario
document.addEventListener("DOMContentLoaded", function () {

    // ==========================
    // ELEMENTOS
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

        loginSection.classList.remove("login-hidden");
        registerSection.classList.add("login-hidden");
        forgotSection.classList.add("login-hidden");

    }

    function mostrarRegistro() {

        loginSection.classList.add("login-hidden");
        registerSection.classList.remove("login-hidden");
        forgotSection.classList.add("login-hidden");

    }

    function mostrarRecuperar() {

        loginSection.classList.add("login-hidden");
        registerSection.classList.add("login-hidden");
        forgotSection.classList.remove("login-hidden");

    }

    showRegister.addEventListener("click", mostrarRegistro);

    showForgot.addEventListener("click", mostrarRecuperar);

    backLogin1.addEventListener("click", mostrarLogin);

    backLogin2.addEventListener("click", mostrarLogin);

    // ==========================
    // LOGIN
    // ==========================

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = loginPassword.value.trim();

        if (email === "" || password === "") {

            alert("Por favor complete todos los campos.");
            return;

        }

        console.log("Iniciando sesión...");
        console.log(email);
        console.log(password);

        // Aquí irá Firebase Authentication

    });

    // ==========================
    // REGISTRO
    // ==========================

    registerForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const nombre = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmar = document.getElementById("confirmPassword").value;

        if (nombre === "" || email === "" || password === "" || confirmar === "") {

            alert("Complete todos los campos.");
            return;

        }

        if (password !== confirmar) {

            alert("Las contraseñas no coinciden.");
            return;

        }

        console.log("Nuevo usuario");
        console.log(nombre);
        console.log(email);

        // Aquí irá Firebase Authentication

    });

    // ==========================
    // RECUPERAR CONTRASEÑA
    // ==========================

    forgotForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const email = document.getElementById("forgotEmail").value.trim();

        if (email === "") {

            alert("Ingrese su correo electrónico.");
            return;

        }

        console.log("Enviar enlace a:", email);

        // Aquí irá Firebase Password Reset

    });

});

//Panel

// ==========================================
// SISTEMA ADMINISTRATIVO NET SUPPORT
// ==========================================


// GENERAR ID

function generarID(prefijo){

    return prefijo + "-" + Date.now();

}



// ==========================================
// BASE DE DATOS LOCAL
// ==========================================


function obtenerDatos(tabla){

    let datos = localStorage.getItem(tabla);

    return datos ? JSON.parse(datos) : [];

}



function guardarDatos(tabla, datos){

    localStorage.setItem(
        tabla,
        JSON.stringify(datos)
    );

}



// ==========================================
// REGISTRAR CLIENTE
// ==========================================


function registrarCliente(cliente){


    let clientes = obtenerDatos("clientes");


    cliente.id = generarID("CLI");

    cliente.fechaRegistro =
    new Date().toLocaleDateString();


    cliente.estado="Activo";


    clientes.push(cliente);


    guardarDatos(
        "clientes",
        clientes
    );


    cargarClientes();

    actualizarDashboard();


}



function registrarTicket(ticket){


let tickets =
obtenerDatos("tickets");



ticket.id =
generarID("TCK");


ticket.fecha =
new Date().toLocaleDateString();



ticket.estado="Pendiente";


ticket.tecnico="Sin asignar";



tickets.push(ticket);



guardarDatos(
"tickets",
tickets
);



cargarTickets();

actualizarDashboard();



}



// ==========================================
// REGISTRAR AVERIA
// ==========================================


function registrarAveria(averia){


let averias =
obtenerDatos("averias");



averia.id =
generarID("AVG");



averia.fecha =
new Date().toLocaleDateString();



averia.estado="Pendiente";



averias.push(averia);



guardarDatos(
"averias",
averias
);



cargarAverias();

actualizarDashboard();


}



// ==========================================
// MOSTRAR CLIENTES
// ==========================================


function cargarClientes(){


let tabla =
document.getElementById(
"admin-clientes-list"
);



if(!tabla) return;



let clientes =
obtenerDatos("clientes");



tabla.innerHTML="";



clientes.forEach(c=>{


tabla.innerHTML += `


<tr>


<td>${c.id}</td>


<td>${c.nombre}</td>


<td>${c.telefono}</td>


<td>${c.plan}</td>



<td>

<span class="estado-activo">

${c.estado}

</span>


</td>



<td>${c.fechaInstalacion || "-"}</td>



<td>


<button onclick="verCliente('${c.id}')">

Ver

</button>


</td>



</tr>


`;


});



}


// ==========================================
// MOSTRAR TICKETS
// ==========================================


function cargarTickets(){


let tabla =
document.getElementById(
"admin-tickets-list"
);



if(!tabla) return;



let tickets =
obtenerDatos("tickets");



tabla.innerHTML="";



tickets.forEach(t=>{


tabla.innerHTML+=`


<tr>


<td>${t.id}</td>


<td>${t.cliente}</td>


<td>${t.problema}</td>


<td>${t.prioridad}</td>



<td>


<select onchange="cambiarEstadoTicket('${t.id}',this.value)">


<option ${t.estado=="Pendiente"?"selected":""}>
Pendiente
</option>


<option ${t.estado=="En proceso"?"selected":""}>
En proceso
</option>



<option ${t.estado=="Resuelto"?"selected":""}>
Resuelto
</option>



</select>


</td>



<td>${t.tecnico}</td>


<td>${t.fecha}</td>



</tr>


`;


});


}


// ==========================================
// CAMBIAR ESTADO TICKET
// ==========================================


function cambiarEstadoTicket(id,estado){


let tickets =
obtenerDatos("tickets");



let ticket =
tickets.find(t=>t.id===id);



if(ticket){


ticket.estado=estado;


}



guardarDatos(
"tickets",
tickets
);



cargarTickets();

actualizarDashboard();


}

// ==========================================
// MOSTRAR AVERIAS
// ==========================================


function cargarAverias(){


let tabla =
document.getElementById(
"admin-averias-list"
);



if(!tabla)return;



let averias =
obtenerDatos("averias");



tabla.innerHTML="";



averias.forEach(a=>{


tabla.innerHTML+=`


<tr>


<td>${a.id}</td>


<td>${a.cliente}</td>


<td>${a.zona}</td>


<td>${a.descripcion}</td>



<td>${a.estado}</td>



<td>

<button onclick="resolverAveria('${a.id}')">

Resolver

</button>

</td>


</tr>


`;


});



}



function resolverAveria(id){


let averias =
obtenerDatos("averias");


let averia =
averias.find(a=>a.id===id);



if(averia){

averia.estado="Resuelta";

}



guardarDatos(
"averias",
averias
);



cargarAverias();


}


// ==========================================
// DASHBOARD
// ==========================================


function actualizarDashboard(){



let clientes =
obtenerDatos("clientes");


let tickets =
obtenerDatos("tickets");


let resueltos =
tickets.filter(
t=>t.estado==="Resuelto"
).length;



let pendientes =
tickets.filter(
t=>t.estado!=="Resuelto"
).length;



document.getElementById(
"totalClientes"
).innerHTML=
clientes.length;



document.getElementById(
"clientesActivos"
).innerHTML=
clientes.filter(
c=>c.estado==="Activo"
).length;



document.getElementById(
"ticketsPendientes"
).innerHTML=
pendientes;



document.getElementById(
"ticketsResueltos"
).innerHTML=
resueltos;



}





// ==========================================
// INICIAR PANEL
// ==========================================


window.onload=function(){


cargarClientes();


cargarTickets();


cargarAverias();


actualizarDashboard();


};
