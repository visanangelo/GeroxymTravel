type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({
  children,
}: Props) {
  return (
    <>
      {children}
    </>
  )
}