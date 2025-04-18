// Variables iniciales  
let contactos = JSON.parse(localStorage.getItem('contactos')) || [];  
let cuentasPagadas = JSON.parse(localStorage.getItem('cuentasPagadas')) || [];  
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];  
let cuentasPendientes = JSON.parse(localStorage.getItem('cuentasPendientes')) || [];  
let saldo = parseFloat(localStorage.getItem('saldo')) || 0;  
let carroCompras = [];  
let graficoGastos;  

window.onload = () => {  
    cargarContactos();  
    actualizarCuentasPendientes();  
    actualizarSaldoDisplay();  
    actualizarGraficoGastos();  
};  

// Función para mostrar secciones  
function mostrarSecciones() {  
    ['billetera', 'transferir', 'cuentas', 'gastos'].forEach(id => {  
        document.getElementById(id).style.display = '';  
    });  
}  

// Función para filtrar contactos  
function filtrarContactos() {  
    const input = document.getElementById('buscar-contacto');  
    const filter = input.value.toUpperCase();  
    const lista = document.getElementById('lista-contactos');  
    lista.innerHTML = '';  
    contactos.filter(c => c.toUpperCase().includes(filter)).forEach(contacto => {  
        const li = document.createElement('li');  
        li.textContent = contacto;  
        lista.appendChild(li);  
    });  
}  

// Función para agregar contacto  
function agregarContacto() {  
    const nombre = document.getElementById('nombre-contacto').value.trim();  
    if (nombre && !contactos.includes(nombre)) {  
        contactos.push(nombre);  
        localStorage.setItem('contactos', JSON.stringify(contactos));  
        document.getElementById('nombre-contacto').value = '';  
        cargarContactos();  
        Swal.fire('Contacto agregado', '', 'success');  
    }  
}  

// Función para cargar contactos  
function cargarContactos() {  
    const lista = document.getElementById('lista-contactos');  
    lista.innerHTML = '';  
    contactos.forEach(contacto => {  
        const li = document.createElement('li');  
        li.textContent = contacto;  
        lista.appendChild(li);  
    });  
}  

// Función para actualizar el saldo en la interfaz  
function actualizarSaldoDisplay() {  
    document.getElementById('total-saldo').textContent = `$${saldo.toFixed(2)}`;  
}  

// Función para guardar el saldo 
function guardarSaldo() {  
    const saldoUsuario = parseFloat(document.getElementById('saldo-usuario').value);  
    const usuario = document.getElementById('usuario').value.trim();  
    const contrasena = document.getElementById('contrasena').value.trim();  

    if (!usuario || !contrasena) {  
        Swal.fire('Campos vacíos', 'Por favor ingresa un usuario y una contraseña.', 'warning');  
        return;  
    }  

    if (isNaN(saldoUsuario) || saldoUsuario <= 0) {  
        Swal.fire('Saldo inválido', 'Por favor ingresa un saldo mayor a 0.', 'error');  
        return;  
    }  

    saldo = saldoUsuario;  
    localStorage.setItem('saldo', saldo);  
    document.getElementById('saldo-inicio').style.display = 'none';  
    mostrarSecciones();  
    actualizarSaldoDisplay();  
    Swal.fire('Bienvenido', `Bienvenido, ${usuario}<br> Tu saldo inicial es: $${saldo.toFixed(2)}`, 'success');  
}  

// Función para actualizar cuentas pendientes  
function actualizarCuentasPendientes() {  
    const lista = document.getElementById('carro-compras');  
    lista.innerHTML = '';  
    cuentasPendientes.forEach((cuenta, i) => {  
        if (cuenta.monto > 0) {  
            const div = document.createElement('div');  
            div.className = 'd-flex justify-content-between align-items-center mb-2';  
            div.innerHTML = `  
                <span>${cuenta.nombre}: $${cuenta.monto.toFixed(2)}</span>  
                <div>  
                    <button class="btn btn-sm btn-primary me-2" onclick="agregarACarrito(${i})">  
                        Agregar al Carrito  
                    </button>  
                    <button class="btn btn-sm btn-danger" onclick="eliminarCuenta(${i})">  
                        ❌  
                    </button>  
                </div>`;  
            lista.appendChild(div);  
        }  
    });  
    localStorage.setItem('cuentasPendientes', JSON.stringify(cuentasPendientes));  
}  

