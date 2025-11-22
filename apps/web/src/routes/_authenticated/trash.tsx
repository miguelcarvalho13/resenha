import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/trash')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /trash</div>;
}
