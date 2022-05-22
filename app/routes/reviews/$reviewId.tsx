import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import type { Review } from "~/models/review.server";
import { deleteReview } from "~/models/review.server";
import { getReview } from "~/models/review.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  review: Review;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.reviewId, "reviewId not found");

  const review = await getReview({ userId, id: params.reviewId });
  if (!review) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ review });
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.reviewId, "reviewId not found");

  await deleteReview({ userId, id: params.reviewId });

  return redirect("/reviews");
};

export default function ReviewDetailsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.review.title}</h3>
      <p className="py-6">{data.review.body}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Review not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
