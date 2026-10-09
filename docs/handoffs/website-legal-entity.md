# For the website session: RemitBridge Labs is now a legal entity

Paste everything below the line into a Claude session working in
`RemitBridge-System-Labs---Website`.

---

RemitBridge Labs is now incorporated: Washington's Secretary of State accepted the Articles,
and Angad has the certificate (2026-10-08). Please make the website say so, and make it clear
that RemitBridge Labs, not any person, is the one responsible for the site. Angad's words:
"make sure they can only sue this legal entity and not me or my parents".

What the app's own site (app.remitbridgelabs.org, in the RemitBridge-App repo) now does, for
reference: https://app.remitbridgelabs.org/terms and https://app.remitbridgelabs.org/privacy.
Read both and match their wording where it fits.

1. **Footer on every page:** `© 2026 RemitBridge Labs, a Washington nonprofit corporation`,
   with links to the website's privacy policy and terms, and hello@remitbridgelabs.org.
2. **A privacy policy page** for the website itself. It has accounts (sign-up, `member`
   role), a contact form and Supabase behind them, so it needs its own. Say RemitBridge Labs,
   a Washington nonprofit corporation, operates the site and is responsible for the data;
   what the site collects (account email and profile, contact-form messages, anything else the
   code actually stores: read the code, don't guess), why, who processes it (Supabase, Vercel,
   Resend or whatever the code uses), how long it's kept, how to delete an account or ask for
   deletion, children under 13, and contact. Mark it `DRAFT: pending legal review` in an HTML
   or code comment, like the app's.
3. **A terms of use page**, with these clauses (same as the app's terms):
   - These terms are an agreement between you and RemitBridge Labs, and no one else. RemitBridge
     Labs is a legal entity separate from the people who found, run, work or volunteer for,
     contribute to or support it, and from their families; none of them is a party or makes
     any promise personally.
   - Not financial or legal advice; RemitBridge never sends, holds or exchanges money.
   - No warranty; provided as it is.
   - Limit of liability: to the fullest extent the law allows, no indirect, incidental, special,
     consequential or punitive damages; total liability capped at $50.
   - Claims are against RemitBridge Labs only: no claim against its founders, directors,
     officers, employees, volunteers or contributors, or their families; none is personally
     liable, and each may enforce this clause as if they'd signed.
   - One year to bring a claim, unless the law requires longer.
   - Washington law; only the state or federal courts in Washington State.
   - Severability.
4. **Anywhere the site says who runs it** (About, Leadership, Contact, the account sign-up
   screen): "RemitBridge Labs, a Washington nonprofit corporation". On sign-up, a line linking
   the terms and privacy policy ("By creating an account you agree to the terms...").
5. **Wording rules:** never "charity", "501(c)(3)" or "tax-deductible" (the IRS hasn't approved
   anything). "Nonprofit corporation" is now correct. No em dashes.

Commit, deploy, and check the live pages.
