/** The newsletter email (D169): supabase/functions/send-newsletter/email.ts. */
import { describe, expect, it } from 'vitest'
import { buildEmail, paragraphs } from '../../../supabase/functions/send-newsletter/email.ts'

describe('the email', () => {
  const sender = { legalName: 'RemitBridge Labs', mailingAddress: 'PO Box 1', contactEmail: 'hello@remitbridgelabs.org' }

  it('splits paragraphs on blank lines', () => {
    expect(paragraphs('One\r\n\r\nTwo\nstill two\n\n\n  \nThree  ')).toEqual(['One', 'Two\nstill two', 'Three'])
  })

  it('escapes what was typed and links web addresses, without the full stop', () => {
    const { html } = buildEmail({ subject: 'Fees <b>&</b> rates', body: 'See https://app.remitbridgelabs.org/p/x. <script>' }, sender, 'https://u')
    expect(html).toContain('Fees &lt;b&gt;&amp;&lt;/b&gt; rates')
    expect(html).toContain('<a href="https://app.remitbridgelabs.org/p/x" style="color:#14705a;">https://app.remitbridgelabs.org/p/x</a>.')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('ends with why it came, the unsubscribe link, and who sent it', () => {
    const { text, html } = buildEmail({ subject: 'S', body: 'Hello' }, sender, 'https://app.remitbridgelabs.org/unsubscribe?t=abc')
    expect(text).toBe(
      'Hello\n\n--\nYou get this because you turned on the RemitBridge newsletter in the app.\n' +
        'To stop it, unsubscribe here in one tap, or turn it off in the app under Account, Newsletter:\n' +
        'https://app.remitbridgelabs.org/unsubscribe?t=abc\n\nRemitBridge Labs\nPO Box 1\nhello@remitbridgelabs.org\n',
    )
    expect(html).toContain('href="https://app.remitbridgelabs.org/unsubscribe?t=abc"')
    expect(html).toContain('RemitBridge Labs<br>PO Box 1<br>hello@remitbridgelabs.org')
  })
})