// Función para eliminar una cuenta  
function eliminarCuenta(index) {  
    if (index >= 0 && index < cuentasPendientes.length) {  
        cuentasPendientes.splice(index, 1);  
        localStorage.setItem('cuentasPendientes', JSON.stringify(cuentasPendientes));  
        actualizarCuentasPendientes();  
        Swal.fire('Cuenta eliminada', 'La cuenta ha sido eliminada correctamente.', 'success');  
    }  
}  

// Función para agregar una cuenta pendiente  
function agregarCuentaPendiente() {  
  const nombre = document.getElementById('nombre-cuenta').value.trim();  
  const monto = parseFloat(document.getElementById('monto-cuenta').value);  

  if (!nombre || isNaN(monto) || monto <= 0) {  
      if (!nombre) {  
          Swal.fire('Error', 'Por favor ingresa el nombre de la cuenta', 'error');  
      } else if (isNaN(monto) || monto <= 0) {  
          Swal.fire('Error', 'Por favor ingresa un monto válido mayor a 0', 'error');  
      }  
      return;  
  }  

  cuentasPendientes.push({  
      nombre: nombre,  
      monto: monto  
  });  

 
  localStorage.setItem('cuentasPendientes', JSON.stringify(cuentasPendientes));  

   
  document.getElementById('nombre-cuenta').value = '';  
  document.getElementById('monto-cuenta').value = '';  

  
  actualizarCuentasPendientes();  

  
  Swal.fire('Cuenta Agregada', `La cuenta ${nombre} con monto $${monto.toFixed(2)} ha sido agregada correctamente`, 'success');  
}  

// Función para agregar cuenta al carrito  
function agregarACarrito(index) {  
    if (index >= 0 && index < cuentasPendientes.length) {  
        const cuenta = {...cuentasPendientes[index]};  
        if (cuenta.monto > 0) {  
            carroCompras.push(cuenta);  
            actualizarTotalCarro();  
            Swal.fire('Cuenta agregada al carrito', `La cuenta ${cuenta.nombre} ha sido agregada al carrito.`, 'success');  
        } else {  
            Swal.fire('Monto inválido', 'La cuenta no tiene un monto válido.', 'error');  
        }  
    }  
}  

// Función para actualizar el total del carrito  
function actualizarTotalCarro() {  
    const total = carroCompras.reduce((sum, c) => sum + (c.monto || 0), 0);  
    document.getElementById('total-carro').textContent = `Total a Pagar: $${total.toFixed(2)}`;  
    const listaDetalle = document.getElementById('detalle-carro');  
    listaDetalle.innerHTML = '';  

    carroCompras.forEach((item, i) => {  
        const div = document.createElement('div');  
        div.className = 'd-flex justify-content-between align-items-center mb-1';  
        div.innerHTML = `  
            <span>${item.nombre}: $${item.monto.toFixed(2)}</span>  
            <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${i})">  
                ❌  
            </button>`;  
        listaDetalle.appendChild(div);  
    });  
}  

// Función para eliminar una cuenta del carrito  
function eliminarDelCarrito(index) {  
    if (index >= 0 && index < carroCompras.length) {  
        carroCompras.splice(index, 1);  
        actualizarTotalCarro();  
        Swal.fire('Cuenta eliminada del carrito', 'La cuenta ha sido eliminada del carrito.', 'success');  
    }  
}  

