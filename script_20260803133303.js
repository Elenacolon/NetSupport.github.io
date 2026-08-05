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

let clientes=[

{
fecha:"03/08/2026",
nombre:"Juan Pérez",
cedula:"001-1234567-8",
telefono:"809-555-2222",
email:"juan@gmail.com",
plan:"Premium 200 Mbps",
estado:"Activo",
tecnico:"Carlos"
},


{
fecha:"03/08/2026",
nombre:"María López",
cedula:"001-9876543-2",
telefono:"809-444-1111",
email:"maria@gmail.com",
plan:"Básico 50 Mbps",
estado:"Activo",
tecnico:"Pedro"
}

];




let tickets=[


{

fecha:"03/08/2026",
cliente:"Juan Pérez",
categoria:"Internet lento",
descripcion:"Baja velocidad",
estado:"Pendiente",
tecnico:"Carlos"

},


{

fecha:"02/08/2026",
cliente:"María López",
categoria:"Instalación",
descripcion:"Configuración del router",
estado:"Atendido",
tecnico:"Pedro"

}



];





function loadPanel(){

mostrarClientes();

mostrarTickets();

estadisticas();

}






function mostrarClientes(){


let tabla=document.getElementById("clientesBody");


tabla.innerHTML="";


clientes.forEach(cliente=>{


tabla.innerHTML+=`

<tr>

<td>${cliente.fecha}</td>

<td>${cliente.nombre}</td>

<td>${cliente.cedula}</td>

<td>${cliente.telefono}</td>

<td>${cliente.email}</td>

<td>${cliente.plan}</td>

<td>${cliente.estado}</td>

<td>${cliente.tecnico}</td>


</tr>

`;

});


}







function mostrarTickets(){


let tabla=document.getElementById("ticketsBody");


tabla.innerHTML="";



tickets.forEach((ticket,index)=>{


tabla.innerHTML+=`

<tr>


<td>${ticket.fecha}</td>

<td>${ticket.cliente}</td>

<td>${ticket.categoria}</td>

<td>${ticket.descripcion}</td>


<td>

<select onchange="cambiarEstado(${index},this.value)">


<option ${ticket.estado=="Pendiente"?"selected":""}>
Pendiente
</option>


<option ${ticket.estado=="En proceso"?"selected":""}>
En proceso
</option>


<option ${ticket.estado=="Atendido"?"selected":""}>
Atendido
</option>



</select>


</td>


<td>${ticket.tecnico}</td>



</tr>


`;


});


}






function cambiarEstado(id,estado){


tickets[id].estado=estado;

estadisticas();

}






function estadisticas(){


let activos=
clientes.filter(c=>c.estado=="Activo").length;



let pendientes=
tickets.filter(t=>t.estado!="Atendido").length;



let atendidos=
tickets.filter(t=>t.estado=="Atendido").length;




document.getElementById("statClientes").innerHTML=clientes.length;


document.getElementById("statActivos").innerHTML=activos;


document.getElementById("statTickets").innerHTML=pendientes;


document.getElementById("statAtendidos").innerHTML=atendidos;


}







function resetData(){


if(confirm("¿Eliminar todos los registros?")){


clientes=[];

tickets=[];


loadPanel();


}


}





window.onload=loadPanel;