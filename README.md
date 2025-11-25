# README
# 📦 Sistema de Inventariado de la UIT

# SistemaInfra_2

**Versión 2 del Sistema de Inventariado de la Unidad de Infraestructura Tecnológica (UIT) de AGETIC**

Una aplicación full-stack hecha con RedwoodJS para gestionar y auditar los activos de infraestructura tecnológica: infraestructura, despliegues,gestion de usuarios, eventos, parametricas y más.

---

## Tabla de Contenidos

1. [Características](#características)  
2. [Tecnologías](#tecnologías)  
3. [Requisitos Previos](#requisitos-previos)  
4. [Instalación y Configuración](#instalación-y-configuración)  
5. [Estructura del Proyecto](#estructura-del-proyecto)  
6. [Modelo Relacional](#modelo-relacional)
7. [Comandos Útiles](#comandos-útiles)  

---

## Características
 
- Gestión CRUD completa de:
- Infraestructura
  - Maquinas
  - Clusters
  - Asignacion Servidor-Maquina
  - Servidores
  - Data Centers
- Despliegues
  - Sistemas
  - Componentes
  - Despliegues
  - Entidades
- Gestión de Usuarios
  - Usuarios
  - Asignacion de Roles
  - Roles
- Eventos
  - Eventos
  - Infraestuctura Afectada
- Parametricas
  - Parametros
 
- Interfaz React con Material UI: responsive y accesible.  
- API GraphQL con Prisma ORM sobre PostgreSQL.  
- Historial de auditoría y filtros de estado (activos/inactivos).  

---

## Tecnologías

- **Framework**: [RedwoodJS](https://redwoodjs.com)  
- **Frontend**: React + [Material UI](https://mui.com)  
- **API**: GraphQL (Apollo)  
- **ORM**: Prisma  
- **Base de datos**: PostgreSQL  
- **Autenticación**: Ciudadania-Digital (Keycloak)  
---

## Requisitos Previos

- Node.js v20.x o superior 
- Yarn v6.x o superior
- PostgreSQL (>=15)  
- Git  

---

## Instalación y Configuración

1. **Clonar el repositorio**  
   ```bash
   git clone https://github.com/Americo7/SistemaInfra_2.git
   cd SistemaInfra_2
   ```

2. **Instalar dependencias**  
   ```bash
   yarn install
   ```

3. **Variables de entorno**  
   - Copia el ejemplo y ajusta según tu entorno:
     ```bash
     nano .env
     ```
   - Edita `.env` y define al menos:
     ```
     DATABASE_URL="postgresql://usuario:password@localhost:5432/infra_manage?"
     ```

4. **Configurar la base de datos**  
   Ejecuta la migración para conectar con la base de datos:
   ```bash
   yarn rw prisma migrate dev
   ```
   Este comando creará y aplicará las migraciones necesarias para mantener la integridad del esquema de la base de datos.
   
   Luego, genera el cliente de Prisma:
   ```bash
   yarn prisma generate
   ```

5. **Arrancar el servidor en modo desarrollo**  
   ```bash
   yarn rw dev
   ```
   - Frontend en ▶ http://localhost:8910  
   - Backend en ▶ http://localhost:8911  
   - GraphQL Playground en ▶ http://localhost:8910/graphql  

---

## Estructura del Proyecto

```
/
├── .redwood/               # Configuración interna de RedwoodJS
├── api/                    # Código del lado servidor
│   ├── db/                 # Prisma schema y migraciones
│   ├── graphql/            # SDL y resolvers
│   └── services/           # Lógica de negocio
├── prisma/                 # (alias a api/db)
├── scripts/                # Scripts personalizados
├── web/                    # Código del lado cliente
│   ├── src/
│   │   ├── components/     # Componentes reutilizables (MUI)
│   │   ├── layouts/        # Layouts y plantillas
│   │   ├── pages/          # Rutas y páginas
│   │   └── utils/          # Helpers y hooks
│   └── public/             # Assets estáticos
├── .env.example            # Variables de entorno de ejemplo
├── redwood.toml            # Configuración de proyecto Redwood
├── package.json            # Dependencias y scripts generales
└── yarn.lock               # Lockfile de Yarn
```

---

## Modelo relacional

### 🗃️ Modelo Relacional de la Base de Datos

El sistema cuenta con una base de datos relacional que gestiona información sobre entidades, sistemas, despliegues, servidores, usuarios, roles y eventos. El diseño está orientado a garantizar la trazabilidad, seguridad y gestión integral de la infraestructura tecnológica.

### 🔗 Diagrama Entidad-Relación

![image](https://github.com/user-attachments/assets/bab81763-19e6-4a5f-a268-e64fbfd6aedc)


### 🧩 Entidades Principales

- **registro_sistemas**: Define los sistemas registrados con su entidad correspondiente.
- **registro_componentes**: Componentes relacionados a sistemas (por tecnología, tipo, categoría).
- **registro_despliegue**: Maneja los despliegues por componente y sus características (ambiente, respaldo, estado).
- **registro_eventos** y **registro_eventos_bitacora**: Para registrar incidencias, auditorías y su historial.
- **registro_servidores** y **registro_maquinas**: Gestión de servidores físicos y máquinas virtuales.
- **registro_usuarios**, **registro_roles** y **registro_usuario_roles**: Control de acceso y permisos.
- **registro_clusters**: Agrupación lógica de máquinas.
- **registro_data_centers**: Ubicación física de los servidores.

### 📌 Relación de tablas destacadas

- Un `sistema` puede tener muchos `componentes`.
- Un `componente` puede tener múltiples `despliegues`.
- Cada `despliegue` puede registrar múltiples `eventos`.
- Los `usuarios` se asocian a `roles` y también a `sistemas` específicos.
- Las `máquinas` pueden ser asignadas a `servidores` y a `clusters`.

---


## Comandos Útiles

| Comando                         | Descripción                                         |
|---------------------------------|-----------------------------------------------------|
| `yarn install`                  | Instalar dependencias                               |
| `yarn rw dev`                   | Arrancar dev server (API + Web)                     |
| `yarn rw prisma migrate dev`    | Ejecutar migraciones de Prisma                      |
| `yarn rw prisma db seed`        | Sembrar datos de prueba                             |
| `yarn rw generate scaffold <X>` | Generar CRUD básico (modelo, páginas, servicios)    |
| `yarn rw test`                  | Ejecutar pruebas con Jest                           |
| `yarn rw format`                | Formatear con Prettier                              |
---
