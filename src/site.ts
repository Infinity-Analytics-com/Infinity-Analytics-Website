// Language-independent facts about the company.
export const site = {
  name: 'Infinity Analytics',
  url: 'https://infinity-analytics.com',
  email: 'contact@infinity-analytics.com',
  phone: '+212 6 73 72 90 97',
  phoneHref: 'tel:+212673729097',
  whatsapp: 'https://wa.me/212673729097',
  address: ['26 Avenue Mers Sultan', 'Appt 3, Etage 1', '20000 Casablanca', 'Morocco'],
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT ?? '',
  gaId: import.meta.env.PUBLIC_GA_ID ?? '',
};

export const clients = [
  'Ingram Micro', 'Bouygues Construction', 'Colas', 'Dow', 'Kuwait Finance House', 'Urban One', 'PhoneCheck',
  'Sterling', 'Afinia', 'Abu Dhabi Finance', 'Dubai Pulse', 'Regency', 'Rawson', 'MVMANT',
];

// Client quotes are kept in their original language.
export const testimonials = [
  { name: 'Uri Rozenblat', org: 'Tech-Alert Inc.', country: 'United States', quote: 'Zak exceeded my expectations and created an amazing, detailed, tailored dashboard. He trained me on the product after it was ready and went above and beyond to ensure it works to my satisfaction.' },
  { name: 'Hani Al-Haddad', org: 'Kuwait Finance House', country: 'Kuwait', quote: 'Smart, creative and committed. They understand business and project management, with minimum to zero revisions. These are your guys. Certainly, I will hire again.' },
  { name: 'Abdallah Al Madani', org: 'Saudi Authority for Intellectual Property', country: 'Saudi Arabia', quote: 'You would never look for someone else to create a dashboard once you have tried their services.' },
  { name: 'Ed English', org: 'ELERTS Corporation', country: 'United States', quote: 'Great job! They delivered the Power BI dashboards as promised, on time. Very happy with their communication and deliverables. I will be sending more projects to them!' },
  { name: 'Arjun Miles-Bey', org: 'CourMed', country: 'United States', quote: 'Infinity Analytics makes us look like superstars to our clients. They have excellent skills, always do a professional job and exceed expectations.' },
  { name: 'Jahaziel Titular', org: 'Interphil Laboratories Inc.', country: 'Philippines', quote: 'Clever and insightful. They did the job well and I will work with them again. I had revisions, and they still delivered the dashboard in time.' },
];
