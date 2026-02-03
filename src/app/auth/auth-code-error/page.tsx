import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-xl font-semibold">Autentificare eșuată</h1>
      <p className="text-center text-muted-foreground text-sm">
        Nu am putut finaliza autentificarea. Încearcă din nou sau folosește email și parola.
      </p>
      <Button asChild variant="default">
        <Link href="/ro/login">Mergi la Login</Link>
      </Button>
    </div>
  )
}
