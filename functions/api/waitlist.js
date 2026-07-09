import { Resend } from 'resend';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const resend = new Resend(env.RESEND_API_KEY);
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await resend.contacts.create({
      email: email,
      unsubscribed: false,
      audienceId: env.RESEND_AUDIENCE_ID,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    
    return Response.json({ message: 'Success', data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
