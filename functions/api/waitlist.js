export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const res = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        unsubscribed: false,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || 'Failed to add contact to Resend' }, { status: res.status });
    }
    
    return Response.json({ message: 'Success', data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
