// Variables iniciales
let contactos = JSON.parse(localStorage.getItem('contactos')) || ['Juan Pérez', 'Ana Gómez', 'Luis Rodríguez', 'María Martínez'];
let historialTransacciones = JSON.parse(localStorage.getItem('historialTransacciones')) || [];
let cuentasPagadas = JSON.parse(localStorage.getItem('cuentasPagadas')) || [];

let cuentasPendientes = JSON.parse(localStorage.getItem('cuentasPendientes')) || [
  { nombre: 'Luz', monto: 50000 },
  { nombre: 'Agua', monto: 40000 },
  { nombre: 'Gas', monto: 20000 },
  { nombre: 'Alquiler', monto: 230000 },
  { nombre: 'Supermercado', monto: 180000 }
];

let saldo = parseFloat(localStorage.getItem('saldo')) || 0;
let carroCompras = [];

// Al cargar la página, inicializar secciones y mostrar datos
window.onload = function() {
  cargarContactos();
  actualizarCuentasPendientes();
  actualizarHistorial();
  actualizarSaldoDisplay();
};

// Mostrar secciones principales luego de guardar el saldo
function mostrarSecciones() {
  document.getElementById('billetera').style.display = '';
  document.getElementById('transferir').style.display = '';
  document.getElementById('cuentas').style.display = '';
  document.getElementById('historial').style.display = '';
}

// Función para filtrar contactos
function filtrarContactos() {
  const input = document.getElementById('buscar-contacto');
  const filter = input.value.toUpperCase();
  const lista = document.getElementById('lista-contactos');
  const contactosFiltrados = contactos.filter(contacto => contacto.toUpperCase().includes(filter));
  lista.innerHTML = '';
  contactosFiltrados.forEach(contacto => {
    const li = document.createElement('li');
    li.textContent = contacto;
    lista.appendChild(li);
  });
}

// Agregar un nuevo contacto
function agregarContacto() {
  const nombreContacto = document.getElementById('nombre-contacto').value.trim();
  if (nombreContacto && !contactos.includes(nombreContacto)) {
    contactos.push(nombreContacto);
    localStorage.setItem('contactos', JSON.stringify(contactos));
    document.getElementById('nombre-contacto').value = '';
    cargarContactos();
  }
}

// Cargar contactos en la lista
function cargarContactos() {
  const listaContactos = document.getElementById('lista-contactos');
  listaContactos.innerHTML = '';
  contactos.forEach(contacto => {
    const li = document.createElement('li');
    li.textContent = contacto;
    listaContactos.appendChild(li);
  });
}

// Actualizar la visualización del saldo
function actualizarSaldoDisplay() {
  document.getElementById('total-saldo').textContent = `$${saldo.toFixed(2)}`;
}

// Guardar el saldo inicial
function guardarSaldo() {
  const saldoUsuario = parseFloat(document.getElementById('saldo-usuario').value);
  if (!isNaN(saldoUsuario) && saldoUsuario > 0) {
    saldo = saldoUsuario;
    localStorage.setItem('saldo', saldo);
    document.getElementById('saldo-inicio').style.display = 'none';
    mostrarSecciones();
    actualizarSaldoDisplay();
  }
}

// Actualizar la lista de cuentas pendientes en el HTML
function actualizarCuentasPendientes() {
  const listaCuentas = document.getElementById('carro-compras');
  listaCuentas.innerHTML = '';
  cuentasPendientes.forEach((cuenta, index) => {
    const div = document.createElement('div');
    div.textContent = `${cuenta.nombre}: $${cuenta.monto.toFixed(2)}`;
    const agregarBtn = document.createElement('button');
    agregarBtn.textContent = 'Agregar al Carrito';
    agregarBtn.onclick = () => agregarACarrito(index);
    div.appendChild(agregarBtn);
    listaCuentas.appendChild(div);
  });
  localStorage.setItem('cuentasPendientes', JSON.stringify(cuentasPendientes));
}

// Agregar cuenta al carrito
function agregarACarrito(index) {
  const cuenta = cuentasPendientes[index];
  carroCompras.push(cuenta);
  actualizarTotalCarro();
  mostrarMensaje(`"${cuenta.nombre}" ha sido agregado al carrito.`);
}

// Actualizar y mostrar el total del carrito
function actualizarTotalCarro() {
  const total = carroCompras.reduce((sum, cuenta) => sum + cuenta.monto, 0);
  document.getElementById('total-carro').textContent = `Total a Pagar: $${total.toFixed(2)}`;
}

// Mostrar mensajes temporales
function mostrarMensaje(mensaje) {
  const mensajePago = document.getElementById('mensaje-pago');
  mensajePago.textContent = mensaje;
  mensajePago.classList.remove('hidden');
  setTimeout(() => {
    mensajePago.classList.add('hidden');
  }, 3000);
}

