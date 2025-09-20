import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mysql from 'mysql2/promise';
import demoRoutes from './routes/demo.js';
import inscriRoutes from './routes/inscri.js';
import connexionApi from './routes/connexion.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'shippinglog_v1',
});

export default pool;


// Debug middleware
app.use((req, res, next) => {
  console.log(`Hit request: ${req.method} ${req.url}`);
  next();
});



//mount
app.use('/api', demoRoutes);
app.use('/api', inscriRoutes);
app.use('/api', connexionApi);


// Initialize database and tables
async function initDB() {
  try {
    // Create demande_demo table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS demande_demo (
        demo_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        nom_prenom VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telephone VARCHAR(255) NOT NULL,
        societe VARCHAR(255),
        date_selectionnee DATE NOT NULL,
        heure_selectionnee TIME NOT NULL,
        message VARCHAR(255),
        statut VARCHAR(10) NOT NULL DEFAULT 'attente',
        cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table demande_demo ready');

    
    // Create gouvernorat table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gouvernorat (
        id_zone INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        nom_zone VARCHAR(255) NOT NULL
      )
    `);
    console.log('✅ Table gouvernorat ready');

  } catch (err) {
    console.error('❌ Error initializing DB:', err);
  }


 
}

// Create societe_livraison table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS societe_livraison (
        societe_id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        nom_societe VARCHAR(255) NOT NULL,
        nom_responsable VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telephone VARCHAR(255) NOT NULL,
        adresse TEXT NOT NULL,
        nombre_livreurs INT NOT NULL,
        document_url VARCHAR(255),
        statut ENUM('attente', 'active', 'refuse') NOT NULL DEFAULT 'attente',
        date_inscription TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table societe_livraison ready');


 // Create societe_zone table (linking companies to zones)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS societe_zone (
        societe_id BIGINT UNSIGNED NOT NULL,
        zone_id BIGINT UNSIGNED NOT NULL,
        PRIMARY KEY (societe_id, zone_id),
        FOREIGN KEY (societe_id) REFERENCES societe_livraison(societe_id) ON DELETE CASCADE,
        FOREIGN KEY (zone_id) REFERENCES gouvernorat(id_zone) ON DELETE CASCADE
      )
    `);
    console.log('✅ Table societe_zone ready');




//API connections initialization
// Create api table
await pool.query(`
  CREATE TABLE IF NOT EXISTS api_type (
    id_api BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nom VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id_api)
  )
`);
console.log('✅ Table api ready');

// Create demande_api table
await pool.query(`
  CREATE TABLE IF NOT EXISTS demande_api (
    demande_api_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    societe_requerente VARCHAR(255) NOT NULL,
    email_technique VARCHAR(255) NOT NULL,
    telephone_technique VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (demande_api_id)
  )
`);
console.log('✅ Table demande_api ready');

// Create demande_api_type table (many-to-many linking requests to API types)
await pool.query(`
  CREATE TABLE IF NOT EXISTS demande_api_type (
    demande_api_id BIGINT UNSIGNED NOT NULL,
    id_api BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (demande_api_id, id_api),
    FOREIGN KEY (demande_api_id) REFERENCES demande_api(demande_api_id) ON DELETE CASCADE,
    FOREIGN KEY (id_api) REFERENCES api(id_api) ON DELETE CASCADE
  )
`);
console.log('✅ Table demande_api_type ready');

initDB();




