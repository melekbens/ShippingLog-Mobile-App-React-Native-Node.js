import express from 'express';
import pool from '../index.js'; // your MySQL pool
import { sendClientConfirmation, sendAdminNotification } from '../services/emailService.js';

const router = express.Router();

// 1️⃣ DEMO: POST route for creating a demo request
router.post('/demande_demo', async (req, res) => {
  const { nom_prenom, email, telephone, societe, date_selectionnee, heure_selectionnee, message } = req.body;

  try {
    // Insert into database
    const [result] = await pool.query(
      `INSERT INTO demande_demo
        (nom_prenom, email, telephone, societe, date_selectionnee, heure_selectionnee, message, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'attente')`,
      [nom_prenom, email, telephone, societe, date_selectionnee, heure_selectionnee, message]
    );

    const demoData = {
      demoId: result.insertId,
      nom_prenom,
      email,
      telephone,
      societe,
      date_selectionnee,
      heure_selectionnee,
      message
    };

    // Send "received" email to client
    await sendClientConfirmation(demoData);

    // Send notification email to admin
    await sendAdminNotification(demoData);

    res.status(201).json({ demoId: result.insertId, message: 'Demande enregistrée et emails envoyés.' });

  } catch (err) {
    console.error('Error creating demo:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});


export default router;
