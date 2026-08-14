# Feature Specification: Gestión de Sesión y Productos Bancarios

**Feature Branch**: `001-gestion-sesion-productos`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "Épica: Como cliente del banco, quiero gestionar mi sesión, ver mis
productos y adquirir nuevos productos financieros desde la app, para tener control total de mi
información financiera de forma autónoma y segura. Historias de usuario HU-01 (login), HU-02
(Home con productos y saldos), HU-03a/b/c (catálogo, formulario y envío de solicitud de un nuevo
producto), HU-04 (cierre de sesión), según `Historias_Usuario_App_Bancaria.pdf` v1.0 (2026-07-28)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inicio de sesión (HU-01) (Priority: P1)

Como cliente registrado del banco, quiero iniciar sesión con mis credenciales, para acceder de
forma segura a mi información financiera.

**Why this priority**: Sin autenticación no existe app bancaria; es la puerta de entrada a todo lo
demás y la primera del MVP según el Product Owner.

**Independent Test**: Puede probarse por completo de forma aislada, sin ninguna otra historia
implementada: entrar credenciales válidas/ inválidas/ vacías contra un cliente registrado de
prueba y verificar la redirección, los mensajes de error y el bloqueo tras intentos fallidos.

**Acceptance Scenarios**:

1. **Given** soy un cliente registrado en la pantalla de login, **When** ingreso usuario/documento
   y contraseña válidos y presiono "Ingresar", **Then** el sistema valida mis credenciales y soy
   redirigido a la pantalla Home con mis productos.
2. **Given** estoy en la pantalla de login, **When** ingreso usuario o contraseña incorrectos,
   **Then** el sistema muestra "Usuario o contraseña incorrectos" y permanezco en el login.
3. **Given** he fallado el login 3 veces consecutivas, **When** intento un cuarto ingreso,
   **Then** el sistema bloquea temporalmente mi usuario y muestra "Usuario bloqueado, contacte a
   su banco / recupere su clave".
4. **Given** estoy en la pantalla de login, **When** presiono "Ingresar" sin diligenciar usuario o
   contraseña, **Then** el sistema muestra un mensaje de validación indicando el campo faltante.

---

### User Story 2 - Visualización de productos y saldos / Home (HU-02) (Priority: P2)

Como cliente autenticado, quiero ver mis productos financieros y sus saldos al ingresar a la app,
para conocer mi situación financiera actual de un vistazo.

**Why this priority**: Es el valor central de la app una vez autenticado; segunda historia del
MVP tras el login.

**Independent Test**: Con un cliente ya autenticado (mock/fixture de sesión), se puede probar de
forma aislada cargando el Home con productos, sin productos, con error de backend, y alternando
mostrar/ocultar saldo.

**Acceptance Scenarios**:

1. **Given** inicié sesión correctamente, **When** ingreso a la pantalla Home, **Then** el sistema
   muestra un listado con todos mis productos activos (cuentas, tarjetas, créditos, etc.) y para
   cada uno su saldo o cupo disponible actualizado.
2. **Given** inicié sesión correctamente y no tengo productos activos, **When** ingreso al Home,
   **Then** el sistema muestra "Aún no tienes productos" y una opción para adquirir un nuevo
   producto.
3. **Given** inicié sesión correctamente, **When** el sistema no logra consultar mis productos
   (error de conexión/backend), **Then** se muestra "No pudimos cargar tu información, intenta
   nuevamente" junto a un botón "Reintentar".
4. **Given** estoy en el Home viendo mis productos, **When** presiono el ícono de ojo sobre un
   saldo, **Then** el saldo se oculta mostrando asteriscos (***) y puedo volver a mostrarlo
   presionando nuevamente.

---

### User Story 3 - Cierre de sesión (HU-04) (Priority: P3)

Como cliente autenticado, quiero cerrar sesión de la app, para proteger mi información cuando
termino de usarla.

**Why this priority**: Cierra el flujo mínimo viable (login → home → logout) que el Product Owner
definió como MVP, antes de abordar la adquisición de productos.

