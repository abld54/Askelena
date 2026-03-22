import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendBookingConfirmationEmail({
  to,
  guestName,
  listingTitle,
  startDate,
  endDate,
  nights,
  totalPrice,
  bookingId,
}: {
  to: string;
  guestName: string;
  listingTitle: string;
  startDate: Date;
  endDate: Date;
  nights: number;
  totalPrice: number;
  bookingId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const formatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#1a1a1a">Réservation confirmée !</h1>
      <p>Bonjour ${guestName},</p>
      <p>Votre réservation pour <strong>${listingTitle}</strong> est confirmée.</p>
      <table style="border-collapse:collapse;width:100%;margin:24px 0">
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666">Arrivée</td>
          <td style="padding:8px;border:1px solid #eee;font-weight:600">${formatter.format(startDate)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666">Départ</td>
          <td style="padding:8px;border:1px solid #eee;font-weight:600">${formatter.format(endDate)}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666">Durée</td>
          <td style="padding:8px;border:1px solid #eee">${nights} nuit${nights > 1 ? "s" : ""}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #eee;color:#666">Total payé</td>
          <td style="padding:8px;border:1px solid #eee;font-weight:600">${totalPrice.toFixed(2)} €</td>
        </tr>
      </table>
      <a href="${appUrl}/bookings/${bookingId}"
         style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        Voir ma réservation
      </a>
      <p style="margin-top:32px;color:#666;font-size:14px">
        L'équipe Askelena
      </p>
    </div>
  `;

  if (!process.env.SMTP_HOST) {
    // Dev mode: log to console instead of sending
    console.log("[email] Booking confirmation would be sent to:", to);
    console.log("[email] Subject: Votre réservation est confirmée –", listingTitle);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "Askelena <noreply@askelena.fr>",
    to,
    subject: `Votre réservation est confirmée – ${listingTitle}`,
    html,
  });
}

export async function sendBookingCancellationEmail({
  to,
  guestName,
  listingTitle,
  bookingId,
}: {
  to: string;
  guestName: string;
  listingTitle: string;
  bookingId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h1 style="color:#1a1a1a">Réservation annulée</h1>
      <p>Bonjour ${guestName},</p>
      <p>Votre réservation pour <strong>${listingTitle}</strong> a été annulée.</p>
      <a href="${appUrl}/bookings/${bookingId}"
         style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        Voir les détails
      </a>
      <p style="margin-top:32px;color:#666;font-size:14px">
        L'équipe Askelena
      </p>
    </div>
  `;

  if (!process.env.SMTP_HOST) {
    console.log("[email] Cancellation email would be sent to:", to);
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "Askelena <noreply@askelena.fr>",
    to,
    subject: `Votre réservation pour ${listingTitle} a été annulée`,
    html,
  });
}
