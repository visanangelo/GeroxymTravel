import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

/** Cancel is now done via dialog in the routes list. Redirect old links to list. */
export default async function CancelRoutePage({ params }: Props) {
  await params
  redirect('/admin/routes')
}
