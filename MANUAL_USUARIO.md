# Manual de Usuario - CIA Seguridad Integral

Bienvenido al sistema de gestión operativa de CIA Seguridad Integral. Este manual describe las funcionalidades disponibles para los perfiles de Guardia, Central de Control y Administrador.

---

## 1. Acceso al Sistema

Para ingresar a la plataforma, debe utilizar sus credenciales corporativas (correo electrónico y contraseña).

### Credenciales de Demo (Desarrollo)
Si está en el entorno de pruebas, puede utilizar las siguientes cuentas:
- **Guardia:** `guardia@cia.cl` / `guardia123`
- **Central de Control:** `control@cia.cl` / `control123`
- **Administrador:** `demo@cia.cl` / `demo123`

---

## 2. Módulo Guardia (Terreno)

Este módulo está diseñado para el personal operativo en terreno, facilitando el registro de actividades y la comunicación.

### 2.1. Dashboard (Inicio)
- Muestra un resumen de su turno actual.
- Visualiza alertas recientes o mensajes importantes.
- Acceso rápido a las funciones principales.

### 2.2. Control de Acceso (Registro de Ingresos/Salidas)
Permite registrar el flujo de personas y vehículos.
1.  **Tipo de Movimiento:** Seleccione "Entrada" o "Salida".
2.  **Identificación:** Ingrese el RUT de la persona. El sistema buscará si ya existe en la base de datos para autocompletar el nombre.
3.  **Datos del Vehículo:** Ingrese la Patente y Modelo si corresponde.
4.  **Fotografías (Evidencia):** Puede adjuntar hasta 3 tipos de fotos específicas:
    *   **Foto RUT:** Documento de identidad.
    *   **Foto Vehículo:** Vista general del vehículo.
    *   **Foto Carga:** Detalle de la carga o maletero.
    *   *Nota: Las fotos se suben en paralelo para mayor rapidez.*
5.  **Observaciones:** Campo de texto libre para notas adicionales.
6.  **Guardar:** Presione "Registrar Acceso" para guardar el evento.

### 2.3. Rondas (Patrullajes)
Gestión de los puntos de control asignados a su turno.
- **Lista de Puntos:** Vea los puntos que debe visitar (Ej: Acceso Principal, Bodega, Perímetro).
- **Mapa Operativo:** Visualización de la ubicación de los puntos.
- **Checklist:** Al llegar a un punto, selecciónelo para completar el formulario de verificación (puertas, luces, etc.) y marcarlo como "Completado".

### 2.4. Libro de Novedades (Incidentes)
Registro de eventos fuera de lo normal.
- Reporte incidentes de seguridad, mantenimiento o salud.
- Clasifique la severidad (Baja, Media, Alta).
- Adjunte descripción detallada.

### 2.5. Mensajes (Buzón)
- Bandeja de entrada para recibir instrucciones directas de la Central o Administración.
- Las alertas críticas aparecerán como notificaciones emergentes (pop-ups) con sonido.

### 2.6. Botón de Pánico
Ubicado en la barra lateral (o menú inferior en móviles).
- Presiónelo para enviar una alerta inmediata de emergencia a la Central de Control con su ubicación GPS actual.

---

## 3. Módulo Central de Control (Operaciones)

Diseñado para los operadores que supervisan la seguridad desde la central.

### 3.1. Monitor en Vivo
- **Mapa GPS:** Visualización en tiempo real de la ubicación de todos los guardias activos.
- **Lista de Personal:** Estado de cada guardia (Activo, En Ronda, Inactivo).
- **Incidentes Recientes:** Feed de las últimas novedades reportadas desde terreno.

### 3.2. Historial de Accesos
Auditoría completa de los registros de entrada y salida.
- **Tabla de Registros:** Vea fecha, hora, tipo, persona, vehículo y guardia responsable.
- **Buscador:** Filtre por RUT, Nombre, Patente o comentarios.
- **Filtros:** Seleccione por rango de fechas (Desde/Hasta) o tipo de movimiento (Entrada/Salida).
- **Exportar PDF:** Descargue un reporte formal con los datos filtrados actualmente en pantalla.

### 3.3. Comunicaciones
- **Envío de Mensajes:** Redacte mensajes individuales a un guardia específico o masivos a todos los guardias de un turno/zona.
- **Historial de Chat:** Revise las instrucciones enviadas previamente.

### 3.4. Documentos
- Repositorio de procedimientos, protocolos y manuales operativos accesibles para consulta rápida.

---

## 4. Módulo Administrador (Gestión)

Panel para la gestión estratégica y configuración del sistema.

### 4.1. Dashboard Administrativo
- Métricas clave de rendimiento (KPIs): Total de accesos, incidentes por zona, cumplimiento de rondas.
- Gráficos de actividad semanal/mensual.

### 4.2. Mapa Global
- Visión general de todas las instalaciones y personal desplegado a nivel macro.

### 4.3. Gestión de Usuarios
- **Directorio:** Lista completa del personal.
- **Administración:** Crear nuevos usuarios, editar perfiles existentes, asignar roles (Guardia, Supervisor, Admin) y desactivar cuentas.

### 4.4. Control de Acceso (Auditoría)
- Acceso total al historial de accesos (idéntico al módulo de Control) para fines de auditoría forense o reportes de gestión.

### 4.5. Comunicaciones Globales
- Herramienta para enviar comunicados oficiales a toda la organización o grupos específicos.

---

## Soporte
Si encuentra problemas técnicos:
1. Revise su conexión a internet.
2. Intente recargar la página.
3. Contacte al equipo de soporte técnico indicando el mensaje de error si aparece uno.