// Función para pagar cuentas  
function pagarCuentas() {  
    const total = carroCompras.reduce((sum, c) => sum + c.monto, 0);  

    if (total > saldo) {  
        Swal.fire('Saldo insuficiente', 'No tienes suficiente saldo para pagar las cuentas seleccionadas.', 'error');  
        return;  
    }  

    if (total <= 0) {  
        Swal.fire('Sin cuentas para pagar', 'No hay cuentas en el carrito.', 'warning');  
        return;  
    }  

    saldo -= total;  
    localStorage.setItem('saldo', saldo);  
    actualizarSaldoDisplay();  

    cuentasPagadas.push(...carroCompras);  
    localStorage.setItem('cuentasPagadas', JSON.stringify(cuentasPagadas));  

    carroCompras = [];  
    actualizarTotalCarro();  
    actualizarCuentasPendientes();  
    actualizarGraficoGastos();  

    const resumen = carroCompras.map(c => `• ${c.nombre}: $${(c.monto || 0).toFixed(2)}`).join('<br>');  
    Swal.fire({  
        icon: 'success',  
        title: 'Cuentas pagadas exitosamente',  
        html: `Se pagaron las siguientes cuentas:<br><br>${resumen}<br><br>Total: $${total.toFixed(2)}`  
    });  
}  

// Función para transferir dinero  
function transferirDinero() {  
    const nombre = document.getElementById('nombre-contacto-transferir').value.trim();  
    const monto = parseFloat(document.getElementById('monto-transferir').value);  

    if (!nombre || !contactos.includes(nombre)) {  
        Swal.fire('Contacto no encontrado', 'El contacto no está en tu lista.', 'warning');  
        return;  
    }  

    if (isNaN(monto) || monto <= 0 || monto > saldo) {  
        Swal.fire('Monto inválido', 'Por favor ingresa un monto válido.', 'error');  
        return;  
    }  

    saldo -= monto;  
    localStorage.setItem('saldo', saldo);  
    actualizarSaldoDisplay();  

    gastos.push({ monto, categoria: `Transferencia a ${nombre}` });  
    localStorage.setItem('gastos', JSON.stringify(gastos));  
    actualizarGraficoGastos();  

    Swal.fire('Transferencia realizada', 'La transferencia se realizó correctamente.', 'success');  
    document.getElementById('nombre-contacto-transferir').value = '';  
    document.getElementById('monto-transferir').value = '';  
}  

// Función para agregar gasto  
function agregarGasto() {  
    const monto = parseFloat(document.getElementById('monto-gasto').value);  
    const categoria = document.getElementById('categoria-gasto').value.trim();  

    if (!categoria || isNaN(monto) || monto <= 0) {  
        Swal.fire('Datos inválidos', 'Por favor ingresa una categoría y un monto válido.', 'warning');  
        return;  
    }  

    if (monto > saldo) {  
        Swal.fire('Saldo insuficiente', 'No tienes suficiente saldo para este gasto.', 'error');  
        return;  
    }  

    gastos.push({ monto, categoria });  
    saldo -= monto;  
    localStorage.setItem('saldo', saldo);  
    localStorage.setItem('gastos', JSON.stringify(gastos));  
    actualizarSaldoDisplay();  

    document.getElementById('monto-gasto').value = '';  
    document.getElementById('categoria-gasto').value = '';  
    actualizarGraficoGastos();  

    Swal.fire('Gasto agregado', 'El gasto ha sido agregado correctamente.', 'success');  
}  

// Función para obtener totales por categoría  
function obtenerTotalesPorCategoria() {  
    const categorias = {};  
    gastos.forEach(g => {  
        categorias[g.categoria] = (categorias[g.categoria] || 0) + g.monto;  
    });  

    const totalCuentas = cuentasPagadas.reduce((sum, c) => sum + (c.monto || 0), 0);  
    if (totalCuentas > 0) {  
        categorias['Pagos de Cuentas'] = totalCuentas;  
    }  

    return categorias;  
}  

// Función para actualizar el gráfico de gastos  
function actualizarGraficoGastos() {  
    const ctx = document.getElementById('grafico-gastos').getContext('2d');  
    if (graficoGastos) {  
        graficoGastos.destroy();  
    }  

    const datos = obtenerTotalesPorCategoria();  
    const labels = Object.keys(datos);  
    const valores = Object.values(datos);  

    graficoGastos = new Chart(ctx, {  
        type: 'pie',  
        data: {  
            labels: labels,  
            datasets: [{  
                data: valores,  
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997']  
            }]  
        },  
        options: {  
            responsive: true,  
            plugins: {  
                legend: {  
                    position: 'right'  
                }  
            }  
        }  
    });  
}  