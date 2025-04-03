type EmailData = {
    name: string;
    email: string;
    website: string;
    issue: string;
    urgency: string;
  };
  
  export function getEmailTemplate({ name, email, website, issue, urgency }: EmailData): string {
    return `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #f9fafb; padding: 2rem;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.07); overflow: hidden;">
          <div style="background: #1e293b; color: #fff; padding: 1.5rem 2rem; text-align: center;">
            <h1 style="margin: 0; font-size: 1.75rem;">🚑 WebTriage Request Received</h1>
            <p style="margin-top: 0.5rem; font-size: 1rem;">A site is in need. Let’s bring it back to life.</p>
          </div>
  
          <div style="padding: 2rem; font-size: 1rem; line-height: 1.6; color: #111827;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Website:</strong> <a href="${website}" style="color: #3b82f6;" target="_blank">${website}</a></p>
            <p><strong>Urgency:</strong> <span style="color: #dc2626;">${urgency}</span></p>
            <p><strong>Issue Description:</strong></p>
            <div style="background: #f3f4f6; padding: 1rem; border-left: 4px solid #3b82f6; border-radius: 4px; margin-top: 0.5rem;">
              <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${issue}</pre>
            </div>
          </div>
  
          <div style="background: #f1f5f9; padding: 1rem 2rem; font-size: 0.85rem; color: #64748b; text-align: center;">
            WebTriage.pro • Precision website care when it matters most.
          </div>
        </div>
      </div>
    `;
  }
  