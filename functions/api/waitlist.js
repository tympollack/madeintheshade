export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { email, honey, vector, first_name, last_name } = await request.json();

    // Honeypot check: If bots fill out the hidden field, silently return success
    if (honey) {
      return Response.json({ message: 'Success' }, { status: 200 });
    }

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    if (email.length > 254) {
      return Response.json({ error: 'Email is too long' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const cleanVector = (vector === 'civic' || vector === 'Civic Alpha') 
      ? 'Civic Alpha' 
      : (vector === 'event_network' || vector === 'Event Network Deployment')
        ? 'Event Network Deployment'
        : 'Commercial Survey';

    const contactPayload = {
      email: email,
      first_name: first_name || cleanVector,
      last_name: last_name || (first_name ? cleanVector : 'Inquiry'),
      unsubscribed: false,
    };

    const res = await fetch(`https://api.resend.com/audiences/${env.RESEND_AUDIENCE_ID}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.message || 'Failed to add contact to Resend' }, { status: res.status });
    }
    
    return Response.json({ message: 'Success', vector: cleanVector, data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
