Un API RESTful que permite hacer operaciones CRUD en una base de datos PostgreSQL utilizando el ORM [Sequelize](https://sequelize.org/). Contiene rutas publicas para 
leer artículos y leer o crear comentarios, y una ruta privada que requiere verificación mediante JWT donde se puede crear, editar o borrar articulos.

Enlace: https://blog-api-production-c97a.up.railway.app/

Este API forma parte de un proyecto que consiste de tres partes: este API, un [sitio publico](https://github.com/oliverowen2210/blog-public/) en donde usuarios
pueden leer y comentar en los articulos que publico, y un [sito privado](https://github.com/oliverowen2210/blog-public/) que utiliza la ruta privada para crear y editar articulos.
