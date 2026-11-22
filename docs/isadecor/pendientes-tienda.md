# Pendientes: tienda, ventas y comprobantes

Lo que **no** se hizo todavía y se acordó dejar anotado. Está ordenado por prioridad; dentro de cada punto va el motivo
y qué haría falta. Ver también [plan-admin-ux.md](plan-admin-ux.md) (el plan de UX del admin, ya completo salvo la 3.3).

## 1. Comprobantes de pago (boletas y facturas)

**Hoy no existe nada.** Ninguna parte del código habla de boleta, factura, comprobante ni IGV. Lo único que hay es que el
checkout ya pide RUC y razón social, y que las ventas registradas a mano guardan tipo de documento (DNI o RUC), número y
razón social del comprador: son los datos de partida para emitir.

**Cómo abordarlo (no construirlo por dentro).** Emitir comprobantes electrónicos tiene reglas fiscales y se hace con un
proveedor autorizado que ofrece API (en Perú los hay conocidos, como Nubefact). Por etapas:

- **Etapa A: registrarlos a mano.** En cada venta o pedido, anotar tipo de comprobante (boleta, factura o ninguno), serie,
  número y enlace al PDF. Se emite en el sistema que ya usen y aquí solo queda el registro.
- **Etapa B: integrar al proveedor.** Un botón «Emitir» en el admin y que el cliente descargue su comprobante en «Mi cuenta».
  Exige definir el desglose de IGV (ver punto 6).

**Antes de decidir:** confirmar con el contador su régimen tributario y si hoy emiten boletas o facturas, y con qué sistema.

## 2. Avisos (correo o WhatsApp)

No hay ningún envío de mensajes: ni el backend tiene dependencia de correo. Al crearse un pedido o cambiar de estado,
**ni el cliente ni el administrador reciben nada**; solo te enteras si abres el dashboard.
Falta: aviso al administrador cuando entra un pedido, y aviso al cliente con la confirmación y los cambios
de estado. Hay que elegir el canal (correo o un enlace/mensaje de WhatsApp) y el proveedor.

## 3. Comprobante del pago del cliente

El cliente paga por transferencia, Plin o Yape y hoy manda la captura por otro lado (WhatsApp). Falta poder **subir la
captura al pedido** para que quien confirma el pago la vea ahí.

## 4. Pedidos sin pagar bloquean stock para siempre

El stock se descuenta en cuanto se crea el pedido (queda en «Pendiente de pago») y solo se devuelve si alguien lo cancela.
No hay vencimiento: un pedido abandonado retiene stock indefinidamente. Falta un plazo (p. ej. 48 horas) tras el cual se
cancele solo y devuelva el stock, o al menos un aviso en el dashboard de «pedidos pendientes de pago hace más de N días».

## 5. «Tarjeta» sin pasarela de pago

La tienda anuncia «Transferencia, Yape o Plin, y tarjeta» (`features/isadecor/home/isadecor-home.static.ts`), pero **no hay
ninguna pasarela de pago implementada**; todo el pago es manual. Dos salidas: quitar «y tarjeta» del texto (rápido), o
integrar una pasarela (proyecto aparte: proveedor, comisiones, conciliación).

## 6. Totales del pedido: envío, IGV y descuentos

El total de un pedido es solo la suma de los productos. Faltan: **costo de envío** (o zonas de reparto), **desglose del
IGV** (hoy no se sabe si los precios lo incluyen) y cupones. Si un producto no tiene precio, el total del pedido queda vacío.

## 7. Devoluciones

Cancelar un pedido **ya entregado** devuelve el stock automáticamente, como si la mercadería hubiera regresado. Falta un
flujo de devoluciones real (qué se devolvió, en qué estado, si vuelve al stock).

## 8. Comprar sin crear cuenta

Para comprar hay que registrarse e iniciar sesión (el pedido exige un cliente). Es fricción para una compra rápida; un
«comprar como invitado» pediría relajar esa regla.

## 9. Mejoras de las ventas registradas a mano

Lo básico ya está (registrar, editar, anular, resumen de hoy y del mes, por cobrar). Quedó fuera:

- **Marcar como cobrada** con un clic una venta «por cobrar» (hoy se hace editándola).
- **Comprobante** de la venta (ver punto 1) y **exportar** a Excel o CSV.
- **Reportes:** más vendido, ventas por canal o por mes.
- Ver las ventas también en la ficha del producto o del cliente.
- Cuando alguien quiera borrar de verdad una venta: hoy solo se anulan.

## 10. Otros pendientes técnicos y de UX

- **Vista previa editable de ISADECOR** (3.3 del plan de UX): proyecto aparte, opcional.
- **Reordenar** equipo, credenciales y servicios desde la vista previa de Landing.
- **Retirar del backend lo que el frontend ya no usa:** los endpoints de anuncios y su tabla `anuncios` (vacía), y los de
  solicitudes de contacto con su tabla `solicitudes_contacto`. Esta última **no se borró a propósito**: puede tener
  solicitudes reales en producción; exportarlas antes de eliminarla con una migración.
- **OpenAPI:** faltan los endpoints de `textos-bloque`.
- **Formulario de producto:** rediseño (muy largo: unas 10 pantallas dentro de un panel).
- **Tests que ya fallaban antes** y siguen pendientes: `app.routes.server.spec` (2), `admin-projects.spec` (4, error de
  `changingFeaturedId`) y `service-form.spec` (6). Además, `hero-editor.spec` falla a veces solo dentro de la corrida completa.
