import express from 'express';
import pool from '../index.js'; // your MySQL pool
import multer from 'multer';
import fs from 'fs';  
import { fileURLToPath } from 'url';
import path from 'path';
import { sendAdminNewCompany } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath); // create folder if missing
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// GET all zones
router.get('/zones', async (req, res) => {
  try {
    const [zones] = await pool.query(
      `SELECT id_zone, nom_zone FROM gouvernorat ORDER BY nom_zone ASC`
    );
    res.status(200).json(zones);
  } catch (err) {
    console.error('Error fetching zones:', err);
    res.status(500).json({ error: 'Impossible de récupérer les zones.' });
  }
});

// POST route for company registration
router.post('/inscription', upload.array('documents'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      nom_societe,
      nom_responsable,
      email,
      telephone,
      adresse,
      nombre_livreurs,
      selectedZones,
      selectAllZones
    } = req.body;

    if (!nom_societe || !nom_responsable || !email || !telephone || !adresse || !nombre_livreurs) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
    }

    // Check for duplicate company BEFORE anything else
    const [existing] = await conn.query(
      `SELECT societe_id FROM societe_livraison WHERE LOWER(TRIM(nom_societe)) = LOWER(TRIM(?))`,
      [nom_societe]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Cette société est déjà enregistrée.' });
    }

    // Start transaction
    await conn.beginTransaction();

    // Insert into main table
    const [result] = await conn.query(
      `INSERT INTO societe_livraison
       (nom_societe, nom_responsable, email, telephone, adresse, nombre_livreurs)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom_societe, nom_responsable, email, telephone, adresse, nombre_livreurs]
    );

    const societeId = result.insertId;

    // Handle zones
    let zonesToInsert = selectedZones ? JSON.parse(selectedZones) : [];
    if (selectAllZones === 'true') {
      const [allZones] = await conn.query(`SELECT id_zone FROM gouvernorat`);
      zonesToInsert = allZones.map(z => z.id_zone);
    }

    for (const zoneId of zonesToInsert) {
      await conn.query(
        `INSERT INTO societe_zone (societe_id, zone_id) VALUES (?, ?)`,
        [societeId, zoneId]
      );
    }

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(f => 'uploads/' + f.filename);
      await conn.query(
        `UPDATE societe_livraison SET document_urls = ? WHERE societe_id = ?`,
        [JSON.stringify(filePaths), societeId]
      );
    }

    await conn.commit();

    // Prepare data for admin email
    const companyData = {
      nom_societe,
      nom_responsable,
      email,
      telephone,
      adresse,
      nombre_livreurs,
      zones: zonesToInsert,
      documents: req.files ? req.files.map(f => path.join(__dirname, 'uploads', f.filename)) : []
    };

    // Send admin notification
    await sendAdminNewCompany(companyData);

    res.status(201).json({ message: 'Société enregistrée avec succès !', societeId });

  } catch (err) {
    await conn.rollback();
    console.error('Error in registration:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement.' });
  } finally {
    conn.release();
  }
});

export default router;
