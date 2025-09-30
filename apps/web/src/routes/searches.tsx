import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/searches')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /searches</div>;
}
