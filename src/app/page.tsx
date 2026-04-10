import { redirect } from 'next/navigation';

// The middleware redirects "/" to "/{locale}" at runtime.
// This page handles the static prerender case.
export default function RootPage() {
  redirect('/en');
}
