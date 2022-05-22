import { json, LoaderFunction, redirect } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";

/**
 * Either redirects to the '/reviews' route if the user is logged or to the
 * '/login' route otherwise.
 */
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request, '/reviews');
  if (userId) return redirect("/reviews");
  return json({});
};