**Independent Test**: Con un cliente autenticado, se puede probar de forma aislada: cerrar sesión
manualmente con y sin confirmación, verificar que no se pueda volver atrás, y simular inactividad
para el cierre automático.

**Acceptance Scenarios**:

1. **Given** estoy autenticado en la app, **When** presiono "Cerrar sesión" y confirmo, **Then**
   el sistema finaliza mi sesión activa, me redirige a la pantalla de login, y no puedo volver al
   Home con el botón "atrás" del dispositivo.
2. **Given** presiono "Cerrar sesión", **Then** el sistema muestra un mensaje de confirmación
   ("¿Seguro que deseas cerrar sesión? - Sí/No") antes de finalizar la sesión.
3. **Given** estoy autenticado y no interactúo con la app por el tiempo de inactividad
   configurado, **Then** el sistema cierra la sesión automáticamente y muestra "Tu sesión ha
   expirado por inactividad".

---

### User Story 4 - Catálogo de productos disponibles (HU-03a) (Priority: P4)

Como cliente autenticado, quiero ver el listado de productos financieros que puedo adquirir, para
elegir cuál se ajusta a mi necesidad.

**Why this priority**: Primer paso del flujo de adquisición; el PO indicó que toda la adquisición
(HU-03) puede iterarse después del MVP de sesión/visualización.

**Independent Test**: Con un cliente autenticado, se puede probar mostrando el catálogo, marcando
productos ya adquiridos, seleccionando uno y simulando un error de carga del catálogo, sin
depender de que el formulario (HU-03b) exista aún.

**Acceptance Scenarios**:

1. **Given** estoy en el Home, **When** presiono "Adquirir producto" / "+", **Then** el sistema
   muestra el listado de productos disponibles (ej. Crédito Rotativo, Tarjeta de crédito, CDT),
   cada uno con nombre, ícono/imagen y una descripción breve.
2. **Given** estoy viendo el catálogo y ya cuento con un producto activo, **Then** ese producto se
   muestra marcado como "Ya lo tienes" y no permite iniciar una nueva solicitud para él.
3. **Given** estoy viendo el catálogo, **When** selecciono un producto disponible, **Then** el
   sistema me redirige al formulario de solicitud correspondiente.
4. **Given** presiono "Adquirir producto", **When** el sistema no logra cargar el catálogo (error
   de backend), **Then** se muestra "No pudimos cargar los productos disponibles" junto a un botón
   "Reintentar".

---

### User Story 5 - Formulario de solicitud de producto (HU-03b) (Priority: P5)

Como cliente autenticado, quiero diligenciar un formulario con mis datos y la información
requerida, para solicitar formalmente el producto seleccionado.

**Why this priority**: Depende de que exista el catálogo (P4) para llegar al formulario; es el
paso intermedio antes de poder enviar una solicitud (P6).

**Independent Test**: Puede probarse de forma aislada abriendo el formulario directamente para un
producto de prueba (ej. Crédito Rotativo) y verificando precarga de datos, validaciones numéricas,
resaltado de errores y bloqueo por checkboxes sin marcar, sin necesidad de enviar la solicitud.

**Acceptance Scenarios**:

1. **Given** ingreso al formulario del producto seleccionado, **Then** los campos de datos
   personales (nombre, documento, celular, correo) se precargan automáticamente con mi información
   de cliente autenticado y no son editables.
2. **Given** estoy en el formulario, **When** diligencio ingresos, ocupación, egresos y
   monto/cupo deseado, **Then** el sistema permite continuar solo si los valores son numéricos y
   están dentro de los rangos permitidos para ese producto.
3. **Given** estoy en el formulario, **When** intento avanzar con campos obligatorios vacíos o
   inválidos, **Then** el sistema resalta en rojo los campos con error y muestra el mensaje
   específico de validación junto a cada campo.
4. **Given** completé todos los datos del formulario, **When** intento continuar sin marcar el
   checkbox de Términos y Condiciones o el de Autorización de consulta en centrales de riesgo,
   **Then** el sistema bloquea el avance y muestra "Debes aceptar los términos para continuar".
