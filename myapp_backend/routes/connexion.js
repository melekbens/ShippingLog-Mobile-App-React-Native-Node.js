import express from 'express';
import pool from '../index.js'; // your MySQL pool
import { sendAdminNewApiRequest } from '../services/emailService.js';



const router = express.Router();



//3 
// API REQUEST: GET all available APIs

router.get('/api_type', async (req, res) => {
  try {
    const [apitypes] = await pool.query(
      `SELECT id_api, nom  FROM api_type ORDER BY id_api ASC`
    );
    res.status(200).json(apitypes);
  } catch (err) {
    console.error('Error fetching apis:', err);
    res.status(500).json({ error: 'Impossible de récupérer les apis' });
  }
});



// POST a new API request
router.post('/demande_api', async (req, res) => {
  try {
    const { societe_requerente, email_technique, telephone_technique, apiTypes,partenaires } = req.body;

    if (!societe_requerente || !email_technique || !telephone_technique || !apiTypes || !apiTypes.length) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs et sélectionner au moins un type d’API.' });
    }

    // Insert into demande_api table
    const [result] = await pool.query(
      `INSERT INTO demande_api (societe_requerente, email_technique, telephone_technique)
       VALUES (?, ?, ?)`,
      [societe_requerente, email_technique, telephone_technique]
    );

    const demandeId = result.insertId;


    // Insert API types into demande_api_type linking table (many-to-many)
    const values = apiTypes.map(id_api => [demandeId, id_api]);
    await pool.query(
      `INSERT INTO demande_api_type (demande_api_id, id_api) VALUES ?`,
      [values]
    );


   const partnerValues = partenaires.map(id_societe => [demandeId, id_societe]);
    if (partnerValues.length > 0) {
      await pool.query(
        `INSERT INTO demande_api_societes (demande_api_id, societe_id) VALUES ?`,
        [partnerValues]
      );
    }

    // --- ENVOI EMAIL ADMIN ---

    // Fetch actual names of API types
const [apiRows] = await pool.query(
  `SELECT nom FROM api_type WHERE id_api IN (?)`,
  [apiTypes]
);
const apiNames = apiRows.map(row => row.nom);

// Fetch actual names of partner companies
let partnerNames = [];
if (partenaires && partenaires.length > 0) {
  const [partnerRows] = await pool.query(
    `SELECT nom_societe FROM societe_livraison WHERE societe_id IN (?)`,
    [partenaires]
  );
  partnerNames = partnerRows.map(row => row.nom_societe);
}

// Prepare email data
const requestData = {
  societe_requerente,
  email_technique,
  telephone_technique,
  apiTypes: apiNames,      // actual names
  partenaires: partnerNames, // actual names
};

// Send email
await sendAdminNewApiRequest(requestData);


    

    res.status(201).json({
      message: 'Demande API enregistrée et admin notifié !',
      demandeId
    });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de la demande API :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }


  
});



// GET all validated delivery companies
router.get('/societes/validated', async (req, res) => {
  try {
    const [companies] = await pool.query(
      `SELECT societe_id, nom_societe
       FROM societe_livraison
       WHERE statut = 'active'
       ORDER BY nom_societe ASC`
    );
    res.json(companies);  // send JSON directly
  } catch (err) {
    console.error('Error fetching validated companies:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