// Procesar el pago de las cuentas en el carrito
function pagarCuentas() {
  const montoTotal = carroCompras.reduce((total, cuenta) => total + cuenta.monto, 0);
  if (montoTotal > saldo) {
    mostrarMensaje('No tienes saldo suficiente para pagar todas las cuentas.');
    return;
  }
  saldo -= montoTotal;
  localStorage.setItem('saldo', saldo);
  actualizarSaldoDisplay();

  const fechaActual = new Date().toLocaleString();
  const timestampActual = Date.now();

  // Registrar transacción de pago global
  const transaccionPago = {
    tipo: 'Pago de cuentas',
    detalle: `Total: $${montoTotal.toFixed(2)}`,
    fecha: fechaActual,
    timestamp: timestampActual
  };
  historialTransacciones.push(transaccionPago);

  // Registrar cada cuenta pagada individualmente
  const cuentasPagadasConFecha = carroCompras.map(cuenta => ({
    nombre: cuenta.nombre,
    monto: cuenta.monto,
    fecha: fechaActual,
    timestamp: timestampActual
  }));
  cuentasPagadas = cuentasPagadas.concat(cuentasPagadasConFecha);

  localStorage.setItem('historialTransacciones', JSON.stringify(historialTransacciones));
  localStorage.setItem('cuentasPagadas', JSON.stringify(cuentasPagadas));

  carroCompras = [];
  actualizarTotalCarro();
  actualizarHistorial();
  mostrarMensaje('Cuentas pagadas exitosamente.');
}

// Procesar la transferencia de dinero
function transferirDinero() {
  const nombreContacto = document.getElementById('nombre-contacto-transferir').value.trim();
  const montoTransferir = parseFloat(document.getElementById('monto-transferir').value);

  if (!nombreContacto || !contactos.includes(nombreContacto)) {
    mostrarMensaje('Contacto no encontrado');
    return;
  }
  if (isNaN(montoTransferir) || montoTransferir <= 0 || montoTransferir > saldo) {
    document.getElementById('mensaje-error').textContent = 'Monto inválido o saldo insuficiente';
    document.getElementById('mensaje-error').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('mensaje-error').classList.add('hidden');
    }, 3000);
    return;
  }
  saldo -= montoTransferir;
  localStorage.setItem('saldo', saldo);
  actualizarSaldoDisplay();

  const fechaActual = new Date().toLocaleString();
  const timestampActual = Date.now();

  const transaccionTransferencia = {
    tipo: 'Transferencia',
    detalle: `A ${nombreContacto} por $${montoTransferir.toFixed(2)}`,
    fecha: fechaActual,
    timestamp: timestampActual
  };
  historialTransacciones.push(transaccionTransferencia);
  localStorage.setItem('historialTransacciones', JSON.stringify(historialTransacciones));

  mostrarMensaje('Transferencia realizada exitosamente.');
  actualizarHistorial();

  document.getElementById('nombre-contacto-transferir').value = '';
  document.getElementById('monto-transferir').value = '';
}

// Agregar una nueva cuenta pendiente
function agregarCuenta() {
  const nombreCuenta = document.getElementById('nombre-cuenta').value.trim();
  const montoCuenta = parseFloat(document.getElementById('monto-cuenta').value);
  if (!nombreCuenta || isNaN(montoCuenta) || montoCuenta <= 0) {
    mostrarMensaje('Datos de cuenta inválidos');
    return;
  }
  const nuevaCuenta = { nombre: nombreCuenta, monto: montoCuenta };
  cuentasPendientes.push(nuevaCuenta);
  localStorage.setItem('cuentasPendientes', JSON.stringify(cuentasPendientes));
  actualizarCuentasPendientes();
  mostrarMensaje('Cuenta agregada exitosamente.');
  document.getElementById('nombre-cuenta').value = '';
  document.getElementById('monto-cuenta').value = '';
}

// Actualizar y mostrar el historial combinado en la sección de historial
function actualizarHistorial() {
  const historialDiv = document.getElementById('lista-historial');
  historialDiv.innerHTML = '';

  let historialCompleto = [];

  // Agregar transacciones de transferencias y pagos globales
  historialTransacciones.forEach(tx => {
    historialCompleto.push({
      fecha: tx.fecha,
      timestamp: tx.timestamp,
      tipo: tx.tipo,
      detalle: tx.detalle
    });
  });

  // Agregar cada cuenta pagada individualmente
  cuentasPagadas.forEach(cuenta => {
    historialCompleto.push({
      fecha: cuenta.fecha,
      timestamp: cuenta.timestamp,
      tipo: 'Pago de cuenta',
      detalle: `${cuenta.nombre}: $${cuenta.monto.toFixed(2)}`
    });
  });

  // Ordenar el historial de más reciente a más antiguo
  historialCompleto.sort((a, b) => b.timestamp - a.timestamp);

  historialCompleto.forEach(item => {
    const p = document.createElement('p');
    p.textContent = `[${item.fecha}] ${item.tipo}: ${item.detalle}`;
    historialDiv.appendChild(p);
  });
}