5. **Given** diligencié todos los campos obligatorios correctamente y acepté los checkboxes
   requeridos, **When** presiono "Continuar", **Then** el sistema habilita el botón de envío de la
   solicitud.

---

### User Story 6 - Envío y confirmación de la solicitud (HU-03c) (Priority: P6)

Como cliente autenticado, quiero enviar mi solicitud y recibir una confirmación, para tener
certeza de que mi trámite fue registrado y hacerle seguimiento.

**Why this priority**: Es el cierre del flujo de adquisición; depende de que el formulario (P5)
esté completo y válido.

**Independent Test**: Puede probarse de forma aislada enviando un formulario ya válido (fixture) y
verificando el mensaje de confirmación con radicado, el manejo de error de envío conservando los
datos, y la consulta posterior del estado por número de radicado.

**Acceptance Scenarios**:

1. **Given** completé correctamente el formulario de solicitud, **When** presiono "Enviar
   solicitud", **Then** el sistema envía la información al backend/core bancario y muestra
   "Solicitud enviada exitosamente" junto con un número/radicado de seguimiento.
2. **Given** presiono "Enviar solicitud", **When** ocurre un error de comunicación con el backend,
   **Then** el sistema muestra "No pudimos procesar tu solicitud, intenta nuevamente" y conserva
   los datos diligenciados para no perder la información.
3. **Given** ya envié una solicitud, **When** ingreso a la sección "Mis solicitudes", **Then**
   puedo ver el estado de mi trámite (en estudio, aprobado, rechazado) usando el número de
   radicado.

---

### Edge Cases

- ¿Qué pasa si el cliente cierra la app (no la sesión) con el formulario de solicitud a medias?
  Los datos diligenciados no persisten entre sesiones de la app; al reabrir, el formulario inicia
  vacío (ver Assumptions).
- ¿Cómo se comporta el bloqueo por intentos fallidos si el cliente intenta iniciar sesión desde
  otro dispositivo mientras su usuario está bloqueado? El bloqueo es por usuario, no por
  dispositivo: se bloquea en cualquier dispositivo desde el que se intente.
- ¿Qué ocurre si el saldo de un producto no puede consultarse individualmente aunque el listado sí
  cargó? Ese producto muestra un estado de error puntual ("No disponible") sin bloquear la
  visualización del resto del listado.
- ¿Qué pasa si el cliente ya tiene una solicitud "en estudio" para el mismo producto y visita el
  catálogo de nuevo? El producto se muestra marcado como "Solicitud en trámite" en vez de permitir
  una nueva solicitud duplicada.
- ¿Qué pasa si la sesión expira por inactividad mientras el cliente está a mitad del formulario de
  solicitud (HU-03b)? Se aplica el mismo cierre automático de HU-04; los datos del formulario se
  pierden, igual que en el cierre manual.

## Requirements *(mandatory)*

### Functional Requirements

#### Autenticación (HU-01)

- **FR-001**: El sistema DEBE permitir a un cliente registrado iniciar sesión mediante
  documento/usuario y contraseña (sin OTP en esta iteración) y redirigirlo al Home al validar
  correctamente sus credenciales.
- **FR-002**: El sistema DEBE mostrar el mensaje "Usuario o contraseña incorrectos" cuando las
  credenciales no coincidan, permaneciendo en la pantalla de login.
- **FR-003**: El sistema DEBE bloquear temporalmente al usuario tras 3 intentos fallidos
  consecutivos, mostrando "Usuario bloqueado, contacte a su banco / recupere su clave", durante
  30 minutos antes de permitir un nuevo intento.
- **FR-004**: El sistema DEBE validar campos obligatorios de login (usuario/documento, contraseña)
  antes de intentar autenticar, mostrando el campo faltante si están vacíos.
- **FR-005**: El campo de contraseña DEBE ocultar su valor por defecto y ofrecer un ícono para
  mostrar/ocultar el texto ingresado.

