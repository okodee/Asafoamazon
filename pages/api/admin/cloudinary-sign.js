const cloudinary = require('cloudinary').v2;

export default function signature(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp },
    process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET // Ensure this matches your .env file
  );

  res.status(200).json({ signature, timestamp });
}
