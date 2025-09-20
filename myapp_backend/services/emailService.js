import nodemailer from 'nodemailer';
import path from 'path';


const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'manuela50@ethereal.email',
    pass: 'XHGHuXr9XzzS8dUGQm'
  }
});


//1

export const sendAdminNotification = async (demoData) => {
  const info = await transporter.sendMail({
    from: '"ShippingLog" <no-reply@shippinglog.tn>',
    to: 'admin@shippinglog.tn',
    subject: 'Nouvelle demande de rendez-vous',
    text: `Nouvelle demande de rendez-vous par ${demoData.nom_prenom} (${demoData.email}) pour le ${demoData.date_selectionnee} à ${demoData.heure_selectionnee}.`,
    html: `<p>Nouvelle demande de rendez-vous par <b>${demoData.nom_prenom}</b> (${demoData.email}) pour le <b>${demoData.date_selectionnee}</b> à <b>${demoData.heure_selectionnee}</b>.</p>`
  });

  console.log('Admin email sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};

export const sendClientConfirmation = async (demoData) => {
  const info = await transporter.sendMail({
    from: '"ShippingLog" <no-reply@shippinglog.tn>',
    to: demoData.email,
    subject: 'Confirmation de votre rendez-vous',
    text: `Bonjour ${demoData.nom_prenom},\n\nVotre rendez-vous pour le ${demoData.date_selectionnee} à ${demoData.heure_selectionnee} a bien été enregistré.`,
    html: `<p>Bonjour <b>${demoData.nom_prenom}</b>,</p><p>Votre rendez-vous pour le <b>${demoData.date_selectionnee}</b> à <b>${demoData.heure_selectionnee}</b> a bien été enregistré.</p>`
  });

  console.log('Client email sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};


//confirm
export const sendClientConfirmed = async (demoData) => {
  const info = await transporter.sendMail({
    from: '"ShippingLog" <no-reply@shippinglog.tn>',
    to: demoData.email,
    subject: 'Votre rendez-vous est confirmé !',
    text: `Bonjour ${demoData.nom_prenom},\n\nVotre rendez-vous est confirmé !\nDate : ${demoData.date_selectionnee}\nHeure : ${demoData.heure_selectionnee}\nLieu : ${demoData.societe}`,
    html: `<p>Bonjour <b>${demoData.nom_prenom}</b>,</p>
           <p>Votre rendez-vous est <b>confirmé</b> !</p>
           <ul>
             <li>Date : ${demoData.date_selectionnee}</li>
             <li>Heure : ${demoData.heure_selectionnee}</li>
             <li>Lieu : ${demoData.societe}</li>
           </ul>`
  });

  console.log('Client confirmed email sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};


//2
export const sendAdminNewCompany = async (companyData) => {
  const attachments = companyData.documents.map(filePath => ({
    filename: path.basename(filePath), // just the file name
    path: filePath                      // absolute path to the file
  }));

  const info = await transporter.sendMail({
    from: '"ShippingLog" <no-reply@shippinglog.tn>',
    to: 'admin@shippinglog.tn',
    subject: 'Nouvelle inscription société',
    text: `
Nouvelle société enregistrée !

Nom société: ${companyData.nom_societe}
Nom responsable: ${companyData.nom_responsable}
Email: ${companyData.email}
Téléphone: ${companyData.telephone}
Adresse: ${companyData.adresse}
Nombre de livreurs: ${companyData.nombre_livreurs}`,
    attachments
  });

  console.log('Admin notification sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};




//3
export const sendAdminNewApiRequest = async (requestData) => {
  const info = await transporter.sendMail({
    from: '"ShippingLog" <no-reply@shippinglog.tn>',
    to: 'admin@shippinglog.tn',
    subject: 'Nouvelle demande de connexion API',
    text: `
Nouvelle demande API enregistrée !

Société requérante: ${requestData.societe_requerente}
Email technique: ${requestData.email_technique}
Téléphone technique: ${requestData.telephone_technique}
Types d'API demandées: ${requestData.apiTypes.join(', ')}
Sociétés partenaires sélectionnées: ${requestData.partenaires.join(', ')}
    `
  });

  console.log('Admin API request notification sent:', info.messageId);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
};