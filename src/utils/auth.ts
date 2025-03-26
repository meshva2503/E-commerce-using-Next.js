import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Function to extract user ID from token
export async function getUserIdFromToken(req: Request): Promise<string | null> {
  try {
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

    if (!token) return null; // No token found

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log("userId:",decoded.id);
    return decoded.id; // Return user ID
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