#### Home y productos (HU-02)

- **FR-006**: El sistema DEBE mostrar, para un cliente autenticado, el listado completo de sus
  productos financieros activos (cuentas, tarjetas, créditos, etc.) al ingresar al Home.
- **FR-007**: El sistema DEBE mostrar, para cada producto listado, su saldo o cupo disponible
  actualizado.
- **FR-008**: El sistema DEBE mostrar un mensaje "Aún no tienes productos" junto con una opción
  para adquirir uno nuevo, cuando el cliente autenticado no tenga productos activos.
- **FR-009**: El sistema DEBE mostrar "No pudimos cargar tu información, intenta nuevamente" junto
  a un botón "Reintentar" cuando falle la consulta de productos.
- **FR-010**: El sistema DEBE permitir ocultar y volver a mostrar el saldo de un producto mediante
  un ícono de ojo, reemplazando el valor oculto por asteriscos (***).

#### Cierre de sesión (HU-04)

- **FR-011**: El sistema DEBE finalizar la sesión activa y redirigir a la pantalla de login cuando
  el cliente confirme el cierre de sesión, sin permitir volver al Home con el botón "atrás".
- **FR-012**: El sistema DEBE solicitar confirmación explícita ("¿Seguro que deseas cerrar
  sesión? - Sí/No") antes de cerrar la sesión por acción manual del cliente.
- **FR-013**: El sistema DEBE cerrar la sesión automáticamente tras 5 minutos de inactividad y
  mostrar "Tu sesión ha expirado por inactividad".
- **FR-014**: El sistema DEBE limpiar todo token de sesión y caché local del cliente al cerrar
  sesión, ya sea manual o automáticamente.

#### Catálogo de productos (HU-03a)

- **FR-015**: El sistema DEBE mostrar, al presionar "Adquirir producto" / "+", el listado de
  productos financieros disponibles para solicitar, cada uno con nombre, ícono/imagen y
  descripción breve.
- **FR-016**: El sistema DEBE marcar en el catálogo los productos que el cliente ya tiene activos
  como "Ya lo tienes", impidiendo iniciar una nueva solicitud duplicada para ese producto.
- **FR-017**: El sistema DEBE redirigir al formulario de solicitud correspondiente cuando el
  cliente seleccione un producto disponible del catálogo.
- **FR-018**: El sistema DEBE mostrar "No pudimos cargar los productos disponibles" junto a un
  botón "Reintentar" cuando falle la carga del catálogo.

#### Formulario de solicitud (HU-03b)

- **FR-019**: El sistema DEBE precargar los campos de datos personales (nombre, documento,
  celular, correo) del cliente autenticado en el formulario de solicitud, de solo lectura.
- **FR-020**: El sistema DEBE validar que los campos de ingresos, ocupación, egresos y monto/cupo
  deseado sean numéricos y estén dentro de los rangos permitidos para el producto solicitado antes
  de permitir avanzar.
- **FR-021**: El sistema DEBE resaltar visualmente (en rojo) cada campo obligatorio vacío o
  inválido y mostrar un mensaje de validación específico junto a él.
- **FR-022**: El sistema DEBE exigir la aceptación explícita (checkbox no premarcado) de los
  Términos y Condiciones y de la Autorización de consulta en centrales de riesgo antes de permitir
  continuar, mostrando "Debes aceptar los términos para continuar" si falta alguno.
- **FR-023**: El sistema DEBE habilitar el botón de envío de la solicitud únicamente cuando todos
  los campos obligatorios sean válidos y ambos checkboxes estén aceptados.
- **FR-024**: El formulario de solicitud NO DEBE realizar validación de score/central de riesgo en
  línea; toda solicitud enviada válida queda en estado "en estudio". Solo se exige aceptación de
  T&C y autorización de central de riesgo (sin firma digital), usando un formulario genérico
  reutilizable para cualquier producto del catálogo (sin campos específicos por tipo de
  producto en esta iteración).

#### Envío y confirmación (HU-03c)

- **FR-025**: El sistema DEBE enviar la solicitud completa al backend/core bancario al presionar
  "Enviar solicitud", mostrando "Solicitud enviada exitosamente" junto con un número de radicado
  único y trazable.
- **FR-026**: El sistema DEBE mostrar "No pudimos procesar tu solicitud, intenta nuevamente" y
  conservar los datos ya diligenciados cuando ocurra un error de comunicación con el backend al
  enviar la solicitud.
- **FR-027**: El sistema DEBE permitir al cliente consultar, en la sección "Mis solicitudes", el
  estado de su trámite (en estudio, aprobado, rechazado) usando el número de radicado.

### Key Entities *(include if feature involves data)*

- **Cliente**: Persona autenticada dueña de la sesión; atributos relevantes: identificador,
  nombre, documento, celular, correo, estado de bloqueo por intentos fallidos.
- **Sesión**: Representa el período autenticado activo de un cliente; atributos: estado
  (activa/expirada/cerrada), marca de tiempo de última actividad, motivo de cierre (manual,
  automático por inactividad).
- **Producto Financiero (del cliente)**: Producto activo que ya posee el cliente (cuenta, tarjeta,
  crédito, etc.); atributos: tipo, saldo o cupo disponible, estado de visibilidad del saldo
  (mostrado/oculto).
- **Producto Disponible (catálogo)**: Producto que el cliente puede solicitar; atributos: nombre,
  ícono/imagen, descripción, si ya fue adquirido o tiene una solicitud en trámite por el cliente.
- **Solicitud de Producto**: Trámite iniciado por el cliente para adquirir un Producto Disponible;
  atributos: datos personales precargados, datos socioeconómicos (ingresos, ocupación, egresos,
  monto/cupo deseado), aceptación de T&C y autorización de central de riesgo, número de radicado,
  estado (en estudio, aprobado, rechazado).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un cliente registrado puede iniciar sesión y ver sus productos en menos de 10
  segundos en condiciones normales de red.
- **SC-002**: La pantalla Home muestra los productos y saldos del cliente en menos de 2 segundos
  desde que se solicita, en el 95% de los casos.
- **SC-003**: El 100% de los intentos de login con credenciales inválidas reciben un mensaje de
  error claro sin exponer cuál campo específico fue incorrecto (usuario vs. contraseña).
- **SC-004**: Un cliente puede completar el flujo de solicitud de un nuevo producto (desde el
  catálogo hasta la confirmación con radicado) en menos de 5 minutos.
- **SC-005**: El 100% de los cierres de sesión (manuales o automáticos) dejan la app sin ningún
  dato de sesión recuperable mediante el botón "atrás" del dispositivo.
- **SC-006**: El 100% de las solicitudes de producto enviadas exitosamente devuelven un número de
  radicado único que el cliente puede usar para consultar el estado posteriormente.

## Assumptions

- El "cliente registrado" ya existe en el core bancario antes de usar la app; el registro de
  nuevos clientes está fuera de alcance de esta especificación.
- Un producto ya adquirido por el cliente se **oculta o marca como no disponible** en el catálogo
  ("Ya lo tienes"), en vez de permitir una segunda solicitud simultánea del mismo producto.
- Los datos personales precargados en el formulario de solicitud (HU-03b) **no son editables**
  por el cliente desde la app; cualquier corrección se hace por los canales existentes del banco.
- La consulta del estado de la solicitud ("Mis solicitudes") queda incluida en el alcance de esta
  misma épica (HU-03c), no diferida a una historia futura.
- Los datos diligenciados en el formulario de solicitud no persisten si el cliente cierra la app
  sin enviar la solicitud (ni se guardan como borrador); solo se conservan ante un error de envío
  dentro de la misma sesión activa (HU-03c, escenario 2).
- El performance objetivo de carga del Home (<2s) y los lineamientos de seguridad (OWASP Mobile)
  ya están fijados como no negociables en la constitución del proyecto y no se repiten como
  clarificaciones aquí.
