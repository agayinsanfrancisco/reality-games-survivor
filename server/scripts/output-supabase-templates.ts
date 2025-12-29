/**
 * Output Supabase Auth Email Templates
 * 
 * Run with: npx ts-node scripts/output-supabase-templates.ts
 * 
 * This script outputs all the branded email templates for Supabase Auth.
 * Copy each template into Supabase Dashboard > Authentication > Email Templates
 */

import { 
  confirmSignupTemplate, 
  confirmSignupSubject,
  magicLinkTemplate, 
  magicLinkSubject,
  resetPasswordTemplate, 
  resetPasswordSubject,
  changeEmailTemplate, 
  changeEmailSubject,
  inviteUserTemplate, 
  inviteUserSubject,
  reauthenticationTemplate, 
  reauthenticationSubject 
} from '../src/emails/auth/index.js';

const templates = [
  { name: 'Confirm sign up', subject: confirmSignupSubject, html: confirmSignupTemplate },
  { name: 'Invite user', subject: inviteUserSubject, html: inviteUserTemplate },
  { name: 'Magic link', subject: magicLinkSubject, html: magicLinkTemplate },
  { name: 'Change email address', subject: changeEmailSubject, html: changeEmailTemplate },
  { name: 'Reset password', subject: resetPasswordSubject, html: resetPasswordTemplate },
  { name: 'Reauthentication', subject: reauthenticationSubject, html: reauthenticationTemplate },
];

console.log('='.repeat(80));
console.log('SUPABASE AUTH EMAIL TEMPLATES');
console.log('='.repeat(80));
console.log('');
console.log('Copy each template into Supabase Dashboard > Authentication > Email Templates');
console.log('');

for (const template of templates) {
  console.log('='.repeat(80));
  console.log(`📧 ${template.name.toUpperCase()}`);
  console.log('='.repeat(80));
  console.log('');
  console.log(`Subject: ${template.subject}`);
  console.log('');
  console.log('HTML Template:');
  console.log('-'.repeat(40));
  console.log(template.html);
  console.log('');
  console.log('');
}

console.log('='.repeat(80));
console.log('Done! Copy each template above into the Supabase Dashboard.');
console.log('='.repeat(80));
