// Es defineix la configuració de sequelize
const { Sequelize, DataTypes } = require("sequelize"); // Importa la llibreria Sequelize

const bcrypt = require("bcrypt"); // Importa la llibreria bcrypt per a encriptar contrasenyes

const sequelize = new Sequelize("gamba", "admin", "admin", {
    host: "localhost",
    //host: '192.168.1.133', //IP de la base de dades
    port: 3308,
    dialect: "mysql", // connectem a mysql
});

// Model per a la taula Projectes
const Usuario = sequelize.define("Usuario", {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cp: {
        type: DataTypes.STRING,// o INT si es CP????
        allowNull: false,
    },
    dieta: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    foto_perfil: {
        type: DataTypes.STRING, // Tipo de datos para almacenar la URL de la imagen
        allowNull: true, // Permitir que el campo sea nulo
    },
});

// Model per a la taula Issues
const Restaurante = sequelize.define("Restaurante", {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    numero: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    direccion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dieta: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcio: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    foto_restaurante: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});


// Model per a la taula Receta
const Receta = sequelize.define("Receta", {
    nombre_receta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    desc_receta: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    persones: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tiempo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dificultad: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    foto_receta: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dieta: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

// Model per a la taula Receta
const Ingrediente = sequelize.define("Ingrediente", {
    nombre_ingrediente: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

// Model per a la taula Receta
const GrupoAlimento = sequelize.define("GrupoAlimento", {
    nombre_grupo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dieta: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    alergeno: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Model per a la taula Receta
const Promo = sequelize.define("Promo", {
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    usuarioInstagram: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    validada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
});

// Model per a la taula Receta
const TipoCocina = sequelize.define("TipoCocina", {
    nombre_tipo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Model per a la taula Receta
const Procedimiento = sequelize.define("Procedimiento", {
    numero_procedimiento: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    desc_procedimiento: {
        type: DataTypes.STRING(1000),
        unique: false,
    },
    foto_procedimiento: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

// Model per a la taula Receta
const Receta_Ingrediente = sequelize.define("Receta_Ingrediente", {
    cantidad: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    medida: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

// hook per encriptar la contrasenya abans de desar un nou usuari o restaurant
Usuario.beforeCreate(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10); // Encripta la contrasenya amb bcrypt
    user.password = hashedPassword;
});

Restaurante.beforeCreate(async (restaurant) => {
    const hashedPassword = await bcrypt.hash(restaurant.password, 10); // Encripta la contrasenya amb bcrypt
    restaurant.password = hashedPassword;
});

async function actualizarDietaRestaurante(restauranteId) {
    try {
        // Encuentra todas las recetas asociadas al restaurante
        const recetas = await Receta.findAll({ where: { restauranteId } });

        // Determina la dieta mínima entre las recetas
        let dietaMinima = 0; // Empezamos con el valor más restrictivo
        recetas.forEach(receta => {
            if (receta.dieta > dietaMinima) {
                dietaMinima = receta.dieta;
            }
        });

        // Actualiza la dieta del restaurante si es necesario
        const restaurante = await Restaurante.findByPk(restauranteId);
        if (restaurante.dieta !== dietaMinima) {
            restaurante.dieta = dietaMinima;
            await restaurante.save();
        }
    } catch (error) {
        console.error('Error al actualizar la dieta del restaurante:', error);
    }
}

// Define el hook afterSave para el modelo Receta
Receta.addHook('afterSave', (receta, options) => {
    // Actualiza la dieta del restaurante asociado a la receta
    actualizarDietaRestaurante(receta.RestauranteId);
});

// Definim les relacions

// Project.hasMany(Issue, { onDelete: 'CASCADE', hooks: true });  DE REFERNCIA PER SI ESTE QUE BORRAR ALGO EN CASCADA

Usuario.belongsToMany(Restaurante, { through: 'UsuarioRestaurante' }); // Un usuario puede seguir a muchos restaurantes
Restaurante.belongsToMany(Usuario, { through: 'UsuarioRestaurante' }); // Un restaurante puede seguir a muchos restaurantes

Receta.belongsToMany(Ingrediente, { through: Receta_Ingrediente }); // Una receta puede tener varios ingredientes
Ingrediente.belongsToMany(Receta, { through: Receta_Ingrediente }); // Un ingrediente puede ser usado por varias recetas

Usuario.belongsToMany(Receta, { through: 'RecetaUsuario' });
Receta.belongsToMany(Usuario, { through: 'RecetaUsuario' });

Restaurante.hasMany(Receta)// Un restaurante puede tener muchas recetas
Receta.belongsTo(Restaurante) // Un receta pertences a un solo restaurante

Usuario.belongsToMany(TipoCocina, { through: 'UsuarioCocina' }); // Un usuario puede tener varios tipos cocina
TipoCocina.belongsToMany(Usuario, { through: 'UsuarioCocina' }); // Un tipo de cocina lo pueden tener varios usuarios

Receta.belongsTo(TipoCocina); // Una receta tiene un unico tipo de cocina
TipoCocina.hasMany(Receta); // Un tipo de cocina pertence a varias recetas

Restaurante.belongsToMany(TipoCocina, { through: 'RestauranteCocina' })
TipoCocina.belongsToMany(Restaurante, { through: 'RestauranteCocina' })

Ingrediente.belongsTo(GrupoAlimento); // Un ingrediente tiene un unico grupo
GrupoAlimento.hasMany(Ingrediente); // Un grupo pertence a varios ingredientes

Promo.belongsTo(Restaurante); // Una promo tiene un unico restaurante
Restaurante.hasMany(Promo); // Un restaurante puede tener varias promos

Procedimiento.belongsTo(Receta); // Un procedimineto tiene una unica receta
Receta.hasMany(Procedimiento); // Un receta puede tener varios procedimiento

GrupoAlimento.belongsToMany(Usuario, { through: 'UsuarioAlimento' }) // Un grupo de alimento puede estar en muchos usuarios
Usuario.belongsToMany(GrupoAlimento, { through: 'UsuarioAlimento' }) // Un usuario puede tener muchos grupos de alimentos

// connectem a base de dades
async function iniDB() {
    await sequelize.sync({ force: true });

    const cocinas = require("./data/tipococina.json");
    const cocinas_añadidas = await TipoCocina.bulkCreate(cocinas);

    const grupos = require("./data/grupos_alimentos.json");
    const grupos_añadidos = await GrupoAlimento.bulkCreate(grupos);

    const ingredientes = require("./data/ingredientes.json");
    const ingredientes_añadidos = await Ingrediente.bulkCreate(ingredientes);

    const anadirRestaurante = require("./data/anadirRestaurante.js")
    await anadirRestaurante()

    const anadirReceta = require("./data/anadirReceta.js")
    await anadirReceta()

    const userTest = {
        nombre: "admin",
        correo: "admin@test.com",
        password: "admin123",
        cp: "08032",
        tipos_cocina: [1, 2, 4],
        alergias: [7, 4],
        dieta: 0,
        foto_perfil: "http://localhost:3000/api/uploads/adminUser.jpg",
    }
    const user = await Usuario.create(userTest)
    await user.addTipoCocina(userTest.tipos_cocina)
    await user.addGrupoAlimento(userTest.alergias)
}

// iniDB();

//Exportem els models
module.exports = {
    Receta,
    Usuario,
    Restaurante,
    Receta_Ingrediente,
    Ingrediente,
    Promo,
    Procedimiento,
    GrupoAlimento,
    TipoCocina,
    sequelize, // Per si vols utilitzar la instància de Sequelize per a altres operacions
};
