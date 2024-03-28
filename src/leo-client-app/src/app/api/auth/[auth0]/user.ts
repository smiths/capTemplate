import { getSession } from "@auth0/nextjs-auth0";

export default async function user(req: any, res: any) {
  const session = await getSession(req, res);

  if (session) {
    return res.json({ email: session.user.email });
  } else {
    return res.json({ email: null });
  }
}
