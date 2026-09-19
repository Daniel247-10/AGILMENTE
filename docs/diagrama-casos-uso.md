# Diagrama de casos de uso

## Sistema Agilmente

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false

actor Usuario
actor Estudiante
actor Docente
actor "Firebase Authentication" as FirebaseAuth
actor "Firebase Firestore" as Firestore

Estudiante --|> Usuario
Docente --|> Usuario

rectangle "Plataforma Agilmente" {
  usecase "Registrarse" as UC01
  usecase "Iniciar sesión" as UC02
  usecase "Autenticarse con Google" as UC03
  usecase "Seleccionar tipo de usuario" as UC04
  usecase "Acceder al inicio" as UC05
  usecase "Consultar biblioteca digital" as UC06
  usecase "Consultar progreso" as UC07
  usecase "Consultar avisos y comunicados" as UC08
  usecase "Consultar recursos educativos" as UC09
  usecase "Consultar información institucional" as UC10
  usecase "Consultar y actualizar perfil" as UC11
  usecase "Realizar actividades de razonamiento lógico" as UC12
  usecase "Cerrar sesión" as UC13
  usecase "Validar acceso" as UC14
  usecase "Guardar datos del usuario" as UC15
}

Usuario --> UC01
Usuario --> UC02
Usuario --> UC03
Usuario --> UC04
Usuario --> UC05
Usuario --> UC06
Usuario --> UC07
Usuario --> UC08
Usuario --> UC09
Usuario --> UC10
Usuario --> UC11
Usuario --> UC12
Usuario --> UC13

UC01 ..> UC04 : <<include>>
UC01 ..> UC15 : <<include>>
UC02 ..> UC14 : <<include>>
UC03 ..> UC14 : <<include>>
UC03 ..> UC15 : <<include>>
UC05 ..> UC14 : <<include>>
UC06 ..> UC14 : <<include>>
UC07 ..> UC14 : <<include>>
UC08 ..> UC14 : <<include>>
UC09 ..> UC14 : <<include>>
UC10 ..> UC14 : <<include>>
UC11 ..> UC14 : <<include>>
UC12 ..> UC14 : <<include>>
UC13 ..> UC14 : <<include>>

FirebaseAuth <-- UC01
FirebaseAuth <-- UC02
FirebaseAuth <-- UC03
FirebaseAuth <-- UC13
Firestore <-- UC01
Firestore <-- UC03

note right of Docente
  Actualmente comparte los casos
  de uso disponibles con Estudiante.
  Los permisos docentes pueden
  ampliarse en una versión futura.
end note
@enduml
```

## Actores

| Actor | Descripción |
| --- | --- |
| Usuario | Actor general que representa a cualquier persona que utiliza la plataforma. |
| Estudiante | Usuario que consulta contenidos, actividades, avisos y su progreso. |
| Docente | Tipo de usuario contemplado por el registro; actualmente utiliza las funciones comunes implementadas. |
| Firebase Authentication | Servicio externo que gestiona autenticación por correo, contraseña y Google. |
| Firebase Firestore | Servicio externo que almacena los datos del usuario. |

## Casos principales

| Caso de uso | Resultado esperado |
| --- | --- |
| Registrarse | Crea la cuenta, guarda el perfil y dirige al inicio. |
| Iniciar sesión | Valida las credenciales y permite acceder al área protegida. |
| Autenticarse con Google | Inicia sesión con Google y crea o actualiza el perfil. |
| Consultar contenidos | Permite acceder a biblioteca, recursos, avisos e información institucional. |
| Consultar progreso | Muestra los logros y avances del usuario. |
| Realizar actividades | Permite acceder a los retos de razonamiento lógico disponibles. |
| Consultar y actualizar perfil | Permite revisar los datos y ajustes de la cuenta. |
| Cerrar sesión | Finaliza la sesión y devuelve al formulario de acceso. |

> Nota: el diagrama refleja las funcionalidades visibles en las rutas y componentes actuales. La administración de cursos, calificaciones o contenidos por parte del docente no se incluye porque todavía no está implementada.
