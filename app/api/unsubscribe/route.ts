import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeUser } from '@/lib/subscribers';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  const outcome = unsubscribeUser(token);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Unsubscribe - Name Rarity</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #fafafa;
            color: #18181b;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
          }
          .card {
            background: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 12px;
            padding: 36px;
            max-width: 440px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          }
          h1 { font-size: 20px; font-weight: 600; margin-bottom: 12px; }
          p { font-size: 14px; color: #71717a; line-height: 1.5; }
          a {
            display: inline-block;
            margin-top: 24px;
            color: #18181b;
            font-weight: 500;
            text-decoration: underline;
            text-underline-offset: 4px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${outcome.success ? 'Unsubscribed' : 'Unsubscribe Status'}</h1>
          <p>${outcome.message}</p>
          <a href="/">Return to How Rare Is My Name</a>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: outcome.success ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
