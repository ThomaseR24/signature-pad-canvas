import { NextResponse } from 'next/server'

export function middleware(request: Request) {
  const auth = request.headers.get('authorization')
  const user = 'test1234'
  const pass = 'test1234'
  const valid = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`

  if (auth !== valid) {
    return new NextResponse('Zugriff verweigert', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected"'
      }
    })
  }
  return NextResponse.next()
}
